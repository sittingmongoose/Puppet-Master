(() => {
  const now = Date.now();
  const ago = (m) => new Date(now - m * 60000).toISOString();
  const text = (id, role, body, extra = {}) => ({ id, role, type: 'text', body, time: extra.time || ago(extra.ago || 10), ...extra });
  const event = (id, type, extra = {}) => ({ id, role: 'system', type, time: extra.time || ago(extra.ago || 9), ...extra });

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

  /* Concrete rows the chrome shows for the phases the video makes specific:
     a streamed thought paragraph, read paths, benchmark tags, edit diff stats.
     Row shape: {text, add?, del?, tag?, stream?}. Anything not overridden here
     falls back to the step's evidence lines. */
  const phaseRows = {
    thought:{ think:[{stream:true, text:'The bottleneck here is a tenant-scoped read path: 95% reads with an N+1 fan-out across 3 queries. A composite index led by tenant_id should let the planner skip the scan — I should read the schema and the migration history before touching anything, and check what the benchmarks actually show.'}] },
    files:{ files:[{text:'Read src/analytics/queries.rs'},{text:'Read src/analytics/schema.rs'},{text:'Read migrations/0042_events.sql'}] },
    bash:{ bash:[{text:'Ran EXPLAIN ANALYZE analytics_query',tag:'p95 482 ms'},{text:'Generated 128,400 fixture rows'},{text:'Ran cargo bench analytics_query'}] },
    edit:{ edit:[{text:'Edited migrations/0043_composite_index.sql',add:84,del:17},{text:'Edited src/analytics/queries.rs',add:22,del:6},{text:'Created src/analytics/index_hints.rs',add:41}] },
    agents:{ agents:[{text:'Query Analyzer · comparing index selectivity',tag:'running'},{text:'Schema Reviewer · checking migration history',tag:'running'}] },
    validate:{ validate:[{text:'42 tests passed',tag:'green'},{text:'LSP diagnostics clean'},{text:'p95 482 ms → 71 ms',tag:'−86%'}] }
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

  const artifacts = [
    { id:'plan-query', kind:'plan', title:'Query Performance Improvement Plan', summary:'Add a tenant-first composite index, remove N+1 query fan-out, validate write amplification, and retain a materialized-view fallback.', status:'ready', version:3, updated:'2m ago' },
    { id:'mermaid-runtime', kind:'mermaid', title:'Assistant Runtime Architecture', summary:'A Mermaid view of chat, activity projection, editor artifacts, subagents, and runtime events.', status:'ready', version:2, updated:'4m ago' },
    { id:'dashboard-query', kind:'dashboard', title:'Query Benchmark Dashboard', summary:'Interactive p50, p95, throughput, cache-hit, and write-amplification comparison.', status:'ready', version:4, updated:'1m ago' },
    { id:'data-explorer', kind:'data', title:'Trace Data Explorer', summary:'Filterable query traces with duration, tenant, route, cache, and plan data.', status:'ready', version:1, updated:'6m ago' },
    { id:'architecture-map', kind:'architecture', title:'Puppet Master Host Map', summary:'Interactive map of server, execution hosts, clients, providers, and editor routes.', status:'ready', version:2, updated:'8m ago' },
    { id:'quiz-indexes', kind:'quiz', title:'Index Strategy Quiz', summary:'A short interactive quiz covering leading columns, selectivity, and write cost.', status:'ready', version:1, updated:'9m ago' },
    { id:'periodic-capabilities', kind:'periodic', title:'Agent Capability Matrix', summary:'Periodic-table-inspired explorer for models, tools, specialties, cost, and qualification.', status:'ready', version:3, updated:'12m ago' },
    { id:'flow-plan', kind:'flowchart', title:'Plan Approval Flow', summary:'Interactive flowchart for approve, revise, cancel, later build, and branch behavior.', status:'ready', version:2, updated:'13m ago' },
    { id:'chart-cost', kind:'chart', title:'Provider Cost and Latency', summary:'Interactive cost, plan estimate, cache, and latency chart.', status:'ready', version:1, updated:'15m ago' },
    { id:'generated-image', kind:'image', title:'Generated Operations Console', summary:'Generated interface image shown compactly in chat and at full size in the editor.', status:'ready', version:1, updated:'18m ago' },
    { id:'test-evidence', kind:'evidence', title:'Browser Test Evidence', summary:'Screenshots, assertions, timings, console logs, and network evidence.', status:'ready', version:5, updated:'20m ago' },
    { id:'report-query', kind:'document', title:'Query Optimization Report', summary:'A durable report with findings, changes, benchmark evidence, risks, and rollback.', status:'stale', version:2, updated:'24m ago' },
    { id:'broken-viz', kind:'dashboard', title:'Usage Projection Dashboard', summary:'A recoverable renderer failure fixture with source fallback and retry.', status:'error', version:1, updated:'28m ago' }
  ];

  const subagents = [
    { id:'agent-query', name:'Query Analyzer', model:'Sonnet 4.6', status:'working', elapsed:'2m 06s', current:'Benchmarking tenant-scoped query alternatives', parent:'Query Performance', progress:68, blocker:'', messages:[
      text('aq1','assistant','I found three queries with full-table scans and two N+1 call sites. I am comparing the index order against the actual tenant-first predicates.'),
      event('aq2','agent-work',{title:'Read src/analytics/queries.rs',detail:'Found three full table scans and two N+1 patterns.'}),
      text('aq3','assistant','The composite index is the safer first step. Materialized views remain a useful fallback if the write path can tolerate refresh lag.')
    ]},
    { id:'agent-schema', name:'Schema Reviewer', model:'Qwen 3.8', status:'blocked', elapsed:'1m 41s', current:'Waiting for explicit schema-change approval', parent:'Query Performance', progress:42, blocker:'Production schema modification requires approval.', messages:[
      event('as1','agent-work',{title:'Read src/analytics/schema.rs',detail:'Identified three denormalization candidates.'}),
      event('as2','blocked',{title:'Policy denial',detail:'Production schema modification requires an explicit user override.'})
    ]},
    { id:'agent-motion', name:'Motion Reviewer', model:'Opus 5', status:'working', elapsed:'48s', current:'Reviewing popup spring timing and transform origins', parent:'Assistant Concept Review', progress:51, blocker:'', messages:[text('am1','assistant','The sidecar should inherit the root menu direction and remain mounted while the pointer crosses the inter-menu gap.')]},
    { id:'agent-test', name:'Browser Auditor', model:'Kimi K3', status:'waiting', elapsed:'36s', current:'Waiting for the current render pass', parent:'Assistant Concept Review', progress:28, blocker:'Parent render still changing.', messages:[event('at1','waiting',{title:'Waiting for parent',detail:'The visual baseline must stabilize before screenshot comparison.'})]},
    { id:'agent-plan', name:'Plan Critic', model:'GLM 5.2', status:'complete', elapsed:'3m 12s', current:'Completed with three revision notes', parent:'Planning Wizard', progress:100, blocker:'', messages:[text('ap1','assistant','I completed the plan critique. The plan needs an explicit rollback gate, a write-amplification threshold, and a benchmark evidence owner.')]}
  ];

  const todos = [
    { id:'t1', label:'Measure the current tenant-scoped query path', status:'done', source:'Goal 1' },
    { id:'t2', label:'Compare composite index column order', status:'doing', source:'Goal 1' },
    { id:'t3', label:'Inspect write amplification', status:'next', source:'Goal 1' },
    { id:'t4', label:'Remove N+1 query fan-out', status:'next', source:'Goal 2' },
    { id:'t5', label:'Run browser and integration tests', status:'blocked', source:'Goal 3', blocker:'Awaiting migration choice' },
    { id:'t6', label:'Render benchmark artifact', status:'next', source:'Goal 3' },
    { id:'t7', label:'Review rollback procedure', status:'skipped', source:'Goal 4' },
    { id:'t8', label:'Open a pull request', status:'next', source:'Goal 4' }
  ];

  const changes = [
    { id:'c1', path:'migrations/0043_tenant_created_index.sql', line:1, summary:'Add tenant_id + created_at composite index', add:18, del:0, status:'modified' },
    { id:'c2', path:'src/analytics/queries.rs', line:128, summary:'Replace per-row event lookup with batched query', add:51, del:14, status:'modified' },
    { id:'c3', path:'src/analytics/bench.rs', line:44, summary:'Add tenant-scale benchmark fixture', add:31, del:3, status:'modified' }
  ];

  const plainConversation = [
    text('plain-u1','user','I want to think through the trade-offs before we change anything. The current page is usable, but it feels dense and I am worried that reducing information will make expert users slower.',{ago:48}),
    text('plain-a1','assistant','That tension is real. The safest direction is not to remove information, but to separate immediate decisions from inspectable detail. Keep the current task, state, and next action visible; let evidence, history, and secondary metadata expand in place or open beside the conversation.',{ago:47}),
    text('plain-u2','user','How would you decide what stays visible without making the interface feel arbitrary?',{ago:45}),
    text('plain-a2','assistant','I would use frequency, urgency, and reversibility. Frequent information belongs in the primary reading path. Urgent blockers should interrupt clearly. Reversible or rarely needed detail can remain one click away, provided the interface signals that it exists and preserves the user’s place when opened.',{ago:44}),
    text('plain-u3','user','I also dislike interfaces that hide everything behind icons. They look clean in screenshots but become tiring when you actually use them.',{ago:42}),
    text('plain-a3','assistant','Agreed. Icons should support recognition, not replace essential language. In a narrow assistant, text-only model, mode, persona, and permission labels are actually efficient because they communicate state without the extra chrome of bordered controls. Icons are most useful for stable actions such as Attach, Search, History, and the capability wand.',{ago:41}),
    text('plain-u4','user','That sounds closer. Show me how a long answer would read when there are no tools or artifacts competing for space.',{ago:39}),
    text('plain-a4','assistant','A prose-first answer should use nearly the full transcript width, modest paragraph spacing, and clear section hierarchy. It should avoid a narrow assistant bubble floating on the left. The message controls can appear on hover or focus, while a persistent More Details action remains available for provenance, cost, timing, model, and context information. Long responses may collapse after a meaningful preview, but expanding them must not move the scroll position unexpectedly.',{ago:38, long:true})
  ];

  const threads = [
    { id:'query', title:'Query Performance', status:'working', pinned:true, archived:false, updated:'2m', unread:0, model:'Sonnet 4.6', summary:'Optimize tenant-scoped analytics queries and validate the result.', messages:[
      text('q-u1','user','Analyze the analytics query performance, use subagents where useful, and give me a safe implementation plan.',{ago:14}),
      event('q-work','working',{title:'Optimizing analytics queries'}),
      event('q-plan','plan-card',{artifactId:'plan-query'}),
      text('q-a1','assistant','The safest first move is a tenant-first composite index plus removal of the two N+1 call sites. The current benchmark is p95 482 ms; the validated concept result is 71 ms. I kept the materialized-view approach as a follow-up rather than the default because it adds refresh lag and operational state.',{ago:2, long:true})
    ]},
    { id:'plain', title:'Product Design Discussion', status:'idle', pinned:true, archived:false, updated:'12m', unread:0, model:'Sonnet 4.6', summary:'A long ordinary conversation with no tools, cards, or artifacts.', messages:plainConversation },
    { id:'questions', title:'Deployment Questionnaire', status:'waiting', pinned:true, archived:false, updated:'18m', unread:2, model:'Qwen 3.8', summary:'A durable queued questionnaire with required and optional answers.', messages:[text('quest-u1','user','Help me configure the deployment. Ask whatever you need.'),event('quest-e1','question-receipt',{title:'Deployment questions waiting',detail:'2 of 5 answered · no expiration'})]},
    { id:'subagents', title:'Runtime Architecture Review', status:'working', pinned:false, archived:false, updated:'24m', unread:3, model:'Opus 5', summary:'Multiple live child agents, including a blocked reviewer.', messages:[text('sa-u1','user','Review the runtime architecture in parallel.'),event('sa-live','live-agents',{title:'Three child agents working'})]},
    { id:'bsd', title:'BSD Intervention', status:'reviewing', pinned:false, archived:false, updated:'31m', unread:1, model:'Sonnet 4.6', summary:'Back Seat Driver catches an unsafe assumption and intervenes.', messages:[text('bsd-u1','user','Go ahead and rewrite the migration history so it is cleaner.'),event('bsd-check','bsd-evaluating',{title:'BSD is reviewing the proposed action'}),event('bsd-advice','bsd-advice',{title:'Back Seat Driver intervened',detail:'Rewriting applied migration history is unsafe. Create a forward migration and preserve rollback evidence.'}),text('bsd-a1','assistant','I will not rewrite applied history. I created a forward-only migration plan and added a rollback gate instead.')]},
    { id:'context', title:'Context Lens Review', status:'idle', pinned:false, archived:false, updated:'38m', unread:0, model:'Kimi K3', summary:'Focus, Mute, and Subcompact receipts with source provenance.', messages:[text('cl-u1','user','Focus on the current renderer and mute the old experiments.'),event('cl-focus','context-focus',{title:'Context Lens · Focus',detail:'Included current renderer, current tests, and final PMConcept7 reference.'}),event('cl-mute','context-mute',{title:'Context Lens · Mute',detail:'Omitted six superseded concept folders from the active context.'}),event('cl-sub','context-subcompact',{title:'Subcompact preview',detail:'Would reduce active context by 18,420 tokens while retaining provenance.'})]},
    { id:'visuals', title:'Inline Visualizer Gallery', status:'complete', pinned:false, archived:false, updated:'44m', unread:0, model:'GLM 5.2', summary:'Mermaid, dashboard, chart, explorer, quiz, map, periodic table, flowchart, and image.', messages:[text('vis-u1','user','Show several native inline visual artifacts.'),event('vis-m','artifact',{artifactId:'mermaid-runtime'}),event('vis-d','artifact',{artifactId:'dashboard-query'}),event('vis-i','artifact',{artifactId:'generated-image'})]},
    { id:'debug', title:'Browser Debug Session', status:'working', pinned:false, archived:false, updated:'51m', unread:4, model:'Qwen 3.8', summary:'Browser control, console, network, test evidence, and recovery.', messages:[text('dbg-u1','user','Debug the intermittent blank dashboard.'),event('dbg-w','working',{title:'Debugging the dashboard'}),event('dbg-a','artifact',{artifactId:'test-evidence'})]},
    { id:'offline', title:'Offline Replay', status:'recovering', pinned:false, archived:false, updated:'1h', unread:0, model:'Sonnet 4.6', summary:'Queued message, reconnect, deduplicated one-time replay.', messages:[text('off-u1','user','Continue after I reconnect.'),event('off-q','offline',{title:'Message queued offline',detail:'Will replay once after the connection is restored.'}),event('off-r','reconnected',{title:'Connection restored',detail:'Queued message replayed once · no duplicate turn created.'})]},
    { id:'attachments', title:'Attachment Routing', status:'idle', pinned:false, archived:false, updated:'1h', unread:0, model:'Kimi K3', summary:'Upload progress, image preview, source routing, and unsupported attachment handling.', messages:[event('att-1','attachment',{title:'schema-diagram.png',detail:'Uploaded · image artifact created'}),event('att-2','attachment-error',{title:'legacy-project.pkg',detail:'Unsupported package · open extraction guidance'})]},
    { id:'tool-failure', title:'Tool Recovery', status:'blocked', pinned:false, archived:false, updated:'2h', unread:1, model:'Opus 5', summary:'Interrupted work, permission denial, checkpoint recovery, and retry.', messages:[event('tf-1','tool-error',{title:'Browser control interrupted',detail:'Execution host disconnected during step 7.'}),event('tf-2','permission',{title:'Permission required',detail:'Reconnecting to the execution host requires approval.'})]},
    { id:'goal-replan', title:'Goal Replanning', status:'paused', pinned:false, archived:false, updated:'2h', unread:0, model:'GLM 5.2', summary:'Edit, pause, resume, stop, clear, evidence, tasks, and material replanning.', messages:[event('gr-1','goal-receipt',{title:'Goal paused',detail:'Revision 4 · material scope edit requires replanning'})]},
    { id:'route', title:'Provider Route Change', status:'complete', pinned:false, archived:false, updated:'3h', unread:0, model:'Qwen 3.8', summary:'Configured-account route change, Fast eligibility, quota, and graceful fallback.', messages:[event('rt-1','route-change',{title:'Model route changed',detail:'Sonnet 4.6 Fast → Qwen 3.8 · quota threshold reached'})]},
    { id:'plan-deep', title:'Deep Plan Review', status:'waiting', pinned:false, archived:false, updated:'4h', unread:2, model:'Opus 5', summary:'Deep Plan artifact, revision, approval, cancellation, and later Build.', messages:[event('dp-1','plan-card',{artifactId:'plan-query',deep:true})]},
    { id:'crew', title:'Crew Coordination', status:'working', pinned:false, archived:false, updated:'5h', unread:5, model:'Sonnet 4.6', summary:'Crew formation, role assignment, wait, block, timeout, recovery, and completion.', messages:[event('cr-1','crew',{title:'Crew formed',detail:'Planner, implementer, reviewer, and browser auditor'})]},
    { id:'artifact-error', title:'Artifact Recovery', status:'failed', pinned:false, archived:false, updated:'6h', unread:1, model:'Kimi K3', summary:'Stale version, render failure, source fallback, and retry.', messages:[event('ae-1','artifact',{artifactId:'broken-viz'})]},
    { id:'new-message', title:'Scroll Anchor Test', status:'working', pinned:false, archived:false, updated:'7h', unread:7, model:'Qwen 3.8', summary:'New messages arrive while the reader is away from the bottom.', messages:[...plainConversation, event('nm-1','new-message',{title:'3 new messages',detail:'Your reading position was preserved.'})]},
    { id:'no-models', title:'Model Availability', status:'blocked', pinned:false, archived:false, updated:'8h', unread:0, model:'—', summary:'No configured models, temporary unavailability, authentication, and quota guidance.', messages:[event('nm-2','model-unavailable',{title:'No available configured model',detail:'Two configured accounts need attention in Provider Settings.'})]},
    { id:'archived-1', title:'Archived Accessibility Audit', status:'complete', pinned:false, archived:true, updated:'3d', unread:0, model:'Sonnet 4.6', summary:'Archived historical audit.', messages:[text('ar1','assistant','This archived thread remains searchable and can be restored.')]},
    { id:'archived-2', title:'Archived Provider Research', status:'complete', pinned:false, archived:true, updated:'5d', unread:0, model:'Qwen 3.8', summary:'Archived provider comparison.', messages:[text('ar2','assistant','Provider comparison archived after the final route decision.')]},
    { id:'archived-3', title:'Archived Usage Prototype', status:'complete', pinned:false, archived:true, updated:'8d', unread:0, model:'Kimi K3', summary:'Archived usage concept.', messages:[text('ar3','assistant','The finalized Context Ring came from this prototype.')]},
    { id:'archived-4', title:'Archived Onboarding Notes', status:'idle', pinned:false, archived:true, updated:'12d', unread:0, model:'GLM 5.2', summary:'Archived onboarding notes.', messages:[text('ar4','assistant','These notes are retained for exact-message search.')]},
    { id:'archived-5', title:'Archived Browser API', status:'complete', pinned:false, archived:true, updated:'18d', unread:0, model:'Opus 5', summary:'Archived browser API review.', messages:[text('ar5','assistant','The native Browser Program API replaced the old Playwright facade idea.')]},
    { id:'archived-6', title:'Archived Settings Bakeoff', status:'complete', pinned:false, archived:true, updated:'24d', unread:0, model:'Sonnet 4.6', summary:'Archived settings concepts.', messages:[text('ar6','assistant','This thread can be restored, forked, renamed, or searched.')]}
  ];

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

  const models = [
    { id:'sonnet46', name:'Sonnet 4.6', provider:'Anthropic', account:'Work account', favorite:true, fast:true, efforts:['Low','Medium','High','Max'], status:'ready' },
    { id:'opus5', name:'Opus 5', provider:'Anthropic', account:'Work account', favorite:true, fast:false, efforts:['Medium','High','Max'], status:'ready' },
    { id:'qwen38', name:'Qwen 3.8', provider:'Alibaba', account:'Coding Plan', favorite:true, fast:true, efforts:['Low','Medium','High'], status:'ready' },
    { id:'kimi-k3', name:'Kimi K3', provider:'Moonshot', account:'Kimi Coding', favorite:false, fast:true, efforts:['Low','Medium','High'], status:'ready' },
    { id:'glm52', name:'GLM 5.2', provider:'z.ai', account:'Primary', favorite:false, fast:false, efforts:['Low','Medium','High'], status:'ready' },
    { id:'cursor-auto', name:'Cursor Auto', provider:'Cursor', account:'Pro', favorite:false, fast:false, efforts:['Automatic'], status:'ready' }
  ];

  const questions = [
    { id:'q1', prompt:'Where should the primary Puppet Master server run?', required:true, type:'choice', options:['TrueNAS Docker','Windows native','macOS native','Linux native'], answer:'TrueNAS Docker' },
    { id:'q2', prompt:'Which hosts may execute Windows work?', required:true, type:'multi', options:['Windows native','Windows WSL','Linux container','macOS'], answer:['Windows native','Windows WSL'] },
    { id:'q3', prompt:'What should happen when the preferred host is offline?', required:true, type:'choice', options:['Pause and ask','Use an eligible fallback','Queue until it returns'], answer:'' },
    { id:'q4', prompt:'Add any constraints the deployment plan should preserve.', required:false, type:'text', answer:'Keep provider credentials on the server and allow clients to reconnect without losing draft state.' },
    { id:'q5', prompt:'Review the resolved deployment summary.', required:false, type:'summary', answer:'' }
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

  window.PM56_DATA = { workSteps, phaseMeta, phaseRows, phaseGroups, artifacts, subagents, todos, changes, threads, recipes, themes, models, questions, workingTakes, transcriptTakes };
})();

/* Final feature manifest used by the concept lab's self-audit and Demo Studio. */
window.PM56_FEATURE_MANIFEST = Object.freeze({
  context: ["Compact Now", "More Details", "Current window", "Tokens loaded", "Cache hit", "Source composition"],
  activityDomains: ["Goal", "Todo", "Subagents", "Changes", "Artifacts"],
  workingControls: ["Start", "Pause", "Complete", "History", "Evidence"],
  workingStates: ["Web search", "Web fetch", "Browser control", "Bash", "Browser test", "App control", "Subagent", "Validate", "Artifact render"],
  workingTakes: window.PM56_DATA.workingTakes.slice(),
  decisions: ["Approve", "Revise", "Build", "Questionnaire", "Permission", "Conflict"],
  messageActions: ["Message Details", "Edit and branch", "Re-answer", "Copy"],
  threadActions: ["Archived", "Restore", "Fork", "Rename", "Search"],
  demoThreads: ["Ordinary", "BSD", "Context Lens", "Offline", "Checkpoint", "Attachment", "Quota", "New-message anchor"],
  artifacts: ["Mermaid", "Dashboard", "Data explorer", "Architecture map", "Quiz", "Periodic table", "Flowchart", "Generated image", "Stale", "Retry"],
  selectors: ["Worktree", "Goal Mode", "Crew", "ELI5", "Thought Stream", "Fast", "Configured", "Favorites", "Account"],
  persistence: ["No passive questionnaire expiry", "Per-thread drafts", "Draft history"],
  optionFamilies: {
    bodyVariants: 8,
    historyVariants: 8,
    workingVariants: window.PM56_DATA.workingTakes.length,
    activityVariants: 8,
    detailVariants: 8,
    transcriptVariants: window.PM56_DATA.transcriptTakes.length,
    questionVariants: 8
  }
});
