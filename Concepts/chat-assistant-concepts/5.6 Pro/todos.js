/* ToDoController — the sole thread-local To-Do writer and Activity projection.
 * Current owners: Plans/ToDo_Runtime.md (TDR-001..012, TDG-001..016, APR-008).
 * Batch 16 adds actual admitted-work bindings, evidence-gated transitions,
 * atomic restructuring, currentness fencing and uncapped virtualized hierarchy.
 * Existing literal demo history is historical fixture data, not recovered work.
 * Typed session-local results/receipts are NOT durable native EventRecords.
 * Goal, Plan, scheduling, artifacts and work adapters keep their own authority.
 */
(function(){
  'use strict';
  var D = window.PM56_DATA; if(!D) return;
  var EXT = window.PM56_EXT; if(!EXT || !EXT.slot) return;
  var RT = window.PM56_RUNTIME = window.PM56_RUNTIME || {};

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  /* Seed transitions carry fixed literal timestamps (never an invented
     Date.now() baseline — see activity-panel.js's own rule against a
     synthetic clock). Interactive mutations made by clicking a control DURING
     this session use the real current time, because it really is now. */
  function nowIso(){ return new Date().toISOString(); }

  /* =====================================================================
     1. THE FIXTURE — TodoItemV2 shape (pm.chat.todo_item.v2), field-for-field
     ---------------------------------------------------------------------
     Flat storage, not nested children: `parent_todo_id` is the only parent
     link, matching Plans/ToDo_Runtime.md's record shape exactly rather than
     keeping two copies of the hierarchy that could drift. Tree structure is
     derived at render time by `childrenOf()`.
       NEGATIVE FIELDS (must never appear on an item): verification_state,
       source_group_label, done_category.
     `blocked_reason_ref` holds the reason text directly rather than a second
     indirection table, the same pragmatic choice goals.js made for
     `blockedReason` — there is exactly one blocked leaf in this whole fixture
     (tq-07), so a resolver table would be one row for no real benefit.
     ===================================================================== */
  var PROJECT_ID = 'pm';

  function itemFactory(threadId){
    return function(o){
      return Object.assign({
        project_id:PROJECT_ID, thread_id:threadId, parent_todo_id:null,
        depends_on:[], parallel_group_id:null,
        plan_id:null, plan_version:null, plan_step_ids:[], planunit_ids:[], goal_id:null,
        expected_outcome:null, active_work_ids:[], blocked_reason_ref:null,
        started_at:null, completed_at:null, revision:1, transitions:[]
      }, o);
    };
  }
  var Q = itemFactory('query');       /* 'query' already carries goals.js's GOAL_FIXTURE */
  var R = itemFactory('subagents');   /* 'Runtime Architecture Review' — a second, unrelated list */
  var C = itemFactory('plan-deep');   /* the ledger-bound Plan that is Building… (plans.js ap-cache) */

  /* transition_id/expected_revision/committed_revision follow
     Plans/ToDo_Runtime.md's TodoTransition (pm.chat.todo_transition.v1).
     `note` is a documented extension beyond the strict schema for the human
     receipt text, the same way goals.js's continuations[] added `note` beside
     the strict GoalContinuationRecord fields. `revBefore` must equal the
     item's revision immediately before this transition — every item below
     keeps `revision === transitions.length + 1` as an invariant a future
     editor must preserve. */
  function TR(todoId, from, to, cause, ref, revBefore, at, note){
    return { transition_id:'tr-'+todoId+'-'+revBefore, todo_id:todoId, from_status:from, to_status:to,
      cause_kind:cause, cause_ref:ref, expected_revision:revBefore, committed_revision:revBefore+1,
      created_at:at, note:note };
  }

  /* --------------------------------------------------------------- query
     Same objective goals.js's GOAL_FIXTURE states on this thread. Two
     leaves carry goal_id:'goal-query-perf' as inert lineage; nothing here
     reads or writes D.goal, and nothing groups by it. */
  var QUERY_ITEMS = [
    Q({ todo_id:'tq-p1', title:'Establish an accurate performance baseline', display_order:1,
      status:'completed', revision:2,
      transitions:[ TR('tq-p1','pending','completed','child_rollup','rollup:tq-p1',1,'2026-08-24T11:10:00Z','Both required children completed.') ] }),
    Q({ todo_id:'tq-01', parent_todo_id:'tq-p1', display_order:1,
      title:'Correct the benchmark fixture to production row shape',
      expected_outcome:'The benchmark fixture matches the 128,400-row production shape, and a rerun reproduces the original slow baseline before any change lands.',
      goal_id:'goal-query-perf', status:'completed', revision:3,
      started_at:'2026-08-24T09:20:00Z', completed_at:'2026-08-24T10:40:00Z',
      transitions:[
        TR('tq-01','pending','in_progress','work_admitted','assignment:tq-01',1,'2026-08-24T09:20:00Z','A tool batch was durably admitted to rebuild the fixture at production row count.'),
        TR('tq-01','in_progress','completed','outcome_satisfied','evidence:tq-01-row-count',2,'2026-08-24T10:40:00Z','Row count and baseline latency both reproduced against the corrected fixture; outcome accepted.')
      ] }),
    Q({ todo_id:'tq-02', parent_todo_id:'tq-p1', display_order:2, depends_on:['tq-01'],
      title:'Measure the current tenant-scoped query path against the corrected fixture',
      expected_outcome:'p95 latency for the tenant-scoped analytics query is recorded from a real EXPLAIN ANALYZE run against the corrected fixture.',
      goal_id:'goal-query-perf', status:'completed', revision:3,
      started_at:'2026-08-24T10:45:00Z', completed_at:'2026-08-24T11:10:00Z',
      transitions:[
        TR('tq-02','pending','in_progress','work_admitted','assignment:tq-02',1,'2026-08-24T10:45:00Z','Admitted once the corrected fixture (tq-01) was accepted.'),
        TR('tq-02','in_progress','completed','outcome_satisfied','evidence:tq-02-explain-analyze',2,'2026-08-24T11:10:00Z','p95 482ms recorded from EXPLAIN ANALYZE output; outcome accepted.')
      ] }),

    Q({ todo_id:'tq-p2', title:'Design and validate the index change', display_order:2,
      status:'in_progress', revision:2,
      transitions:[ TR('tq-p2','pending','in_progress','child_rollup','rollup:tq-p2',1,'2026-08-25T09:00:00Z','A child entered in_progress.') ] }),
    Q({ todo_id:'tq-03', parent_todo_id:'tq-p2', display_order:1, depends_on:['tq-02'],
      title:'Compare composite index column orderings',
      expected_outcome:'A ranked comparison of at least two column orderings names the winning order and the query plan that justifies it.',
      goal_id:'goal-query-perf', status:'completed', revision:3,
      started_at:'2026-08-25T09:00:00Z', completed_at:'2026-08-25T13:30:00Z',
      transitions:[
        TR('tq-03','pending','in_progress','work_admitted','assignment:tq-03',1,'2026-08-25T09:00:00Z','Admitted once the p95 baseline (tq-02) was accepted.'),
        TR('tq-03','in_progress','completed','outcome_satisfied','evidence:tq-03-plan-compare',2,'2026-08-25T13:30:00Z','tenant_id-leading order accepted; plan comparison attached.')
      ] }),
    /* CONCURRENT PAIR: tq-04 and tq-05 share parallel_group_id and are BOTH
       in_progress at once — the genuine concurrency TDR-003 requires. */
    Q({ todo_id:'tq-04', parent_todo_id:'tq-p2', display_order:2, depends_on:['tq-03'],
      title:'Inspect write amplification under the new index',
      expected_outcome:'Write amplification for the new index is measured and compared against the accepted 8% threshold from the Goal.',
      goal_id:'goal-query-perf', parallel_group_id:'pg-index-validate',
      active_work_ids:['work-tq04-wamp'], status:'in_progress', revision:2,
      started_at:'2026-08-26T08:15:00Z',
      transitions:[ TR('tq-04','pending','in_progress','work_admitted','assignment:tq-04',1,'2026-08-26T08:15:00Z','Admitted alongside tq-05 as a parallel pair; same index build, independent measurements.') ] }),
    Q({ todo_id:'tq-05', parent_todo_id:'tq-p2', display_order:3, depends_on:['tq-03'],
      title:'Load-test the index under concurrent write traffic',
      expected_outcome:'The index holds its query plan under simulated concurrent write load for a 10-minute soak.',
      goal_id:'goal-query-perf', parallel_group_id:'pg-index-validate',
      active_work_ids:['work-tq05-loadtest'], status:'in_progress', revision:2,
      started_at:'2026-08-26T08:16:00Z',
      transitions:[ TR('tq-05','pending','in_progress','work_admitted','assignment:tq-05',1,'2026-08-26T08:16:00Z','Admitted one minute after tq-04, deliberately concurrent rather than queued behind it.') ] }),
    /* OUT OF DISPLAY ORDER: tq-06 is display_order 4 under this parent (last)
       yet is already completed while tq-04/tq-05 (order 2/3) are still
       running — display order is never execution authority (TDR-003). */
    Q({ todo_id:'tq-06', parent_todo_id:'tq-p2', display_order:4,
      title:'Draft the rehearsed forward-rollback script',
      expected_outcome:'A rollback script exists, and a dry run against a copy of the database returns it to the pre-change schema.',
      status:'completed', revision:3,
      started_at:'2026-08-24T15:00:00Z', completed_at:'2026-08-24T17:40:00Z',
      transitions:[
        TR('tq-06','pending','in_progress','work_admitted','assignment:tq-06',1,'2026-08-24T15:00:00Z','Independent of the index work; admitted early because it has no dependency.'),
        TR('tq-06','in_progress','completed','outcome_satisfied','evidence:tq-06-dry-run',2,'2026-08-24T17:40:00Z','Dry run against a database copy reproduced the pre-change schema exactly.')
      ] }),

    /* THE ONE REAL BLOCKER in this whole fixture. tq-08 depends on tq-07 and
       correctly stays PENDING (not blocked) while it waits — TDR-003's core
       distinction, demonstrated rather than only documented. */
    Q({ todo_id:'tq-p3', title:'Ship the schema-adjacent cleanup', display_order:3,
      status:'blocked', revision:2,
      transitions:[ TR('tq-p3','pending','blocked','child_rollup','rollup:tq-p3',1,'2026-08-27T10:05:00Z','A required child is blocked and nothing under this parent is running.') ] }),
    Q({ todo_id:'tq-07', parent_todo_id:'tq-p3', display_order:1,
      title:'Bound the event payload column size',
      expected_outcome:'The event payload column enforces a maximum size, and existing rows already comply with it.',
      blocked_reason_ref:'Production schema modification requires an explicit user override before this item can run.',
      status:'blocked', revision:3, started_at:'2026-08-27T09:40:00Z',
      transitions:[
        TR('tq-07','pending','in_progress','work_admitted','assignment:tq-07',1,'2026-08-27T09:40:00Z','Admitted to draft the constraint migration.'),
        TR('tq-07','in_progress','blocked','external_block','policy:schema-change-approval',2,'2026-08-27T10:05:00Z','The migration touches a production column; it stopped at the approval gate rather than proceeding without one.')
      ] }),
    Q({ todo_id:'tq-08', parent_todo_id:'tq-p3', display_order:2, depends_on:['tq-07'],
      title:'Drop the unused events_hourly foreign key',
      expected_outcome:'The unused foreign key is dropped and the migration is reversible.',
      status:'pending', revision:1, transitions:[] }),
    Q({ todo_id:'tq-09', parent_todo_id:'tq-p3', display_order:3,
      title:'Review the rollback procedure with the release owner',
      expected_outcome:'The release owner has reviewed and signed off on the rollback procedure.',
      status:'skipped', revision:2,
      transitions:[ TR('tq-09','pending','skipped','explicit_skip','skip:tq-09-owner-on-leave',1,'2026-08-27T10:20:00Z','Skipped: the release owner is on leave, and the rollback rehearsal in tq-06 already exercises the same procedure.') ] }),

    Q({ todo_id:'tq-p4', title:'Validate and report', display_order:4,
      status:'pending', revision:1, transitions:[] }),
    Q({ todo_id:'tq-10', parent_todo_id:'tq-p4', display_order:1, depends_on:['tq-04','tq-05'],
      title:'Run the full integration and browser suites against the new index',
      expected_outcome:'Both suites pass against a database carrying the new index.',
      status:'pending', revision:1, transitions:[] }),
    /* A VALIDATION To-Do, not a verification status (TDR-004/6.5): checking the
       rollback is its own bounded leaf, runnable now because tq-06 is done. */
    Q({ todo_id:'tq-11', parent_todo_id:'tq-p4', display_order:2, depends_on:['tq-06'],
      title:'Confirm the rollback rehearsal reproduces the pre-change state',
      expected_outcome:'Running the rollback script against a copy of the post-change database reproduces the pre-change schema exactly.',
      status:'pending', revision:1, transitions:[] }),
    Q({ todo_id:'tq-12', parent_todo_id:'tq-p4', display_order:3, depends_on:['tq-10','tq-11'],
      title:'Publish the p95 and write-amplification comparison artifact',
      expected_outcome:'An artifact shows p95 before/after and write amplification against the accepted threshold, ready to attach to the Goal record.',
      goal_id:'goal-query-perf', status:'pending', revision:1, transitions:[] })
  ];

  /* ------------------------------------------------------------ subagents
     A second, unrelated list on the 'Runtime Architecture Review' thread —
     proof the store is genuinely per-thread rather than one list with a
     filter. Loosely follows the exact tree 04_GUI_IMPACTS.md §9.2 illustrates
     (find / remove / validate), themed to this thread instead of file cleanup. */
  var REVIEW_ITEMS = [
    R({ todo_id:'tr-p1', title:'Find duplicate service registrations', display_order:1,
      status:'in_progress', revision:2,
      transitions:[ TR('tr-p1','pending','in_progress','child_rollup','rollup:tr-p1',1,'2026-08-30T09:00:00Z','A child entered in_progress.') ] }),
    R({ todo_id:'tr-01', parent_todo_id:'tr-p1', display_order:1,
      title:'Scan the DI container for duplicate bean definitions',
      expected_outcome:'Every duplicate DI binding is listed with its file and line.',
      status:'completed', revision:3,
      started_at:'2026-08-30T09:00:00Z', completed_at:'2026-08-30T10:20:00Z',
      transitions:[
        TR('tr-01','pending','in_progress','work_admitted','assignment:tr-01',1,'2026-08-30T09:00:00Z','Admitted to scan the DI container.'),
        TR('tr-01','in_progress','completed','outcome_satisfied','evidence:tr-01-scan-report',2,'2026-08-30T10:20:00Z','Scan report lists 3 duplicate bindings with file and line; outcome accepted.')
      ] }),
    R({ todo_id:'tr-02', parent_todo_id:'tr-p1', display_order:2,
      title:'Scan the route table for duplicate handler registrations',
      expected_outcome:'Every route registered by more than one handler is listed.',
      active_work_ids:['work-tr02-routescan'], status:'in_progress', revision:2,
      started_at:'2026-08-30T10:25:00Z',
      transitions:[ TR('tr-02','pending','in_progress','work_admitted','assignment:tr-02',1,'2026-08-30T10:25:00Z','Admitted immediately after tr-01; an independent scan target.') ] }),
    R({ todo_id:'tr-03', parent_todo_id:'tr-p1', display_order:3,
      title:'Scan the config loader for duplicate provider keys',
      expected_outcome:'Every provider key registered from more than one config source is listed.',
      status:'pending', revision:1, transitions:[] }),

    R({ todo_id:'tr-p2', title:'Remove confirmed duplicates', display_order:2,
      status:'pending', revision:1, transitions:[] }),
    /* Second, independent proof that waiting on a dependency stays pending —
       tr-02 (the dependency) is in_progress, not completed/skipped. */
    R({ todo_id:'tr-04', parent_todo_id:'tr-p2', display_order:1, depends_on:['tr-02'],
      title:'Delete the duplicate handler registrations found while scanning',
      expected_outcome:'The duplicate route handlers named in tr-02 are removed, and the route table has one handler per route.',
      status:'pending', revision:1, transitions:[] }),
    R({ todo_id:'tr-05', parent_todo_id:'tr-p2', display_order:2, depends_on:['tr-04'],
      title:'Empty the recycle bin of removed files',
      expected_outcome:'The recycle bin contains none of the files removed in this pass.',
      status:'pending', revision:1, transitions:[] }),

    R({ todo_id:'tr-p3', title:'Validate the cleanup', display_order:3,
      status:'pending', revision:1, transitions:[] }),
    R({ todo_id:'tr-06', parent_todo_id:'tr-p3', display_order:1, depends_on:['tr-05'],
      title:'Confirm no in-use route or binding was removed',
      expected_outcome:'A full request-path smoke test passes with none of the removed bindings present.',
      status:'pending', revision:1, transitions:[] })
  ];


  /* ----------------------------------------------------------- plan-deep
     Additive Correction v4 (PPROG-002..007, CONCEPT-004). This is the list the
     AssistantPlanProgressProjector reads. It is an ordinary thread-local To-Do
     list -- no verification status, no source groups, no Done section -- and
     the ONLY thing that makes it special is that its leaves carry
     plan_step_ids, which is the mapping the projector joins on.

     It is deliberately shaped so that every step state the correction names is
     real rather than described:
       cs-0  one completed leaf                       -> completed
       cs-1  one in_progress leaf                     -> in_progress   (concurrent with cs-2b)
       cs-2  parent step, children cs-2a + cs-2b      -> mixed
       cs-3  completed while cs-2 is still running    -> completed, out of display order
       cs-4  pending leaf whose dependency is unmet   -> pending, NOT blocked
       cs-5  one genuinely blocked leaf               -> blocked
       cs-6  one leaf skipped with accepted disposition -> skipped
     The step ids below must stay in step with plans.js's CACHE_V1. */
  var CACHE_ITEMS = [
    C({ todo_id:'tc-00', display_order:1, plan_id:'ap-cache', plan_version:1, plan_step_ids:['cs-0'],
      planunit_ids:['APU-ap-cache-1'], title:'Add hit/miss/inflight counters at the three call sites',
      expected_outcome:'All three session-cache call sites report hit, miss and inflight counts, and none of the counters allocates on the hot path.',
      status:'completed', revision:3, started_at:'2026-09-03T21:44:00Z', completed_at:'2026-09-03T22:06:00Z',
      transitions:[
        TR('tc-00','pending','in_progress','work_admitted','assignment:tc-00',1,'2026-09-03T21:44:00Z','Admitted immediately after Build; this step gates every other one.'),
        TR('tc-00','in_progress','completed','outcome_satisfied','evidence:tc-00-counters',2,'2026-09-03T22:06:00Z','Counters present at all three sites; allocation check clean.')
      ] }),

    C({ todo_id:'tc-01', display_order:2, depends_on:['tc-00'], plan_id:'ap-cache', plan_version:1,
      plan_step_ids:['cs-1'], planunit_ids:['APU-ap-cache-2'],
      title:'Extend bench/session_load.rs with a cold-cache phase',
      expected_outcome:'The benchmark reproduces the 2026-08-19 incident profile from a cold cache.',
      status:'in_progress', revision:2, started_at:'2026-09-03T22:08:00Z',
      active_work_ids:['work-bench-cold'],
      transitions:[
        TR('tc-01','pending','in_progress','work_admitted','assignment:tc-01',1,'2026-09-03T22:08:00Z','Running concurrently with the loader work; the two share no files.')
      ] }),

    C({ todo_id:'tc-02a', display_order:3, depends_on:['tc-00'], plan_id:'ap-cache', plan_version:1,
      plan_step_ids:['cs-2a'], planunit_ids:['APU-ap-cache-3'],
      title:'Share one in-flight future per key',
      expected_outcome:'One origin load per key per cold-start window, proved by the inflight counter.',
      status:'completed', revision:3, started_at:'2026-09-03T22:08:00Z', completed_at:'2026-09-03T22:41:00Z',
      transitions:[
        TR('tc-02a','pending','in_progress','work_admitted','assignment:tc-02a',1,'2026-09-03T22:08:00Z','Admitted in parallel with the benchmark work.'),
        TR('tc-02a','in_progress','completed','outcome_satisfied','evidence:tc-02a-inflight',2,'2026-09-03T22:41:00Z','Inflight counter shows one origin load per key across the cold window.')
      ] }),

    C({ todo_id:'tc-02b', display_order:4, depends_on:['tc-02a'], plan_id:'ap-cache', plan_version:1,
      plan_step_ids:['cs-2b'], planunit_ids:['APU-ap-cache-3'],
      title:'Bound the shared future with one owner for timeout and cancellation',
      expected_outcome:'A shared future has exactly one timeout owner, and a cancelled waiter cannot cancel the load for the others.',
      status:'in_progress', revision:2, started_at:'2026-09-03T22:43:00Z',
      active_work_ids:['work-future-ownership'],
      transitions:[
        TR('tc-02b','pending','in_progress','work_admitted','assignment:tc-02b',1,'2026-09-03T22:43:00Z','Admitted once the shared future landed.')
      ] }),

    C({ todo_id:'tc-03', display_order:5, depends_on:['tc-00'], plan_id:'ap-cache', plan_version:1,
      plan_step_ids:['cs-3'], planunit_ids:['APU-ap-cache-4'],
      title:'Decide the failure policy for a failed load',
      expected_outcome:'Waiters observe the loader error, and no error is written to the cache.',
      status:'completed', revision:3, started_at:'2026-09-03T22:10:00Z', completed_at:'2026-09-03T22:29:00Z',
      transitions:[
        TR('tc-03','pending','in_progress','work_admitted','assignment:tc-03',1,'2026-09-03T22:10:00Z','A decision item; it does not wait on the loader landing.'),
        TR('tc-03','in_progress','completed','outcome_satisfied','decision:tc-03-no-negative-cache',2,'2026-09-03T22:29:00Z','Decided in conversation with no tool receipt: failures propagate, nothing negative is cached. Recorded as the item outcome.')
      ] }),

    C({ todo_id:'tc-04', display_order:6, depends_on:['tc-01','tc-02b','tc-03'], plan_id:'ap-cache', plan_version:1,
      plan_step_ids:['cs-4'], planunit_ids:['APU-ap-cache-5'],
      title:'Re-run under the incident load',
      expected_outcome:'p99 cold-start latency is below the incident threshold on the corrected benchmark.',
      status:'pending', revision:1, transitions:[] }),

    C({ todo_id:'tc-05', display_order:7, depends_on:['tc-02a'], plan_id:'ap-cache', plan_version:1,
      plan_step_ids:['cs-5'], planunit_ids:['APU-ap-cache-6'],
      title:'Validate eviction behaviour mid-flight',
      expected_outcome:'An eviction while a load is in flight yields no stale read.',
      status:'blocked', revision:2, blocked_reason_ref:'blocker:tc-05-no-eviction-hook',
      transitions:[
        TR('tc-05','pending','blocked','blocker_recorded','blocker:tc-05-no-eviction-hook',1,'2026-09-03T22:52:00Z','The cache exposes no eviction hook to observe from; this is a genuine blocker on this item, not a dependency wait.')
      ] }),

    C({ todo_id:'tc-06', display_order:8, plan_id:'ap-cache', plan_version:1,
      plan_step_ids:['cs-6'], title:'Backfill the ops dashboard panel for the new counters',
      expected_outcome:'The ops dashboard shows hit, miss and inflight for the session cache.',
      status:'skipped', revision:2,
      transitions:[
        TR('tc-06','pending','skipped','skip_accepted','disposition:tc-06-ops-owns-dashboards',1,'2026-09-03T22:15:00Z','Explicitly accepted skip: the ops team owns dashboard panels and has the counters. An item that merely disappeared would NOT count as skipped.')
      ] })
  ];

  var TODO_FIXTURE = { demo:true, byThread:{ query:{ items:QUERY_ITEMS, refusals:[] }, subagents:{ items:REVIEW_ITEMS, refusals:[] }, 'plan-deep':{ items:CACHE_ITEMS, refusals:[] } } };
  var TODO0 = JSON.stringify(TODO_FIXTURE);
  if(!RT.todos) RT.todos = JSON.parse(TODO0);

  /* Local view state only — expand/collapse and receipts disclosure write NO
     transition and are never truth (TDR-007: "Parent expansion and collapse
     is local view state"). Nothing here is domain state. */
  var ui = { collapsed:{}, receiptsOpen:{}, refusalsOpen:false };

  function restoreFixture(){
    RT.todos = JSON.parse(TODO0);
    ui.collapsed = {}; ui.receiptsOpen = {}; ui.refusalsOpen = false; ui.detailOpen = {}; treeViews.clear();
  }

  /* =====================================================================
     2. GRAPH HELPERS — read-only queries over one thread's flat item list
     ===================================================================== */
  function threadStore(threadId){ return (RT.todos && threadId && RT.todos.byThread[threadId]) || null; }
  function itemsOf(threadId){ var s = threadStore(threadId); return s ? s.items : null; }
  function findItem(list, id){
    if(!list) return null;
    for(var i=0;i<list.length;i++) if(list[i].todo_id===id) return list[i];
    return null;
  }
  const graphIndexes=new WeakMap();
  function graphIndex(list){
    if(!list)return {byId:new Map(),children:new Map()};
    let ix=graphIndexes.get(list);if(ix)return ix;
    ix={byId:new Map(),children:new Map()};
    for(const t of list){ix.byId.set(t.todo_id,t);const key=t.parent_todo_id??null;
      if(!ix.children.has(key))ix.children.set(key,[]);ix.children.get(key).push(t);}
    for(const children of ix.children.values())children.sort((a,b)=>(a.display_order||0)-(b.display_order||0));
    graphIndexes.set(list,ix);return ix;
  }
  function childrenOf(list,parentId){return graphIndex(list).children.get(parentId??null)||[];}
  function topLevel(list){return childrenOf(list,null);}
  function isLeaf(list,item){return !childrenOf(list,item.todo_id).length;}
  function runnable(list,item){const ix=graphIndex(list);return (item.depends_on||[]).every(id=>{
    const dep=ix.byId.get(id);return dep&&(dep.status==='completed'||dep.status==='skipped');});}
  function unmetDeps(list,item){const ix=graphIndex(list);return (item.depends_on||[]).map(id=>ix.byId.get(id)||{todo_id:id,title:'Missing reference: '+id,status:'pending'}).filter(t=>!['completed','skipped'].includes(t.status));}
  function docOrder(list){
    const ix=graphIndex(list),out=[],stack=[...(ix.children.get(null)||[])].reverse(),seen=new Set();
    while(stack.length){const t=stack.pop();if(seen.has(t.todo_id))continue;seen.add(t.todo_id);out.push(t);
      const kids=ix.children.get(t.todo_id)||[];for(let i=kids.length-1;i>=0;i--)stack.push(kids[i]);}
    return out;
  }
  function allLeaves(list){const ix=graphIndex(list);return docOrder(list).filter(t=>!ix.children.get(t.todo_id)?.length);}
  function parallelSiblings(list, item){
    if(!item.parallel_group_id) return [];
    return childrenOf(list, item.parent_todo_id).filter(function(x){
      return x.todo_id!==item.todo_id && x.parallel_group_id===item.parallel_group_id;
    });
  }

  /* =====================================================================
     3. TODOCONTROLLER — the sole writer of `status` (TDR-005)
     ---------------------------------------------------------------------
     Every entry point below re-checks `expected_revision` FIRST, ahead of any
     status or dependency check, so `attemptStaleWrite()` can call any of them
     and reliably exercise the `stale_todo_revision` rejection regardless of
     the item's current status — matching "a transition whose expected_revision
     does not match the item's current revision is rejected" (TDR-006) as an
     unconditional precondition, not a special case of one action. A model,
     subagent, or provider tool never asserts a status directly; it can only
     reach one of these functions the same way a click does. */
  function refuse(threadId,code,reason,todoId,source){
    const store=threadStore(threadId);if(store)window.PM56_TX.set(store,'refusals',(store.refusals||[]).concat({at:nowIso(),code,reason,todo_id:todoId||null,source:source||'user'}));
    return {ok:false,error:code,code,reason};
  }
  const STALE_MSG=item=>'This row changed since it was opened (now at revision '+item.revision+'). Reopen it and try again.';
  function workAction(threadId,todoId,revision){
    const item=findItem(itemsOf(threadId),todoId);if(!item)return refuse(threadId,'todo_not_found','This work is no longer in the current list.',todoId);
    if(item.revision!==revision)return refuse(threadId,'stale_todo_revision',STALE_MSG(item),todoId);
    const owner=workOwner(item),result=owner?.execute?.(item.workflow_ref,item,captureTodo(threadId,todoId));
    return result||refuse(threadId,'owner_unavailable','No execution adapter is available for this historical or proposed item.',todoId);
  }
  function admit(t,id,rev){return workAction(t,id,rev);}
  function complete(t,id,rev){return workAction(t,id,rev);}
  function localTransition(threadId,todoId,revision,extra){const item=findItem(itemsOf(threadId),todoId);
    if(!item)return {ok:false,error:'todo_not_found'};
    return applyTransition(threadId,{...captureTodo(threadId,todoId),expected_revision:revision,...extra});}
  function unblock(t,id,rev){return localTransition(t,id,rev,{to_status:'pending',cause_kind:'dependency_changed',cause_ref:'user:recheck:'+id});}
  function skip(t,id,rev){
    const item=findItem(itemsOf(t),id);if(!item)return {ok:false,error:'todo_not_found'};
    return window.PM56_TX.run(()=>{const active=itemBindings(t,id).filter(liveBinding),owner=workOwner(item);
      const cancellation=active.length?owner?.stop?.(item.workflow_ref,active):null;
      return localTransition(t,id,rev,{to_status:'skipped',cause_kind:'explicit_skip',cause_ref:'user:skip:'+id+':'+rev,
        skip_disposition:{user_approved:true,reason:'Explicitly marked no longer required in To-Do Activity.',cancellation_ref:cancellation?.receipt_ref||null}});});
  }
  function reopen(t,id,rev){return localTransition(t,id,rev,{to_status:'pending',cause_kind:'reopen',cause_ref:'user:reopen:'+id+':'+rev,user_approved:true});}
  function attemptBulkComplete(threadId, source){
    var list = itemsOf(threadId);
    var targets = list ? list.filter(function(x){ return isLeaf(list,x) && x.status!=='completed' && x.status!=='skipped'; }) : [];
    var reason = 'Bulk completion is refused: '+targets.length+' item'+(targets.length===1?'':'s')+
      ' would each need its own outcome evidence, and none was supplied in one gesture. Nothing changed.';
    return refuse(threadId, 'bulk_completion_refused', reason, null, source||'user_bulk_gesture');
  }
  /* TDR-008: a provider-native whole-list proposal is translated into a
     proposal, never authority. This simulates the part that matters for the
     UI — a completion assertion with no work binding or outcome receipt is
     rejected and the targeted items are left exactly as they were. */
  function attemptProviderProposal(threadId){
    var list = itemsOf(threadId);
    var targets = list ? list.filter(function(x){ return isLeaf(list,x) && x.status!=='completed' && x.status!=='skipped'; }).slice(0,2) : [];
    var names = targets.map(function(x){ return x.title; }).join(' and ');
    var reason = targets.length
      ? ('A provider-native whole-list proposal tried to mark "'+names+'" complete directly. Reconciliation accepted it only as a proposal: no work binding or outcome receipt backs either item, so nothing changed. Existing items are retained and reported, never deleted or completed by a proposal alone.')
      : 'A provider-native whole-list proposal arrived with nothing left to propose completing; every remaining item already carries a real transition history.';
    return refuse(threadId, 'bulk_completion_refused', reason, null, 'provider_proposal');
  }
  function attemptStaleWrite(threadId, todoId){
    var list = itemsOf(threadId);
    var item = list && findItem(list, todoId);
    if(!item) return refuse(threadId,'todo_not_found','That item no longer exists in this list.',todoId);
    return admit(threadId, todoId, Math.max(0, item.revision-1));
  }

  /* =====================================================================
     4. DERIVED VIEWS — every count below is computed from the item list at
        read time, never hand-authored, so it cannot drift from the tree.
     ===================================================================== */
  function summary(threadId){
    var list = itemsOf(threadId);
    if(!list) return { total:0, completed:0, active:0, blocked:0, skipped:0, current:[], nextRunnable:[] };
    var leaves = allLeaves(list);
    var completed = leaves.filter(function(x){ return x.status==='completed'; });
    var active = leaves.filter(function(x){ return x.status==='in_progress'; });
    var blocked = leaves.filter(function(x){ return x.status==='blocked'; });
    var skipped = leaves.filter(function(x){ return x.status==='skipped'; });
    var nextRunnable = leaves.filter(function(x){ return x.status==='pending' && runnable(list,x); });
    return {
      total:leaves.length, completed:completed.length, active:active.length,
      blocked:blocked.length, skipped:skipped.length,
      current: active.map(function(x){ return x.todo_id; }),
      nextRunnable: nextRunnable.map(function(x){ return x.todo_id; })
    };
  }
  /* Hover preview feed (04_GUI_IMPACTS.md §9.1): currently in-progress rows
     first, then next-runnable pending rows, capped, plus a blocked count that
     the caller only renders when nonzero. */
  var HOVER_ROWS = 5;
  function hoverFeed(threadId){
    var list = itemsOf(threadId);
    if(!list) return null;
    var leaves = docOrder(list).filter(function(x){ return isLeaf(list,x); });
    var current = leaves.filter(function(x){ return x.status==='in_progress'; });
    var next = leaves.filter(function(x){ return x.status==='pending' && runnable(list,x); });
    var blockedCount = leaves.filter(function(x){ return x.status==='blocked'; }).length;
    var done = leaves.filter(function(x){ return x.status==='completed'; }).length;
    var rows = current.slice(0, HOVER_ROWS).map(function(x){ return { item:x, current:true }; });
    if(rows.length < HOVER_ROWS) rows = rows.concat(next.slice(0, HOVER_ROWS-rows.length).map(function(x){ return { item:x, current:false }; }));
    return { rows:rows, blockedCount:blockedCount, done:done, total:leaves.length };
  }
  function childSummary(list, item){
    var kids = childrenOf(list, item.todo_id);
    if(!kids.length) return '';
    var done = kids.filter(function(k){ return k.status==='completed'; }).length;
    var active = kids.filter(function(k){ return k.status==='in_progress'; }).length;
    var blocked = kids.filter(function(k){ return k.status==='blocked'; }).length;
    var parts = [done+' of '+kids.length+' complete'];
    if(active) parts.push(active+' active');
    if(blocked) parts.push(blocked+' blocked');
    return parts.join(' · ');
  }

  /* =====================================================================
     5. GLYPHS + LABELS — five distinct SHAPES, not colour alone. This matches
        the two-channel rule goals.css documents for its own phase glyphs:
        colour is the second channel; the glyph SHAPE carries the state by
        itself. Bespoke, small, inline SVG — no emoji anywhere.
     ===================================================================== */
  var STATUS_LABEL = { pending:'Pending', in_progress:'In progress', completed:'Completed', blocked:'Blocked', skipped:'Skipped' };
  var STATUS_TONE  = { pending:'idle', in_progress:'working', completed:'done', blocked:'blocked', skipped:'idle' };
  var CAUSE_LABEL = {
    work_admitted:'Work admitted', outcome_satisfied:'Outcome accepted', dependency_changed:'Dependency changed',
    external_block:'Blocked', explicit_skip:'Skipped', retry:'Unblocked', reopen:'Reopened', child_rollup:'Derived from children'
  };
  function glyph(status){
    if(status==='completed') return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="currentColor"/></svg>';
    if(status==='in_progress') return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle class="todo-glyph-pulse" cx="8" cy="8" r="2.6" fill="currentColor"/></svg>';
    if(status==='blocked') return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="4.3" y="7.1" width="7.4" height="6.1" rx="1.3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 7.1V5.6a2 2 0 0 1 4 0v1.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
    if(status==='skipped') return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="3.7" y1="12.3" x2="12.3" y2="3.7" stroke="currentColor" stroke-width="1.6"/></svg>';
    return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.3 2.3"/></svg>';
  }
  function clockOf(iso){ if(!iso) return ''; var d=new Date(iso); if(isNaN(d)) return ''; return d.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}); }
  function dayOf(iso){ if(!iso) return ''; var d=new Date(iso); if(isNaN(d)) return ''; return d.toLocaleDateString([], {month:'short', day:'numeric'}); }
  function preview(text, max){ text=String(text||''); return text.length<=max ? text : text.slice(0,max-1).replace(/\s+\S*$/,'')+'…'; }

  /* =====================================================================
     6. RENDERERS
     ===================================================================== */
  function currentThreadId(ctx){
    return (ctx && ctx.thread && ctx.thread.id) || (ctx && ctx.state && ctx.state.selectedThread) || null;
  }

  /* Activity-bar hover preview (04_GUI_IMPACTS.md §9.1): completed-over-total,
     every currently in_progress row, then next-runnable rows, capped; a
     blocked count only when nonzero; one "Open Activity" footer. Mirrors the
     attribute set activity-bar.js's own activityHoverCard registrant uses
     (id/data-overlay/data-k/data-domain/data-tone/role) so aria-controls on
     the Activity Bar button still resolves once this owns the 'todo' domain. */
  function renderCompact(ctx){
    var feed=hoverFeed(currentThreadId(ctx)); if(!feed) return '';
    var rows=feed.rows.slice(0,4);
    return '<button type="button" class="todo-hover-head" data-action="open-activity" data-domain="todo">'+
      '<span class="todo-hover-head-icon">'+ctx.icon('todo',13)+'</span><strong>To-Dos</strong><span class="todo-hover-head-meta">'+feed.done+' of '+feed.total+'</span></button>'+
      '<div class="todo-hover-list">'+(rows.length?rows.map(function(r){var it=r.item;return '<button type="button" class="todo-hover-row'+(r.current?' is-current':'')+'" data-k="todo-hr:'+esc(it.todo_id)+'" data-action="todo-show-item" data-thread="'+esc(it.thread_id)+'" data-id="'+esc(it.todo_id)+'"><span class="todo-hover-glyph todo-glyph-'+esc(it.status)+'">'+glyph(it.status)+'</span><span class="todo-hover-title">'+esc(it.title)+'</span></button>';}).join(''):'<p class="todo-hover-empty">Nothing waiting.</p>')+'</div>'+
      (feed.total>rows.length?'<button class="todo-hover-overflow" data-action="open-activity" data-domain="todo">Open all '+feed.total+' items</button>':'')+(feed.blockedCount?'<button type="button" class="todo-hover-blocked" data-action="open-activity" data-domain="todo">'+ctx.icon('lock',11)+' '+feed.blockedCount+' blocked</button>':'');
  }

  /* extReplace('activityPanelBody',{domain:d,transient}, ...) (app.js) passes
     the FALLBACK-CORRECTED domain as `ctx.domain` — the one the surrounding
     chrome (head icon, filter chips) actually resolved to, which can diverge
     from the raw ctx.state.activity.domain on a thread where the 'todo'
     domain is not (yet) live. Preferring ctx.domain keeps this module's
     content consistent with whatever the chrome is showing; the fallback to
     the raw state field keeps this correct even if a future caller invokes
     the slot directly without going through that exact call site. */
  function panelDomain(ctx){
    if(ctx && ctx.domain) return ctx.domain;
    return (ctx && ctx.state && ctx.state.activity && ctx.state.activity.domain) || '';
  }

  function depChip(list, item){
    if(!item.depends_on || !item.depends_on.length) return '';
    var unmet = unmetDeps(list, item);
    var names = item.depends_on.map(function(id){ var d=findItem(list,id); return d?d.title:id; }).join(', ');
    if(item.status==='pending' && unmet.length){
      var waiting = unmet.map(function(d){ return d.title; }).join(', ');
      return '<span class="todo-chip todo-chip-dep is-waiting" title="Pending with a dependency, not blocked.">Waiting on: '+esc(waiting)+'</span>';
    }
    return '<span class="todo-chip todo-chip-dep">Depends on: '+esc(names)+'</span>';
  }
  function parallelChip(list, item){
    var sibs = parallelSiblings(list, item);
    if(!sibs.length) return '';
    var running = item.status==='in_progress' && sibs.some(function(s){ return s.status==='in_progress'; });
    var names = sibs.map(function(s){ return s.title; }).join(', ');
    return '<span class="todo-chip todo-chip-parallel'+(running?' is-live':'')+'" title="Shares parallel_group_id '+esc(item.parallel_group_id)+' — intended concurrency, not an execution order.">'+
      (running?'Running in parallel with: ':'Parallel group with: ')+esc(names)+'</span>';
  }

  function renderReceipts(item){
    if(!ui.receiptsOpen[item.todo_id]) return '';
    if(!item.transitions.length) return '<ul class="todo-receipts" data-k="todo-receipts:'+esc(item.todo_id)+'"><li class="todo-receipt-empty">No transitions recorded yet.</li></ul>';
    var rows = item.transitions.slice().reverse().map(function(t){
      return '<li class="todo-receipt-row" data-k="todo-rr:'+esc(t.transition_id)+'">'+
        '<span class="todo-receipt-when">'+esc(dayOf(t.created_at))+' '+esc(clockOf(t.created_at))+'</span>'+
        '<span class="todo-receipt-source">'+esc(CAUSE_LABEL[t.cause_kind]||t.cause_kind)+'</span>'+
        '<p class="todo-receipt-note">'+esc(t.note)+'</p>'+
      '</li>';
    }).join('');
    return '<ul class="todo-receipts" data-k="todo-receipts:'+esc(item.todo_id)+'">'+rows+'</ul>';
  }

  function pickDemoTarget(list){
    var leaves = docOrder(list).filter(function(x){ return isLeaf(list,x); });
    var inProg = leaves.filter(function(x){ return x.status==='in_progress'; });
    if(inProg.length) return inProg[0];
    var pend = leaves.filter(function(x){ return x.status==='pending'; });
    return pend[0] || leaves[0] || null;
  }
  /* The required negative path, exposed: a demo control that ATTEMPTS a bulk
     completion / a provider-style whole-list assertion / a stale write, and
     shows the refusal — not just a toast, a durable row in the log below
     (Hard Rule 2: no toast-only success, including for a refusal). */
  function renderTools(ctx, list){
    var target = pickDemoTarget(list);
    return '<div class="todo-tools" data-k="todo-tools">'+
      '<button class="soft-button" type="button" data-action="todo-attempt-bulk-complete">Attempt: complete every open item</button>'+
      '<button class="soft-button" type="button" data-action="todo-attempt-provider-proposal">Simulate: provider marks 2 items complete</button>'+
      (target ? '<button class="soft-button" type="button" data-action="todo-attempt-stale-write" data-id="'+esc(target.todo_id)+'">Simulate: stale write on “'+esc(preview(target.title,28))+'”</button>' : '')+
    '</div>';
  }
  function renderRefusals(tid){
    var store = threadStore(tid);
    var list = store ? store.refusals : [];
    var toggle = '<button class="text-button" type="button" data-action="todo-toggle-refusals" aria-expanded="'+(ui.refusalsOpen?'true':'false')+'">'+(ui.refusalsOpen?'Hide':'Show')+' refused attempts ('+list.length+')</button>';
    if(!ui.refusalsOpen) return '<div class="todo-refusals-head" data-k="todo-refusals-head">'+toggle+'</div>';
    var rows = list.slice().reverse().map(function(r){
      /* Keyed on `at` (unique per attempt) rather than array position, so an
         existing row is patched in place as new refusals are prepended
         instead of every row silently swapping content underneath its key. */
      return '<li class="todo-refusal-row" data-k="todo-refusal:'+esc(r.at)+'">'+
        '<span class="todo-refusal-code">'+esc(r.code)+'</span>'+
        '<span class="todo-refusal-when">'+esc(dayOf(r.at))+' '+esc(clockOf(r.at))+'</span>'+
        '<span class="todo-refusal-source">'+esc(r.source)+'</span>'+
        '<p class="todo-refusal-reason">'+esc(r.reason)+'</p>'+
      '</li>';
    }).join('');
    return '<div class="todo-refusals-head" data-k="todo-refusals-head">'+toggle+'</div>'+
      '<ul class="todo-refusals" data-k="todo-refusals-list">'+(rows||'<li class="todo-refusal-empty">No refused attempts recorded yet.</li>')+'</ul>';
  }

  /* View-only virtual hierarchy. The complete graph remains in ToDoController.
     Fixed row geometry keeps deep/large trees bounded in DOM, never in data. */
  const ROW_HEIGHT=88;
  const treeViews=new Map();
  function treeView(tid){if(!treeViews.has(tid))treeViews.set(tid,{query:'',searchCollapsed:{},top:0,selected:null,work:null});return treeViews.get(tid);}
  function visibleTree(tid){
    const list=itemsOf(tid)||[],ix=graphIndex(list),view=treeView(tid),query=view.query.trim().toLocaleLowerCase(),included=new Set();
    if(query)for(const t of list)if((t.title+' '+t.todo_id).toLocaleLowerCase().includes(query)){
      let id=t.todo_id;while(id&&!included.has(id)){included.add(id);id=ix.byId.get(id)?.parent_todo_id;}}
    const out=[],stack=(ix.children.get(null)||[]).map(t=>({item:t,depth:0})).reverse();
    while(stack.length){const row=stack.pop(),t=row.item;if(query&&!included.has(t.todo_id))continue;out.push(row);
      if(!(query?view.searchCollapsed[t.todo_id]:ui.collapsed[t.todo_id])){const children=ix.children.get(t.todo_id)||[];for(let i=children.length-1;i>=0;i--)stack.push({item:children[i],depth:row.depth+1});}}
    return out;
  }
  function rowScope(tid,item){return ' data-thread="'+esc(tid)+'" data-id="'+esc(item.todo_id)+'" data-revision="'+item.revision+'" data-list-revision="'+(threadStore(tid).revision||1)+'"';}
  function rowActions(ctx,list,item){
    if(!isLeaf(list,item))return '';
    const tid=item.thread_id,attrs=rowScope(tid,item),owner=workOwner(item),bindings=itemBindings(tid,item.todo_id);
    let html='';
    if(['pending','in_progress'].includes(item.status)){
      const availability=owner?.availability?.(item.workflow_ref,item),can=!!owner?.execute&&runnable(list,item)&&availability?.ok!==false,reason=!owner?.execute?'No executable owner is attached to this historical or proposed item.':!runnable(list,item)?'Waiting for the named dependencies.':availability?.reason||'';
      html+='<button class="text-button" data-action="'+(item.status==='pending'?'todo-admit':'todo-complete')+'"'+attrs+(can?'':' disabled title="'+esc(reason)+'"')+'>'+(item.status==='pending'?'Start work':'Run work')+'</button>';
    }
    if(bindings.length)html+='<button class="text-button" data-action="todo-open-work"'+attrs+' data-binding="'+esc(bindings.at(-1).binding_id)+'">Open work</button>';
    return html;
  }
  function virtualRows(ctx,tid,rows,top,height){
    const list=itemsOf(tid),start=Math.max(0,Math.floor(top/ROW_HEIGHT)-3),end=Math.min(rows.length,Math.ceil((top+height)/ROW_HEIGHT)+3);
    return rows.slice(start,end).map((row,n)=>{
      const t=row.item,kids=childrenOf(list,t.todo_id),view=treeView(tid),selected=view.selected===t.todo_id,scope=rowScope(tid,t),collapsed=!!(view.query.trim()?view.searchCollapsed[t.todo_id]:ui.collapsed[t.todo_id]);
      const wait=t.owner_wait||workOwner(t)?.waitState?.(t.workflow_ref,t),next=kids.length?childSummary(list,t):wait?.reason||wait?.kind||t.blocked_reason_ref||(t.status==='pending'&&!runnable(list,t)?'Waiting for dependencies':STATUS_LABEL[t.status]);
      return '<div class="todo-node todo-virtual-row" data-todo-id="'+esc(t.todo_id)+'" data-status="'+esc(t.status)+'" data-k="todo-node:'+esc(t.todo_id)+'" style="top:'+((start+n)*ROW_HEIGHT)+'px;--todo-indent:'+Math.min(row.depth*12,48)+'px" role="treeitem" aria-level="'+(row.depth+1)+'"'+(kids.length?' aria-expanded="'+!collapsed+'"':'')+' aria-selected="'+selected+'">'+
        '<div class="todo-row">'+(kids.length?'<button class="todo-caret'+(collapsed?' is-collapsed':'')+'" data-action="todo-toggle-parent"'+scope+' aria-label="'+(collapsed?'Expand ':'Collapse ')+esc(t.title)+'" aria-expanded="'+!collapsed+'">'+ctx.icon('chevron',11)+'</button>':'<span class="todo-caret-spacer"></span>')+
        '<span class="todo-glyph todo-glyph-'+esc(t.status)+'" title="'+esc(STATUS_LABEL[t.status])+'">'+glyph(t.status)+'</span><button class="todo-copy todo-title-button" data-action="todo-toggle-detail"'+scope+' aria-expanded="'+selected+'" title="'+esc(t.title)+'"><span class="todo-title'+(t.status==='completed'?' is-struck':'')+'">'+esc(t.title)+'</span><small>'+esc(next)+'</small></button></div><div class="todo-row-actions">'+(t.explicit_assignment_label?'<small>'+esc(t.explicit_assignment_label)+'</small>':'')+rowActions(ctx,list,t)+'</div></div>';
    }).join('');
  }
  function selectedDetail(ctx,tid){
    const view=treeView(tid),list=itemsOf(tid),item=findItem(list,view.selected);if(!item)return '';
    return '<section class="todo-selected-detail todo-detail" data-k="todo-detail:'+esc(item.todo_id)+'"><header><strong>'+esc(item.title)+'</strong><button class="text-button" data-action="todo-toggle-detail"'+rowScope(tid,item)+'>Close details</button></header><p>'+esc(item.expected_outcome||childSummary(list,item))+'</p>'+depChip(list,item)+(item.source_room_run_id&&item.source_room_message_id?'<button class="text-button" data-action="room-open-discussion" data-run="'+esc(item.source_room_run_id)+'" data-message="'+esc(item.source_room_message_id)+'">Open source message</button>':'')+(item.source_review_run_id&&item.source_finding_id?'<button class="text-button" data-action="review-open-report" data-run="'+esc(item.source_review_run_id)+'" data-finding="'+esc(item.source_finding_id)+'">Open source finding</button>':'')+
      '<details data-k="todo-technical:'+esc(item.todo_id)+'"><summary>Dependencies, attempts and receipts</summary><pre>'+esc(JSON.stringify({todo_id:item.todo_id,list_revision:threadStore(tid).revision||1,item_revision:item.revision,dependencies:item.depends_on,bindings:itemBindings(tid,item.todo_id),transitions:item.transitions},null,2))+'</pre></details>'+ 
      (view.work?.todo_id===item.todo_id?'<div class="todo-opened-work" data-k="todo-opened-work"><strong>Exact work · '+esc(view.work.attempt_id)+'</strong><p>'+esc(view.work.work_id)+'</p><pre>'+esc(JSON.stringify(view.work.detail,null,2))+'</pre></div>':'')+'</section>';
  }
  function renderPanel(ctx){
    if(panelDomain(ctx)!=='todo')return '';
    const tid=currentThreadId(ctx),list=itemsOf(tid);if(!list)return '<div class="todo-panel todo-panel-empty"><p>No To-Do list exists for this thread yet.</p></div>';
    const view=treeView(tid),rows=visibleTree(tid),s=summary(tid),height=Math.min(440,Math.max(88,rows.length*ROW_HEIGHT));view.top=Math.max(0,Math.min(view.top,rows.length*ROW_HEIGHT-height));
    return '<div class="todo-panel" data-k="todo-panel:'+esc(tid)+'"><div class="todo-panel-summary"><strong>'+s.completed+' of '+s.total+' complete</strong><span>'+s.active+' active'+(s.blocked?' · '+s.blocked+' blocked':'')+'</span></div><label class="todo-search"><span>Search this hierarchy</span><input type="search" data-todo-search="'+esc(tid)+'" value="'+esc(view.query)+'" placeholder="Title or exact item ID" aria-label="Search this hierarchy"></label><div class="todo-tree-navigation"><small>'+rows.length+' visible of '+list.length+' items</small><button class="text-button" data-action="todo-reveal-last" data-thread="'+esc(tid)+'">Last item</button><button class="text-button" data-action="todo-expand-all" data-thread="'+esc(tid)+'">Expand all</button></div><div class="todo-viewport" data-todo-viewport="'+esc(tid)+'" data-k="todo-viewport:'+esc(tid)+'" role="tree" aria-label="Current thread To-Dos" tabindex="0" style="height:'+height+'px"><div class="todo-tree todo-virtual-space" style="height:'+(rows.length*ROW_HEIGHT)+'px">'+virtualRows(ctx,tid,rows,view.top,height)+'</div></div>'+(!rows.length?'<p>No matching items.</p>':'')+selectedDetail(ctx,tid)+'<div class="todo-refusals-wrap">'+renderRefusals(tid)+'</div></div>';
  }
  function revealItem(ctx,tid,id){
    if(tid!==currentThreadId(ctx))return;
    const list=itemsOf(tid),ix=graphIndex(list),item=ix.byId.get(id);if(!item)return;
    const view=treeView(tid);view.query='';view.selected=id;
    let parent=item.parent_todo_id;while(parent){delete ui.collapsed[parent];parent=ix.byId.get(parent)?.parent_todo_id;}
    const rows=visibleTree(tid),i=rows.findIndex(r=>r.item.todo_id===id);view.top=Math.max(0,i*ROW_HEIGHT-ROW_HEIGHT);
    Object.assign(ctx.state.activity,{open:true,pinned:true,domain:'todo',scope:'focus'});ctx.state.hover=null;ctx.renderApp();
    requestAnimationFrame(()=>{const vp=document.querySelector('[data-todo-viewport="'+CSS.escape(tid)+'"]');if(vp)vp.scrollTop=view.top;});
  }
  function scopeAction(ctx,btn){
    const tid=btn.dataset.thread||currentThreadId(ctx),id=btn.dataset.id,item=findItem(itemsOf(tid),id);
    if(tid!==currentThreadId(ctx)||!item)return {ok:false,error:'wrong_todo_scope'};
    if(Number(btn.dataset.revision)!==item.revision||Number(btn.dataset.listRevision)!==(threadStore(tid).revision||1))return {ok:false,error:'stale_todo_control'};
    return {ok:true,tid,id,item};
  }
  function executeRow(ctx,btn){
    const s=scopeAction(ctx,btn),out=s.ok?workAction(s.tid,s.id,s.item.revision):s;
    ctx.renderApp();if(!out?.ok)ctx.toast('Work not changed',out?.error||out?.reason||'Owner unavailable');
  }
  var ACTIONS={
    'todo-toggle-detail':(ctx,b)=>{const s=scopeAction(ctx,b);if(!s.ok)return;const v=treeView(s.tid);v.selected=v.selected===s.id?null:s.id;ctx.renderApp();},
    'todo-show-item':(ctx,b)=>revealItem(ctx,b.dataset.thread||currentThreadId(ctx),b.dataset.id),
    'todo-toggle-parent':(ctx,b)=>{const s=scopeAction(ctx,b);if(!s.ok)return;const v=treeView(s.tid),collapsed=v.query.trim()?v.searchCollapsed:ui.collapsed;collapsed[s.id]=!collapsed[s.id];v.top=0;ctx.renderApp();},
    'todo-open-work':(ctx,b)=>{const s=scopeAction(ctx,b);if(!s.ok){ctx.toast('Work not opened',s.error);return;}const out=openWork(s.tid,s.id,b.dataset.binding);if(out.ok){const v=treeView(s.tid);v.selected=s.id;v.work=out;ctx.renderApp();}else ctx.toast('Work unavailable',out.error);},
    'todo-reveal-last':(ctx,b)=>{const tid=b.dataset.thread,list=itemsOf(tid);if(list?.length)revealItem(ctx,tid,docOrder(list).at(-1).todo_id);},
    'todo-expand-all':(ctx,b)=>{if(b.dataset.thread!==currentThreadId(ctx))return;for(const t of itemsOf(b.dataset.thread)||[])delete ui.collapsed[t.todo_id];treeView(b.dataset.thread).top=0;treeView(b.dataset.thread).searchCollapsed={};ctx.renderApp();},
    'todo-toggle-receipts':(ctx,b)=>{ui.receiptsOpen[b.dataset.id]=!ui.receiptsOpen[b.dataset.id];ctx.renderApp();},
    'todo-toggle-refusals':ctx=>{ui.refusalsOpen=!ui.refusalsOpen;ctx.renderApp();},
    'todo-admit':executeRow,'todo-complete':executeRow,
    'todo-attempt-bulk-complete':ctx=>{const out=attemptBulkComplete(currentThreadId(ctx),'user_bulk_gesture');ui.refusalsOpen=true;ctx.renderApp();ctx.toast('Bulk completion refused',out.reason);},
    'todo-attempt-provider-proposal':ctx=>{const out=attemptProviderProposal(currentThreadId(ctx));ui.refusalsOpen=true;ctx.renderApp();ctx.toast('Proposal refused',out.reason);},
    'todo-attempt-stale-write':(ctx,b)=>{const out=attemptStaleWrite(currentThreadId(ctx),b.dataset.id);ui.refusalsOpen=true;ctx.renderApp();ctx.toast('Stale write refused',out.reason);}
  };
  Object.entries(ACTIONS).forEach(([name,fn])=>EXT.action(name,(ctx,b,e)=>{fn(ctx,b,e);return true;}));
  if(typeof document!=='undefined'){
    document.addEventListener('input',e=>{const tid=e.target.dataset?.todoSearch;if(!tid)return;const ctx=activeCtx();if(currentThreadId(ctx)!==tid)return;const v=treeView(tid),pos=e.target.selectionStart;v.query=e.target.value;v.searchCollapsed={};v.top=0;ctx.renderApp();const field=document.querySelector('[data-todo-search="'+CSS.escape(tid)+'"]');field?.focus();try{field?.setSelectionRange(pos,pos);}catch(_){};});
    document.addEventListener('scroll',e=>{const vp=e.target,tid=vp.dataset?.todoViewport;if(!tid)return;const view=treeView(tid);view.top=vp.scrollTop;const space=vp.querySelector('.todo-virtual-space');if(space)space.innerHTML=virtualRows(activeCtx(),tid,visibleTree(tid),view.top,vp.clientHeight);},true);
    let restorePending=false;
    new MutationObserver(()=>{if(restorePending)return;restorePending=true;requestAnimationFrame(()=>{restorePending=false;for(const vp of document.querySelectorAll('[data-todo-viewport]')){const v=treeView(vp.dataset.todoViewport);if(Math.abs(vp.scrollTop-v.top)>1)vp.scrollTop=v.top;}});}).observe(document,{childList:true,subtree:true});
  }

  /* =====================================================================
     8. ACTIVITY SLOTS
     ---------------------------------------------------------------------
     Both decline (return '') for every domain but 'todo', so goal / subagents
     / crew / changes / artifacts keep rendering exactly as activity-bar.js and
     activity-panel.js already render them — this module never blanks out
     another domain's card. See the file header for the residual 'todo'-domain
     duplication those two files still need a one-line guard for; this module
     cannot close that gap from here without editing integrator-owned files.
     ===================================================================== */
  /* activity-bar.js owns the hover-card SHELL (.hover-card.ab-card[role=dialog],
     its data-k identity, tone and aria wiring), and calls into CARDS[domain]
     for the body. Registering a second slot here produced a body with no shell
     -- the preview stopped being a dialog at all. This module supplies the body
     through window.PM56_TODOS.hoverBody instead, and declines the slot. */
  EXT.slot('activityHoverCard', function(){ return ''; });
  EXT.slot('activityPanelBody', function(ctx){
    return renderPanel(ctx);
  });

  /* =====================================================================
     9. RESET-ALL — chained, not clobbered, matching goals.js's identical
        pattern, so this module's fixture resets alongside every other one.
     ===================================================================== */
  var prevReset = EXT._actions && EXT._actions['reset-all'];
  EXT.chainAction('reset-all', function(ctx,btn,ev){
    restoreFixture();
    return false;
  });

  /* =====================================================================
     10. PUBLIC API — window.PM56_TODOS, matching the window.PM56_GOAL shape
         goals.js exposes at the bottom of that file.
     ===================================================================== */
  function activeCtx(){ return (EXT.ctx ? EXT.ctx() : null); }

  /* =====================================================================
     10A. GRAPH VALIDATION AND LIST REPLACEMENT — Additive Correction v4
          (TDG-001..012)
     ---------------------------------------------------------------------
     Every mutation below fails CLOSED. A candidate graph is validated in full
     before anything is written, and a rejected candidate leaves the current
     list byte-identical -- there is no partial commit and no silent repair.
     ===================================================================== */
  /* Validate the complete candidate without changing it or the live list.
     Iterative traversal avoids both prototype-key collisions and recursion
     limits for large hierarchies. Presentation order has no role here. */
  function validateGraph(threadId, candidate){
    const res={schema:'pm.todo.graph_validation_result.v1',thread_id:threadId,
      candidate_revision:candidate?.revision??null,valid:false,self_parent_ids:[],
      parent_cycles:[],dependency_cycles:[],unknown_refs:[],cross_thread_refs:[],
      duplicate_ids:[],invalid_statuses:[],invalid_fields:[],parent_work_refs:[]};
    const fail=(id,field)=>res.invalid_fields.push({todo_id:id??null,field});
    if(typeof threadId!=='string'||!threadId||!candidate||!Array.isArray(candidate.items)){
      fail(null,'candidate');res.error='invalid_graph';return res;
    }
    const items=candidate.items,byId=new Map(),parents=new Map();
    const validId=id=>typeof id==='string'&&id.length>0;
    for(const t of items){
      if(!t||typeof t!=='object'||Array.isArray(t)){fail(null,'item');continue;}
      if(!validId(t.todo_id)){fail(t.todo_id,'todo_id');continue;}
      if(byId.has(t.todo_id))res.duplicate_ids.push(t.todo_id);
      else byId.set(t.todo_id,t);
      if(t.thread_id!==threadId)res.cross_thread_refs.push(t.todo_id);
      if(candidate.project_id!=null&&t.project_id!==candidate.project_id)res.cross_thread_refs.push(t.todo_id);
      if(t.status!=null&&!TODO_STATUSES.includes(t.status))res.invalid_statuses.push({todo_id:t.todo_id,status:t.status});
      for(const field of ['verification_state','source_group_label','done_category'])
        if(Object.prototype.hasOwnProperty.call(t,field))fail(t.todo_id,field);
      if(t.depends_on!=null&&!Array.isArray(t.depends_on))fail(t.todo_id,'depends_on');
      if(t.active_work_ids!=null&&!Array.isArray(t.active_work_ids))fail(t.todo_id,'active_work_ids');
      if(t.parent_todo_id!=null&&!validId(t.parent_todo_id))fail(t.todo_id,'parent_todo_id');
      if(t.parent_todo_id===t.todo_id)res.self_parent_ids.push(t.todo_id);
      if(t.parent_todo_id!=null)parents.set(t.parent_todo_id,true);
    }
    const foreign=new Set();
    for(const [tid,store] of Object.entries(RT.todos?.byThread||{}))if(tid!==threadId)
      for(const t of store.items||[])foreign.add(t.todo_id);
    function reference(id,owner){
      if(!validId(id)||!byId.has(id))res.unknown_refs.push(id??null);
      if(foreign.has(id)&&!byId.has(id))res.cross_thread_refs.push(owner+':'+id);
    }
    for(const [id,t] of byId){
      if(t.parent_todo_id!=null)reference(t.parent_todo_id,id);
      if(Array.isArray(t.depends_on))for(const dep of t.depends_on)reference(dep,id);
      if(parents.has(id)&&((t.active_work_ids||[]).length||t.expected_outcome||
         (Array.isArray(t.work_bindings)&&t.work_bindings.length)))res.parent_work_refs.push(id);
    }
    const bindings=Array.isArray(candidate.bindings)?candidate.bindings:[];
    for(const binding of bindings){
      if(!binding||typeof binding!=='object'){fail(null,'binding');continue;}
      reference(binding.todo_id,binding.binding_id||'binding');
      if(binding.thread_id!=null&&binding.thread_id!==threadId)res.cross_thread_refs.push(binding.binding_id||'binding');
      if(candidate.project_id!=null&&binding.project_id!=null&&binding.project_id!==candidate.project_id)
        res.cross_thread_refs.push(binding.binding_id||'binding');
      if(parents.has(binding.todo_id))res.parent_work_refs.push(binding.todo_id);
    }
    function cycles(edges,out){
      const colour=new Map();
      for(const start of byId.keys()){
        if(colour.has(start))continue;
        const stack=[{id:start,edges:edges(byId.get(start)),at:0}],positions=new Map([[start,0]]);
        colour.set(start,1);
        while(stack.length){
          const top=stack[stack.length-1];
          if(top.at===top.edges.length){colour.set(top.id,2);positions.delete(top.id);stack.pop();continue;}
          const next=top.edges[top.at++];if(!byId.has(next))continue;
          if(colour.get(next)===1){out.push(stack.slice(positions.get(next)).map(x=>x.id).concat(next));continue;}
          if(colour.get(next)===2)continue;
          colour.set(next,1);positions.set(next,stack.length);
          stack.push({id:next,edges:edges(byId.get(next)),at:0});
        }
      }
    }
    cycles(t=>t.parent_todo_id==null?[]:[t.parent_todo_id],res.parent_cycles);
    cycles(t=>Array.isArray(t.depends_on)?t.depends_on:[],res.dependency_cycles);
    for(const key of ['unknown_refs','cross_thread_refs','duplicate_ids','parent_work_refs'])res[key]=Array.from(new Set(res[key]));
    const graphBad=['self_parent_ids','parent_cycles','dependency_cycles','unknown_refs',
      'cross_thread_refs','duplicate_ids','invalid_fields','parent_work_refs'].some(k=>res[k].length);
    res.valid=!graphBad&&!res.invalid_statuses.length;
    if(!res.valid)res.error=graphBad?'invalid_graph':'invalid_status';
    return res;
  }

  /* Batch 16 ToDoController runtime. Records below are session-local concept
     records, not centrally admitted EventRecords or durable native storage. */
  var outcomeOwners=new Map();
  var TODO_STATUSES=['pending','in_progress','completed','blocked','skipped'];
  var TODO_CAUSES=['work_admitted','outcome_satisfied','dependency_changed','external_block','explicit_skip','retry','reopen','child_rollup'];
  const copyTodo=x=>JSON.parse(JSON.stringify(x));
  const sameTodo=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  function workOwner(item){return outcomeOwners.get(item.outcome_owner)||null;}
  function bindingsOf(threadId){return threadStore(threadId)?.bindings||[];}
  function bindingTarget(store,b){return store.binding_targets?.[b.binding_id]?.todo_id||b.todo_id;}
  function itemBindings(threadId,id){const s=threadStore(threadId);return s?(s.bindings||[]).filter(b=>bindingTarget(s,b)===id):[];}
  function liveBinding(b){return ['admitted','running','recovery_required'].includes(b.state);}
  function executionFence(item){
    const owner=workOwner(item);let fence;
    try{fence=owner?.fence?.(item.workflow_ref,item);}catch(e){return {error:'work_owner_unavailable'};}
    return fence||{run_id:item.run_id??null,run_epoch:item.run_epoch??null};
  }
  function captureTodo(threadId,todoId){
    const s=threadStore(threadId),item=s&&findItem(s.items,todoId);if(!item)return null;
    const fence=executionFence(item);
    return {project_id:item.project_id||PROJECT_ID,thread_id:threadId,todo_id:todoId,
      expected_list_revision:s.revision||1,expected_revision:item.revision,
      plan_id:item.plan_id??null,plan_version:item.plan_version??null,plan_hash:item.plan_hash??null,
      run_id:item.run_id??null,run_epoch:fence.run_epoch??null,
      ...(fence.user_stop_epoch!=null?{user_stop_epoch:fence.user_stop_epoch}:{}),
      ...(fence.error?{fence_error:fence.error}:{})};
  }
  function rejectedTodo(store,ev,error){
    // Rejected evidence is outside the item graph. It participates in any
    // surrounding command transaction, so failed admission leaves no residue.
    window.PM56_TX.set(store,'rejected',(store.rejected||[]).concat({event:copyTodo(ev),reason:error,at:nowIso()}));
    return {ok:false,error,retained_as_evidence:true};
  }
  function currentTodoError(threadId,item,ev){
    const s=threadStore(threadId),snap=captureTodo(threadId,item.todo_id);
    if(!ev||ev.thread_id!==threadId||ev.project_id!==snap.project_id)return 'wrong_todo_scope';
    if(ev.expected_list_revision!==(s.revision||1))return 'stale_list_revision';
    if(ev.expected_revision!==item.revision)return 'stale_item_revision';
    if(ev.plan_id!==snap.plan_id||ev.plan_version!==snap.plan_version||ev.plan_hash!==snap.plan_hash)return 'stale_plan_binding';
    if(ev.run_id!==snap.run_id||ev.run_epoch!==snap.run_epoch||ev.user_stop_epoch!==snap.user_stop_epoch||snap.fence_error)return 'stale_run_binding';
    return null;
  }
  function transitionRecord(item,ev,at){
    const tr=TR(item.todo_id,item.status,ev.to_status,ev.cause_kind,ev.cause_ref,item.revision,at,ev.note||'');
    tr.transition_id=ev.transition_id||('transition:'+item.todo_id+':'+item.revision+':'+ev.cause_kind);
    tr.expected_revision=item.revision;tr.committed_revision=item.revision+1;
    tr.request_fingerprint=JSON.stringify(ev);return tr;
  }
  function derivedStatus(children){
    if(children.some(t=>t.status==='in_progress'))return 'in_progress';
    if(children.every(t=>t.status==='skipped'))return 'skipped';
    if(children.every(t=>t.status==='completed'||t.status==='skipped'))return 'completed';
    if(children.some(t=>t.status==='blocked'))return 'blocked';return 'pending';
  }
  function refreshRollups(store,at){
    const TX=window.PM56_TX,ix=graphIndex(store.items),order=docOrder(store.items);
    for(let i=order.length-1;i>=0;i--){
      const item=order[i],children=ix.children.get(item.todo_id);if(!children?.length)continue;
      const next=derivedStatus(children);if(next===item.status)continue;
      const cause='rollup:'+item.todo_id+':'+(store.revision||1)+':'+children.map(t=>t.todo_id+'@'+t.revision).join(',');
      const ev={to_status:next,cause_kind:'child_rollup',cause_ref:cause,note:'Derived from current child membership.'};
      const tr=transitionRecord(item,ev,at);
      TX.set(item,'transitions',(item.transitions||[]).concat(tr));TX.set(item,'status',next);TX.set(item,'revision',tr.committed_revision);
      TX.set(item,'blocked_reason_ref',next==='blocked'?children.find(t=>t.status==='blocked').blocked_reason_ref:null);
      if(next==='completed')TX.set(item,'completed_at',at);
    }
  }
  function refreshBindingTargets(store){
    const targets={...(store.binding_targets||{})},ix=graphIndex(store.items);
    for(const b of store.bindings||[]){const id=bindingTarget(store,b),item=ix.byId.get(id);if(item)targets[b.binding_id]={todo_id:id,list_revision:store.revision||1,item_revision:item.revision};}
    window.PM56_TX.set(store,'binding_targets',targets);
  }
  function applyTransition(threadId,ev){
    const store=threadStore(threadId);if(!store)return {ok:false,error:'unknown_thread'};
    const item=findItem(store.items,ev?.todo_id);if(!item)return rejectedTodo(store,ev||{},'unknown_todo');
    const replayId=ev.transition_id||('transition:'+item.todo_id+':'+ev.expected_revision+':'+ev.cause_kind);
    const prior=(item.transitions||[]).find(t=>t.transition_id===replayId);if(prior)return prior.request_fingerprint===JSON.stringify(ev)?{ok:true,replayed:true,transition:prior,item}:{ok:false,error:'conflicting_transition_replay'};
    const currentError=currentTodoError(threadId,item,ev);if(currentError)return rejectedTodo(store,ev,currentError);
    if(!TODO_STATUSES.includes(ev.to_status))return {ok:false,error:'invalid_status'};
    if(!TODO_CAUSES.includes(ev.cause_kind)||typeof ev.cause_ref!=='string'||!ev.cause_ref.trim())return {ok:false,error:'unsupported_transition_cause'};
    if(!isLeaf(store.items,item))return {ok:false,error:'parent_not_executable'};
    const owner=workOwner(item),existing=itemBindings(threadId,item.todo_id),active=existing.filter(liveBinding);
    let binding=ev.work_binding?existing.find(b=>b.binding_id===ev.work_binding):null,newBinding=null;
    if(ev.to_status==='in_progress'&&item.status==='pending'){
      if(ev.cause_kind!=='work_admitted'||!runnable(store.items,item))return {ok:false,error:'work_not_admissible'};
      const b=ev.binding;
      if(!b||!b.binding_id||b.binding_id!==ev.work_binding||b.todo_id!==item.todo_id||
        !b.work_id||!b.attempt_id||!['primary_segment','subagent_assignment','crew_assignment','tool_batch','research','validation','artifact_generation'].includes(b.work_kind)||
        !item.expected_outcome||b.expected_outcome!==item.expected_outcome||b.terminal_result_ref!=null||active.length)return {ok:false,error:'work_binding_required'};
      for(const [tid,s] of Object.entries(RT.todos.byThread))if((s.bindings||[]).some(x=>x.binding_id===b.binding_id||x.work_id===b.work_id&&x.attempt_id===b.attempt_id))return {ok:false,error:'work_binding_already_admitted'};
      const admitted=owner?.admit?.(item.workflow_ref,item,b,ev.cause_ref);
      if(!admitted?.ok)return {ok:false,error:admitted?.error||'work_owner_required'};
      newBinding={schema:'pm.chat.todo_work_binding.v1',binding_id:b.binding_id,todo_id:b.todo_id,
        work_kind:b.work_kind,work_id:b.work_id,attempt_id:b.attempt_id,expected_outcome:b.expected_outcome,
        admitted_at:nowIso(),terminal_result_ref:null,state:'running',project_id:item.project_id||PROJECT_ID,
        thread_id:threadId,run_id:item.run_id??null,admission_epoch:item.run_epoch??null,
        plan_id:item.plan_id??null,plan_version:item.plan_version??null,plan_hash:item.plan_hash??null,
        admission_ref:ev.cause_ref};
    }else if(ev.to_status==='completed'){
      if(item.status!=='in_progress'||ev.cause_kind!=='outcome_satisfied'||!binding||!liveBinding(binding))return {ok:false,error:'outcome_evidence_required'};
      let proof;try{proof=owner?.outcome?.(item.workflow_ref,item,ev.cause_ref,binding);}catch(e){proof={ok:false,error:e.message};}
      if(!proof?.ok)return {ok:false,error:proof?.error||'outcome_not_verified'};
    }else if(ev.to_status==='blocked'){
      if(['completed','skipped'].includes(item.status)||ev.cause_kind!=='external_block'||!ev.blocked_reason_ref||!owner?.condition?.(item.workflow_ref,item,ev.blocked_reason_ref,'blocked')?.ok)return {ok:false,error:'external_block_evidence_required'};
    }else if(ev.to_status==='skipped'){
      if(['completed','skipped'].includes(item.status)||ev.cause_kind!=='explicit_skip'||!ev.skip_disposition?.user_approved||!ev.skip_disposition.reason?.trim())return {ok:false,error:'skip_not_accepted'};
      if(active.some(b=>!owner?.cancel?.(item.workflow_ref,b,ev.skip_disposition.cancellation_ref)?.ok))return {ok:false,error:'safe_cancellation_required'};
    }else if(ev.to_status==='pending'&&item.status==='blocked'){
      if(ev.cause_kind!=='dependency_changed'||!owner?.condition?.(item.workflow_ref,item,item.blocked_reason_ref,'cleared')?.ok)return {ok:false,error:'block_not_cleared'};
      if(active.length)return {ok:false,error:'active_work_requires_recovery'};
    }else if(ev.to_status==='pending'&&['completed','skipped'].includes(item.status)){
      if(ev.cause_kind!=='reopen'||!ev.user_approved)return {ok:false,error:'explicit_reopen_required'};
    }else if(ev.to_status==='pending'&&item.status==='in_progress'){
      if(ev.cause_kind!=='retry'||!binding||!owner?.retry?.(item.workflow_ref,binding,ev.cause_ref)?.ok)return {ok:false,error:'retry_evidence_required'};
    }else return {ok:false,error:item.status===ev.to_status?'status_unchanged':'invalid_transition'};
    return window.PM56_TX.run(()=>{
      const TX=window.PM56_TX,at=nowIso(),tr=transitionRecord(item,ev,at);
      if(newBinding){TX.set(store,'bindings',(store.bindings||[]).concat(newBinding));binding=newBinding;TX.set(item,'active_work_ids',[binding.work_id]);}
      TX.set(item,'transitions',(item.transitions||[]).concat(tr));TX.set(item,'status',ev.to_status);TX.set(item,'revision',tr.committed_revision);
      if(ev.to_status==='in_progress'&&!item.started_at)TX.set(item,'started_at',at);
      if(ev.to_status==='completed'){
        TX.set(item,'completed_at',at);TX.set(binding,'terminal_result_ref',ev.cause_ref);TX.set(binding,'state','succeeded');
        TX.set(item,'active_work_ids',[]);
      }
      if(ev.to_status==='pending'){
        TX.set(item,'completed_at',null);TX.set(item,'active_work_ids',[]);
        if(ev.cause_kind==='retry'&&binding){TX.set(binding,'state','failed');TX.set(binding,'terminal_result_ref',ev.cause_ref);}
      }
      if(ev.to_status==='skipped'){
        TX.set(item,'skip_disposition',copyTodo(ev.skip_disposition));TX.set(item,'active_work_ids',[]);
        for(const b of active){TX.set(b,'state','cancelled');TX.set(b,'terminal_result_ref',ev.skip_disposition.cancellation_ref);}
      }
      TX.set(item,'blocked_reason_ref',ev.to_status==='blocked'?ev.blocked_reason_ref:null);
      TX.set(store,'revision',(store.revision||1)+1);refreshRollups(store,at);refreshBindingTargets(store);
      return {ok:true,item,transition:tr,binding:binding||null};
    });
  }
  function applyTransitions(threadId,events){
    if(!Array.isArray(events)||!events.length)return {ok:false,error:'invalid_request'};
    const s=threadStore(threadId),base=s?.revision||1;
    if(events.some(e=>e.expected_list_revision!==base)||new Set(events.map(e=>e.todo_id)).size!==events.length)return {ok:false,error:'stale_or_duplicate_batch'};
    const out=window.PM56_TX.run(()=>{
      const receipts=[];
      for(const e of events){const r=window.PM56_TODOS.applyTransition(threadId,{...e,expected_list_revision:s.revision||1});if(!r.ok)return r;receipts.push(r.transition);}
      return {ok:true,transitions:receipts};
    });
    if(!out.ok&&events.some(e=>e.to_status==='completed'))return {...out,detail:out.error,error:'bulk_completion_refused'};return out;
  }
  /* Binding targets are mutable associations, not new admitted identities.
     Even a rebound binding keeps its original todo_id, work_id and attempt_id. */
  function replaceThreadList(threadId,candidate,opts={}){
    const store=threadStore(threadId),old=store?.items||[],revision=store?.revision||1;
    if(opts.source==='provider'||opts.mode==='provider')return {ok:false,error:'provider_proposal_required'};
    const initial=!old.length;
    if(!initial&&(opts.mode!=='restructure'||opts.expected_revision!==revision))return {ok:false,error:'explicit_current_restructure_required'};
    const check=validateGraph(threadId,candidate);if(!check.valid)return {ok:false,error:'invalid_graph',validation:check};
    const items=copyTodo(candidate.items),byId=new Map(items.map(t=>[t.todo_id,t])),oldById=new Map(old.map(t=>[t.todo_id,t]));
    const disp={schema:'pm.todo.list_replacement_disposition.v1',thread_id:threadId,old_revision:revision,new_revision:revision+1,retained:[],rebound:[],canceled:[],refused:[],active_work_refs:[]};
    const targets={...(store?.binding_targets||{})},bindingUpdates=[],reboundIds=new Map();
    for(const [from,to] of Object.entries(opts.rebind||{}))if(!oldById.has(from)||byId.has(from)||!byId.has(to))return {ok:false,error:'unknown_rebind_reference'};
    for(const t of items){
      const prev=oldById.get(t.todo_id);
      if(!prev&&(t.status&&t.status!=='pending'||t.active_work_ids?.length||t.transitions?.length))return {ok:false,error:'new_items_must_be_pending'};
      if(prev&&t.status!=null&&t.status!==prev.status)return {ok:false,error:'unsupported_status_assertion'};
      // Structural proposals cannot replace owner runtime/evidence fields.
      if(prev){
        const structural={title:t.title??prev.title,parent_todo_id:t.parent_todo_id??null,depends_on:t.depends_on||[],display_order:t.display_order??prev.display_order,parallel_group_id:t.parallel_group_id??null};
        if(t.expected_outcome!==undefined&&t.expected_outcome!==prev.expected_outcome&&itemBindings(threadId,prev.todo_id).length)return {ok:false,error:'bound_outcome_changed'};
        Object.assign(t,copyTodo(prev),structural,{revision:(prev.revision||1)+1});
        if(!itemBindings(threadId,prev.todo_id).length&&candidate.items.find(x=>x.todo_id===t.todo_id).expected_outcome!==undefined)t.expected_outcome=candidate.items.find(x=>x.todo_id===t.todo_id).expected_outcome;
        disp.retained.push(t.todo_id);
      }else Object.assign(t,itemFactory(threadId)({...t,status:'pending',revision:1,transitions:[],active_work_ids:[]}));
    }
    for(const b of store?.bindings||[]){
      const oldId=bindingTarget(store,b),previous=oldById.get(oldId);
      if(liveBinding(b))disp.active_work_refs.push({binding_id:b.binding_id,work_id:b.work_id,attempt_id:b.attempt_id,todo_id:oldId});
      if(byId.has(oldId)){targets[b.binding_id]={todo_id:oldId,list_revision:revision+1,item_revision:byId.get(oldId).revision};continue;}
      const targetId=opts.rebind?.[oldId],target=targetId&&byId.get(targetId);
      if(target){
        if(reboundIds.has(targetId)&&reboundIds.get(targetId)!==oldId||oldById.has(targetId)||!isLeaf(items,target)||target.expected_outcome!==b.expected_outcome){disp.refused.push({binding_id:b.binding_id,reason:'incompatible_rebind_target'});continue;}
        reboundIds.set(targetId,oldId);
        // Current record follows exact work lineage; the admission record is unchanged.
        const structure={todo_id:target.todo_id,title:target.title,parent_todo_id:target.parent_todo_id,depends_on:target.depends_on,display_order:target.display_order,parallel_group_id:target.parallel_group_id};
        Object.assign(target,copyTodo(previous),structure,{revision:(previous.revision||1)+1});
        targets[b.binding_id]={todo_id:targetId,list_revision:revision+1,item_revision:target.revision};
        disp.rebound.push({from:oldId,to:targetId,binding_id:b.binding_id,work_id:b.work_id,attempt_id:b.attempt_id});
      }else if(liveBinding(b)){
        const receipt=opts.cancellations?.[b.binding_id],owner=workOwner(previous);
        if(receipt&&owner?.cancel?.(previous.workflow_ref,b,receipt)?.ok){bindingUpdates.push({binding:b,receipt});disp.canceled.push({binding_id:b.binding_id,todo_id:oldId,cancellation_ref:receipt});}
        else disp.refused.push({binding_id:b.binding_id,todo_id:oldId,reason:'active_work_unresolved'});
      }
    }
    for(const o of old)if(isLeaf(old,o)&&o.status==='in_progress'&&!itemBindings(threadId,o.todo_id).length)disp.refused.push({todo_id:o.todo_id,reason:'unproven_legacy_work_binding'});
    if(disp.refused.length)return {ok:false,error:'active_work_unresolved',disposition:disp};
    const finalCheck=validateGraph(threadId,{...candidate,items});if(!finalCheck.valid)return {ok:false,error:'invalid_graph',validation:finalCheck};
    return window.PM56_TX.run(()=>{
      const TX=window.PM56_TX,s=store||{items:[],revision:1,refusals:[],bindings:[],binding_targets:{}};
      if(!store)TX.set(RT.todos.byThread,threadId,s);
      TX.set(s,'items',items);TX.set(s,'revision',revision+1);TX.set(s,'binding_targets',targets);
      TX.set(s,'removed',(s.removed||[]).concat(old.filter(t=>!byId.has(t.todo_id)).map(t=>({item:copyTodo(t),removed_at:nowIso(),list_revision:revision+1}))));
      for(const u of bindingUpdates){TX.set(u.binding,'state','cancelled');TX.set(u.binding,'terminal_result_ref',u.receipt);}
      refreshRollups(s,nowIso());refreshBindingTargets(s);TX.set(s,'restructures',(s.restructures||[]).concat(disp));
      return {ok:true,disposition:disp,validation:finalCheck};
    });
  }
  function proposeTodos(threadId,proposal,expectedRevision){
    const s=threadStore(threadId),old=s?.items||[];
    if(expectedRevision!==(s?.revision||1)||!proposal||!Array.isArray(proposal.items))return {ok:false,error:'stale_or_invalid_proposal'};
    const permitted=new Set(['todo_id','title','status','parent_todo_id','depends_on','parallel_group_id','display_order','expected_outcome']);
    const byId=new Map(old.map(t=>[t.todo_id,copyTodo(t)])),seen=new Set(),omitted=[];
    for(const patch of proposal.items){
      if(!patch||!patch.todo_id||seen.has(patch.todo_id)||Object.keys(patch).some(k=>!permitted.has(k)))return {ok:false,error:'unsupported_provider_proposal'};
      seen.add(patch.todo_id);const existing=byId.get(patch.todo_id);
      if(patch.status!=null&&patch.status!==(existing?.status||'pending'))return {ok:false,error:'unsupported_status_assertion'};
      byId.set(patch.todo_id,{...(existing||itemFactory(threadId)({todo_id:patch.todo_id,status:'pending'})),...copyTodo(patch)});
    }
    for(const t of old)if(!seen.has(t.todo_id))omitted.push(t.todo_id);
    const result=replaceThreadList(threadId,{items:Array.from(byId.values())},{mode:'restructure',expected_revision:expectedRevision});
    return {...result,omitted_retained:omitted,proposal_only:true};
  }
  function materializeForPlan(plan){
    const threadId=plan.thread_id,store=threadStore(threadId),mk=itemFactory(threadId),existing=store?.items||[];
    // New document versions get fresh executable leaves; Retry never comes here.
    // The list owner retains the retired item/binding history when it replaces
    // a cancelled version. This is not a second list or a source-group section.
    const prefix='tp-'+plan.plan_id+(plan.version>1?'-V'+plan.version:'')+'-';
    const mine=existing.filter(t=>t.plan_id===plan.plan_id&&t.plan_version===plan.version&&t.run_id===plan.run_id);
    const expected=(plan.steps||[]).map(st=>prefix+st.id);
    if(mine.length)return mine.length===expected.length&&expected.every(id=>mine.some(t=>t.todo_id===id&&t.plan_hash===plan.plan_hash))?{ok:true,created:0,reused:true,ids:expected}:{ok:false,error:'existing_todo_binding_conflict'};
    if(existing.some(t=>expected.includes(t.todo_id)))return {ok:false,error:'existing_todo_binding_conflict'};
    const prior=existing.filter(t=>t.plan_id===plan.plan_id),replacement=plan.replace_revision;
    if(prior.length){
      const owner=window.PM56_PLANS,record=owner?.get(plan.plan_id),oldRun=replacement&&owner?.runs()[replacement.plan_run_id];
      if(!replacement||!oldRun||oldRun.state!=='cancelled'||oldRun.plan_id!==plan.plan_id||
        oldRun.thread_id!==threadId||oldRun.project_id!==plan.project_id||
        oldRun.plan_version!==replacement.version||oldRun.plan_hash!==replacement.hash||
        plan.version<=replacement.version||record?.version!==plan.version||record?.status!=='ready'||owner.hash(plan.plan_id)!==plan.plan_hash||
        prior.some(t=>t.run_id!==oldRun.plan_run_id||t.plan_version!==replacement.version||t.plan_hash!==replacement.hash))
        return {ok:false,error:'plan_revision_replacement_not_admitted'};
    }
    const retained=prior.length?existing.filter(t=>t.plan_id!==plan.plan_id):existing;
    const parentIds=new Set((plan.steps||[]).map(st=>st.parent).filter(Boolean));
    const items=(plan.steps||[]).map((st,i)=>mk({todo_id:expected[i],display_order:retained.length+i+1,
      project_id:plan.project_id||PROJECT_ID,parent_todo_id:st.parent?prefix+st.parent:null,
      depends_on:(st.deps||[]).map(d=>prefix+d),parallel_group_id:st.parallel_group_id||null,
      plan_id:plan.plan_id,plan_version:plan.version,plan_hash:plan.plan_hash,plan_step_ids:[st.id],planunit_ids:(plan.unit_mapping?.[st.id]||[]).slice(),
      title:st.title,expected_outcome:parentIds.has(st.id)?null:st.outcome||null,status:'pending',revision:1,transitions:[],
      strict_outcome_contract:true,outcome_owner:plan.workRef?.kind||null,workflow_ref:plan.workRef?.ref||null,run_id:plan.run_id,run_epoch:plan.run_epoch||1}));
    if(!items.length)return {ok:false,error:'no_plan_steps'};
    if(!prior.length)return appendMaterialized(threadId,existing,items);
    return window.PM56_TX.run(()=>{
      const cancellations={};
      for(const t of prior){
        const active=itemBindings(threadId,t.todo_id).filter(liveBinding);if(!active.length)continue;
        const stop=workOwner(t)?.stop?.(t.workflow_ref,active,{kind:'plan_revision',replacement,new_plan_version:plan.version});
        if(!stop?.ok||!stop.receipt_ref)return {ok:false,error:stop?.error||'revision_work_stop_required'};
        for(const binding of active)cancellations[binding.binding_id]=stop.receipt_ref;
      }
      const result=replaceThreadList(threadId,{items:retained.concat(items)},{mode:'restructure',expected_revision:store.revision||1,cancellations});
      if(!result.ok)return result;
      return {ok:true,created:items.length,reused:false,ids:expected,replaced_revision:replacement.version,disposition:result.disposition};
    });
  }
  function appendMaterialized(threadId,existing,items){
    const check=validateGraph(threadId,{items:existing.concat(items)});if(!check.valid)return {ok:false,error:'invalid_graph',validation:check};
    return window.PM56_TX.run(()=>{const TX=window.PM56_TX;let store=threadStore(threadId);
      if(!store){store={items:[],refusals:[],revision:1,bindings:[],binding_targets:{}};TX.set(RT.todos.byThread,threadId,store);}
      TX.set(store,'items',existing.concat(items));TX.set(store,'revision',(store.revision||1)+1);refreshBindingTargets(store);
      return {ok:true,created:items.length,reused:false,ids:items.map(t=>t.todo_id)};});
  }
  function materializeForWork(work){
    const store=threadStore(work.thread_id),existing=store?.items||[],mk=itemFactory(work.thread_id),prefix='tw-'+work.run_id+'-';
    const ids=(work.steps||[]).map(st=>prefix+st.id),prior=existing.filter(t=>t.run_id===work.run_id),parents=new Set((work.steps||[]).map(st=>st.parent).filter(Boolean));
    if(prior.length)return prior.length===ids.length&&ids.every(id=>prior.some(t=>t.todo_id===id&&t.workflow_ref===work.ref&&t.outcome_owner===work.owner))?{ok:true,reused:true,ids}:{ok:false,error:'work_mapping_conflict'};
    const items=(work.steps||[]).map((st,i)=>mk({todo_id:ids[i],project_id:work.project_id,display_order:existing.length+i+1,title:st.title,expected_outcome:parents.has(st.id)?null:st.outcome,
      parent_todo_id:st.parent?prefix+st.parent:null,depends_on:(st.deps||[]).map(d=>prefix+d),parallel_group_id:st.parallel_group_id||null,
      status:'pending',strict_outcome_contract:true,outcome_owner:work.owner,workflow_ref:work.ref,run_id:work.run_id,run_epoch:work.epoch||1}));
    if(!items.length||!outcomeOwners.has(work.owner))return {ok:false,error:'work_owner_required'};
    return appendMaterialized(work.thread_id,existing,items);
  }
  function outcomeSummary(threadId,ids){
    const items=itemsOf(threadId)||[],ix=graphIndex(items),required=(ids||[]).map(id=>ix.byId.get(id));
    if(!ids?.length||required.some(t=>!t))return {ok:false,error:'required_todo_missing',evidenceRefs:[]};
    const leaves=required.filter(t=>!ix.children.get(t.todo_id)?.length),evidence=[];
    for(const t of leaves){
      if(t.status==='skipped'){
        const tr=t.transitions?.at(-1);if(!t.skip_disposition?.user_approved||!t.skip_disposition.reason?.trim()||tr?.cause_kind!=='explicit_skip')return {ok:false,error:'skip_not_accepted',evidenceRefs:[]};
        evidence.push(tr.cause_ref);continue;
      }
      if(t.status!=='completed')return {ok:false,error:'required_work_unfinished',evidenceRefs:[]};
      const tr=t.transitions?.at(-1),b=itemBindings(threadId,t.todo_id).find(b=>b.state==='succeeded'&&b.terminal_result_ref===tr?.cause_ref);
      if(!tr||tr.to_status!=='completed'||tr.cause_kind!=='outcome_satisfied'||!b)return {ok:false,error:'accepted_outcome_missing',evidenceRefs:[]};
      let proof;try{proof=workOwner(t)?.outcome?.(t.workflow_ref,t,tr.cause_ref,b);}catch(e){proof={ok:false};}
      if(!proof?.ok)return {ok:false,error:'completion_evidence_missing_or_stale',evidenceRefs:[]};evidence.push(tr.cause_ref);
    }
    if(!leaves.length)return {ok:false,error:'completion_evidence_missing',evidenceRefs:[]};
    return {ok:true,evidenceRefs:Array.from(new Set(evidence)),requiredIds:ids.slice()};
  }
  function advanceForPlan(){return {ok:false,error:'execution_owner_required'};}
  function setOwnerWait(threadId,todoId,condition){
    const s=threadStore(threadId),t=s&&findItem(s.items,todoId);if(!t||t.status!=='in_progress')return {ok:false,error:'work_not_running'};
    if(condition&&!['quota','window','recovery_required'].includes(condition.kind))return {ok:false,error:'invalid_wait'};
    const owner=workOwner(t);if(!owner?.wait?.(t.workflow_ref,t,condition)?.ok)return {ok:false,error:'owner_wait_required'};
    return window.PM56_TX.run(()=>{const TX=window.PM56_TX;TX.set(t,'owner_wait',condition?copyTodo(condition):null);
      for(const b of itemBindings(threadId,todoId).filter(liveBinding)){if(condition?.kind==='recovery_required')TX.set(b,'state','recovery_required');else if(!condition&&b.state==='recovery_required')TX.set(b,'state','running');}
      TX.set(t,'revision',t.revision+1);TX.set(s,'revision',(s.revision||1)+1);refreshBindingTargets(s);
      return {ok:true,status:t.status};});
  }
  function openWork(threadId,todoId,bindingId){
    const t=findItem(itemsOf(threadId),todoId),b=itemBindings(threadId,todoId).find(b=>!bindingId||b.binding_id===bindingId);
    if(!t||!b)return {ok:false,error:'work_binding_not_found'};
    const owner=workOwner(t),detail=owner?.open?.(t.workflow_ref,b,t);
    if(!detail?.ok)return {ok:false,error:detail?.error||'owner_unavailable'};
    return {ok:true,command:'cmd.chat.todos.open_work',concept_only:true,thread_id:threadId,todo_id:todoId,binding_id:b.binding_id,work_id:b.work_id,attempt_id:b.attempt_id,detail};
  }

  /* Explicit Review conversion through the existing To-Do owner. All selected
     records are validated before append; unrelated items and work bindings stay
     byte-identical. Identity includes the source run and finding. */
  function materializeForReview(run, selectedIds){
    if(!run || run.kind!=='review' || run.status!=='completed' || !run.review)
      return {ok:false,error:'review_not_completed'};
    var ids=Array.from(new Set(selectedIds||[]));
    if(!ids.length) return {ok:false,error:'no_findings_selected'};
    var findings=ids.map(function(id){return (run.review.findings||[]).find(function(f){return f.id===id;});});
    if(findings.some(function(f){return !f || f.disposition!=='confirmed' || !f.evidenceRefs || !f.evidenceRefs.length;}))
      return {ok:false,error:'confirmed_evidenced_findings_only'};
    var store=threadStore(run.threadId),existing=(store&&store.items)||[],mk=itemFactory(run.threadId),made=[],mapped=[];
    findings.forEach(function(f){
      var id='trv-'+run.id+'-'+f.id, found=existing.find(function(t){return t.todo_id===id;});
      mapped.push({finding_id:f.id,todo_id:id});
      if(!found) made.push(mk({todo_id:id,display_order:existing.length+made.length+1,title:f.proposedRemediation||f.claim,
        expected_outcome:f.expectedOutcome||f.claim,status:'pending',source_review_run_id:run.id,source_finding_id:f.id,
        source_target_hash:run.review.targetPack.targetHashes.primary,source_evidence_refs:JSON.parse(JSON.stringify(f.evidenceRefs))}));
    });
    var check=validateGraph(run.threadId,{items:existing.concat(made)});
    if(!check.valid) return {ok:false,error:'invalid_graph',validation:check};
    if(made.length){const added=appendMaterialized(run.threadId,existing,made);if(!added.ok)return added;}
    return {ok:true,created:made.length,items:mapped,reused:made.length===0};
  }

  // B06: explicit selected-message promotion. Never writes a task during discussion.
  function materializeFromRoom(x){
    const checked=window.PM56_ROOM?.validatePromotion(x,'todo');
    if(!checked?.ok)return checked||{ok:false,error:'room_unavailable'};
    const r=checked.run,m=checked.message,id='room-todo-'+r.id+'-'+m.id;
    let store=threadStore(r.threadId);const existing=store?.items||[],prior=existing.find(t=>t.todo_id===id);
    if(prior)return {ok:true,todoId:id,reused:true};
    const item=itemFactory(r.threadId)({todo_id:id,display_order:existing.length+1,title:m.body,
      expected_outcome:m.body,status:'pending',source_room_run_id:r.id,source_room_message_id:m.id,
      source_participant_id:m.senderId,source_definition_revision:r.definitionRevision,source_message_hash:x.messageHash});
    const check=validateGraph(r.threadId,{items:existing.concat(item)});
    if(!check.valid)return {ok:false,error:'invalid_graph'};
    const added=appendMaterialized(r.threadId,existing,[item]);if(!added.ok)return added;
    return {ok:true,todoId:id,reused:false};
  }

  window.PM56_TODOS = {
    materializeForWork, outcomeSummary,
    registerOutcomeOwner:(kind,validator,options={})=>{if(outcomeOwners.has(kind))throw new Error('duplicate_todo_outcome_owner');outcomeOwners.set(kind,{...options,outcome:validator});},
    capture:captureTodo,bindings:bindingsOf,bindingsFor:itemBindings,openWork,setOwnerWait,
    visibleTree:tid=>visibleTree(tid).map(r=>({todo_id:r.item.todo_id,depth:r.depth})),
    applyTransitions,propose:proposeTodos,
    snapshot:threadId=>{const s=threadStore(threadId);return s?copyTodo(s):null;},
    runnable:(threadId,todoId)=>{const items=itemsOf(threadId),t=findItem(items,todoId);return !!t&&isLeaf(items,t)&&runnable(items,t);},
    materializeFromRoom:materializeFromRoom,
    /* Body only -- activity-bar.js wraps it in the shared hover-card shell. */
    hoverBody: renderCompact,
    /* Flat item list (TodoItemV2[]) for one thread, or the current thread
       when no id is given. Returns null when that thread has no list. */
    get: function(threadId){ return itemsOf(threadId || currentThreadId(activeCtx())); },
    summary: function(threadId){ return summary(threadId || currentThreadId(activeCtx())); },
    leaves: function(threadId){ return allLeaves(itemsOf(threadId || currentThreadId(activeCtx()))||[]); },
    restore: restoreFixture,
    fixture: function(){ return JSON.parse(TODO0); },
    /* Additive Correction v4 (TDG-001..012). Graph validation, atomic list
       replacement with retain/rebind/cancel/refuse dispositions, and the
       currentness-gated transition path. */
    validateGraph: validateGraph,
    replaceThreadList: replaceThreadList,
    applyTransition: applyTransition,
    materializeForPlan: materializeForPlan,
    materializeForReview: materializeForReview,
    advanceForPlan: advanceForPlan,
    revisionOf: function(threadId){ var s=threadStore(threadId); return s?(s.revision||1):null; },
    rejectedEvents: function(threadId){ var s=threadStore(threadId); return s?(s.rejected||[]):[]; },
    statusVocabulary: function(){ return TODO_STATUSES.slice(); }
  };
  window.ToDoController=window.PM56_TODOS;
})();
