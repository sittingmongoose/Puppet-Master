
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
