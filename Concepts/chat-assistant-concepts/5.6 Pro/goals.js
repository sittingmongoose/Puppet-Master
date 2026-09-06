/* goals.js — feature module.  OWNER: Assistant redesign wave (2026-09-03), Goal V2.
 *
 * WHAT CHANGED AND WHY
 * --------------------
 * This file used to model a goal as a PHASE MACHINE: a phase list with exit
 * criteria and evidence, a currentPhaseId that could move backwards, a subgoal
 * (child goal) roster, a token budget, and a replan log.  The approved redesign
 * retires every one of those.  A Goal is now exactly:
 *
 *     one concise text objective  +  a four-value lifecycle  +  durable
 *     host continuation that keeps working until the objective is complete,
 *     paused, blocked or cancelled.
 *
 * The phase model was not a port and was never canon — the previous header in
 * this file said so itself ("Phases are OUR ADDITION, not a port").  It is gone
 * rather than hidden, because a phase was a second, weaker copy of a stage the
 * owning workflow already tracked, and the two drifted.  Progress is visible
 * through To-Dos (todos.js) and the ordinary transcript, not through a
 * Goal-owned tracker.  See Plans/Goal_Runtime_System.md (GRS-048..GRS-056) and
 * Plans/FinalGUISpec.md §7 of the 2026-09-03 redesign section.
 *
 * WHAT THIS FILE IS HONEST ABOUT
 * ------------------------------
 * Continuation is host-owned in the product.  A concept page has no host, so
 * the "continuation" here is a visible demo counter with a real stop epoch:
 * pressing Pause or Cancel latches `stopEpoch`, and every simulated
 * continuation compares the epoch it was decided against before it may land.
 * That is the one invariant worth demonstrating, and it is demonstrated for
 * real rather than described in copy.
 *
 * GOAL IS NOT A MODE.  Nothing here reads state.mode.
 * GOAL IS NOT A TRANSCRIPT CARD.  It renders in Activity only.
 * GOAL DOES NOT OWN TO-DOS.  This module never reads D.todos.
 */
(function(){
  'use strict';
  var D = window.PM56_DATA;
  if(!D) return;
  var EXT = window.PM56_EXT;
  if(!EXT || !EXT.slot) return;

  /* =====================================================================
     1. THE FIXTURE — GoalRecordV2 shape (pm.goal.record.v2)
     ---------------------------------------------------------------------
     Field-for-field the record in Plans/Goal_Runtime_System.md, minus the
     storage-only columns.  The negative fields are listed in a comment rather
     than as keys, because a key set to null is still a field a renderer can
     find and start showing.
       NEGATIVE FIELDS (must never appear): title, phase, tranche,
       child_goal_ids, goal_budget, planner_role, verifier_role,
       adjudicator_role, separate_done_when, separate_scope,
       separate_constraints, attachment_manifest.
     ===================================================================== */
  var GOAL_FIXTURE = {
    demo:true,
    id:'goal-query-perf',
    projectId:'pm',
    thread:'query',
    /* One paragraph. The outcome, the finish condition and the constraints all
       live in this prose, because a user who wants to change any of them edits
       one field rather than reconciling five. */
    objective:'Reduce the tenant-scoped analytics query p95 below 100 ms without exceeding the accepted 8% write-amplification threshold, while preserving a rehearsed forward-rollback path.',
    revision:3,
    status:'active',                 /* active | paused | blocked | completed  */
    blockedReason:null,
    activeRunRef:'run-query-perf',
    createdAt:'2026-08-24T09:10:00Z',
    updatedAt:'2026-08-27T11:42:00Z',
    currentnessHash:'c8a1f0d4',
    stopEpoch:0,                     /* latched by Pause / Cancel             */
    mode:null,                       /* a Goal is not a mode — permanently null */
    revisions:[
      { revision:1, at:'2026-08-24T09:10:00Z', source:'user_direct',
        objective:'Make the analytics query faster.' },
      { revision:2, at:'2026-08-24T14:05:00Z', source:'user_direct',
        objective:'Reduce the tenant-scoped analytics query p95 below 100 ms.' },
      { revision:3, at:'2026-08-27T11:42:00Z', source:'agent_proposed_user_approved',
        approvalId:'apr-4471',
        objective:'Reduce the tenant-scoped analytics query p95 below 100 ms without exceeding the accepted 8% write-amplification threshold, while preserving a rehearsed forward-rollback path.' }
    ],
    /* GoalContinuationRecord projections. `result` is the host decision, not a
       model assertion; `stopEpochAt` is what the decision was computed against. */
    continuations:[
      { id:'cont-1', at:'2026-08-27T11:44:00Z', result:'continue', stopEpochAt:0, note:'Objective unfinished, thread idle, no stop latched.' },
      { id:'cont-2', at:'2026-08-27T11:58:00Z', result:'continue', stopEpochAt:0, note:'Index rewrite landed; benchmark evidence still open.' },
      { id:'cont-3', at:'2026-08-27T12:11:00Z', result:'continue', stopEpochAt:0, note:'Third host-admitted turn. One model response was never completion.' }
    ]
  };
  var GOAL0 = JSON.stringify(GOAL_FIXTURE);
  if(!D.goal || D.goal.id === GOAL_FIXTURE.id) D.goal = JSON.parse(GOAL0);

  /* Local view state only. Nothing here is domain truth. */
  var ui = { editing:false, draft:null, showHistory:false, showContinuations:false, confirmCancel:false, proposal:null };

  function restoreFixture(){
    D.goal = JSON.parse(GOAL0); ui.editing=false; ui.draft=null; ui.showHistory=false;
    ui.confirmCancel=false; ui.proposal=null;
    /* Plan-bound Goals live in the shared runtime, not in D.goal, so restoring
       only the fixture left every Goal a previous Build as Goal had created
       still bound -- the next admission then failed `active_run_exists` against
       a Goal the caller had just asked to be rid of. A restore that leaves
       durable records behind is a restore that lies. */
    if(RT_G.boundGoals){ RT_G.boundGoals.byPlan={}; RT_G.boundGoals.seq=0; }
  }

  var STATUS_LABEL = { active:'Running', paused:'Paused', blocked:'Blocked', completed:'Completed' };
  var STATUS_TONE  = { active:'working', paused:'idle',   blocked:'blocked', completed:'done' };

  function goal(){ var g=D.goal; return (g && g.status!=='cleared') ? g : null; }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function clockOf(iso){
    if(!iso) return '';
    var d=new Date(iso); if(isNaN(d)) return '';
    return d.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
  }
  function dayOf(iso){
    if(!iso) return '';
    var d=new Date(iso); if(isNaN(d)) return '';
    return d.toLocaleDateString([], {month:'short', day:'numeric'});
  }

  /* Two-line preview for the Activity bar. Deliberately a character budget
     rather than a word count, so a long single word cannot blow the card. */
  function preview(text, max){
    text=String(text||'');
    if(text.length<=max) return text;
    return text.slice(0, max-1).replace(/\s+\S*$/,'') + '…';
  }

  function summary(){
    var g=goal();
    if(!g) return { tone:'idle', status:'none', statusLine:'No goal', objective:'' };
    return {
      tone: g.blockedReason ? 'blocked' : (STATUS_TONE[g.status]||'idle'),
      status: g.status,
      statusLine: STATUS_LABEL[g.status]||g.status,
      objective: g.objective,
      revision: g.revision,
      blocker: g.blockedReason
    };
  }

  /* =====================================================================
     2. AUTHORITY — exactly two paths write objective text
     ---------------------------------------------------------------------
     user_direct                    : the user edits and presses Save.
     agent_proposed_user_approved   : the agent proposes, the user approves.
     There is no third path. Nothing else in this file writes `objective`.
     ===================================================================== */
  function writeRevision(objective, source, approvalId){
    var g=goal(); if(!g) return false;
    objective=String(objective||'').trim();
    if(!objective) return false;
    if(objective.length>4000) return false;            /* rejected, not truncated */
    if(objective===g.objective) return false;
    g.revision += 1;
    g.objective = objective;
    g.updatedAt = new Date().toISOString();
    g.currentnessHash = (Math.random().toString(16).slice(2,10));
    var rec = { revision:g.revision, at:g.updatedAt, source:source, objective:objective };
    if(approvalId) rec.approvalId = approvalId;
    g.revisions.push(rec);
    return true;
  }

  /* Pause / Cancel latch the stop epoch. A continuation decided before the
     latch and delivered after it is discarded — that comparison is the whole
     point of the field, so it is exercised rather than described. */
  function latchStop(g){ g.stopEpoch = (g.stopEpoch||0) + 1; }

  function admitContinuation(g, note){
    var decidedAt = g.stopEpoch;
    if(g.status!=='active') {
      g.continuations.push({ id:'cont-'+(g.continuations.length+1), at:new Date().toISOString(),
        result: g.status==='paused' ? 'pause' : g.status==='blocked' ? 'blocked' : 'complete',
        stopEpochAt:decidedAt, note:'Refused at dispatch: '+(STATUS_LABEL[g.status]||g.status).toLowerCase()+'.' });
      return false;
    }
    if(decidedAt !== g.stopEpoch){
      g.continuations.push({ id:'cont-'+(g.continuations.length+1), at:new Date().toISOString(),
        result:'pause', stopEpochAt:decidedAt, note:'Discarded: decided before a manual stop, delivered after it.' });
      return false;
    }
    g.continuations.push({ id:'cont-'+(g.continuations.length+1), at:new Date().toISOString(),
      result:'continue', stopEpochAt:decidedAt, note: note || 'Objective unfinished; host admitted another ordinary agent turn.' });
    return true;
  }

  /* =====================================================================
     3. RENDERERS
     ===================================================================== */
  function statusChip(g){
    return '<span class="goal-chip goal-chip-'+esc(g.status)+'" data-k="goal-chip">'+
      '<i class="goal-dot goal-dot-'+esc(g.status)+'"></i>'+esc(STATUS_LABEL[g.status]||g.status)+
      '</span>';
  }

  /* Activity-bar hover preview: status, a two-line objective, and ACTIONABLE
     controls. The edit icon opens Activity Detail in edit mode; the packet is
     explicit that it is an icon and that it lands in edit mode, not view mode. */
  function renderCompact(ctx){
    var g=goal(); if(!g) return '';
    /* The pencil's own tooltip promises "Edit objective in Activity Detail",
       and goal-open-editor sets ui.editing. But the DEFAULT Activity Detail
       concept (#2 Status Board) draws the COMPACT goal, which has no editor --
       so the pencil opened the panel and then showed no way to edit, on the
       one layout that ships selected. While an edit is in progress the compact
       projection yields to the full section, which owns the textarea, Save and
       Cancel. One editor, one owner, reachable from every concept. */
    if(ui.editing) return renderSection(ctx);
    var resumeable = g.status==='paused' || (g.status==='blocked' && !g.blockedReason);
    var actions =
      (g.status==='active'
        ? '<button class="soft-button" data-action="goal-pause" data-k="goal-a-pause">'+ctx.icon('pause',12)+' Pause</button>'
        : resumeable
          ? '<button class="soft-button" data-action="goal-resume" data-k="goal-a-resume">'+ctx.icon('play',12)+' Resume</button>'
          : '<button class="soft-button" data-action="goal-resume" data-k="goal-a-resume" disabled title="'+esc(g.blockedReason||'Not resumable')+'">'+ctx.icon('play',12)+' Resume</button>') +
      '<button class="soft-button" data-action="goal-cancel" data-k="goal-a-cancel">'+ctx.icon('close',12)+' Cancel</button>'+
      '<button class="icon-button" data-action="goal-open-editor" data-k="goal-a-edit" title="Edit objective in Activity Detail">'+ctx.icon('edit',12)+'</button>';
    return '<div class="goal-compact" data-k="goal-compact">'+
        '<div class="goal-compact-head" data-k="goal-compact-head">'+statusChip(g)+
          '<span class="goal-rev" data-k="goal-rev">Revision '+g.revision+'</span></div>'+
        '<p class="ab-objective goal-objective-2" data-k="ab-obj">'+esc(preview(g.objective, 150))+'</p>'+
        (g.blockedReason?'<p class="goal-blocker-line" data-k="goal-blocked">'+esc(g.blockedReason)+'</p>':'')+
        '<div class="goal-compact-actions" data-k="goal-compact-actions">'+actions+'</div>'+
      '</div>';
  }

  /* Activity Detail. Objective area, Save / Cancel edit, lifecycle controls,
     History. NO title field, NO phases, NO child goals, NO budget, NO current
     action, NO next action, NO invented percentage. */

  /* =====================================================================
     BOUND GOALS — Additive Correction v4 (PGOAL-003..014, GREPLAY-001..011)
     ---------------------------------------------------------------------
     `Build as Goal` creates ONE simple Goal, ONE PlanRun and ONE
     GoalPlanBinding, atomically. The Goal it creates is an ordinary simple
     Goal: text only, no title, no phases, no child Goals, no budgets. What is
     new is the hidden lineage beside it (origin, source refs, admitted context
     manifest, bound Plan) and the binding record, neither of which is a
     visible Goal field.

     A bound Goal lives in Activity, exactly like the thread Goal. It never
     becomes a thread card.
     ===================================================================== */
  var RT_G = window.PM56_RUNTIME = window.PM56_RUNTIME || {};
  RT_G.boundGoals = RT_G.boundGoals || { byPlan:{}, seq:0 };

  /* GREPLAY-002. The FOUR origin kinds, as a closed vocabulary the owner
     publishes rather than a string one code path happens to write. Only
     `plan_build` was ever produced here, so nothing could tell whether the
     other three existed as a contract or had simply been forgotten; and
     because a Goal has no title, origin can never be inferred from one.
     `originOf()` is the single reader, so a future writer that invents a
     fifth kind fails closed instead of leaking an unknown value into replay. */
  var ORIGIN_KINDS = ['user_request','agent_requested_by_user','plan_build','internal_workflow'];
  var ORIGIN_LABEL = {
    user_request:'the user asked for it directly',
    agent_requested_by_user:'an agent created it because the user asked the agent to',
    plan_build:'an approved Plan was built as a Goal',
    internal_workflow:'a workflow uses it internally'
  };
  function originOf(kind){
    return ORIGIN_KINDS.indexOf(kind)>=0 ? kind : 'user_request';
  }
  /* The plain thread Goal has an origin too; it is simply not `plan_build`. */
  function lineageFor(goalId, revision, kind, o){
    o=o||{};
    return { schema:'pm.goal.origin_lineage.v1', goal_id:goalId, goal_revision:revision||1,
             origin_kind:originOf(kind), origin_label:ORIGIN_LABEL[originOf(kind)],
             source_message_refs:o.source_message_refs||[],
             source_context_manifest_ref:o.source_context_manifest_ref||null,
             bound_plan_ref:o.bound_plan_ref||null,
             owning_workflow_ref:o.owning_workflow_ref||null };
  }

  function boundFor(planId){ return RT_G.boundGoals.byPlan[planId] || null; }
  function boundList(threadId){
    var out=[], k, m=RT_G.boundGoals.byPlan;
    for(k in m){ if(!threadId || m[k].thread===threadId) out.push(m[k]); }
    return out;
  }

  /* PGOAL-003/011/012. Fails CLOSED on a stale hash, on an existing active run,
     and returns the ORIGINAL result for a repeated idempotency key. */
  function createBound(o){
    var prior=boundFor(o.plan_id);
    if(prior && prior.idempotency_key===o.idempotency_key) return { ok:true, goal:prior, replayed:true };
    if(prior && prior.status!=='canceled' && prior.status!=='completed')
      return { ok:false, error:'active_run_exists', goal:prior };
    if(o.expected_hash && o.plan_hash && o.expected_hash!==o.plan_hash)
      return { ok:false, error:'stale_plan_version' };
    RT_G.boundGoals.seq++;
    var id='goal-plan-'+o.plan_id+'-'+RT_G.boundGoals.seq;
    var g={
      id:id, projectId:'pm', thread:o.thread, bound:true,
      objective:'Complete the approved Plan “'+o.title+'” at version V'+o.version+' exactly as written.',
      revision:1, status:'active', blockedReason:null,
      createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
      currentnessHash:o.plan_hash, stopEpoch:0, mode:null,
      idempotency_key:o.idempotency_key,
      /* GREPLAY-001..002: hidden lineage. Not rendered as Goal content. */
      lineage:lineageFor(id, 1, o.origin_kind||'plan_build', {
                source_message_refs:o.source_refs||[],
                source_context_manifest_ref:'ctx-manifest:'+o.plan_id+'@V'+o.version,
                bound_plan_ref:o.plan_id+'@V'+o.version,
                owning_workflow_ref:o.owning_workflow_ref||null }),
      /* PGOAL-003/004: the binding. todo_list_ref and planunit_bundle_ref are
         REFERENCES to what already exists -- identity equality is the proof
         that nothing was duplicated. */
      binding:{ schema:'pm.goal.plan_binding.v1', goal_id:id,
                assistant_plan_id:o.plan_id, plan_version:o.version, plan_hash:o.plan_hash,
                plan_run_id:o.plan_run_id,
                todo_list_ref:'todos:'+o.thread, planunit_bundle_ref:o.planunit_bundle_ref||null },
      history:[{ at:new Date().toISOString(), what:'created', note:'Build as Goal admitted; Goal, PlanRun and binding committed together.' }],
      continuations:[], revisions:[{ revision:1, at:new Date().toISOString(), source:'plan_build', objective:null }]
    };
    g.revisions[0].objective=g.objective;
    RT_G.boundGoals.byPlan[o.plan_id]=g;
    return { ok:true, goal:g };
  }

  function boundTransition(planId, to, note){
    var g=boundFor(planId); if(!g) return null;
    /* GREPLAY-009/010: pause, cancel and revision each fence the epoch, and a
       manual stop is authoritative -- resume after cancel is refused. */
    if(to==='active' && g.status==='canceled') return { ok:false, error:'canceled_is_terminal' };
    if(to==='paused' || to==='canceled') g.stopEpoch++;
    g.status=to; g.updatedAt=new Date().toISOString();
    g.history.push({ at:g.updatedAt, what:to, note:note||'' });
    return { ok:true, goal:g };
  }

  function renderBound(ctx, g){
    var b=g.binding;
    return '<div class="goal-bound goal-bound-'+esc(g.status)+'" data-k="goal-bound-'+esc(g.id)+'" data-goal-id="'+esc(g.id)+'" data-bound-plan="'+esc(b.assistant_plan_id)+'">'+
      '<div class="goal-bound-head">'+
        '<span class="goal-bound-chip">'+esc(g.status)+'</span>'+
        '<span class="goal-bound-link">bound to '+esc(b.assistant_plan_id)+' · V'+b.plan_version+'</span>'+
        '<span class="spacer"></span>'+
        '<span class="goal-hash">'+esc(b.plan_hash)+'</span>'+
      '</div>'+
      '<p class="goal-objective-full">'+esc(g.objective)+'</p>'+
      '<div class="goal-lifecycle">'+
        (g.status==='active'
          ? '<button class="soft-button" data-action="goal-bound-pause" data-id="'+esc(b.assistant_plan_id)+'">'+ctx.icon('pause',12)+' Pause</button>'
          : '<button class="soft-button" data-action="goal-bound-resume" data-id="'+esc(b.assistant_plan_id)+'"'+(g.status==='paused'?'':' disabled')+'>'+ctx.icon('play',12)+' Resume</button>')+
        '<button class="soft-button danger" data-action="goal-bound-cancel" data-id="'+esc(b.assistant_plan_id)+'"'+(g.status==='canceled'||g.status==='completed'?' disabled':'')+'>'+ctx.icon('close',12)+' Cancel Goal</button>'+
        '<span class="spacer"></span>'+
        '<button class="text-button" data-action="goal-bound-open-plan" data-id="'+esc(b.assistant_plan_id)+'">Open Plan</button>'+
      '</div>'+
      '<p class="goal-note">Reuses the thread To-Do list (<code>'+esc(b.todo_list_ref)+'</code>)'+
        (b.planunit_bundle_ref?' and the scoped PlanUnit bundle (<code>'+esc(b.planunit_bundle_ref)+'</code>)':'')+
        '. No phases, no child Goals, no Orchestrator. Editing this Goal never edits the approved Plan.</p>'+
    '</div>';
  }

  function renderBoundAll(ctx){
    var t=ctx && ctx.state && ctx.state.selectedThread;
    var gs=boundList(t);
    if(!gs.length) return '';
    return '<div class="goal-bound-wrap" data-k="goal-bound-wrap">'+
      '<h4 class="goal-bound-h">Plan-bound Goals</h4>'+
      gs.map(function(g){ return renderBound(ctx,g); }).join('')+'</div>';
  }

  function renderSection(ctx){
    var g=goal();
    if(!g) return '<div class="goal-section-v2" data-k="goal-section-v2">'+renderBoundAll(ctx)+
      '<div class="goal-empty" data-k="goal-empty"><p>No goal on this thread. Start one with <code>/goal</code>, the Goal control, or by asking for one directly.</p></div></div>';

    var editing = ui.editing;
    var draft = ui.draft==null ? g.objective : ui.draft;
    var over = draft.length>4000;

    var body = editing
      ? '<div class="goal-edit" data-k="goal-edit">'+
          '<textarea class="goal-objective-input" data-goal-input="objective" data-pm-keep rows="6" '+
            'placeholder="One concise objective. The outcome, the finish condition and the constraints all live here.">'+esc(draft)+'</textarea>'+
          '<div class="goal-edit-foot">'+
            '<span class="goal-count'+(over?' over':'')+'">'+draft.length+' / 4000</span>'+
            '<span class="spacer"></span>'+
            '<button class="text-button" data-action="goal-cancel-edit">Cancel edit</button>'+
            '<button class="primary-button" data-action="goal-save"'+(over?' disabled':'')+'>Save</button>'+
          '</div>'+
          '<p class="goal-note">Save is your approved change. There is no confirmation dialog for your own edit.</p>'+
        '</div>'
      : '<div class="goal-view" data-k="goal-view">'+
          '<p class="goal-objective-full">'+esc(g.objective)+'</p>'+
          '<button class="soft-button" data-action="goal-edit">'+ctx.icon('edit',12)+' Edit objective</button>'+
        '</div>';

    var resumeable = g.status==='paused';
    var lifecycle = '<div class="goal-lifecycle" data-k="goal-lifecycle">'+
      (g.status==='active'
        ? '<button class="soft-button" data-action="goal-pause">'+ctx.icon('pause',12)+' Pause</button>'
        : '<button class="soft-button" data-action="goal-resume"'+(resumeable?'':' disabled title="'+esc(g.blockedReason||'Not resumable')+'"')+'>'+ctx.icon('play',12)+' Resume</button>')+
      '<button class="soft-button danger" data-action="goal-cancel">'+ctx.icon('close',12)+' Cancel Goal</button>'+
      '<span class="spacer"></span>'+
      '<button class="soft-button" data-action="goal-continue" data-k="goal-continue"'+(g.status==='active'?'':' disabled')+'>'+ctx.icon('play',12)+' Admit next turn</button>'+
      '</div>';

    var hist = ui.showHistory
      ? '<div class="goal-history" data-k="goal-history">'+
          g.revisions.slice().reverse().map(function(r){
            return '<div class="goal-history-row" data-k="goal-hr-'+r.revision+'">'+
              '<span class="goal-history-rev">V'+r.revision+'</span>'+
              '<span class="goal-history-when">'+esc(dayOf(r.at)+' '+clockOf(r.at))+'</span>'+
              '<span class="goal-history-src goal-src-'+esc(r.source)+'">'+esc(r.source==='user_direct'?'You edited it':'You approved an agent proposal')+'</span>'+
              '<p class="goal-history-text">'+esc(r.objective)+'</p>'+
            '</div>';
          }).join('')+
        '</div>' : '';

    var conts = ui.showContinuations
      ? '<div class="goal-conts" data-k="goal-conts">'+
          g.continuations.slice().reverse().map(function(c){
            return '<div class="goal-cont-row goal-cont-'+esc(c.result)+'" data-k="goal-cr-'+esc(c.id)+'">'+
              '<span class="goal-cont-result">'+esc(c.result)+'</span>'+
              '<span class="goal-cont-when">'+esc(clockOf(c.at))+'</span>'+
              '<span class="goal-cont-epoch">stop epoch '+c.stopEpochAt+'</span>'+
              '<p class="goal-cont-note">'+esc(c.note)+'</p>'+
            '</div>';
          }).join('')+
          '<p class="goal-note">The host decides continuation and records the decision. One model response ending is never completion.</p>'+
        '</div>' : '';

    /* The approval host renders HERE as well as in the goal-artifact editor
       pane. The control that raises an agent proposal lives in this section,
       but renderEditor was only reachable through the `goalEditor` slot -- so a
       proposal raised from Activity Detail was invisible until the user
       happened to open a different pane, and "agent-proposed Goal changes
       require the existing approval dialog" was not satisfied on the very
       surface that raised it. */
    return '<div class="goal-section-v2" data-k="goal-section-v2">'+
      renderEditor(ctx)+
      renderBoundAll(ctx)+
      '<div class="goal-head" data-k="goal-head">'+statusChip(g)+
        '<span class="goal-rev">Revision '+g.revision+'</span>'+
        '<span class="spacer"></span>'+
        '<span class="goal-hash" title="Compare-and-swap token for every mutation">'+esc(g.currentnessHash)+'</span>'+
      '</div>'+
      (g.blockedReason?'<div class="goal-blocked-card" data-k="goal-blocked-card">'+ctx.icon('lock',13)+'<div><strong>Blocked</strong><p>'+esc(g.blockedReason)+'</p></div></div>':'')+
      body + lifecycle +
      '<div class="goal-disclosures" data-k="goal-disclosures">'+
        '<button class="text-button" data-action="goal-toggle-history">'+(ui.showHistory?'Hide':'Show')+' History ('+g.revisions.length+')</button>'+
        '<button class="text-button" data-action="goal-toggle-conts">'+(ui.showContinuations?'Hide':'Show')+' continuation log ('+g.continuations.length+')</button>'+
        '<button class="text-button" data-action="goal-demo-proposal">Simulate an agent-proposed change</button>'+
      '</div>'+ hist + conts +
    '</div>';
  }

  /* The approval host for an agent-proposed replacement. Shows exactly the
     current objective, the proposed complete replacement, Approve Change and
     Cancel — and writes nothing until Approve. */
  function renderEditor(ctx){
    if(!ui.proposal) return '';
    var g=goal(); if(!g) return '';
    return '<div class="goal-approval" data-k="goal-approval">'+
      '<div class="goal-approval-head">'+ctx.icon('warning',13)+'<strong>The agent proposes a new objective</strong></div>'+
      '<div class="goal-approval-pair">'+
        '<div><label>Current</label><p>'+esc(g.objective)+'</p></div>'+
        '<div><label>Proposed</label><p>'+esc(ui.proposal.objective)+'</p></div>'+
      '</div>'+
      '<p class="goal-note">Nothing changes until you approve. A denied or expired proposal leaves the revision and currentness hash untouched.</p>'+
      '<div class="plan-actions">'+
        '<button class="soft-button" data-action="goal-deny-proposal">Cancel</button>'+
        '<button class="primary-button" data-action="goal-approve-proposal">Approve Change</button>'+
      '</div>'+
    '</div>';
  }

  function headerChip(){ return ''; }        /* no Goal chip in the header — packet §1 */
  function sidebarSummary(){ var s=summary(); return s.statusLine; }

  /* =====================================================================
     4. ACTIONS
     ===================================================================== */
  var ACTIONS = {
    'goal-edit': function(ctx){ var g=goal(); if(!g) return; ui.editing=true; ui.draft=g.objective; ctx.renderApp(); },
    'goal-cancel-edit': function(ctx){ ui.editing=false; ui.draft=null; ctx.renderApp(); },
    'goal-save': function(ctx){
      var g=goal(); if(!g) return;
      var next = ui.draft==null ? g.objective : ui.draft;
      var ok = writeRevision(next, 'user_direct', null);
      ui.editing=false; ui.draft=null;
      ctx.renderApp();
      if(ok) ctx.toast('Objective saved', 'Revision '+g.revision+' recorded as your own change. No approval was needed.');
      else ctx.toast('No change recorded', 'The objective was unchanged, empty, or over the 4,000-character limit.');
    },
    'goal-open-editor': function(ctx){
      var g=goal(); if(!g) return;
      ui.editing=true; ui.draft=g.objective;
      ctx.state.activity.open=true; ctx.state.activity.domain='goal'; ctx.state.activity.scope='focus';
      if(ctx.state.activity.expanded && ctx.state.activity.expanded.indexOf('goal')<0) ctx.state.activity.expanded.push('goal');
      ctx.closeMenu && ctx.closeMenu();
      ctx.renderApp();
    },
    'goal-pause': function(ctx){
      var g=goal(); if(!g||g.status!=='active') return;
      g.status='paused'; latchStop(g); g.updatedAt=new Date().toISOString();
      ctx.renderApp();
      ctx.toast('Goal paused', 'Stop epoch '+g.stopEpoch+' is latched. Nothing auto-resumes it — not a quota reset, not a window opening.');
    },
    'goal-resume': function(ctx){
      var g=goal(); if(!g) return;
      if(g.status==='blocked' && g.blockedReason){ ctx.toast('Cannot resume', g.blockedReason); return; }
      if(g.status!=='paused' && g.status!=='blocked') return;
      g.status='active'; g.updatedAt=new Date().toISOString();
      ctx.renderApp();
      ctx.toast('Goal resumed', 'You resumed it explicitly. That is the only thing that clears a latched stop.');
    },
    'goal-cancel': function(ctx){
      var g=goal(); if(!g) return;
      latchStop(g);
      ctx.addReceipt('goal-receipt','Goal cancelled','Objective ended at revision '+g.revision+'. Workflow-owned records remain under their own owners.');
      D.goal = Object.assign({}, g, { status:'cleared' });
      ui.editing=false; ui.draft=null;
      ctx.renderApp();
    },
    'goal-continue': function(ctx){
      var g=goal(); if(!g) return;
      var admitted = admitContinuation(g);
      ui.showContinuations = true;
      ctx.renderApp();
      ctx.toast(admitted?'Next turn admitted':'Continuation refused',
        admitted ? 'The host reloaded canonical Goal state, compared the stop epoch, and admitted one ordinary agent turn.'
                 : 'The stop epoch moved or the Goal is not active, so the decision was discarded rather than dispatched.');
    },
    'goal-toggle-history': function(ctx){ ui.showHistory=!ui.showHistory; ctx.renderApp(); },
    'goal-toggle-conts': function(ctx){ ui.showContinuations=!ui.showContinuations; ctx.renderApp(); },
    'goal-demo-proposal': function(ctx){
      ui.proposal = { objective:'Reduce the tenant-scoped analytics query p95 below 80 ms, accept up to 12% write amplification, and drop the rehearsed rollback requirement.', at:new Date().toISOString() };
      ctx.renderApp();
      ctx.toast('Proposal raised', 'The agent wrote nothing. The approval host is showing the current and proposed objectives.');
    },
    'goal-approve-proposal': function(ctx){
      var p=ui.proposal; if(!p) return;
      var g=goal(); if(!g) return;
      var ok = writeRevision(p.objective, 'agent_proposed_user_approved', 'apr-'+Math.floor(Math.random()*9000+1000));
      ui.proposal=null;
      ctx.renderApp();
      ctx.toast(ok?'Change approved':'Nothing written', ok?('Revision '+g.revision+' recorded with its originating approval id.'):'The proposal did not change the objective.');
    },
    'goal-deny-proposal': function(ctx){
      var g=goal(); var before = g?g.revision:0;
      ui.proposal=null; ctx.renderApp();
      ctx.toast('Proposal denied', 'Revision stayed at '+before+' and the currentness hash is untouched.');
    },

    /* --- Additive Correction v4: bound Goal lifecycle -------------------
       PGOAL-007/008. These control the BOUND PlanRun. The Plan's Build
       control stays Building… through pause; only cancel makes it Canceled,
       and cancel fences that execution's schedules and quota consent while
       leaving unrelated scheduled messages alone. */
    'goal-bound-pause': function(ctx,btn){
      var id=btn.dataset.id, P=window.PM56_PLANS;
      var res=boundTransition(id,'paused','Paused by the user; the bound PlanRun stopped at a safe boundary.');
      if(!res) return;
      if(P && P.boundPause) P.boundPause(id, res.goal.stopEpoch);
      ctx.renderApp();
      ctx.toast('Goal paused','The Plan stays Building… with “Paused” as its secondary reason. Continuation epoch is now '+res.goal.stopEpoch+'.');
    },
    'goal-bound-resume': function(ctx,btn){
      var id=btn.dataset.id, P=window.PM56_PLANS;
      var res=boundTransition(id,'active','Resumed under the current epoch.');
      if(!res) return;
      if(res.ok===false){ ctx.toast('Refused', 'A cancelled Goal is terminal; resume is not available.'); return; }
      if(P && P.boundResume) P.boundResume(id, res.goal.stopEpoch);
      ctx.renderApp();
      ctx.toast('Goal resumed','Revalidated against the current epoch before the bound run continued.');
    },
    'goal-bound-cancel': function(ctx,btn){
      var id=btn.dataset.id, P=window.PM56_PLANS;
      var res=boundTransition(id,'canceled','Cancelled by the user; the bound PlanRun and its schedules are fenced.');
      if(!res) return;
      var fenced = (P && P.boundCancel) ? P.boundCancel(id, res.goal.stopEpoch) : null;
      ctx.renderApp();
      ctx.toast('Goal cancelled', fenced
        ? ('Plan is Canceled. Invalidated '+fenced.schedules+' schedule(s) for this execution; '+fenced.untouched+' unrelated scheduled message(s) untouched.')
        : 'Plan is Canceled.');
    },
    'goal-bound-open-plan': function(ctx,btn){
      var P=window.PM56_PLANS;
      if(P && P.openDetails) P.openDetails(ctx, btn.dataset.id);
    }
  };
  Object.keys(ACTIONS).forEach(function(name){
    EXT.action(name, function(ctx,btn,ev){ ACTIONS[name](ctx,btn,ev); return true; });
  });

  EXT.slot('goalSection', renderSection);
  EXT.slot('goalEditor',  renderEditor);

  /* Reset must really reset. Chain rather than clobber, so whichever module
     loads last does not silently drop the others. */
  var prevReset = EXT._actions && EXT._actions['reset-all'];
  EXT.chainAction('reset-all', function(ctx,btn,ev){
    restoreFixture();
    return false;
  });

  /* Own delegated input listener. Deliberately does NOT re-render: the
     objective is a textarea and a re-render mid-keystroke would fight the
     caret. The textarea carries data-pm-keep so pmPatch leaves it alone. */
  document.addEventListener('input', function(e){
    var t=e.target;
    if(!t || !t.getAttribute) return;
    if(t.getAttribute('data-goal-input')!=='objective') return;
    ui.draft = t.value;
    var foot = t.parentNode && t.parentNode.querySelector('.goal-count');
    if(foot){ foot.textContent = ui.draft.length + ' / 4000'; foot.classList.toggle('over', ui.draft.length>4000); }
  });

  window.PM56_GOAL = {
    get:goal, summary:summary,
    /* phaseNumber/progress are retained as retired-shape stubs so any older
       harness that still calls them gets a truthful empty answer instead of a
       TypeError. Nothing in the redesign calls either. */
    progress:function(){ return { completed:0, total:0, open:0, retired:true }; },
    phaseNumber:function(){ return 0; },
    restore:restoreFixture,
    fixture:function(){ return JSON.parse(GOAL0); },
    render:{ section:renderSection, compact:renderCompact, editor:renderEditor },
    /* Additive Correction v4 (PGOAL/GREPLAY). Plan-bound simple Goals. */
    bound:boundFor,
    boundList:boundList,
    createBound:createBound,
    boundTransition:boundTransition,
    chip:headerChip,
    sidebar:sidebarSummary,
    /* GREPLAY-002: the closed origin vocabulary, published by its owner. */
    originKinds:function(){ return ORIGIN_KINDS.slice(); },
    originLabel:function(k){ return ORIGIN_LABEL[originOf(k)]; },
    lineageFor:lineageFor
  };
})();
