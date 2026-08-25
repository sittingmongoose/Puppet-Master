
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
