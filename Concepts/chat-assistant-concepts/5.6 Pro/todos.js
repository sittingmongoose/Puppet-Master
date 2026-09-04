/* todos.js — feature module.  OWNER: Assistant redesign wave (2026-09-03), To-Do Runtime.
 * Canonical spec: Plans/ToDo_Runtime.md (TDR-001..TDR-009). Packet: 01_IMPLEMENTATION_SPEC.md
 * §6 "To-Dos", 04_GUI_IMPACTS.md §9 "To-Dos Activity UI".
 *
 * WHAT THIS FILE OWNS
 * --------------------
 * The thread-local hierarchical To-Do list: stable item identity, parent/child
 * structure, depends_on[]/parallel_group_id, the five-value status enum, a small
 * ToDoController that is the sole writer of status, individually receipted
 * transitions, derived parent rollup, and the Activity hover/detail projection
 * for the `todo` domain. Two demo threads ('query', 'subagents' — both real
 * thread ids already in data.js) each carry their OWN list on `RT.todos`, so
 * switching threads shows a different list rather than a merged one (TDR-001).
 *
 * WHAT THIS FILE IS HONEST ABOUT
 * -------------------------------
 * There is no `verifying` status and no verification field anywhere in this
 * file, on purpose (TDR-004) — a validation need is modelled as its own leaf
 * (tq-11 "Confirm the rollback rehearsal reproduces the pre-change state").
 * There is no Done section and no source grouping (TDR-007): completed items
 * stay inline, in display order, with a filled dot and strike-through, and
 * `goal_id` lineage on a leaf is never rendered as a group header.
 * Bulk completion is REFUSED, not simulated: `attemptBulkComplete` and
 * `attemptProviderProposal` always return ok:false and mutate nothing, and the
 * demo controls that call them are wired to real refusal records in the
 * Refused attempts log, not a toast alone (Hard Rule 2). `cmd.chat.todos.open_work`
 * is not a registered native command in this concept, so the "Open work"
 * control on an in-progress leaf is rendered disabled with that fact stated in
 * its title, rather than pretending to navigate anywhere (Hard Rule 3/5).
 *
 * TO-DOS ARE ACTIVITY-ONLY. Nothing here renders a transcript card (TDR-007).
 * TO-DOS DO NOT OWN GOALS. `goal_id` on an item is lineage only — this module
 * never writes D.goal or reads goals.js's fixture; the two are linked only by
 * the shared string 'goal-query-perf' appearing as inert lineage on some
 * 'query'-thread leaves, matching goals.js's GOAL_FIXTURE on the same thread.
 *
 * A KNOWN, REPORTED COMPOSITION GAP (see the two EXT.slot registrations below
 * for the exact mechanism, and the end-of-turn report for the exact requested
 * integrator patch): `extEach()` (app.js) CONCATENATES every registered
 * slot's non-empty output rather than letting the first one win. activity-bar.js
 * and activity-panel.js each already register a generic 'todo' domain card
 * built from the legacy flat `D.todos` fixture (data.js), unconditionally for
 * any thread where that fixture has entries ('query' only). This module's own
 * registrations correctly decline (return '') for every OTHER domain, but
 * cannot make activity-bar.js/activity-panel.js decline for 'todo' — that is
 * integrator-owned code this brief forbids editing. Until a one-line guard
 * lands in each of those two files, the 'query' thread's hover card and panel
 * body will show the legacy generic todo card ABOVE this module's real one.
 * This module's own output is correct in isolation; the residual duplication
 * is entirely the other two files' pre-existing, not-yet-updated behaviour.
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
    ui.collapsed = {}; ui.receiptsOpen = {}; ui.refusalsOpen = false;
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
  function childrenOf(list, parentId){
    return (list||[]).filter(function(x){ return x.parent_todo_id===parentId; })
      .sort(function(a,b){ return a.display_order-b.display_order; });
  }
  function topLevel(list){ return childrenOf(list, null); }
  function isLeaf(list, item){ return childrenOf(list, item.todo_id).length===0; }
  /* depends_on[] controls admission: runnable once every dependency is
     completed or skipped (TDR-003). This never touches `status` — a pending
     item with an unmet dependency stays pending; it is never blocked. */
  function runnable(list, item){
    if(!item.depends_on || !item.depends_on.length) return true;
    for(var i=0;i<item.depends_on.length;i++){
      var dep = findItem(list, item.depends_on[i]);
      if(dep && dep.status!=='completed' && dep.status!=='skipped') return false;
    }
    return true;
  }
  function unmetDeps(list, item){
    return (item.depends_on||[]).map(function(id){ return findItem(list,id); })
      .filter(function(dep){ return dep && dep.status!=='completed' && dep.status!=='skipped'; });
  }
  /* Depth-first, display-order traversal — the exact order the tree renders
     in and the order the hover feed reasons about "next runnable". */
  function docOrder(list){
    var out = [];
    function walk(parentId){
      childrenOf(list, parentId).forEach(function(item){ out.push(item); walk(item.todo_id); });
    }
    walk(null);
    return out;
  }
  function allLeaves(list){ return docOrder(list).filter(function(x){ return isLeaf(list,x); }); }
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
  function writeTransition(item, toStatus, causeKind, causeRef, note, at){
    var rec = TR(item.todo_id, item.status, toStatus, causeKind, causeRef, item.revision, at, note);
    item.transitions.push(rec);
    item.status = toStatus;
    item.revision = rec.committed_revision;
    return rec;
  }
  /* Parent status derives from children, never from direct assertion — a
     parent-complete action does not exist anywhere in this file (TDR-003). */
  function bubbleRollup(list, parentId, at){
    if(!parentId) return;
    var parent = findItem(list, parentId); if(!parent) return;
    var kids = childrenOf(list, parentId); if(!kids.length) return;
    var anyInProgress = kids.some(function(k){ return k.status==='in_progress'; });
    var anyBlocked = kids.some(function(k){ return k.status==='blocked'; });
    var anyCompleted = kids.some(function(k){ return k.status==='completed'; });
    var allDoneOrSkipped = kids.every(function(k){ return k.status==='completed'||k.status==='skipped'; });
    var allSkipped = kids.every(function(k){ return k.status==='skipped'; });
    var next = anyInProgress ? 'in_progress'
      : (allDoneOrSkipped && anyCompleted) ? 'completed'
      : allSkipped ? 'skipped'
      : anyBlocked ? 'blocked'
      : 'pending';
    if(next!==parent.status){
      writeTransition(parent, next, 'child_rollup', 'rollup:'+parent.todo_id,
        'Derived from child status; a parent is never completed by direct assertion.', at);
      bubbleRollup(list, parent.parent_todo_id, at);
    }
  }
  function refuse(threadId, code, reason, todoId, source){
    var store = threadStore(threadId);
    if(store) store.refusals.push({ at:nowIso(), code:code, reason:reason, todo_id:todoId||null, source:source||'user' });
    return { ok:false, code:code, reason:reason };
  }
  var STALE_MSG = function(item){ return 'This row changed since it was opened (now at revision '+item.revision+'). Reopen it and try again.'; };

  function admit(threadId, todoId, expectedRevision){
    var list = itemsOf(threadId); if(!list) return refuse(threadId,'todo_not_found','No To-Do list is loaded for this thread.',todoId);
    var item = findItem(list, todoId); if(!item) return refuse(threadId,'todo_not_found','That item no longer exists in this list.',todoId);
    if(item.revision!==expectedRevision) return refuse(threadId,'stale_todo_revision',STALE_MSG(item),todoId);
    if(!isLeaf(list,item)) return refuse(threadId,'invalid_request','A parent carries no work binding; only a leaf is admitted.',todoId);
    if(item.status!=='pending') return refuse(threadId,'invalid_request','Only a pending item can be admitted.',todoId);
    if(!runnable(list,item)) return refuse(threadId,'invalid_request','A dependency is not yet completed or skipped.',todoId);
    var at = nowIso();
    if(!item.started_at) item.started_at = at;
    if(!item.active_work_ids.length) item.active_work_ids = ['work-'+item.todo_id+'-'+(item.transitions.length+1)];
    writeTransition(item,'in_progress','work_admitted','assignment:'+item.todo_id, 'A tool batch was durably admitted for this item.', at);
    bubbleRollup(list, item.parent_todo_id, at);
    return { ok:true };
  }
  /* Completion is outcome-gated, not tool-success-gated (TDR-004/TDR-006): a
     tool call succeeding is evidence about the tool, not the outcome, so the
     accepted note always names the expected_outcome it satisfied. */
  function complete(threadId, todoId, expectedRevision){
    var list = itemsOf(threadId); if(!list) return refuse(threadId,'todo_not_found','No To-Do list is loaded for this thread.',todoId);
    var item = findItem(list, todoId); if(!item) return refuse(threadId,'todo_not_found','That item no longer exists in this list.',todoId);
    if(item.revision!==expectedRevision) return refuse(threadId,'stale_todo_revision',STALE_MSG(item),todoId);
    if(item.status!=='in_progress') return refuse(threadId,'outcome_evidence_required','Only an item that is in progress can be completed, and only with accepted outcome evidence.',todoId);
    var at = nowIso();
    item.completed_at = at;
    var note = item.expected_outcome ? ('Outcome evidence accepted: '+item.expected_outcome) : 'Outcome evidence accepted.';
    writeTransition(item,'completed','outcome_satisfied','evidence:'+item.todo_id+'-'+(item.transitions.length+1), note, at);
    bubbleRollup(list, item.parent_todo_id, at);
    return { ok:true };
  }
  function unblock(threadId, todoId, expectedRevision){
    var list = itemsOf(threadId); if(!list) return refuse(threadId,'todo_not_found','No To-Do list is loaded for this thread.',todoId);
    var item = findItem(list, todoId); if(!item) return refuse(threadId,'todo_not_found','That item no longer exists in this list.',todoId);
    if(item.revision!==expectedRevision) return refuse(threadId,'stale_todo_revision',STALE_MSG(item),todoId);
    if(item.status!=='blocked') return refuse(threadId,'invalid_request','Only a blocked item can be unblocked.',todoId);
    var at = nowIso();
    item.blocked_reason_ref = null;
    writeTransition(item,'pending','retry','unblock:'+item.todo_id, 'The blocking condition was resolved; the item returns to pending rather than resuming on its own.', at);
    bubbleRollup(list, item.parent_todo_id, at);
    return { ok:true };
  }
  function skip(threadId, todoId, expectedRevision){
    var list = itemsOf(threadId); if(!list) return refuse(threadId,'todo_not_found','No To-Do list is loaded for this thread.',todoId);
    var item = findItem(list, todoId); if(!item) return refuse(threadId,'todo_not_found','That item no longer exists in this list.',todoId);
    if(item.revision!==expectedRevision) return refuse(threadId,'stale_todo_revision',STALE_MSG(item),todoId);
    if(item.status==='completed' || item.status==='skipped') return refuse(threadId,'invalid_request','This item already reached a terminal status.',todoId);
    if(!isLeaf(list,item)) return refuse(threadId,'invalid_request','A parent status is derived from its children; skip a leaf instead.',todoId);
    var at = nowIso();
    writeTransition(item,'skipped','explicit_skip','skip:'+item.todo_id, 'Marked no longer required from Activity Detail.', at);
    bubbleRollup(list, item.parent_todo_id, at);
    return { ok:true };
  }
  function reopen(threadId, todoId, expectedRevision){
    var list = itemsOf(threadId); if(!list) return refuse(threadId,'todo_not_found','No To-Do list is loaded for this thread.',todoId);
    var item = findItem(list, todoId); if(!item) return refuse(threadId,'todo_not_found','That item no longer exists in this list.',todoId);
    if(item.revision!==expectedRevision) return refuse(threadId,'stale_todo_revision',STALE_MSG(item),todoId);
    if(item.status!=='completed' && item.status!=='skipped') return refuse(threadId,'invalid_request','Only a completed or skipped item can be reopened.',todoId);
    var at = nowIso();
    item.completed_at = null;
    writeTransition(item,'pending','reopen','reopen:'+item.todo_id, 'Reopened explicitly; the earlier completion or skip stays in the receipt history below.', at);
    bubbleRollup(list, item.parent_todo_id, at);
    return { ok:true };
  }
  /* THE REQUIRED NEGATIVE PATH (TDR-005/TDR-006). Always refuses and applies
     nothing — there is no code path anywhere in this controller that marks
     more than one item complete from a single caller gesture. */
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
    var tid = currentThreadId(ctx);
    var feed = hoverFeed(tid);
    if(!feed) return '';
    var anyCurrent = feed.rows.some(function(r){ return r.current; });
    var tone = feed.blockedCount ? 'blocked' : anyCurrent ? 'working' : (feed.total && feed.done===feed.total) ? 'done' : 'idle';
    var rowsHtml = feed.rows.length ? feed.rows.map(function(r){
      var it = r.item;
      return '<li class="todo-hover-row'+(r.current?' is-current':'')+'" data-k="todo-hr:'+esc(it.todo_id)+'">'+
        '<span class="todo-hover-glyph todo-glyph-'+esc(it.status)+'">'+glyph(it.status)+'</span>'+
        '<span class="todo-hover-title">'+esc(it.title)+'</span>'+
      '</li>';
    }).join('') : '<li class="todo-hover-empty" data-k="todo-hr:empty">Nothing runnable is waiting right now.</li>';
    return '<div class="hover-card todo-hover" id="activity-domain-preview" data-overlay="hover" data-k="ab-card" '+
      'data-domain="todo" data-tone="'+esc(tone)+'" role="dialog" aria-modal="false" aria-label="To-Dos activity preview">'+
      '<div class="todo-hover-head" data-k="todo-hover-head">'+
        '<span class="todo-hover-head-icon">'+ctx.icon('todo',13)+'</span>'+
        '<strong>To-Dos</strong>'+
        '<span class="todo-hover-head-meta">'+feed.done+' of '+feed.total+'</span>'+
      '</div>'+
      '<ul class="todo-hover-list" data-k="todo-hover-list">'+rowsHtml+'</ul>'+
      (feed.blockedCount ? '<p class="todo-hover-blocked" data-k="todo-hover-blocked">'+ctx.icon('lock',11)+' '+feed.blockedCount+' blocked</p>' : '')+
      '<button class="todo-hover-foot" type="button" data-k="todo-hover-foot" data-action="open-activity" data-domain="todo" aria-label="Open To-Dos Activity Detail">'+
        '<span>Open Activity</span>'+ctx.icon('chevron',11)+
      '</button>'+
    '</div>';
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

  /* Parents get no work-affecting buttons at all — only the caret. Leaves get
     exactly the controls valid from their current status (TDR-006's table),
     each of which calls a real ToDoController entry point. */
  function rowActions(ctx, list, item){
    if(!isLeaf(list,item)) return '';
    var btns = '';
    if(item.status==='pending'){
      var can = runnable(list,item);
      btns += '<button class="text-button" data-action="todo-admit" data-id="'+esc(item.todo_id)+'"'+
        (can?'':' disabled title="Waiting on: '+esc(unmetDeps(list,item).map(function(d){ return d.title; }).join(', '))+'"')+'>Start</button>';
      btns += '<button class="text-button" data-action="todo-skip" data-id="'+esc(item.todo_id)+'">Skip</button>';
    } else if(item.status==='in_progress'){
      btns += '<button class="text-button" data-action="todo-complete" data-id="'+esc(item.todo_id)+'">Complete</button>';
      btns += '<button class="text-button" data-action="todo-skip" data-id="'+esc(item.todo_id)+'">Skip</button>';
    } else if(item.status==='blocked'){
      btns += '<button class="text-button" data-action="todo-unblock" data-id="'+esc(item.todo_id)+'">Unblock</button>';
      btns += '<button class="text-button" data-action="todo-skip" data-id="'+esc(item.todo_id)+'">Skip</button>';
    } else if(item.status==='completed' || item.status==='skipped'){
      btns += '<button class="text-button" data-action="todo-reopen" data-id="'+esc(item.todo_id)+'">Reopen</button>';
    }
    if(item.active_work_ids && item.active_work_ids.length){
      btns += '<button class="icon-button" type="button" disabled title="cmd.chat.todos.open_work is not a registered command in this concept, so this cannot navigate yet.">'+ctx.icon('monitor-play',12)+'</button>';
    }
    return btns;
  }

  function renderNode(ctx, list, item, depth){
    var kids = childrenOf(list, item.todo_id);
    var hasKids = kids.length>0;
    var collapsed = !!ui.collapsed[item.todo_id];
    var receiptsOpen = !!ui.receiptsOpen[item.todo_id];
    var chips = (item.depends_on&&item.depends_on.length?depChip(list,item):'') + (item.parallel_group_id?parallelChip(list,item):'');
    /* Only a leaf ever carries its own blocked_reason_ref (a parent's blocked
       status is always a derived rollup, per bubbleRollup above) — so a
       blocked parent shows no reason line of its own rather than a
       fabricated-looking placeholder; its rollupNote already says which
       child is blocked. */
    var blockedLine = (item.status==='blocked' && item.blocked_reason_ref) ? '<p class="todo-blocked-line">'+ctx.icon('lock',11)+' '+esc(item.blocked_reason_ref)+'</p>' : '';
    var outcomeLine = (!hasKids && item.expected_outcome) ? '<p class="todo-outcome">'+esc(item.expected_outcome)+'</p>' : '';
    var rollupNote = hasKids ? '<p class="todo-parent-note">'+esc(childSummary(list,item))+'</p>' : '';
    var caret = hasKids
      ? '<button class="todo-caret'+(collapsed?' is-collapsed':'')+'" type="button" data-action="todo-toggle-parent" data-id="'+esc(item.todo_id)+'" aria-expanded="'+(collapsed?'false':'true')+'" title="'+(collapsed?'Expand':'Collapse')+'">'+ctx.icon('chevron',11)+'</button>'
      : '<span class="todo-caret-spacer" aria-hidden="true"></span>';
    var titleCls = 'todo-title'+(item.status==='completed'?' is-struck':'');
    return '<div class="todo-node" data-status="'+esc(item.status)+'" data-k="todo-node:'+esc(item.todo_id)+'" style="--todo-depth:'+depth+'">'+
      '<div class="todo-row">'+
        caret+
        '<span class="todo-glyph todo-glyph-'+esc(item.status)+'" title="'+esc(STATUS_LABEL[item.status]||item.status)+'">'+glyph(item.status)+'</span>'+
        '<div class="todo-copy">'+
          '<span class="'+titleCls+'">'+esc(item.title)+'</span>'+
          rollupNote + outcomeLine +
          (chips?'<div class="todo-chips">'+chips+'</div>':'')+
          blockedLine+
        '</div>'+
        '<div class="todo-row-actions">'+
          rowActions(ctx,list,item)+
          '<button class="text-button todo-receipts-toggle" type="button" data-action="todo-toggle-receipts" data-id="'+esc(item.todo_id)+'" aria-expanded="'+(receiptsOpen?'true':'false')+'">Receipts ('+item.transitions.length+')</button>'+
        '</div>'+
      '</div>'+
      renderReceipts(item)+
      (hasKids && !collapsed ? '<div class="todo-children" data-k="todo-children:'+esc(item.todo_id)+'">'+kids.map(function(k){ return renderNode(ctx,list,k,depth+1); }).join('')+'</div>' : '')+
    '</div>';
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

  /* Activity Detail body (04_GUI_IMPACTS.md §9.2): one hierarchical list in
     display_order within each parent. No Done section, no source headers, no
     verification column — completed items stay exactly where they are. */
  function renderPanel(ctx){
    if(panelDomain(ctx)!=='todo') return '';
    var tid = currentThreadId(ctx);
    var list = itemsOf(tid);
    if(!list) return '<div class="todo-panel todo-panel-empty" data-k="todo-panel"><p>No To-Do list is loaded for this thread yet.</p></div>';
    var s = summary(tid);
    var extra = [];
    if(s.active) extra.push(s.active+' active');
    if(s.blocked) extra.push(s.blocked+' blocked');
    if(s.skipped) extra.push(s.skipped+' skipped');
    var tree = topLevel(list).map(function(p){ return renderNode(ctx,list,p,0); }).join('');
    return '<div class="todo-panel" data-k="todo-panel">'+
      '<div class="todo-panel-summary" data-k="todo-summary"><strong>'+s.completed+' of '+s.total+' leaves complete</strong>'+
        (extra.length?'<span class="todo-summary-extra">'+esc(extra.join(' · '))+'</span>':'')+
      '</div>'+
      renderTools(ctx, list)+
      '<div class="todo-refusals-wrap" data-k="todo-refusals-wrap">'+renderRefusals(tid)+'</div>'+
      '<div class="todo-tree" data-k="todo-tree">'+tree+'</div>'+
    '</div>';
  }

  /* =====================================================================
     7. ACTIONS — namespaced `todo-*` (module contract §5). Every mutating
        action reads the item's CURRENT revision itself and passes that as
        expected_revision, so an ordinary click always succeeds; only the
        dedicated stale-write demo control deliberately passes an old one.
        Every one of these changes RT.todos (durable domain state) and calls
        ctx.renderApp() before toasting — the toast never stands alone.
     ===================================================================== */
  var ACTIONS = {
    'todo-toggle-parent': function(ctx,btn){
      var id = btn && btn.dataset && btn.dataset.id; if(!id) return;
      if(ui.collapsed[id]) delete ui.collapsed[id]; else ui.collapsed[id]=true;
      ctx.renderApp();
    },
    'todo-toggle-receipts': function(ctx,btn){
      var id = btn && btn.dataset && btn.dataset.id; if(!id) return;
      if(ui.receiptsOpen[id]) delete ui.receiptsOpen[id]; else ui.receiptsOpen[id]=true;
      ctx.renderApp();
    },
    'todo-toggle-refusals': function(ctx){ ui.refusalsOpen = !ui.refusalsOpen; ctx.renderApp(); },
    'todo-admit': function(ctx,btn){
      var tid=currentThreadId(ctx), id=btn.dataset.id, list=itemsOf(tid), item=list&&findItem(list,id);
      if(!item) return;
      var title=item.title, r=admit(tid,id,item.revision);
      ctx.renderApp();
      ctx.toast(r.ok?'Work admitted':'Not admitted', r.ok?('"'+title+'" moved to in progress.'):r.reason);
    },
    'todo-complete': function(ctx,btn){
      var tid=currentThreadId(ctx), id=btn.dataset.id, list=itemsOf(tid), item=list&&findItem(list,id);
      if(!item) return;
      var title=item.title, r=complete(tid,id,item.revision);
      ctx.renderApp();
      ctx.toast(r.ok?'Outcome accepted':'Not completed', r.ok?('"'+title+'" is complete. Its receipts show the accepted evidence.'):r.reason);
    },
    'todo-unblock': function(ctx,btn){
      var tid=currentThreadId(ctx), id=btn.dataset.id, list=itemsOf(tid), item=list&&findItem(list,id);
      if(!item) return;
      var title=item.title, r=unblock(tid,id,item.revision);
      ctx.renderApp();
      ctx.toast(r.ok?'Unblocked':'Not unblocked', r.ok?('"'+title+'" returned to pending.'):r.reason);
    },
    'todo-skip': function(ctx,btn){
      var tid=currentThreadId(ctx), id=btn.dataset.id, list=itemsOf(tid), item=list&&findItem(list,id);
      if(!item) return;
      var title=item.title, r=skip(tid,id,item.revision);
      ctx.renderApp();
      ctx.toast(r.ok?'Marked skipped':'Not skipped', r.ok?('"'+title+'" is skipped and stays inline.'):r.reason);
    },
    'todo-reopen': function(ctx,btn){
      var tid=currentThreadId(ctx), id=btn.dataset.id, list=itemsOf(tid), item=list&&findItem(list,id);
      if(!item) return;
      var title=item.title, r=reopen(tid,id,item.revision);
      ctx.renderApp();
      ctx.toast(r.ok?'Reopened':'Not reopened', r.ok?('"'+title+'" is pending again; its prior receipts are unchanged.'):r.reason);
    },
    'todo-attempt-bulk-complete': function(ctx){
      var r = attemptBulkComplete(currentThreadId(ctx),'user_bulk_gesture');
      ui.refusalsOpen = true;
      ctx.renderApp();
      ctx.toast('Bulk completion refused', r.reason);
    },
    'todo-attempt-provider-proposal': function(ctx){
      var r = attemptProviderProposal(currentThreadId(ctx));
      ui.refusalsOpen = true;
      ctx.renderApp();
      ctx.toast('Proposal reconciled, not applied', r.reason);
    },
    'todo-attempt-stale-write': function(ctx,btn){
      var r = attemptStaleWrite(currentThreadId(ctx), btn.dataset.id);
      ui.refusalsOpen = true;
      ctx.renderApp();
      ctx.toast('Rejected: stale revision', r.reason);
    }
  };
  Object.keys(ACTIONS).forEach(function(name){
    EXT.action(name, function(ctx,btn,ev){ ACTIONS[name](ctx,btn,ev); return true; });
  });

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
    return prevReset ? prevReset(ctx,btn,ev) : false;
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
  function validateGraph(threadId, candidate){
    var res={ schema:'pm.todo.graph_validation_result.v1',
              thread_id:threadId, candidate_revision:(candidate&&candidate.revision)||null,
              valid:true, self_parent_ids:[], parent_cycles:[], dependency_cycles:[],
              unknown_refs:[], cross_thread_refs:[], duplicate_ids:[], invalid_statuses:[] };
    var items=(candidate&&candidate.items)||[], byId={}, i, j;
    for(i=0;i<items.length;i++){
      var it=items[i];
      if(byId[it.todo_id]) res.duplicate_ids.push(it.todo_id);
      byId[it.todo_id]=it;
    }
    function cycle(startId, next){
      var seen={}, cur=startId, path=[];
      while(cur){
        if(seen[cur]) return path.concat(cur);
        seen[cur]=1; path.push(cur);
        cur=next(byId[cur]);
        if(cur && !byId[cur]) return null;
      }
      return null;
    }
    for(i=0;i<items.length;i++){
      var t=items[i];
      if(t.thread_id && t.thread_id!==threadId) res.cross_thread_refs.push(t.todo_id);
      /* TDG-014 / TODO-010 / PROVIDER-007. The status vocabulary is closed
         HERE too, not only on the transition path. Whole-list replacement is
         exactly how a provider snapshot arrives, so leaving it unvalidated let
         a model write any word it liked -- `verifying` included -- straight
         into canonical items while `applyTransition` refused the same word. */
      if(t.status!=null && TODO_STATUSES.indexOf(t.status)<0)
        res.invalid_statuses.push({ todo_id:t.todo_id, status:t.status });
      if(t.parent_todo_id===t.todo_id) res.self_parent_ids.push(t.todo_id);
      if(t.parent_todo_id && !byId[t.parent_todo_id]) res.unknown_refs.push(t.parent_todo_id);
      for(j=0;j<(t.depends_on||[]).length;j++){
        var dep=t.depends_on[j];
        if(dep===t.todo_id) res.dependency_cycles.push([t.todo_id]);
        else if(!byId[dep]) res.unknown_refs.push(dep);
      }
    }
    for(i=0;i<items.length;i++){
      var pc=cycle(items[i].todo_id, function(x){ return x?x.parent_todo_id:null; });
      if(pc && pc.length>1){ res.parent_cycles.push(pc); }
    }
    /* Dependency cycles of any length, including ones that cross sibling
       branches: a depth-first walk over depends_on edges only. */
    var colour={};
    function dfs(id, stack){
      if(colour[id]===2) return null;
      if(colour[id]===1) return stack.slice(stack.indexOf(id)).concat(id);
      colour[id]=1; stack.push(id);
      var node=byId[id], deps=(node&&node.depends_on)||[];
      for(var q=0;q<deps.length;q++){
        if(!byId[deps[q]]) continue;
        var found=dfs(deps[q], stack);
        if(found) return found;
      }
      stack.pop(); colour[id]=2; return null;
    }
    for(i=0;i<items.length;i++){
      var dc=dfs(items[i].todo_id,[]);
      if(dc) res.dependency_cycles.push(dc);
    }
    function uniq(a){ return a.filter(function(x,k){ return a.indexOf(x)===k; }); }
    res.unknown_refs=uniq(res.unknown_refs);
    res.cross_thread_refs=uniq(res.cross_thread_refs);
    res.duplicate_ids=uniq(res.duplicate_ids);
    res.valid = !(res.self_parent_ids.length || res.parent_cycles.length ||
                  res.dependency_cycles.length || res.unknown_refs.length ||
                  res.cross_thread_refs.length || res.duplicate_ids.length ||
                  res.invalid_statuses.length);
    if(!res.valid) res.error = res.invalid_statuses.length &&
      !(res.self_parent_ids.length || res.parent_cycles.length || res.dependency_cycles.length ||
        res.unknown_refs.length || res.cross_thread_refs.length || res.duplicate_ids.length)
      ? 'invalid_status' : 'invalid_graph';
    return res;
  }

  /* TDG-007..009. Replacement is one atomic owner operation. Before the new
     list commits, EVERY active work reference is classified; nothing is
     orphaned, and an in-progress item's identity is never deleted while its
     work continues. */
  function replaceThreadList(threadId, candidate, opts){
    opts=opts||{};
    var store=threadStore(threadId);
    var check=validateGraph(threadId, candidate);
    if(!check.valid) return { ok:false, error:'invalid_graph', validation:check };
    var oldItems=(store&&store.items)||[], newItems=candidate.items||[];
    var newById={}, i;
    for(i=0;i<newItems.length;i++) newById[newItems[i].todo_id]=newItems[i];
    var disp={ schema:'pm.todo.list_replacement_disposition.v1',
               thread_id:threadId, old_revision:(store&&store.revision)||1,
               new_revision:((store&&store.revision)||1)+1,
               retained:[], rebound:[], canceled:[], refused:[], active_work_refs:[] };
    for(i=0;i<oldItems.length;i++){
      var o=oldItems[i], active=(o.active_work_ids||[]).length>0 ||
                                o.status==='in_progress';
      if(active) disp.active_work_refs=disp.active_work_refs.concat(o.active_work_ids||[]);
      if(newById[o.todo_id]){
        /* Same identity survives: the work binding is preserved exactly. */
        newById[o.todo_id].active_work_ids=(o.active_work_ids||[]).slice();
        newById[o.todo_id].revision=(o.revision||1)+1;
        disp.retained.push(o.todo_id);
      } else if(active){
        var target=opts.rebind && opts.rebind[o.todo_id];
        if(target && newById[target]){
          newById[target].active_work_ids=(newById[target].active_work_ids||[]).concat(o.active_work_ids||[]);
          disp.rebound.push({ from:o.todo_id, to:target, work:(o.active_work_ids||[]).slice() });
        } else if(opts.cancelActive){
          disp.canceled.push({ todo_id:o.todo_id, work:(o.active_work_ids||[]).slice(),
                               receipt:'cancel:'+o.todo_id });
        } else {
          disp.refused.push({ todo_id:o.todo_id, reason:'active work has no rebind target and cancelActive was not requested' });
        }
      }
    }
    if(disp.refused.length) return { ok:false, error:'active_work_unresolved', disposition:disp };
    if(!store){ RT.todos.byThread[threadId]={ items:[], refusals:[] }; store=threadStore(threadId); }
    store.items=newItems; store.revision=disp.new_revision;
    return { ok:true, disposition:disp, validation:check };
  }

  /* TDG-010. A late event needs list revision, item revision, work binding,
     Plan version and run epoch to still be current. A stale one is RETAINED as
     rejected evidence and never applied; timestamp order is not a gate. */
  /* TDG-014. The CLOSED status vocabulary. It is enforced here rather than
     documented, because an unvalidated `to_status` let a caller write any word
     it liked -- including `verifying`, the one status the correction retires by
     name. A To-Do has five states; validation is an ordinary To-Do, never a
     status. */
  var TODO_STATUSES = ['pending','in_progress','completed','blocked','skipped'];

  function applyTransition(threadId, ev){
    var store=threadStore(threadId);
    if(!store) return { ok:false, error:'unknown_thread' };
    var item=findItem(store.items, ev.todo_id);
    if(!item) return { ok:false, error:'unknown_todo' };
    if(TODO_STATUSES.indexOf(ev.to_status)<0)
      return { ok:false, error:'invalid_status', allowed:TODO_STATUSES.slice(),
               detail:'`'+String(ev.to_status)+'` is not a To-Do status. There is no verification status; validation is an ordinary To-Do.' };
    var why=null;
    if(ev.expected_list_revision!=null && ev.expected_list_revision!==(store.revision||1)) why='stale_list_revision';
    else if(ev.expected_revision!=null && ev.expected_revision!==item.revision)            why='stale_item_revision';
    else if(ev.work_binding && (item.active_work_ids||[]).indexOf(ev.work_binding)<0)      why='stale_work_binding';
    else if(ev.plan_version!=null && item.plan_version!=null && ev.plan_version!==item.plan_version) why='stale_plan_version';
    else if(ev.run_epoch!=null && store.run_epoch!=null && ev.run_epoch!==store.run_epoch)  why='stale_run_epoch';
    if(why){
      store.rejected=(store.rejected||[]).concat([{ event:ev, reason:why, at:new Date().toISOString() }]);
      return { ok:false, error:why, retained_as_evidence:true };
    }
    item.transitions=(item.transitions||[]).concat([TR(item.todo_id,item.status,ev.to_status,
      ev.cause_kind||'work_admitted', ev.cause_ref||('event:'+item.todo_id), item.revision,
      ev.at||new Date().toISOString(), ev.note||'')]);
    item.status=ev.to_status; item.revision=item.revision+1;
    if(ev.to_status==='in_progress' && !item.started_at) item.started_at=ev.at||new Date().toISOString();
    if(ev.to_status==='completed') item.completed_at=ev.at||new Date().toISOString();
    /* PPROG-007: `blocked` must reference its OWNING CONDITION. Only the
       seeded fixture carried `blocked_reason_ref` before this, so any item
       blocked through the ordinary transition path produced a projection cell
       with `reason:null` -- a blocked step that could not say what blocked it.
       Leaving `blocked` also clears the reference, so a resolved blocker
       cannot linger as stale evidence on a running item. */
    if(ev.to_status==='blocked')
      item.blocked_reason_ref = ev.blocked_reason_ref || ev.cause_ref || ('blocker:'+item.todo_id);
    else if(item.blocked_reason_ref)
      item.blocked_reason_ref = null;
    return { ok:true, item:item };
  }

  /* Build materialises the thread list from the Plan's steps when the thread
     has none yet -- the same thing admitBuild's `todosCreated` receipt claims.
     Without this the projector would have nothing to derive from and the
     Building… gutter would be a local counter pretending to be a projection. */
  function materializeForPlan(plan){
    var threadId=plan.thread_id, store=threadStore(threadId);
    var mk=itemFactory(threadId), items=[], i;
    var existing=(store&&store.items)||[];
    for(i=0;i<existing.length;i++){ if(existing[i].plan_id===plan.plan_id) return { ok:true, created:0, reused:true }; }
    for(i=0;i<(plan.steps||[]).length;i++){
      var s=plan.steps[i];
      items.push(mk({ todo_id:'tp-'+plan.plan_id+'-'+s.id, display_order:i+1,
        parent_todo_id:s.parent?('tp-'+plan.plan_id+'-'+s.parent):null,
        depends_on:(s.deps||[]).map(function(d){ return 'tp-'+plan.plan_id+'-'+d; }),
        plan_id:plan.plan_id, plan_version:plan.version, plan_step_ids:[s.id],
        title:s.title, expected_outcome:s.outcome||null, status:'pending', revision:1, transitions:[] }));
    }
    var next=existing.concat(items);
    var res=replaceThreadList(threadId, { items:next, revision:((store&&store.revision)||1)+1 }, {});
    return res.ok ? { ok:true, created:items.length } : res;
  }

  /* One demo tick: admit the next runnable pending leaf, or complete the
     oldest in-progress one. Ordinary transitions through applyTransition, so
     the projector sees exactly what a real run would have written. */
  function advanceForPlan(planId, threadId){
    var store=threadStore(threadId); if(!store) return null;
    var mine=store.items.filter(function(t){ return t.plan_id===planId; });
    var i, t;
    for(i=0;i<mine.length;i++){
      t=mine[i];
      if(t.status==='in_progress' && isLeaf(store.items,t))
        return applyTransition(threadId,{ todo_id:t.todo_id, to_status:'completed',
          expected_revision:t.revision, cause_kind:'outcome_satisfied',
          cause_ref:'evidence:'+t.todo_id, note:'Expected outcome accepted.' });
    }
    for(i=0;i<mine.length;i++){
      t=mine[i];
      if(t.status==='pending' && isLeaf(store.items,t) && runnable(store.items,t))
        return applyTransition(threadId,{ todo_id:t.todo_id, to_status:'in_progress',
          expected_revision:t.revision, cause_kind:'work_admitted',
          cause_ref:'assignment:'+t.todo_id, note:'Admitted by the Plan run.' });
    }
    return null;
  }

  window.PM56_TODOS = {
    /* Body only -- activity-bar.js wraps it in the shared hover-card shell. */
    hoverBody: renderCompact,
    /* Flat item list (TodoItemV2[]) for one thread, or the current thread
       when no id is given. Returns null when that thread has no list. */
    get: function(threadId){ return itemsOf(threadId || currentThreadId(activeCtx())); },
    summary: function(threadId){ return summary(threadId || currentThreadId(activeCtx())); },
    restore: restoreFixture,
    fixture: function(){ return JSON.parse(TODO0); },
    /* Additive Correction v4 (TDG-001..012). Graph validation, atomic list
       replacement with retain/rebind/cancel/refuse dispositions, and the
       currentness-gated transition path. */
    validateGraph: validateGraph,
    replaceThreadList: replaceThreadList,
    applyTransition: applyTransition,
    materializeForPlan: materializeForPlan,
    advanceForPlan: advanceForPlan,
    revisionOf: function(threadId){ var s=threadStore(threadId); return s?(s.revision||1):null; },
    rejectedEvents: function(threadId){ var s=threadStore(threadId); return s?(s.rejected||[]):[]; },
    statusVocabulary: function(){ return TODO_STATUSES.slice(); }
  };
})();
