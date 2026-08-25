
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
