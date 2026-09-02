/* goals.js — feature module.  OWNER: Wave 2 — Goals agent (item 2: phased goal fixture + the three goal surfaces)
 *
 * Load order (see build.py): data.js, motion.js, variants-*.js, then EVERY feature
 * module, then app.js.  Modules run BEFORE the app boots, so the fixture attached
 * here is live on the very first render — no re-render, no flash.
 *
 * WHAT THIS FILE IS HONEST ABOUT
 * ------------------------------
 * Phases are OUR ADDITION, not a port.  Codex's goal is a single <=4000-char
 * objective string (`ext/goal`, `state/goals_migrations/0001_thread_goals.sql`);
 * grepping its entire goal surface for phase/milestone/stage/subgoal returns
 * zero.  OMP and Claude Code have no phases on a goal either.  The concept says
 * so on screen rather than dressing the addition up as canon.
 *
 * GOAL IS NOT A MODE.  Codex's `ModeKind` has exactly two variants, Plan and
 * Default.  A goal is an orthogonal, thread-scoped, persisted object that rides
 * alongside whatever mode is active, so nothing in this file reads `state.mode`
 * and `goal.mode` is permanently null.
 *
 * GOAL AND THE TODO LIST ARE NOT LINKED.  This module never reads `D.todos`.
 * `goal.tasks` is the Goal Runtime's own aggregate (ACD-418's "8/14 tasks"), not
 * a count over the checklist.  The only join is a foreign key on the TODO
 * (`todo.goalPhaseId`), which the Demo Data agent may stamp; a phase never
 * advances because its todos are checked.
 *
 * Shape contract for the other Wave 2 agents: scratchpad/waves/DATA_HANDOFF.md.
 */
(function(){
  'use strict';
  var D = window.PM56_DATA;
  if(!D) return;

  /* =====================================================================
     1. THE FIXTURE
     ---------------------------------------------------------------------
     Fixed UTC ISO-8601 throughout (FIXTURE_SCHEMA §0) so a screenshot
     baseline is stable.  Invariants the renderers are allowed to assume:
       * exactly one phase is `in_progress`
       * no phase went pending -> completed; each passed through in_progress
       * `evidence` appears only on completed phases
       * `currentPhaseId` HAS ALREADY MOVED BACKWARD in this fixture: Verify
         was started against the prototype, stalled, and the pointer moved
         back to Implement.  Never drive a monotonic stepper off it.
     ===================================================================== */
  var GOAL_FIXTURE = {
    id:'goal-query-perf',
    title:'Optimize analytics query performance',
    objective:'Reduce the tenant-scoped analytics query p95 below 100 ms without exceeding the accepted 8% write-amplification threshold, while preserving a rehearsed forward-rollback path.',
    status:'active',
    statusSince:'2026-08-24T10:18:00Z',
    createdAt:'2026-08-24T09:10:00Z',
    thread:'query',
    mode:null,               /* always null — a goal is not a mode */
    plan:'plan-query',       /* the plan DOCUMENT is a separate surface from the phase list */
    worktree:'feature/query-index',
    mergeStatus:'clean · 2 commits ahead',
    takeoverState:'agent',
    currentPhaseId:'ph-implement',
    budget:{ used:42000, limit:100000, unit:'tokens' },
    progress:{ completed:3, total:6, open:2 },
    tasks:{ done:8, total:14 },      /* Goal Runtime aggregate (ACD-418) — NOT D.todos */
    subgoals:[
      { id:'sg-index',  title:'Index strategy',        status:'complete', agent:'Query Analyzer',   model:'Claude Sonnet 4.6', current:'Recommendation accepted', blocker:null },
      { id:'sg-fanout', title:'Fan-out removal',       status:'running',  agent:'Query Analyzer',   model:'Claude Sonnet 4.6', current:'Rewriting the batched event lookup', blocker:null },
      { id:'sg-safety', title:'Migration safety',      status:'blocked',  agent:'Schema Reviewer',  model:'GPT-5.3 Codex',     current:'Holding at the production gate', blocker:'Awaiting production schema approval CHG-4471' },
      { id:'sg-bench',  title:'Benchmark evidence',    status:'running',  agent:'Benchmark Runner', model:'GPT-5.3 Codex',     current:'Re-running the 1,000-tenant sweep', blocker:null },
      { id:'sg-runbook',title:'Rollback runbook',      status:'running',  agent:'Docs Writer',      model:'GLM 5.2',           current:'Drafting the forward-rollback steps', blocker:null }
    ],
    phases:[
      { id:'ph-audit', title:'Audit',
        activeLabel:'Capturing the baseline',
        status:'completed',
        exitCriterion:'EXPLAIN ANALYZE captured for all four tenant-scoped routes and committed under bench/baseline/',
        estTokens:9000,
        evidence:[
          {kind:'command_output', label:'4 plans captured · p95 482 ms', ref:'bench/baseline/p95.txt'},
          {kind:'file',           label:'bench/baseline/explain-0001.json', ref:'bench/baseline/explain-0001.json'}
        ],
        blocker:null, note:null,
        startedAt:'2026-08-24T09:12:00Z', endedAt:'2026-08-24T09:48:00Z' },

      { id:'ph-research', title:'Research',
        activeLabel:'Comparing index strategies',
        status:'completed',
        exitCriterion:'Written comparison of at least three index strategies exists in the plan artifact with one named recommendation',
        estTokens:11000,
        evidence:[
          {kind:'artifact', label:'Query optimization plan · v3', ref:'plan-query'}
        ],
        blocker:null, note:null,
        startedAt:'2026-08-24T09:53:00Z', endedAt:'2026-08-24T10:02:00Z' },

      { id:'ph-proto', title:'Prototype',
        activeLabel:'Prototyping the composite index',
        status:'completed',
        exitCriterion:'cargo test analytics:: exits 0 on the prototype branch',
        estTokens:13000,
        evidence:[
          {kind:'test_result',    label:'42 passed, 0 failed', ref:'evidence-run'},
          {kind:'command_output', label:'p95 71 ms on the prototype branch', ref:'bench/proto/p95.txt'}
        ],
        blocker:null, note:null,
        startedAt:'2026-08-24T10:06:00Z', endedAt:'2026-08-24T10:16:00Z' },

      { id:'ph-implement', title:'Implement',
        activeLabel:'Landing the migration and removing the N+1 fan-out',
        status:'in_progress',
        exitCriterion:'migrations/0043_tenant_created_index.sql applied on staging AND rg "events_by_tenant" src/ returns 0 call sites',
        estTokens:21000,
        evidence:[], blocker:null, note:null,
        startedAt:'2026-08-24T10:18:00Z', endedAt:null },

      { id:'ph-verify', title:'Verify',
        activeLabel:'Running the acceptance gates',
        status:'blocked',
        exitCriterion:'All four acceptance gates report pass: unit, integration, browser, and write amplification at or below 8%',
        estTokens:24000,
        evidence:[],
        blocker:{
          blockerClass:'policy',
          cause:'Applying migrations/0043_tenant_created_index.sql to production requires a named schema-owner approval, and the automation account is not on the approver list for change CHG-4471.',
          scope:'The Verify phase only. The staging migration, the index itself and the fan-out removal are unaffected and already applied on staging.',
          lastRecovery:'Retried once against the staging DSN (succeeded), then requested the production approval token through the change queue at 10:31 UTC. No response inside the 20-minute window.',
          whyUnsafe:'The only remaining path is the break-glass credential, which would apply unreviewed DDL to production and destroy the rollback rehearsal evidence. Autonomy stops rather than widen its own permissions.',
          nextSafeAction:'A human with schema-owner rights approves CHG-4471, or re-scopes Verify to the staging gate only. Either unblocks without granting new permissions.',
          since:'2026-08-24T10:31:00Z'
        },
        note:null,
        startedAt:'2026-08-24T10:24:00Z', endedAt:null },

      { id:'ph-handoff', title:'Handoff',
        activeLabel:'Packaging the rollback runbook',
        status:'pending',
        exitCriterion:'Pull request opened with the rollback runbook linked and the benchmark artifact attached',
        estTokens:19000,
        evidence:[], blocker:null, note:null,
        startedAt:null, endedAt:null }
    ],
    /* A phase a replan removed is RETIRED, not deleted: erasing the record would
       erase the audit trail, which is exactly the "shrink the goal to declare
       victory" move the authority asymmetry exists to prevent. It lives outside
       `phases[]` so that `phases[]` means THE PLAN and every count -- including
       app.js's own goalSummary(), which this module cannot edit -- agrees on 6.
       `after` places it back in the list for display. */
    retiredPhases:[
      { id:'ph-matview', title:'Materialized-view spike', after:'ph-proto',
        activeLabel:'Measuring refresh lag',
        status:'abandoned',
        exitCriterion:'Refresh lag under 30 s measured over a one-hour window',
        estTokens:0,
        evidence:[], blocker:null,
        note:'Superseded — the composite index alone met the p95 gate, so a second write path was no longer worth its write amplification.',
        retiredBy:'rp-2',
        startedAt:'2026-08-24T10:07:00Z', endedAt:'2026-08-24T10:05:00Z' }
    ],
    replans:[
      { id:'rp-1', at:'2026-08-24T09:52:00Z', by:'agent',
        note:'Baseline showed the N+1 fan-out dominates, not the index. Acceptance evidence had no owner, so Verify was added as a phase instead of being folded into Implement.',
        added:['ph-verify'], removed:[] },
      { id:'rp-2', at:'2026-08-24T10:05:00Z', by:'agent',
        note:'The composite index alone met the p95 gate on the prototype branch. The materialized-view spike is no longer needed and was abandoned rather than deleted.',
        added:[], removed:['ph-matview'] }
    ],
    blocker:{
      blockerClass:'policy',
      cause:'Applying migrations/0043_tenant_created_index.sql to production requires a named schema-owner approval, and the automation account is not on the approver list for change CHG-4471.',
      scope:'The Verify phase only. The staging migration, the index itself and the fan-out removal are unaffected and already applied on staging.',
      lastRecovery:'Retried once against the staging DSN (succeeded), then requested the production approval token through the change queue at 10:31 UTC. No response inside the 20-minute window.',
      whyUnsafe:'The only remaining path is the break-glass credential, which would apply unreviewed DDL to production and destroy the rollback rehearsal evidence. Autonomy stops rather than widen its own permissions.',
      nextSafeAction:'A human with schema-owner rights approves CHG-4471, or re-scopes Verify to the staging gate only. Either unblocks without granting new permissions.',
      since:'2026-08-24T10:31:00Z',
      phaseId:'ph-verify'
    },
    history:[
      {at:'2026-08-24T09:10:00Z', kind:'created',   label:'Goal created',        detail:'Objective accepted. Six phases authored at creation, each with a binary exit criterion.'},
      {at:'2026-08-24T09:48:00Z', kind:'phase',     label:'Audit completed',     detail:'Baseline p95 482 ms across four routes.'},
      {at:'2026-08-24T09:52:00Z', kind:'replan',    label:'Replan · revision 2', detail:'Verify added as its own phase.'},
      {at:'2026-08-24T10:02:00Z', kind:'phase',     label:'Research completed',  detail:'Tenant-first composite index recommended over three alternatives.'},
      {at:'2026-08-24T10:05:00Z', kind:'replan',    label:'Replan · revision 3', detail:'Materialized-view spike abandoned.'},
      {at:'2026-08-24T10:16:00Z', kind:'phase',     label:'Prototype completed', detail:'42 tests pass, p95 71 ms on the prototype branch.'},
      {at:'2026-08-24T10:18:00Z', kind:'phase',     label:'Implement started',   detail:'Pointer moved back from Verify to Implement.'},
      {at:'2026-08-24T10:26:00Z', kind:'automation',label:'Automation',          detail:'Starting login flow verification'},
      {at:'2026-08-24T10:27:00Z', kind:'takeover',  label:'Agent took control',  detail:'Browser session handed to Browser Verifier · takeover_state: agent'},
      {at:'2026-08-24T10:31:00Z', kind:'blocked',   label:'Verify stalled',      detail:'Production schema approval CHG-4471 not granted.'}
    ]
  };

  var GOAL0 = JSON.stringify(GOAL_FIXTURE);
  D.goal = JSON.parse(GOAL0);

  /* Module-local view state.  Deliberately NOT on app.js's `state`, because a
     goal's live status must survive the 2s work tick; and deliberately reset by
     restoreFixture() so Reset really resets (the model-favourites bug in item 5
     was exactly a fixture mutation that survived Reset). */
  var ui = { openPhase:null, editing:false, draft:null, confirmClear:false, showReplans:false,
             showHistory:false, showSubgoals:false, showBlocker:false, tab:'phases' };
  var settled = Object.create(null);   /* phase ids whose completion wipe has already played */
  var arrived = Object.create(null);   /* phase ids that have already mounted once */
  var arrivePending = null;
  function seedSettled(){
    settled = Object.create(null);
    arrived = Object.create(null);
    arrivePending = null;
    (D.goal && D.goal.phases || []).forEach(function(p){ if(p.status==='completed') settled[p.id]=true; });
  }
  seedSettled();

  function restoreFixture(){
    D.goal = JSON.parse(GOAL0);
    ui = { openPhase:null, editing:false, draft:null, confirmClear:false, showReplans:false,
           showHistory:false, showSubgoals:false, showBlocker:false, tab:'phases' };
    seedSettled();
  }

  /* =====================================================================
     2. MODEL
     ===================================================================== */
  var STATUS_LABEL = {
    planning:'Replanning', active:'Running', paused:'Paused', blocked:'Blocked',
    budget_limited:'Budget limited', stopped:'Stopped', complete:'Completed', cleared:'Cleared'
  };
  var STATUS_TONE = {
    planning:'working', active:'working', paused:'paused', blocked:'blocked',
    budget_limited:'blocked', stopped:'idle', complete:'done', cleared:'idle'
  };
  /* "stalled" is the human word for a blocked phase — Codex deliberately
     relabels it, and "blocked" reads as a permission error rather than as work
     that has stopped moving. */
  var PHASE_LABEL = {
    pending:'Not started', in_progress:'In progress', completed:'Done',
    blocked:'Stalled', abandoned:'Abandoned'
  };
  /* A phase that was started and then demoted back to `pending` (the user
     re-opened it, or the pointer moved off it) is not "Not started". The enum
     has no fourth word for it, so the LABEL distinguishes what the STATUS
     cannot -- without inventing a status value nothing else understands. */
  function plabel(p){
    if(!p) return '';
    if(p.status==='pending' && p.startedAt) return 'Re-queued';
    return PHASE_LABEL[p.status]||p.status;
  }

  function goal(){ var g=D.goal; return (g && g.status!=='cleared') ? g : null; }
  function anyGoal(){ return D.goal || null; }
  function phases(){ var g=goal(); return g ? (g.phases||[]) : []; }
  function retired(){ var g=goal(); return g ? (g.retiredPhases||[]) : []; }
  function livePhases(){ return phases().filter(function(p){ return p.status!=='abandoned'; }); }
  function phaseById(id){
    var hit=phases().filter(function(p){ return p.id===id; })[0];
    return hit || retired().filter(function(p){ return p.id===id; })[0] || null;
  }
  /* The plan plus its audit trail, in reading order: a retired phase is shown
     back in the slot it occupied (`after`), so the history stays legible without
     ever counting towards the plan. */
  function displayPhases(){
    var out=[];
    var rs=retired();
    phases().forEach(function(p){
      out.push(p);
      rs.forEach(function(r){ if(r.after===p.id) out.push(r); });
    });
    rs.forEach(function(r){ if(out.indexOf(r)<0) out.push(r); });
    return out;
  }

  /* 1-based display number over the NON-abandoned phases, computed in the
     renderer so a replan reorder can never print 3/1/2, and null for an
     abandoned record so numbering stays 1..6. */
  function phaseNumber(id){
    var live = livePhases();
    for(var i=0;i<live.length;i++) if(live[i].id===id) return i+1;
    return null;
  }

  function progress(){
    var live = livePhases(), all = displayPhases();
    var completed = live.filter(function(p){ return p.status==='completed'; }).length;
    var open      = live.filter(function(p){ return p.status==='pending' || p.status==='in_progress'; }).length;
    var stalled   = live.filter(function(p){ return p.status==='blocked'; }).length;
    var abandoned = all.filter(function(p){ return p.status==='abandoned'; }).length;
    var current   = phaseById((goal()||{}).currentPhaseId);
    return { completed:completed, total:live.length, open:open, stalled:stalled,
             abandoned:abandoned, current:current,
             currentIndex: current ? phaseNumber(current.id) : null };
  }

  function fmtK(n){
    if(n==null) return 'not reported';
    if(n>=100000) return Math.round(n/1000)+'K';
    if(n>=1000) return (n/1000).toFixed(1)+'K';
    return String(n);
  }
  function clockOf(iso){
    if(!iso) return '';
    var m=/T(\d\d):(\d\d)/.exec(String(iso));
    return m ? m[1]+':'+m[2] : '';
  }
  function spanOf(a,b){
    if(!a||!b) return '';
    var ms = Date.parse(b)-Date.parse(a);
    if(!(ms>0)) return '';
    var mins = Math.round(ms/60000);
    return mins>=60 ? Math.floor(mins/60)+'h '+(mins%60)+'m' : mins+'m';
  }

  function summary(){
    var g = anyGoal();
    if(!g) return null;
    var p = progress();
    var running = g.subgoals ? g.subgoals.filter(function(s){ return s.status==='running'; }).length : 0;
    var label = STATUS_LABEL[g.status] || g.status;
    return {
      status:g.status,
      statusLabel:label,
      tone:STATUS_TONE[g.status] || 'idle',
      /* ACD-418 preserves this format exactly: "Running · 8/14 tasks · 3 subgoals active" */
      sidebar: label + ' · ' + (g.tasks?g.tasks.done:0) + '/' + (g.tasks?g.tasks.total:0) + ' tasks · ' + running + ' subgoals active',
      counter: p.completed + '/' + p.total + ' done · ' + p.open + ' open',
      phaseLine: p.current
        ? ('Phase ' + p.currentIndex + ' of ' + p.total + ' · ' + p.current.title)
        : (p.total ? p.completed + ' of ' + p.total + ' phases done' : 'No phases'),
      budgetLine: g.budget ? (fmtK(g.budget.used) + ' / ' + fmtK(g.budget.limit)) : '',
      revision: (g.replans ? g.replans.length : 0) + 1
    };
  }

  function pushHistory(kind,label,detail){
    var g=anyGoal(); if(!g) return;
    (g.history=g.history||[]).push({ at:new Date().toISOString(), kind:kind, label:label, detail:detail });
  }

  /* One place decides which phase is current, so "exactly one in_progress" can
     never be violated by a caller forgetting to demote the previous one. */
  function setCurrent(id){
    var g=goal(); if(!g) return;
    g.phases.forEach(function(p){
      if(p.status==='in_progress' && p.id!==id) p.status = p.endedAt ? 'completed' : 'pending';
    });
    var p = phaseById(id);
    if(p && p.status!=='completed' && p.status!=='abandoned' && p.status!=='blocked'){
      p.status='in_progress';
      if(!p.startedAt) p.startedAt=new Date().toISOString();
      g.currentPhaseId=id;
    }
  }
  function nextOpenPhase(){
    var live = livePhases();
    for(var i=0;i<live.length;i++) if(live[i].status==='pending') return live[i];
    return null;
  }
  function syncProgress(){
    var g=goal(); if(!g) return;
    var p=progress();
    g.progress={completed:p.completed,total:p.total,open:p.open};
  }

  window.PM56_GOAL = {
    get:goal, progress:progress, summary:summary, phaseNumber:phaseNumber,
    restore:restoreFixture, fixture:function(){ return JSON.parse(GOAL0); }
  };

  /* =====================================================================
     3. GLYPHS — five distinct SHAPES, so status never rests on colour alone.
        No emoji anywhere in this concept; inline SVG only.
     ===================================================================== */
  function glyph(status,size){
    var s=size||13;
    var o='<svg class="goal-glyph-svg" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    if(status==='completed')   return o+'<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="M7.8 12.4l2.9 2.9 5.5-6.1" stroke="var(--surface)" stroke-width="2.4"/></svg>';
    if(status==='in_progress') return o+'<circle cx="12" cy="12" r="9"/><path d="M10.1 8.2l5.9 3.8-5.9 3.8z" fill="currentColor" stroke="none"/></svg>';
    if(status==='blocked')     return o+'<rect x="4.8" y="10.4" width="14.4" height="8.8" rx="2.4"/><path d="M8.2 10.4V8.1a3.8 3.8 0 017.6 0v2.3"/></svg>';
    if(status==='abandoned')   return o+'<circle cx="12" cy="12" r="9"/><path d="M6.2 17.8L17.8 6.2"/></svg>';
    return o+'<circle cx="12" cy="12" r="8.2" stroke-dasharray="2.4 3.4"/></svg>';
  }

  /* The completion wipe must read as ONE phase finishing, never as a batch:
     already-completed fixture phases are pre-seeded as settled, so nothing
     strikes through on the first paint. A phase that completes DURING the
     session gets data-wipe="1" for one mount and its ~14-frame wipe runs. */
  var wipeTimers = Object.create(null);
  function wipeFlag(p){
    if(p.status!=='completed' || settled[p.id]) return '';
    /* 520ms, not 420: the row wash this flag also carries
       (goal-phase-complete) is 520ms, so a render landing in the 100ms gap
       used to tear the wash off ~85% of the way through and snap the
       background back to rest. This is NOT what stops the row replaying its
       entrance -- that guard is arriveFlag() below, and it is permanent.
       Lengthening a finite guard only ever moves a defect later. */
    if(!wipeTimers[p.id]) wipeTimers[p.id]=setTimeout(function(){ settled[p.id]=true; delete wipeTimers[p.id]; },520);
    return ' data-wipe="1"';
  }

  /* G1's actual guard. The entrance is emitted for the FIRST mount of a phase
     id and never again, so nothing a later render does -- dropping data-wipe,
     changing the row's status key, re-inserting the row during a reorder --
     can hand a settled row a fresh entrance to play.
     The commit is deferred to the end of the task rather than done inline
     because ONE task can legitimately paint the same phase list twice (the
     Activity panel and the goal editor both show it) and both copies must
     get the entrance; marking inline would give it to whichever rendered
     first and leave the other snapping in. */
  function arriveFlag(p){
    if(arrived[p.id]) return '';
    if(!arrivePending){
      arrivePending = [];
      setTimeout(function(){
        var list = arrivePending || []; arrivePending = null;
        for(var i=0;i<list.length;i++) arrived[list[i]] = true;
      },0);
    }
    arrivePending.push(p.id);
    return ' data-arrive="1"';
  }

  /* =====================================================================
     4. RENDERERS
     ===================================================================== */
  function evidenceLine(ctx,e){
    return '<li class="goal-ev"><span class="goal-ev-kind">'+ctx.esc(String(e.kind).replace(/_/g,' '))+'</span>'
         + '<span class="goal-ev-label">'+ctx.esc(e.label)+'</span>'
         + (e.ref?'<code class="goal-ev-ref">'+ctx.esc(e.ref)+'</code>':'')+'</li>';
  }

  function blockerCard(ctx,b,where,compact){
    if(!b) return '';
    var ph = b.phaseId ? phaseById(b.phaseId) : null;
    /* GRS-019's five fields, always all present in the model. In the narrow
       Activity panel the two a reader acts on lead and the other three are one
       click away; the goal editor never collapses them. A generic failure label
       is what this replaces -- the structure is never dropped, only folded. */
    var rows=[['Cause',b.cause],['Affected scope',b.scope],['Last attempted recovery',b.lastRecovery],
              ['Why autonomy stopped',b.whyUnsafe],['Next safe action',b.nextSafeAction]];
    var folded = compact && !ui.showBlocker;
    if(folded) rows=[rows[0],rows[4]];
    return '<div class="goal-blocker" data-k="goalblk:'+ctx.esc(where)+'">'
      + '<div class="goal-blocker-head">'+ctx.icon('warning',12)
      + '<strong>Stalled</strong>'
      + '<span class="goal-blocker-class">'+ctx.esc(b.blockerClass)+'</span>'
      + (ph?'<span class="goal-blocker-where">'+ctx.esc(ph.title)+'</span>':'')
      + (b.since?'<span class="goal-blocker-since">since '+ctx.esc(clockOf(b.since))+'</span>':'')
      + '</div>'
      + '<dl class="goal-blocker-grid">'+rows.map(function(r){
          return '<dt>'+ctx.esc(r[0])+'</dt><dd>'+ctx.esc(r[1]||'not reported')+'</dd>'; }).join('')+'</dl>'
      + (compact?'<button class="goal-blocker-more" data-action="goal-toggle" data-value="blocker">'
          +ctx.icon(folded?'down':'up',10)+' '+(folded?'Show all five blocker fields':'Show fewer fields')+'</button>':'')
      + '<div class="goal-blocker-act"><button class="soft-button" data-action="goal-unblock">'
      + ctx.icon('check',12)+' Approve CHG-4471 and resume at '+ctx.esc(ph?ph.title:'the stalled phase')+'</button>'
      + '<span class="goal-auth">user only</span></div>'
      + '</div>';
  }

  function phaseDetail(ctx,p,full){
    var num = phaseNumber(p.id);
    var out = '<div class="goal-phase-detail" data-k="phd:'+ctx.esc(p.id)+'">';
    out += '<div class="goal-exit"><span class="goal-exit-tag">Exit criterion</span><code>'+ctx.esc(p.exitCriterion)+'</code></div>';
    out += '<div class="goal-phase-facts">'
        +  '<span>'+ctx.esc(plabel(p))+'</span>'
        +  (p.startedAt?'<span>started '+ctx.esc(clockOf(p.startedAt))+'</span>':'<span>not started</span>')
        +  (p.endedAt&&p.status==='completed'?'<span>ended '+ctx.esc(clockOf(p.endedAt))+'</span>':'')
        +  (spanOf(p.startedAt,p.endedAt)?'<span>'+ctx.esc(spanOf(p.startedAt,p.endedAt))+'</span>':'')
        +  '<span>'+(p.evidence?p.evidence.length:0)+' evidence</span>'
        +  '</div>';
    if(p.evidence && p.evidence.length){
      out += '<ul class="goal-ev-list">'+p.evidence.map(function(e){ return evidenceLine(ctx,e); }).join('')+'</ul>';
    } else if(p.status==='completed'){
      out += '<p class="goal-none">No evidence attached.</p>';
    } else {
      out += '<p class="goal-none">Evidence is attached only when a phase completes — evidence on unfinished work is a promise, not evidence.</p>';
    }
    if(p.note) out += '<p class="goal-note">'+ctx.icon('info',11)+' '+ctx.esc(p.note)+'</p>';
    if(p.blocker){
      var gb=(goal()||{}).blocker;
      out += (gb && gb.phaseId===p.id)
        /* the goal-level card below is the canonical one for this blocker --
           printing the same five fields twice on one screen is noise */
        ? '<p class="goal-note">'+ctx.icon('warning',11)+' Stalled — '+ctx.esc(p.blocker.blockerClass)+'. The structured blocker for this phase is shown once, with the goal.</p>'
        : blockerCard(ctx,p.blocker,'ph-'+p.id,!full);
    }
    if(full){
      out += '<div class="goal-phase-user">'
          +  '<span class="goal-auth">user only</span>'
          +  (p.status==='completed'?'<button class="text-button" data-action="goal-reopen-phase" data-id="'+ctx.esc(p.id)+'">'+ctx.icon('restore',11)+' Re-open</button>':'')
          +  (p.status!=='abandoned'&&num&&num>1?'<button class="text-button" data-action="goal-move-phase" data-id="'+ctx.esc(p.id)+'" data-dir="up">'+ctx.icon('up',11)+' Move up</button>':'')
          +  (p.status!=='abandoned'?'<button class="text-button" data-action="goal-move-phase" data-id="'+ctx.esc(p.id)+'" data-dir="down">'+ctx.icon('down',11)+' Move down</button>':'')
          +  '</div>';
    }
    return out+'</div>';
  }

  function replanMarker(ctx,r){
    var bits=[];
    if(r.added && r.added.length)   bits.push('+'+r.added.length);
    if(r.removed && r.removed.length) bits.push('−'+r.removed.length);
    return '<li class="goal-replan-marker" data-k="rp:'+ctx.esc(r.id)+'">'
      + '<span class="goal-replan-dot">'+ctx.icon('branch',11)+'</span>'
      + '<span class="goal-replan-copy"><strong>Replan '+ctx.esc(clockOf(r.at))+(bits.length?' · '+ctx.esc(bits.join(' ')):'')+'</strong>'
      + '<span>'+ctx.esc(r.note)+'</span></span></li>';
  }

  function phaseList(ctx,full){
    var g=goal(); if(!g) return '';
    var all=displayPhases(), cur=g.currentPhaseId;
    /* A replan marker is anchored to the first phase it touched, so the list
       shows WHERE the plan changed rather than burying it in a log. */
    var anchor=Object.create(null);
    (g.replans||[]).forEach(function(r){
      var first=(r.added&&r.added[0])||(r.removed&&r.removed[0]);
      if(first && !anchor[first]) anchor[first]=r;
    });
    var rows = all.map(function(p){
      var num=phaseNumber(p.id), isCur=(p.id===cur), open=(ui.openPhase===p.id);
      var st=p.status;
      var pre = anchor[p.id] ? replanMarker(ctx,anchor[p.id]) : '';
      return pre + '<li class="goal-phase '+st.replace('_','-')+(isCur?' is-current':'')+(open?' is-open':'')+'"'
        + wipeFlag(p) + arriveFlag(p)
        + ' data-flip-move'
        + ' data-k="ph:'+ctx.esc(p.id)+':'+ctx.esc(st)+':'+(isCur?'1':'0')+'">'
        + '<button class="goal-phase-row" data-action="goal-phase" data-id="'+ctx.esc(p.id)+'"'
        + ' aria-expanded="'+(open?'true':'false')+'"'
        + ' title="'+ctx.esc(p.title+' — '+plabel(p))+'">'
        + '<span class="goal-phase-num">'+(num?num:'—')+'</span>'
        + '<span class="goal-phase-glyph">'+glyph(st,13)+(isCur?'<i class="goal-pulse"></i>':'')+'</span>'
        + '<span class="goal-phase-copy">'
        +   '<span class="goal-phase-title"><span class="goal-phase-text">'+ctx.esc(p.title)+'</span><i class="goal-strike"></i></span>'
        +   '<span class="goal-phase-sub">'+ctx.esc(isCur&&st==='in_progress'&&p.activeLabel?p.activeLabel:p.exitCriterion)+'</span>'
        + '</span>'
        + '<span class="goal-phase-state">'
        +   '<span class="goal-phase-badge">'+ctx.esc(plabel(p))+'</span>'
        +   '<span class="goal-phase-count">'+((p.evidence&&p.evidence.length)?p.evidence.length+' ev':(st==='pending'?'—':fmtK(p.estTokens)))+'</span>'
        + '</span>'
        + '</button>'
        + (open?phaseDetail(ctx,p,full):'')
        + '</li>';
    }).join('');
    return '<ol class="goal-phases'+(full?' is-full':'')+'" data-k="goalphases">'+rows+'</ol>';
  }

  function counterRow(ctx){
    var p=progress(), s=summary();
    return '<div class="goal-counter" data-k="goalcount">'
      + '<span class="goal-count-main"><b>'+p.completed+'/'+p.total+'</b> done</span>'
      + '<span class="goal-count-sep">·</span>'
      + '<span class="goal-count-main"><b>'+p.open+'</b> open</span>'
      + (p.stalled?'<span class="goal-flag stalled">'+p.stalled+' stalled</span>':'')
      + (p.abandoned?'<span class="goal-flag abandoned">'+p.abandoned+' abandoned</span>':'')
      + '<span class="goal-count-note" title="open counts pending and in-progress phases only. Stalled and abandoned phases stay visible but are excluded from unfinished work, so open is not total minus done.">'+ctx.icon('info',10)+'</span>'
      + '</div>';
  }

  function budgetRow(ctx){
    var g=anyGoal(); if(!g||!g.budget) return '';
    var b=g.budget, pct=Math.min(100,Math.round(b.used/b.limit*100));
    var over = g.status==='budget_limited';
    return '<div class="goal-budget'+(over?' is-over':'')+'" data-k="goalbudget">'
      + '<div class="goal-budget-top"><span>Goal budget</span><b>'+fmtK(b.used)+' / '+fmtK(b.limit)+' '+ctx.esc(b.unit||'tokens')+'</b></div>'
      + '<div class="goal-meter"><i style="width:'+pct+'%"></i></div>'
      + '<div class="goal-budget-note">'+(over
          ? 'Budget limit reached. This is not completion — the remaining phase is unfinished.'
          : 'One budget for the whole goal, not per phase. '+pct+'% used.')+'</div>'
      + '</div>';
  }

  function statusChip(ctx){
    var s=summary(); if(!s) return '';
    return '<span class="goal-status-chip tone-'+s.tone+'" data-k="goalchip-status">'
      + '<i class="goal-chip-dot"></i>'+ctx.esc(s.statusLabel)+'</span>';
  }

  function lifecycleRow(ctx){
    var g=anyGoal(); if(!g) return '';
    var st=g.status;
    var can = {
      edit:   st!=='cleared',
      pause:  st==='active'||st==='planning'||st==='blocked',
      resume: st==='paused',
      stop:   st!=='stopped'&&st!=='complete'&&st!=='cleared',
      clear:  st!=='cleared'
    };
    var why = {
      edit:'The goal was cleared from this thread.',
      pause: st==='paused'?'Already paused.':st==='stopped'?'The goal was stopped.':st==='complete'?'The goal is complete.':st==='budget_limited'?'Budget limited — raise the budget or stop.':'Nothing is running.',
      resume:'Resume applies only to a paused goal — this goal is '+(STATUS_LABEL[st]||st).toLowerCase()+'.',
      stop: st==='stopped'?'Already stopped.':st==='complete'?'The goal already completed.':'The goal was cleared.',
      clear:'Already cleared.'
    };
    function b(action,label,ic,ok,reason,cls){
      return '<button class="'+(cls||'soft-button')+'" data-action="'+action+'"'+(ok?'':' disabled')
        + ' title="'+ctx.esc(ok?label:reason)+'">'+ctx.icon(ic,12)+' '+label+'</button>';
    }
    if(ui.confirmClear){
      return '<div class="plan-actions goal-actions goal-confirm" data-k="goalact">'
        + '<span class="goal-confirm-copy">'+ctx.icon('warning',12)+' Clear the goal from this thread? Phases, evidence and replan history are detached. You can restore it afterwards.</span>'
        + '<button class="soft-button" data-action="goal-clear-cancel">Cancel</button>'
        + '<button class="text-button danger" data-action="goal-clear-confirm">Clear goal</button>'
        + '</div>';
    }
    return '<div class="plan-actions goal-actions" data-k="goalact">'
      + '<button class="soft-button" data-action="open-goal" title="Open the full goal in the editor pane">'+ctx.icon('eye',12)+' View Goal</button>'
      + b('edit-goal','Edit','edit',can.edit,why.edit)
      + b('pause-goal','Pause','pause',can.pause,why.pause)
      + b('resume-goal','Resume','play',can.resume,why.resume)
      + b('stop-goal','Stop','stop',can.stop,why.stop)
      + b('clear-goal','Clear','close',can.clear,why.clear,'text-button danger')
      + '</div>';
  }

  function clearedBlock(ctx){
    return '<div class="goal-cleared" data-k="goalcleared">'
      + '<div class="goal-cleared-head">'+ctx.icon('goal',14)+'<strong>No goal on this thread</strong></div>'
      + '<p>The goal was cleared. Clearing detaches the goal from the thread — it is not the same as stopping it, and it is not a completion.</p>'
      + '<div class="plan-actions"><button class="soft-button" data-action="goal-restore">'+ctx.icon('restore',12)+' Restore the cleared goal</button><span class="goal-auth">user only</span></div>'
      + '</div>';
  }

  /* ---- Surface A: the Activity Detail goal section ---- */
  function renderSection(ctx){
    var g=anyGoal();
    if(!g) return '';
    if(g.status==='cleared') return clearedBlock(ctx);
    var s=summary();
    return '<div class="goal-block" data-k="goalblock">'
      + '<div class="goal-head" data-k="goalhead">'
      +   statusChip(ctx)
      +   '<strong class="goal-title">'+ctx.esc(g.title)+'</strong>'
      +   '<span class="goal-head-sub">'+ctx.esc(s.phaseLine)+' · revision '+s.revision+'</span>'
      + '</div>'
      + counterRow(ctx)
      + budgetRow(ctx)
      + phaseList(ctx,false)
      + (g.blocker?blockerCard(ctx,g.blocker,'goal',true):'')
      + lifecycleRow(ctx)
      + '</div>';   /* closes .goal-block -- pmPatch parses the WHOLE app as one
                       fragment, so an unclosed tag here swallows every following
                       sibling in the panel, not just this section. */
  }

  /* ---- Surface B: the Activity Bar hover card (read-only, no actions) ---- */
  function renderCompact(ctx){
    var g=anyGoal(); if(!g) return '';
    if(g.status==='cleared') return '<div class="goal-compact" data-k="goalcompact"><strong>No goal on this thread</strong><p>Cleared — not stopped, not complete.</p></div>';
    var s=summary(), p=progress();
    var shown=livePhases().slice(0,5);
    return '<div class="goal-compact" data-k="goalcompact">'
      + '<div class="goal-compact-head">'+statusChip(ctx)+'<strong>'+ctx.esc(g.title)+'</strong></div>'
      + '<div class="goal-compact-line">'+ctx.esc(s.phaseLine)+'</div>'
      + '<div class="goal-compact-line">'+ctx.esc(s.counter)+(p.stalled?' · '+p.stalled+' stalled':'')+' · '+ctx.esc(s.budgetLine)+'</div>'
      + '<ul class="goal-compact-list">'+shown.map(function(x){
          return '<li class="'+x.status.replace('_','-')+(x.id===g.currentPhaseId?' is-current':'')+'">'
            + '<span class="goal-compact-glyph">'+glyph(x.status,11)+'</span>'
            + '<span class="goal-compact-title">'+ctx.esc(x.title)+'</span>'
            + '<span class="goal-compact-state">'+ctx.esc(plabel(x))+'</span></li>'; }).join('')
      + '</ul>'
      + (g.blocker?'<div class="goal-compact-blocker">'+ctx.icon('warning',11)+' '+ctx.esc(g.blocker.cause)+'</div>':'')
      + '</div>';
  }

  /* ---- Surface C: the goal editor (the fuller view, editor pane) ---- */
  var RUNTIME_LABELS = 'Mode Provider Model Effort Subagents Tokens Context Est. Cost Worktree Merge Status takeover_state';
  function runtimeGrid(ctx){
    var g=anyGoal(), m=ctx.model||ctx.selectedModel(), st=ctx.state;
    var agents=(ctx.D.subagents||[]).length;
    /* ACD-418 preserves these labels exactly. A value that is genuinely unknown
       reads "not reported" — never 0, never an em dash where a number belongs. */
    var rows=[
      ['Mode', st.mode],
      ['Provider', m&&m.provider],
      ['Model', m&&m.name],
      ['Effort', st.effort],
      ['Subagents', agents?String(agents):'not reported'],
      ['Tokens', g&&g.budget?fmtK(g.budget.used)+' of '+fmtK(g.budget.limit):'not reported'],
      ['Context', '83.9K / 131K'],
      ['Est. Cost', '$0.115'],
      ['Worktree', g&&g.worktree],
      ['Merge Status', g&&g.mergeStatus],
      ['takeover_state', g&&g.takeoverState]
    ];
    return '<div class="goal-runtime" data-k="goalruntime">'+rows.map(function(r){
      return '<div class="goal-runtime-cell"><label>'+ctx.esc(r[0])+'</label><strong>'+ctx.esc(r[1]||'not reported')+'</strong></div>';
    }).join('')+'</div>';
  }

  function subgoalBlock(ctx){
    var g=anyGoal(); if(!g||!g.subgoals||!g.subgoals.length) return '';
    var open=ui.showSubgoals;
    var active=g.subgoals.filter(function(s){return s.status==='running';}).length;
    return '<section class="goal-sub-block" data-k="goalsubs">'
      + '<button class="goal-disclose" data-action="goal-toggle" data-value="subgoals" aria-expanded="'+(open?'true':'false')+'">'
      +   ctx.icon('users',12)+'<strong>Child goals</strong><span>'+active+' of '+g.subgoals.length+' active</span>'
      +   '<span class="spacer"></span>'+ctx.icon(open?'up':'down',11)+'</button>'
      + (open?'<ul class="goal-sub-list">'+g.subgoals.map(function(s){
          return '<li class="goal-sub '+ctx.esc(s.status)+'"><span class="goal-sub-glyph">'
            + glyph(s.status==='complete'?'completed':s.status==='blocked'?'blocked':'in_progress',12)+'</span>'
            + '<span class="goal-sub-copy"><strong>'+ctx.esc(s.title)+'</strong>'
            + '<span>'+ctx.esc(s.agent)+' · '+ctx.esc(s.model)+' · '+ctx.esc(s.current)+'</span>'
            + (s.blocker?'<span class="goal-sub-blocker">'+ctx.esc(s.blocker)+'</span>':'')+'</span>'
            + '<span class="goal-sub-state">'+ctx.esc(s.status==='blocked'?'stalled':s.status)+'</span></li>';
        }).join('')+'</ul>':'')
      + '</section>';
  }

  function replanBlock(ctx){
    var g=anyGoal(); if(!g) return '';
    var list=g.replans||[], open=ui.showReplans;
    return '<section class="goal-replans" data-k="goalreplans">'
      + '<button class="goal-disclose" data-action="goal-toggle" data-value="replans" aria-expanded="'+(open?'true':'false')+'">'
      +   ctx.icon('branch',12)+'<strong>Replan history</strong><span>'+list.length+' revision'+(list.length===1?'':'s')+'</span>'
      +   '<span class="spacer"></span>'+ctx.icon(open?'up':'down',11)+'</button>'
      + (open?(list.length?'<ol class="goal-replan-list">'+list.map(function(r,i){
          return '<li><strong>Revision '+(i+2)+' · '+ctx.esc(clockOf(r.at))+' · '+ctx.esc(r.by||'agent')+'</strong>'
            + '<p>'+ctx.esc(r.note)+'</p>'
            + '<span class="goal-replan-delta">'
            + (r.added&&r.added.length?'added '+ctx.esc(r.added.map(function(id){var p=phaseById(id);return p?p.title:id;}).join(', ')):'')
            + (r.added&&r.added.length&&r.removed&&r.removed.length?' · ':'')
            + (r.removed&&r.removed.length?'removed '+ctx.esc(r.removed.map(function(id){var p=phaseById(id);return p?p.title:id;}).join(', ')):'')
            + (!(r.added&&r.added.length)&&!(r.removed&&r.removed.length)?'objective revised':'')
            + '</span></li>'; }).join('')+'</ol>'
        :'<p class="goal-none">No replans yet.</p>'):'')
      + '</section>';
  }

  function historyBlock(ctx){
    var g=anyGoal(); if(!g) return '';
    var list=(g.history||[]).slice().reverse(), open=ui.showHistory;
    return '<section class="goal-history" data-k="goalhistory">'
      + '<button class="goal-disclose" data-action="goal-toggle" data-value="history" aria-expanded="'+(open?'true':'false')+'">'
      +   ctx.icon('history',12)+'<strong>Goal activity</strong><span>'+list.length+' entries</span>'
      +   '<span class="spacer"></span>'+ctx.icon(open?'up':'down',11)+'</button>'
      + (open?'<ul class="goal-history-list">'+list.map(function(h){
          return '<li class="kind-'+ctx.esc(h.kind)+'"><span class="goal-history-at">'+ctx.esc(clockOf(h.at))+'</span>'
            + '<span class="goal-history-copy"><strong>'+ctx.esc(h.label)+'</strong><span>'+ctx.esc(h.detail||'')+'</span></span></li>';
        }).join('')+'</ul>':'')
      + '<p class="goal-none">These summaries link to Goal Runtime receipts; they are not the canonical evidence store and carry no raw logs.</p>'
      + '</section>';
  }

  function completionReport(ctx){
    var g=anyGoal(); if(!g||g.status!=='complete') return '';
    var live=livePhases(), all=displayPhases();
    var ev=[]; live.forEach(function(p){ (p.evidence||[]).forEach(function(e){ ev.push(e); }); });
    var skipped=all.filter(function(p){return p.status==='abandoned';});
    return '<section class="goal-report" data-k="goalreport">'
      + '<h2>Completion report</h2>'
      + '<div class="goal-report-grid">'
      +   '<div class="metric-card"><label>Phases completed</label><strong>'+live.filter(function(p){return p.status==='completed';}).length+' / '+live.length+'</strong></div>'
      +   '<div class="metric-card"><label>Evidence items</label><strong>'+ev.length+'</strong></div>'
      +   '<div class="metric-card"><label>Skipped or abandoned</label><strong>'+skipped.length+'</strong></div>'
      +   '<div class="metric-card"><label>Budget used</label><strong>'+fmtK(g.budget?g.budget.used:null)+'</strong></div>'
      + '</div>'
      + (skipped.length?'<p class="goal-degraded">'+ctx.icon('warning',11)+' Degraded: '+ctx.esc(skipped.map(function(p){return p.title;}).join(', '))+' was abandoned and never verified.</p>':'')
      + '<ul class="goal-ev-list">'+ev.map(function(e){return evidenceLine(ctx,e);}).join('')+'</ul>'
      + '</section>';
  }

  function editForm(ctx){
    var g=anyGoal(); if(!g) return '';
    var d=ui.draft||{};
    return '<section class="goal-edit" data-k="goaledit">'
      + '<h2>Edit goal</h2>'
      + '<p class="goal-none">Changing the objective or the phase set is a <strong>material</strong> edit: it records a Replan with an explanation and moves the goal into Replanning. Editing only the title is not material and records nothing.</p>'
      + '<label class="goal-field"><span>Title</span><input class="goal-input" data-goal-input="title" value="'+ctx.esc(d.title!=null?d.title:g.title)+'"></label>'
      + '<label class="goal-field"><span>Objective</span><textarea class="goal-input goal-textarea" data-goal-input="objective" data-pm-keep rows="4">'+ctx.esc(d.objective!=null?d.objective:g.objective)+'</textarea></label>'
      + '<label class="goal-field"><span>Add a phase (optional)</span><input class="goal-input" data-goal-input="newPhase" placeholder="Phase title" value="'+ctx.esc(d.newPhase||'')+'"></label>'
      + '<label class="goal-field"><span>Its exit criterion — binary and evaluator-verifiable</span><input class="goal-input" data-goal-input="newExit" placeholder="e.g. bench/regression.sh exits 0" value="'+ctx.esc(d.newExit||'')+'"></label>'
      + '<div class="plan-actions"><button class="primary-button" data-action="goal-save-edit">'+ctx.icon('check',12)+' Save</button>'
      + '<button class="soft-button" data-action="goal-cancel-edit">Cancel</button></div>'
      + '</section>';
  }

  function runtimeControls(ctx){
    var g=anyGoal(); if(!g||g.status==='cleared') return '';
    var cur=phaseById(g.currentPhaseId);
    var stepOk = !!cur && cur.status==='in_progress' && ['active','planning','blocked'].indexOf(g.status)>=0;
    return '<section class="goal-controls" data-k="goalctl">'
      + '<h2>Runtime controls</h2>'
      + '<p class="goal-none">Authority is asymmetric, exactly as Codex has it: the agent may only push a phase <em>forward</em> — advance, complete, block. Only a user may re-open, reorder or edit one.</p>'
      + '<div class="plan-actions">'
      +   '<button class="soft-button" data-action="goal-agent-step"'+(stepOk?'':' disabled')+' title="'+ctx.esc(stepOk?('Agent completes "'+cur.title+'" and charges '+fmtK(cur.estTokens)+' to the goal budget'):'Nothing is in progress to advance.')+'">'+ctx.icon('step',12)+' Agent: complete current phase</button>'
      +   '<span class="goal-auth agent">agent</span>'
      +   (g.status==='budget_limited'?'<button class="soft-button" data-action="goal-raise-budget">'+ctx.icon('lightning',12)+' Raise budget to 150K</button><span class="goal-auth">user only</span>':'')
      + '</div>'
      + '</section>';
  }

  function renderEditor(ctx){
    var g=anyGoal();
    if(!g) return '';
    if(g.status==='cleared'){
      return '<article class="editor-doc goal-doc" data-artifact-id="goal-artifact"><h1>No goal on this thread</h1>'
        + '<div class="editor-meta"><span class="meta-pill">Cleared</span><span class="meta-pill">Goal is not a mode</span></div>'
        + clearedBlock(ctx)+'</article>';
    }
    var s=summary();
    return '<article class="editor-doc goal-doc" data-artifact-id="goal-artifact" data-k="goaldoc">'
      + '<h1>'+ctx.esc(g.title)+'</h1>'
      + '<div class="editor-meta">'+statusChip(ctx)
      +   '<span class="meta-pill">Revision '+s.revision+'</span>'
      +   '<span class="meta-pill" title="Codex ModeKind has exactly two variants, Plan and Default. A goal is an orthogonal, thread-scoped object that rides alongside whatever mode is active.">Goal is not a mode</span>'
      +   '<span class="meta-pill">'+ctx.esc(g.worktree||'')+'</span>'
      +   '<span class="meta-pill">'+ctx.esc(s.budgetLine)+'</span>'
      + '</div>'
      + (g.status==='planning'?'<div class="goal-replan-callout" data-k="goalplanning">'+ctx.icon('branch',13)
          +'<div><strong>Replanning</strong><p>A material edit was recorded as revision '+s.revision+'. The goal is not running until the revision is accepted.</p></div>'
          +'<button class="primary-button" data-action="goal-accept-replan">Accept revision and continue</button></div>':'')
      + (ui.editing?editForm(ctx):'<h2>Objective</h2><p class="goal-objective">'+ctx.esc(g.objective)+'</p>')
      + '<h2>Runtime</h2>'+runtimeGrid(ctx)
      + '<h2>Budget</h2>'+budgetRow(ctx)
      + '<h2>Phases</h2>'
      + '<p class="goal-none">Phases are <strong>our addition</strong>, not a port: Codex’s goal is a single objective string with no phase concept, and neither OMP nor Claude Code puts phases on a goal. They are authored at goal creation or at an explicit replan — never derived from the Todo list, which every tool replaces wholesale on each write.</p>'
      + counterRow(ctx)
      + phaseList(ctx,true)
      + (g.blocker?blockerCard(ctx,g.blocker,'editor'):'')
      + subgoalBlock(ctx)
      + replanBlock(ctx)
      + historyBlock(ctx)
      + completionReport(ctx)
      + runtimeControls(ctx)
      + '<h2>Lifecycle</h2>'
      + lifecycleRow(ctx)
      + '<p class="goal-none">Plan document: <button class="text-button" data-action="open-artifact" data-id="'+ctx.esc(g.plan||'')+'">'+ctx.icon('document',11)+' open the plan artifact</button> — the plan and the phase checklist are deliberately separate surfaces.</p>'
      + '</article>';
  }

  /* ---- Surface D (bonus): the header chip and the thread-sidebar summary.
     Both exist to prove the point that the goal is NOT a mode: they render
     identically whatever `state.mode` is, and neither reads it. ---- */
  function headerChip(ctx){
    var g=anyGoal(); if(!g) return '';
    var s=summary(), p=progress();
    var txt = g.status==='cleared' ? 'No goal'
            : (p.completed+'/'+p.total+' phases · '+s.budgetLine);
    return '<button class="goal-chip tone-'+s.tone+'" data-k="goalheadchip" data-action="open-goal"'
      + ' title="'+ctx.esc('Goal — '+s.statusLabel+' · '+s.phaseLine+' · '+s.counter+'. A goal is not a mode; it rides alongside '+ctx.state.mode+'.')+'">'
      + ctx.icon('goal',13)+'<span class="goal-chip-text">'+ctx.esc(txt)+'</span></button>';
  }

  function sidebarSummary(ctx){
    var g=anyGoal(); if(!g) return '';
    var s=summary();
    var th=(ctx.state.threads||[]).filter(function(t){return t.id===g.thread;})[0];
    return '<button class="goal-sidebar tone-'+s.tone+'" data-k="goalsidebar" data-action="open-goal"'
      + ' title="Open the goal attached to this thread">'
      + '<span class="goal-sidebar-head">'+ctx.icon('goal',12)+'<strong>'+ctx.esc(g.status==='cleared'?'No goal':g.title)+'</strong></span>'
      + '<span class="goal-sidebar-line">'+ctx.esc(s.sidebar)+'</span>'
      + (th?'<span class="goal-sidebar-thread">on '+ctx.esc(th.title)+'</span>':'')
      + '</button>';
  }

  /* =====================================================================
     5. BEHAVIOUR — the six lifecycle verbs act on the model above.
        None of these is a toast stub; every one changes real state and every
        one is visible on all three surfaces at once.
     ===================================================================== */
  var COMPLETION_EVIDENCE = {
    'ph-implement':[{kind:'command_output',label:'migration 0043 applied on staging in 1.2 s',ref:'ops/staging.log'},
                    {kind:'command_output',label:'rg "events_by_tenant" src/ → 0 call sites',ref:null}],
    'ph-verify':   [{kind:'test_result',label:'unit 42 · integration 18 · browser 14 — all pass',ref:'evidence-run'},
                    {kind:'runtime',label:'write amplification 4.8% (gate ≤ 8%)',ref:'bench/write-amp.txt'}],
    'ph-handoff':  [{kind:'pr',label:'PR #812 opened · rollback runbook linked',ref:'#812'}]
  };

  function now(){ return new Date().toISOString(); }

  function agentStep(ctx){
    var g=goal(); if(!g) return;
    var cur=phaseById(g.currentPhaseId);
    if(!cur||cur.status!=='in_progress'){ ctx.toast('Nothing to advance','No phase is in progress, so there is nothing for the agent to push forward.'); return; }
    var cost=cur.estTokens||10000;
    if(g.budget && g.budget.used+cost > g.budget.limit){
      g.status='budget_limited'; g.statusSince=now();
      pushHistory('budget','Budget limit reached','Completing “'+cur.title+'” needs '+fmtK(cost)+', which exceeds the '+fmtK(g.budget.limit)+' goal budget. The phase is unfinished — budget exhaustion is not completion.');
      ctx.toast('Goal budget limited','“'+cur.title+'” is still unfinished. Budget exhaustion is not completion.');
      return;
    }
    if(g.budget) g.budget.used+=cost;
    cur.status='completed'; cur.endedAt=now();
    cur.evidence=(COMPLETION_EVIDENCE[cur.id]||[{kind:'command_output',label:'exit criterion met',ref:null}]).slice();
    delete settled[cur.id];               /* so THIS completion plays its wipe */
    pushHistory('phase',cur.title+' completed',cur.exitCriterion);
    var nxt=nextOpenPhase();
    if(nxt){
      setCurrent(nxt.id);
      pushHistory('phase',nxt.title+' started',nxt.activeLabel||'');
      if(g.status==='blocked') g.status='active';
    } else {
      g.currentPhaseId=null;
      var stalled=livePhases().filter(function(p){return p.status==='blocked';});
      if(stalled.length){
        g.status='blocked'; g.statusSince=now();
        pushHistory('blocked','Goal blocked','Every remaining phase is stalled: '+stalled.map(function(p){return p.title;}).join(', ')+'.');
        ctx.toast('Goal blocked','No phase can advance — '+stalled.length+' stalled phase'+(stalled.length===1?'':'s')+' remain.');
      } else {
        g.status='complete'; g.statusSince=now();
        pushHistory('completed','Goal completed','All '+livePhases().length+' phases met their exit criteria.');
        ctx.toast('Goal completed','All phases met their exit criteria. A completion report is in the goal editor.');
      }
    }
    syncProgress();
  }

  function paint(ctx){
    if(typeof ctx.renderGoals==='function') ctx.renderGoals();
    else ctx.renderApp();
  }

  var ACTIONS = {
    'goal-phase': function(ctx,btn){ var id=btn.dataset.id; ui.openPhase = (ui.openPhase===id)?null:id; paint(ctx); },

    'goal-toggle': function(ctx,btn){
      var v=btn.dataset.value;
      if(v==='replans') ui.showReplans=!ui.showReplans;
      else if(v==='history') ui.showHistory=!ui.showHistory;
      else if(v==='subgoals') ui.showSubgoals=!ui.showSubgoals;
      else if(v==='blocker') ui.showBlocker=!ui.showBlocker;
      paint(ctx);
    },

    'goal-agent-step': function(ctx){ agentStep(ctx); paint(ctx); },

    'goal-unblock': function(ctx){
      var g=goal(); if(!g) return;
      var id=(g.blocker&&g.blocker.phaseId)||null;
      var ph=id?phaseById(id):null;
      g.blocker=null;
      if(ph){ ph.blocker=null; ph.status='pending'; setCurrent(ph.id); }
      if(g.status==='blocked') g.status='active';
      g.statusSince=now();
      pushHistory('resumed','Blocker cleared','CHG-4471 approved by a schema owner.'+(ph?' The pointer moved back to '+ph.title+' — a goal pointer legitimately moves backward.':''));
      syncProgress();
      ctx.toast('Blocker cleared',(ph?ph.title+' resumed. ':'')+'The pointer moved back — do not drive a monotonic stepper off currentPhaseId.');
      paint(ctx);
    },

    /* User authority: only a user may re-open, reorder or edit a phase. */
    'goal-reopen-phase': function(ctx,btn){
      var p=phaseById(btn.dataset.id); if(!p||p.status!=='completed') return;
      var n=(p.evidence||[]).length;
      p.evidence=[]; p.endedAt=null; delete settled[p.id];
      setCurrent(p.id);
      pushHistory('phase',p.title+' re-opened','Re-opened by the user.'+(n?' '+n+' evidence item'+(n===1?'':'s')+' detached — evidence belongs only to a completed phase.':''));
      syncProgress(); ctx.toast('Phase re-opened',p.title+' is in progress again. Only a user can do this; the agent may only push a phase forward.');
      paint(ctx);
    },
    'goal-move-phase': function(ctx,btn){
      var g=goal(); if(!g) return;
      var id=btn.dataset.id, dir=btn.dataset.dir==='up'?-1:1;
      var i=g.phases.map(function(p){return p.id;}).indexOf(id);
      var j=i+dir;
      if(i<0||j<0||j>=g.phases.length) return;
      var t=g.phases[i]; g.phases[i]=g.phases[j]; g.phases[j]=t;
      pushHistory('replan','Phases reordered','“'+t.title+'” moved '+(dir<0?'earlier':'later')+' by the user. Numbering is computed at render time, so the list never prints 3/1/2.');
      paint(ctx);
    },
    'goal-raise-budget': function(ctx){
      var g=goal(); if(!g||!g.budget) return;
      g.budget.limit=150000;
      if(g.status==='budget_limited'){ g.status='active'; g.statusSince=now(); }
      pushHistory('budget','Budget raised','Goal budget raised to 150K tokens by the user. One budget covers the whole goal, never a phase.');
      ctx.toast('Budget raised','150K tokens for the whole goal.');
      paint(ctx);
    },

    'edit-goal': function(ctx){
      var g=anyGoal(); if(!g||g.status==='cleared'){ ctx.toast('No goal','This thread has no goal to edit.'); return; }
      ui.editing=true;
      ui.draft={title:g.title, objective:g.objective, newPhase:'', newExit:''};
      ctx.openEditor('goal-artifact');
      ctx.renderApp();
    },
    'goal-cancel-edit': function(ctx){ ui.editing=false; ui.draft=null; ctx.renderApp(); },
    'goal-save-edit': function(ctx){
      var g=anyGoal(); if(!g) return;
      var d=ui.draft||{};
      var newTitle=(d.title!=null?d.title:g.title).trim()||g.title;
      var newObj=(d.objective!=null?d.objective:g.objective).trim()||g.objective;
      var addTitle=(d.newPhase||'').trim();
      var addExit=(d.newExit||'').trim();
      var objChanged = newObj!==String(g.objective).trim();
      var material = objChanged || !!addTitle;
      g.title=newTitle;
      var added=[];
      if(addTitle){
        var id='ph-user-'+((g.phases||[]).length+1);
        g.phases.push({ id:id, title:addTitle,
          activeLabel:'Working on '+addTitle.toLowerCase(),
          status:'pending',
          exitCriterion:addExit||'Not stated — a phase without a binary, evaluator-verifiable exit criterion is a progress bar with no semantics.',
          estTokens:12000, evidence:[], blocker:null, note:null, startedAt:null, endedAt:null });
        added.push(id);
      }
      if(material){
        g.objective=newObj;
        var note = objChanged
          ? 'Objective revised by the user.'+(addTitle?' Phase “'+addTitle+'” added.':'')
          : 'Phase “'+addTitle+'” added by the user.';
        (g.replans=g.replans||[]).push({ id:'rp-'+(g.replans.length+1), at:now(), by:'user', note:note, added:added, removed:[] });
        g.status='planning'; g.statusSince=now();
        pushHistory('replan','Replan · revision '+(g.replans.length+1), note);
        ctx.addReceipt('goal-receipt','Goal replanning','Revision '+(g.replans.length+1)+' · '+note);
        ctx.toast('Replan recorded','A material edit never silently replaces the objective — revision '+(g.replans.length+1)+' is on the record.');
      } else {
        pushHistory('edit','Goal renamed','Title changed. Not a material edit, so no replan was recorded.');
        ctx.toast('Title updated','Not a material edit — no replan recorded.');
      }
      ui.editing=false; ui.draft=null; ui.showReplans=material||ui.showReplans;
      syncProgress(); ctx.renderApp();
    },
    'goal-accept-replan': function(ctx){
      var g=goal(); if(!g||g.status!=='planning') return;
      g.status='active'; g.statusSince=now();
      pushHistory('resumed','Revision accepted','The goal is running again on the revised plan.');
      ctx.toast('Revision accepted','The goal is running on the revised plan.');
      ctx.renderApp();
    },

    'pause-goal': function(ctx){
      var g=goal(); if(!g) return;
      if(['active','planning','blocked'].indexOf(g.status)<0){ ctx.toast('Cannot pause','The goal is '+(STATUS_LABEL[g.status]||g.status).toLowerCase()+'.'); return; }
      g.status='paused'; g.statusSince=now();
      pushHistory('paused','Goal paused','user_paused');   /* ACD-418 preserved token */
      ctx.addReceipt('goal-receipt','Goal paused',summary().phaseLine+' · budget metering suspended at '+fmtK(g.budget?g.budget.used:null)+'.');
      ctx.toast('Goal paused','The in-progress phase is held, not cleared. Budget metering is suspended.');
      ctx.renderApp();
    },
    'resume-goal': function(ctx){
      var g=goal(); if(!g) return;
      if(g.status!=='paused'){ ctx.toast('Nothing to resume','Resume applies only to a paused goal; this goal is '+(STATUS_LABEL[g.status]||g.status).toLowerCase()+'.'); return; }
      g.status='active'; g.statusSince=now();
      pushHistory('resumed','Goal resumed','user_paused -> resumed');   /* ACD-418 preserved token */
      ctx.toast('Goal resumed',summary().phaseLine+'.');
      ctx.renderApp();
    },
    'stop-goal': function(ctx){
      var g=goal(); if(!g) return;
      if(['stopped','complete','cleared'].indexOf(g.status)>=0){ ctx.toast('Already stopped','The goal is '+(STATUS_LABEL[g.status]||g.status).toLowerCase()+'.'); return; }
      g.status='stopped'; g.statusSince=now();
      pushHistory('stopped','Goal stopped','Stopped by the user. The goal stays attached and inspectable — stopping is not completing and not clearing.');
      ctx.addReceipt('goal-receipt','Goal stopped','Stopped at '+summary().phaseLine+'. Not a completion.');
      ctx.toast('Goal stopped','Retained and inspectable. Stopping is not completing — and not clearing.');
      ctx.renderApp();
    },
    'clear-goal': function(ctx){
      var g=anyGoal(); if(!g||g.status==='cleared'){ ctx.toast('Already cleared','This thread has no goal.'); return; }
      ui.confirmClear=true; ctx.renderApp();
    },
    'goal-clear-cancel': function(ctx){ ui.confirmClear=false; ctx.renderApp(); },
    'goal-clear-confirm': function(ctx){
      var g=anyGoal(); if(!g) return;
      cleared_stash=JSON.parse(JSON.stringify(g));
      var hist=(g.history||[]).slice();
      hist.push({at:now(),kind:'cleared',label:'Goal cleared',detail:'Detached from the thread by the user. Clearing is not stopping and not completing.'});
      D.goal={ id:g.id, title:'No goal on this thread', objective:'', status:'cleared', statusSince:now(),
        thread:g.thread, mode:null, plan:null, worktree:g.worktree, currentPhaseId:null,
        budget:null, progress:{completed:0,total:0,open:0}, tasks:{done:0,total:0},
        subgoals:[], phases:[], retiredPhases:[], replans:[], blocker:null, history:hist };
      ui.confirmClear=false; ui.openPhase=null; ui.editing=false; ui.draft=null;
      ctx.addReceipt('goal-receipt','Goal cleared','The goal was detached from this thread. Clearing is not stopping and not completing.');
      ctx.toast('Goal cleared','Detached from the thread. Restore it from Activity Detail or the goal tab.');
      ctx.renderApp();
    },
    'goal-restore': function(ctx){
      if(cleared_stash){ D.goal=cleared_stash; cleared_stash=null; seedSettled(); }
      else restoreFixture();
      pushHistory('created','Goal restored','Restored by the user.');
      ctx.toast('Goal restored','Phases, evidence and replan history are back.');
      ctx.renderApp();
    }
  };
  var cleared_stash=null;

  /* =====================================================================
     6. REGISTRATION
     ===================================================================== */
  var EXT=window.PM56_EXT;
  EXT.slot('goalSection', renderSection);
  EXT.slot('goalEditor',  renderEditor);
  Object.keys(ACTIONS).forEach(function(name){
    EXT.action(name, function(ctx,btn,ev){ ACTIONS[name](ctx,btn,ev); return true; });
  });

  /* Reset must really reset. The model-favourites defect in item 5 was exactly
     a fixture mutation that survived Reset, so the goal fixture is restored
     here. Returning false DECLINES the action, so app.js's own globalReset()
     still runs — and any handler another module registered first is chained,
     so whichever module loads last does not silently drop the others.
     CONVENTION for later waves: chain, do not clobber. */
  var prevReset = EXT._actions['reset-all'];
  EXT.action('reset-all', function(ctx,btn,ev){
    restoreFixture();
    return prevReset ? prevReset(ctx,btn,ev) : false;
  });

  /* Own delegated input listener rather than app.js's `data-input` chain,
     which has no extension hook. Deliberately does NOT re-render: the goal
     objective is a textarea and a re-render mid-keystroke would fight the
     caret. The textarea carries data-pm-keep so pmPatch leaves it alone. */
  document.addEventListener('input', function(e){
    var t=e.target;
    if(!t || !t.getAttribute) return;
    var k=t.getAttribute('data-goal-input');
    if(!k) return;
    ui.draft = ui.draft || {};
    ui.draft[k]=t.value;
  });

  window.PM56_GOAL.render = { section:renderSection, compact:renderCompact, editor:renderEditor };
  window.PM56_GOAL.chip = headerChip;
  window.PM56_GOAL.sidebar = sidebarSummary;
})();
