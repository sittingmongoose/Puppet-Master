
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
