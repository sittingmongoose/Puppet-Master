/* Puppet Master Assistant Chat 5.6 Pro — deterministic concept fixtures */
window.PM56_DATA = (() => {
  const themes = [
    {id:'puppet-dark', name:'Puppet Dark', a:'#a77cff', b:'#252039'},
    {id:'midnight', name:'Midnight', a:'#50b8ff', b:'#0a1f31'},
    {id:'graphite', name:'Graphite', a:'#9ba8ff', b:'#25292f'},
    {id:'ember', name:'Ember', a:'#ff9b67', b:'#3a1915'},
    {id:'puppet-light', name:'Puppet Light', a:'#7650df', b:'#eeeaf6'},
    {id:'paper', name:'Paper', a:'#7b59c8', b:'#f5efe4'},
    {id:'glass-dark', name:'Glass Dark', a:'#bd8cff', b:'#271d55'},
    {id:'glass-light', name:'Glass Light', a:'#7650db', b:'#e3dbf2'}
  ];

  const families = [
    {id:'shell', name:'Assistant body + composer', options:['PM7 Refined','Narrow Priority','Compact Header','Split Selector Row','Reading Focus','Wide Workbench','Composer First','Adaptive Density']},
    {id:'history', name:'Thread history', options:['Pinned List','Pinned + Recent','Compact Status Rail','Dense Worktree','Search Focused','Preview Rows','Grouped Recency','Minimal Reading Rail']},
    {id:'working', name:'Working Animation', options:['Reference Morph','Living Capsule','Compact Step Stack','Tool Ribbon','Progressive Receipt','Expanding Work Capsule','Agent Lanes','Calm Completion']},
    {id:'activitybar', name:'Chat Activity Bar', options:['Extended PM7 Pill','Segmented Strip','Icon Cluster','Current + History','Capsule Stack','Edge Rail','Current Work Dock','Minimal Glyph Row']},
    {id:'activitypanel', name:'Activity Detail panel', options:['Domain Inspector','Tabbed Overview','Status Summary','Goal Tree','Agent Board','File + Artifact Ledger','Live Work Feed','Overview Split']},
    {id:'transcript', name:'Chat transcript', options:['PM7 Cleaned','Prose First','Wide Dialogue','Sectioned Response','Compact Work','Response Cards','Reading Mode','Dense Technical']},
    {id:'question', name:'Question + decision surface', options:['Morphing Composer','Stable Floating Card','Anchored Sheet','Side Inspector','Focused Workspace','Queue Stack','Focus Modal','Evidence Split']}
  ];

  const recipes = [
    {id:'refined', name:'PM7 Refined', blurb:'The closest evolution of the proven assistant.', values:{shell:1,history:1,working:1,activitybar:1,activitypanel:1,transcript:1,question:1}},
    {id:'compact', name:'Compact Operator', blurb:'Higher information density without sacrificing hierarchy.', values:{shell:2,history:3,working:3,activitybar:3,activitypanel:7,transcript:5,question:2}},
    {id:'reading', name:'Reading First', blurb:'Calm long-form assistant responses and restrained work detail.', values:{shell:5,history:8,working:8,activitybar:8,activitypanel:8,transcript:7,question:2}},
    {id:'agentic', name:'Agent Control', blurb:'Foregrounds active agents, goals, evidence, and decisions.', values:{shell:1,history:2,working:7,activitybar:7,activitypanel:5,transcript:4,question:8}},
    {id:'technical', name:'Technical Dense', blurb:'Optimized for code, logs, changes, and exact navigation.', values:{shell:8,history:4,working:4,activitybar:2,activitypanel:6,transcript:8,question:4}},
    {id:'visual', name:'Visual Studio', blurb:'Gives interactive artifacts and editor handoff more presence.', values:{shell:6,history:6,working:6,activitybar:5,activitypanel:6,transcript:6,question:5}},
    {id:'planning', name:'Planning Room', blurb:'Plan, Deep Plan, questionnaires, and goals are first class.', values:{shell:3,history:7,working:5,activitybar:4,activitypanel:4,transcript:4,question:1}},
    {id:'adaptive', name:'Adaptive Daily', blurb:'Balanced defaults that remain legible under width pressure.', values:{shell:8,history:2,working:2,activitybar:2,activitypanel:2,transcript:3,question:3}}
  ];

  const providers = [
    {id:'anthropic', name:'Anthropic', mark:'A', account:'Work · OAuth', configured:true},
    {id:'openai', name:'OpenAI', mark:'O', account:'Personal · OAuth', configured:true},
    {id:'google', name:'Google', mark:'G', account:'Studio · API key', configured:true},
    {id:'openrouter', name:'OpenRouter', mark:'OR', account:'Primary · API key', configured:true}
  ];

  const models = [
    {id:'sonnet-46', name:'Sonnet 4.6', provider:'anthropic', detail:'Balanced reasoning and implementation', favorite:true, efforts:['Low','Medium','High','Max'], effort:'High', fast:true, fastEnabled:false},
    {id:'opus-46', name:'Opus 4.6', provider:'anthropic', detail:'Deep analysis and difficult orchestration', favorite:true, efforts:['Medium','High','Max'], effort:'High', fast:false},
    {id:'gpt-56-pro', name:'GPT-5.6 Pro', provider:'openai', detail:'High-quality planning and code review', favorite:true, efforts:['Low','Medium','High','Max'], effort:'High', fast:true, fastEnabled:false},
    {id:'gpt-56', name:'GPT-5.6', provider:'openai', detail:'Fast general-purpose agent work', favorite:false, efforts:['Low','Medium','High'], effort:'Medium', fast:true, fastEnabled:true},
    {id:'gemini-4-pro', name:'Gemini 4 Pro', provider:'google', detail:'Long-context analysis and visual reasoning', favorite:true, efforts:['Low','Medium','High'], effort:'High', fast:false},
    {id:'gemini-4-flash', name:'Gemini 4 Flash', provider:'google', detail:'Responsive, economical assistance', favorite:false, efforts:['Low','Medium'], effort:'Medium', fast:true, fastEnabled:false},
    {id:'qwen-38', name:'Qwen 3.8 Coder', provider:'openrouter', detail:'Coding-focused open model route', favorite:false, efforts:['Low','Medium','High'], effort:'High', fast:false},
    {id:'kimi-k3', name:'Kimi K3', provider:'openrouter', detail:'Repository-scale agentic coding', favorite:true, efforts:['Medium','High'], effort:'High', fast:false}
  ];

  const personas = [
    {id:'product', name:'Product Manager', detail:'Requirements, tradeoffs, and delivery', icon:'person'},
    {id:'architect', name:'Software Architect', detail:'Systems, boundaries, and contracts', icon:'architecture'},
    {id:'frontend', name:'Frontend Director', detail:'Interaction design and motion quality', icon:'sparkles'},
    {id:'debugger', name:'Debugger', detail:'Evidence-first fault isolation', icon:'bug'},
    {id:'teacher', name:'Teacher', detail:'Clear explanations and guided learning', icon:'book'},
    {id:'none', name:'No persona', detail:'Use the model’s general behavior', icon:'minus'}
  ];

  const modes = [
    {id:'ask', name:'Ask', detail:'Answer without changing files', icon:'chat'},
    {id:'agent', name:'Agent', detail:'Work autonomously with tools', icon:'agent'},
    {id:'plan', name:'Plan', detail:'Create an implementation plan', icon:'plan', sidecar:'plan'},
    {id:'deep-plan', name:'Deep Plan', detail:'Research and create a rigorous plan', icon:'layers', sidecar:'deep-plan'},
    {id:'debug', name:'Debug', detail:'Investigate and repair a problem', icon:'bug'}
  ];

  const planThoroughness = ['Quick','Standard','Thorough','Exhaustive'];
  const permissions = [
    {id:'ask', name:'Ask for approval', detail:'Confirm edits, commands, and external actions', icon:'hand'},
    {id:'edits', name:'Auto accept edits', detail:'Edits are automatic; other actions still ask', icon:'edit'},
    {id:'auto', name:'Auto', detail:'Use policy and risk to decide when to ask', icon:'shield'},
    {id:'full', name:'Full Access', detail:'Run permitted actions without confirmation', icon:'unlock'}
  ];

  const worktrees = [
    {id:'main', name:'main', detail:'Primary working tree', icon:'branch'},
    {id:'feature-query', name:'feature/query-index', detail:'Index optimization work', icon:'branch'},
    {id:'concept-chat', name:'concept/chat-5-6-pro', detail:'Assistant concept worktree', icon:'branch'},
    {id:'review-bench', name:'review/query-benchmarks', detail:'Read-only benchmark review', icon:'eye'}
  ];

  const capabilities = [
    {id:'goal', name:'Goal Mode', icon:'target', description:'Persistent goal, tasks, evidence, and replanning', submenu:[
      {id:'goal-on', name:'On', detail:'Keep a persistent objective and activity projection'},
      {id:'goal-off', name:'Off', detail:'Use a normal conversational thread'}
    ]},
    {id:'crew', name:'Crew', icon:'users', description:'Coordinate a purpose-built group of agents', submenu:[
      {id:'crew-auto', name:'Auto', detail:'Create a crew when the work benefits'},
      {id:'crew-on', name:'On', detail:'Always consider delegated specialists'},
      {id:'crew-off', name:'Off', detail:'Keep the work in this thread'}
    ]},
    {id:'bsd', name:'Back Seat Driver', icon:'steering', description:'Advisory review while another agent works', submenu:[
      {id:'bsd-auto', name:'Auto', detail:'Watch high-risk or difficult work'},
      {id:'bsd-on', name:'On', detail:'Always provide advisory review'},
      {id:'bsd-off', name:'Off', detail:'Disable the advisor'}
    ]},
    {id:'lens', name:'Context Lens', icon:'lens', description:'Control what stays prominent in context', submenu:[
      {id:'lens-mute', name:'Mute', detail:'Suppress low-value context immediately'},
      {id:'lens-focus', name:'Focus', detail:'Promote the selected context immediately'},
      {id:'lens-subcompact', name:'Subcompact', detail:'Preview a deeper context compaction first'}
    ]},
    {id:'eli5', name:'ELI5', icon:'lightbulb', description:'Adjust explanation complexity', submenu:[
      {id:'eli5-off', name:'Off', detail:'Use normal technical language'},
      {id:'eli5-concise', name:'Concise', detail:'Plain language without extra teaching'},
      {id:'eli5-teach', name:'Teach', detail:'Explain unfamiliar concepts as they appear'}
    ]},
    {id:'thought', name:'Thought Stream', icon:'thought', description:'Show permitted reasoning activity', submenu:[
      {id:'thought-auto', name:'Auto', detail:'Expand only while it is useful'},
      {id:'thought-expanded', name:'Expanded', detail:'Keep permitted thought activity open'}
    ]}
  ];

  const threads = [
    {id:'query-performance', title:'Query performance and schema', summary:'Composite indexes versus materialized views', time:'2m', status:'working', pinned:true, archived:false, scenario:'query'},
    {id:'assistant-redesign', title:'Assistant chat redesign', summary:'Motion, overlays, and responsive behavior', time:'18m', status:'waiting', pinned:true, archived:false, scenario:'design'},
    {id:'runtime-slice', title:'Native runtime product slice', summary:'Rust and Slint integration plan', time:'43m', status:'complete', pinned:true, archived:false, scenario:'plan'},
    {id:'provider-routing', title:'Provider routing audit', summary:'Configured accounts and model constraints', time:'1h', status:'complete', pinned:false, archived:false, scenario:'provider'},
    {id:'browser-tests', title:'Browser integration tests', summary:'Visible browser control and evidence capture', time:'2h', status:'working', pinned:false, archived:false, scenario:'browser'},
    {id:'mermaid-architecture', title:'Architecture map', summary:'Native visualizer and Mermaid separation', time:'3h', status:'complete', pinned:false, archived:false, scenario:'mermaid'},
    {id:'usage-dashboard', title:'Usage dashboard analysis', summary:'Cost, token, cache, and reset telemetry', time:'5h', status:'complete', pinned:false, archived:false, scenario:'visualizer'},
    {id:'goal-mode', title:'Goal Mode lifecycle', summary:'Pause, resume, stop, clear, and replan', time:'Yesterday', status:'blocked', pinned:false, archived:false, scenario:'goal'},
    {id:'questionnaire', title:'Planning questionnaire', summary:'Durable queued questions and revisions', time:'Yesterday', status:'waiting', pinned:false, archived:false, scenario:'questions'},
    {id:'generated-image', title:'Generate dancing SVG concept', summary:'Compact image preview and editor handoff', time:'Mon', status:'complete', pinned:false, archived:false, scenario:'image'},
    {id:'file-review', title:'Review analytics query changes', summary:'Exact file and range navigation', time:'Mon', status:'complete', pinned:false, archived:false, scenario:'changes'},
    {id:'subagent-audit', title:'Subagent audit threads', summary:'Live read-only child transcripts', time:'Sun', status:'working', pinned:false, archived:false, scenario:'subagents'},
    {id:'old-onboarding', title:'Onboarding concept bakeoff', summary:'Archived design exploration', time:'Jul 30', status:'complete', pinned:false, archived:true, scenario:'archive'},
    {id:'doctor-flow', title:'Doctor diagnostics', summary:'Archived repair and health checks', time:'Jul 28', status:'complete', pinned:false, archived:true, scenario:'archive'},
    {id:'settings-nav', title:'Settings navigation study', summary:'Archived navigation directions', time:'Jul 25', status:'complete', pinned:false, archived:true, scenario:'archive'},
    {id:'remote-hosts', title:'Remote execution hosts', summary:'Archived host discovery discussion', time:'Jul 18', status:'complete', pinned:false, archived:true, scenario:'archive'},
    {id:'provider-cli', title:'Provider CLI adjudication', summary:'Archived installation policy review', time:'Jul 14', status:'complete', pinned:false, archived:true, scenario:'archive'},
    {id:'ledger-migration', title:'Ledger migration certification', summary:'Archived evidence and shard checks', time:'Jul 7', status:'complete', pinned:false, archived:true, scenario:'archive'}
  ];

  const workingStates = [
    {id:'preparing', label:'Preparing', subtitle:'Organizing the next work phase', icon:'sparkles'},
    {id:'thinking', label:'Thinking', subtitle:'Reasoning through constraints and tradeoffs', icon:'thought'},
    {id:'thought-stream', label:'Thought stream', subtitle:'Permitted reasoning activity is expanded', icon:'thought'},
    {id:'exploring', label:'Exploring files', subtitle:'Reading the repository and tracing ownership', icon:'files'},
    {id:'web-search', label:'Searching the web', subtitle:'Finding primary sources and current documentation', icon:'search'},
    {id:'web-fetch', label:'Fetching sources', subtitle:'Reading selected pages and extracting evidence', icon:'globe'},
    {id:'browser', label:'Controlling browser', subtitle:'Inspecting the rendered product in a visible browser', icon:'browser'},
    {id:'bash', label:'Running Bash', subtitle:'Executing a deterministic local command', icon:'terminal'},
    {id:'program', label:'Controlling application', subtitle:'Driving another program and observing state', icon:'monitor'},
    {id:'subagents', label:'Coordinating subagents', subtitle:'Two specialists are working in parallel', icon:'users'},
    {id:'editing', label:'Editing files', subtitle:'Applying a focused implementation patch', icon:'edit'},
    {id:'browser-test', label:'Testing in browser', subtitle:'Clicking controls, scrolling, and checking geometry', icon:'browser'},
    {id:'program-test', label:'Testing application', subtitle:'Exercising native controls and integration behavior', icon:'check'},
    {id:'rendering', label:'Rendering artifact', subtitle:'Building an interactive visual result', icon:'sparkles'},
    {id:'validating', label:'Validating', subtitle:'Checking invariants, output, and evidence', icon:'shield'},
    {id:'compiler', label:'Running compiler and LSP', subtitle:'Resolving diagnostics and type errors', icon:'code'},
    {id:'debugging', label:'Debugging', subtitle:'Following evidence to isolate a fault', icon:'bug'},
    {id:'tooling', label:'Using connected tool', subtitle:'Calling an approved MCP or provider tool', icon:'plug'},
    {id:'permission', label:'Waiting for approval', subtitle:'A material action needs user confirmation', icon:'hand'},
    {id:'recovering', label:'Recovering from checkpoint', subtitle:'Restoring the last verified state and resuming', icon:'restore'},
    {id:'complete', label:'Work complete', subtitle:'Verified changes and artifacts are ready', icon:'check'}
  ];

  const subagents = [
    {id:'query-analyzer', name:'Query Analyzer', model:'Sonnet 4.6', status:'working', task:'Benchmarking composite indexes against representative traffic', elapsed:'1m 42s'},
    {id:'schema-reviewer', name:'Schema Reviewer', model:'Opus 4.6', status:'blocked', task:'Reviewing production schema policy and denormalization risks', elapsed:'1m 31s'},
    {id:'motion-director', name:'Motion Director', model:'Gemini 4 Pro', status:'working', task:'Inspecting menu choreography and transition frames', elapsed:'52s'},
    {id:'test-auditor', name:'Test Auditor', model:'GPT-5.6 Pro', status:'complete', task:'Completed the interaction and geometry sweep', elapsed:'3m 04s'},
    {id:'visualizer-agent', name:'Visualizer Agent', model:'Qwen 3.8 Coder', status:'waiting', task:'Waiting to render the selected data explorer', elapsed:'18s'}
  ];

  const todos = [
    {id:'t1', text:'Inspect query call sites and cardinality', state:'complete'},
    {id:'t2', text:'Benchmark composite index candidates', state:'active'},
    {id:'t3', text:'Compare materialized-view refresh cost', state:'queued'},
    {id:'t4', text:'Validate write amplification under peak load', state:'queued'},
    {id:'t5', text:'Run browser interaction matrix', state:'complete'},
    {id:'t6', text:'Review motion recordings frame by frame', state:'active'},
    {id:'t7', text:'Open every artifact in editor', state:'queued'},
    {id:'t8', text:'Write final evidence disposition', state:'queued'}
  ];

  const artifacts = [
    {id:'plan-query', type:'plan', title:'Query Performance Plan', subtitle:'Plan · revision 3', icon:'plan'},
    {id:'deep-plan-runtime', type:'deep-plan', title:'Native Runtime Deep Plan', subtitle:'Deep Plan · revision 2', icon:'layers'},
    {id:'mermaid-runtime', type:'mermaid', title:'Runtime Architecture', subtitle:'Mermaid diagram · rendered', icon:'diagram'},
    {id:'dashboard-usage', type:'visualizer', title:'Usage Health Dashboard', subtitle:'Interactive dashboard · live fixture', icon:'chart'},
    {id:'data-explorer', type:'visualizer', title:'Query Benchmark Explorer', subtitle:'Interactive data explorer', icon:'table'},
    {id:'architecture-map', type:'visualizer', title:'Agent Routing Architecture', subtitle:'Interactive architecture map', icon:'architecture'},
    {id:'quiz-routing', type:'visualizer', title:'Routing Knowledge Check', subtitle:'Interactive quiz', icon:'quiz'},
    {id:'periodic-capabilities', type:'visualizer', title:'Capability Periodic Table', subtitle:'Interactive capability explorer', icon:'grid'},
    {id:'flowchart-goal', type:'visualizer', title:'Goal Lifecycle Flowchart', subtitle:'Interactive flowchart', icon:'flow'},
    {id:'chart-latency', type:'visualizer', title:'Latency Distribution', subtitle:'Interactive chart', icon:'chart'},
    {id:'generated-dancer', type:'image', title:'Dancing SVG Figure', subtitle:'Generated image · 2048 × 2048', icon:'image'},
    {id:'test-evidence', type:'image', title:'Responsive Test Evidence', subtitle:'Browser screenshot · 1440 × 900', icon:'camera'}
  ];

  const fileChanges = [
    {id:'c1', path:'src/analytics/queries.rs', range:'L128–L164', summary:'Add tenant-scoped composite index query path', added:42, removed:8},
    {id:'c2', path:'src/analytics/schema.rs', range:'L34–L61', summary:'Register non-blocking index migration metadata', added:23, removed:4},
    {id:'c3', path:'tests/analytics/query_bench.rs', range:'L18–L112', summary:'Add representative read/write benchmark matrix', added:95, removed:0},
    {id:'c4', path:'Concepts/settings-redesign-concepts/5.6 Pro/styles.css', range:'L720–L944', summary:'Repair anchored overlay and submenu motion', added:131, removed:76}
  ];

  const questions = [
    {id:'approach', title:'Choose the optimization approach', description:'Both candidates improve read latency, but they have different operational costs.', required:true, type:'single', options:[
      {id:'indexes', label:'Composite indexes', detail:'Fast to ship, roughly 60% latency reduction, about 15% write overhead.'},
      {id:'views', label:'Materialized views', detail:'Best read performance, but introduces refresh lag and extra storage.'},
      {id:'hybrid', label:'Hybrid validation', detail:'Ship indexes first, then validate one materialized view in shadow mode.'}
    ]},
    {id:'traffic', title:'Which traffic profile should govern the benchmark?', description:'This changes weighting, dataset size, and acceptance thresholds.', required:true, type:'single', options:[
      {id:'read-heavy', label:'Current read-heavy traffic', detail:'95% reads, 5% writes; closest to production today.'},
      {id:'balanced', label:'Future balanced traffic', detail:'70% reads, 30% writes; tests planned feature growth.'},
      {id:'both', label:'Run both profiles', detail:'More complete, but adds roughly twelve minutes to validation.'}
    ]},
    {id:'notes', title:'Any constraints the plan should preserve?', description:'Optional details will be attached to the immutable plan revision.', required:false, type:'text', placeholder:'For example: keep migrations online and preserve the existing API…'}
  ];

  const demos = [
    {category:'Working Animation', icon:'activity', items:workingStates.map(s => ({id:`work:${s.id}`, title:s.label, detail:s.subtitle, icon:s.icon}))},
    {category:'Questions + decisions', icon:'question', items:[
      {id:'question:prepare', title:'Preparing questions', detail:'Morph from a compact preparation state', icon:'sparkles'},
      {id:'question:open', title:'Open questionnaire', detail:'Three durable paged questions', icon:'question'},
      {id:'question:queued', title:'Queued questionnaires', detail:'Show two pending question sets', icon:'layers'},
      {id:'decision:plan', title:'Plan approval', detail:'Approve, revise, or cancel a plan', icon:'plan'},
      {id:'decision:permission', title:'Permission request', detail:'Focused approval with evidence', icon:'hand'},
      {id:'decision:conflict', title:'Conflict resolution', detail:'Choose between incompatible changes', icon:'branch'},
      {id:'question:restore', title:'Restore unfinished answers', detail:'Return to a durable questionnaire', icon:'restore'},
      {id:'question:submitted', title:'Submission receipt', detail:'Show the compact submitted state', icon:'check'}
    ]},
    {category:'Artifacts', icon:'artifact', items:artifacts.map(a => ({id:`artifact:${a.id}`, title:a.title, detail:a.subtitle, icon:a.icon}))},
    {category:'Activity domains', icon:'activity', items:[
      {id:'activity:goal', title:'Goal details', detail:'Goal state, plan summary, tasks, evidence, and controls', icon:'target'},
      {id:'activity:todo', title:'Todo details', detail:'Active, queued, complete, and blocked work', icon:'checklist'},
      {id:'activity:subagents', title:'Subagent board', detail:'Live status, current action, and read-only threads', icon:'users'},
      {id:'activity:changes', title:'File changes', detail:'Exact files, ranges, versions, and diff stats', icon:'diff'},
      {id:'activity:artifacts', title:'Artifact ledger', detail:'Inline, editor-open, stale, and ready states', icon:'artifact'},
      {id:'activity:pin', title:'Pin activity panel', detail:'Move transient details into the dock', icon:'pin'},
      {id:'activity:blocked', title:'Blocked goal state', detail:'Show exact blocker and decision route', icon:'warning'},
      {id:'activity:complete', title:'Completed work receipt', detail:'Condense work without losing history', icon:'check'}
    ]},
    {category:'Thread + message states', icon:'chat', items:[
      {id:'thread:long', title:'Long collapsible response', detail:'Substantial preview with stable expansion', icon:'text'},
      {id:'thread:image', title:'Generated image response', detail:'Compact image that opens in editor', icon:'image'},
      {id:'thread:plan', title:'Durable Plan card', detail:'View Plan and later Build actions', icon:'plan'},
      {id:'thread:deep-plan', title:'Durable Deep Plan card', detail:'Research summary and approval flow', icon:'layers'},
      {id:'thread:error', title:'Recoverable tool error', detail:'Clear fault, retry route, and preserved evidence', icon:'warning'},
      {id:'thread:approval', title:'Approval receipt', detail:'Compact transcript receipt after decision', icon:'check'},
      {id:'thread:search-hit', title:'Cross-thread search hit', detail:'Jump to and highlight an exact message', icon:'search'},
      {id:'thread:new-message', title:'Message arrival motion', detail:'Stable scroll anchor and spring arrival', icon:'send'}
    ]},
    {category:'Menus + capabilities', icon:'sliders', items:[
      {id:'menu:model', title:'Model picker', detail:'Favorites, configured providers, effort, and Fast', icon:'model'},
      {id:'menu:mode', title:'Mode + thoroughness', detail:'Plan and Deep Plan sidecar menus', icon:'layers'},
      {id:'menu:wand', title:'Wand capabilities', detail:'Goal, Crew, BSD, Context Lens, ELI5, thought stream', icon:'wand'},
      {id:'capability:goal', title:'Enable Goal Mode', detail:'Button, slash command, and natural-language state', icon:'target'},
      {id:'capability:subcompact', title:'Subcompact preview', detail:'Apply or cancel a deeper context compaction', icon:'lens'},
      {id:'command:slash', title:'Slash command palette', detail:'Goal, Plan, Deep Plan, Ask, Debug, and more', icon:'terminal'},
      {id:'context:details', title:'Context More Details', detail:'Finalized ring and detailed context drawer', icon:'lens'},
      {id:'thread:archive', title:'Archived thread search', detail:'Search, inspect, and restore archived history', icon:'archive'}
    ]}
  ];

  const slashCommands = [
    {cmd:'/goal', label:'Goal Mode', detail:'Start or update a persistent goal', icon:'target'},
    {cmd:'/plan', label:'Plan', detail:'Create an implementation plan', icon:'plan'},
    {cmd:'/deep-plan', label:'Deep Plan', detail:'Research and create a rigorous plan', icon:'layers'},
    {cmd:'/ask', label:'Ask', detail:'Answer without changing files', icon:'chat'},
    {cmd:'/agent', label:'Agent', detail:'Work autonomously with tools', icon:'agent'},
    {cmd:'/debug', label:'Debug', detail:'Investigate a fault with evidence', icon:'bug'},
    {cmd:'/todo', label:'Todo', detail:'Open or update the current task list', icon:'checklist'},
    {cmd:'/web', label:'Web research', detail:'Search and fetch current primary sources', icon:'globe'},
    {cmd:'/compact', label:'Compact context', detail:'Preview context compaction', icon:'lens'}
  ];

  const transcriptScenarios = {
    query: [
      {kind:'user', text:'Investigate why the analytics dashboard queries have become slow under tenant-heavy traffic. Use subagents where useful, compare safe fixes, and show me the evidence before changing the production schema.'},
      {kind:'working', state:'subagents', expanded:true},
      {kind:'assistant', text:'I traced the slowdown to three full-table scan paths that apply tenant filtering after the broadest predicate. Two index candidates remove most of that work, but the safest production choice depends on how much write amplification you will accept.\n\nThe current representative profile is **95% reads and 5% writes**. Composite indexes reduce median latency by roughly 60% in the fixture while increasing write cost by about 15%. A materialized view is faster for reads, but adds refresh behavior, storage, and a new failure mode.\n\nI have paused before modifying the production schema because the selected policy requires an explicit decision. The active subagents and their evidence remain available in the Working Animation and Subagents detail panel.', collapsible:true},
      {kind:'plan-card', artifact:'plan-query'},
      {kind:'mermaid', artifact:'mermaid-runtime'},
      {kind:'visualizer', artifact:'dashboard-usage'}
    ],
    design: [
      {kind:'user', text:'Redesign the assistant without losing the usability, polish, readability, or animation language of PMConcept7. I need the components to be swappable for concept evaluation.'},
      {kind:'working', state:'browser-test', expanded:true},
      {kind:'assistant', text:'The concept lab now uses one stable state and command layer with eight renderer choices per major component. Menus use a shared anchored-overlay system so parent menus and sidecars remain synchronized, clamp to the viewport, and preserve their spring origin as the assistant is resized.'},
      {kind:'image', artifact:'test-evidence'},
      {kind:'visualizer', artifact:'architecture-map'}
    ],
    plan: [
      {kind:'user', text:'Create a Deep Plan for a real Rust and Slint runtime product slice. Open it in the editor and ask me to approve, revise, or cancel it.'},
      {kind:'working', state:'validating', expanded:false},
      {kind:'assistant', text:'I created revision 2 of the native runtime Deep Plan and opened the full artifact in the editor. The durable card below remains available even if you dismiss the focused decision surface.'},
      {kind:'plan-card', artifact:'deep-plan-runtime'}
    ],
    provider: [
      {kind:'user', text:'Audit the model picker. Only configured providers should appear, favorites should open first, and effort plus Fast mode should live in the model sidecar.'},
      {kind:'working', state:'validating', expanded:true},
      {kind:'assistant', text:'The picker currently exposes four configured provider accounts and hides every unconfigured provider. Favorites is the initial scope, All groups models by provider, and the effort sidecar remains attached to the parent picker while it changes size.'}
    ],
    browser: [
      {kind:'user', text:'Control the browser, click every menu and submenu, resize every panel, and collect evidence for clipping, overlap, and scroll behavior.'},
      {kind:'working', state:'browser', expanded:true},
      {kind:'assistant', text:'The active browser pass is exercising selectors, nested sidecars, activity details, thread actions, decisions, context surfaces, and responsive pressure states. A recoverable failure remains visible instead of disappearing from the transcript.'}
    ],
    mermaid: [
      {kind:'user', text:'Show the runtime and artifact boundary as a Mermaid chart directly in chat.'},
      {kind:'working', state:'rendering', expanded:false},
      {kind:'assistant', text:'The diagram is registered as a Mermaid artifact with source and rendered views. Opening it preserves the artifact identity and editor tab.'},
      {kind:'mermaid', artifact:'mermaid-runtime'}
    ],
    visualizer: [
      {kind:'user', text:'Build an interactive usage dashboard and a data explorer. They should work in chat and open in the editor.'},
      {kind:'working', state:'rendering', expanded:false},
      {kind:'visualizer', artifact:'dashboard-usage'},
      {kind:'visualizer', artifact:'data-explorer'}
    ],
    goal: [
      {kind:'user', text:'Use Goal Mode to finish the assistant interaction audit without dropping evidence or unresolved blockers.'},
      {kind:'working', state:'permission', expanded:true},
      {kind:'assistant', text:'Goal Mode is paused at a production-schema policy boundary. The exact blocker, active tasks, evidence, plan summary, and lifecycle controls are available in Goal details.'}
    ],
    questions: [
      {kind:'user', text:'Ask me the missing planning questions, but let me close the questionnaire and come back later without losing anything.'},
      {kind:'working', state:'preparing', expanded:false},
      {kind:'assistant', text:'The question set is queued and durable. Closing it preserves the current page and every answer; it remains attached to this thread until submitted, skipped, explicitly cancelled, or the thread is deleted.'}
    ],
    image: [
      {kind:'user', text:'Generate a compact image of a stylized SVG dancer and let me open the full result in the editor.'},
      {kind:'working', state:'rendering', expanded:false},
      {kind:'assistant', text:'The generated image is registered as an artifact. The compact preview stays in the transcript and opens the full-size view in the editor.'},
      {kind:'image', artifact:'generated-dancer'}
    ],
    changes: [
      {kind:'user', text:'Show the files you changed and open each one at the exact modified span.'},
      {kind:'working', state:'editing', expanded:true},
      {kind:'assistant', text:'Four changes are registered with version, range, insertion, deletion, and review state. Select any change in Activity Details to open its exact fixture and highlighted line range.'}
    ],
    subagents: [
      {kind:'user', text:'Show me the active subagents inline, then let me open each ongoing child transcript without being able to modify it.'},
      {kind:'working', state:'subagents', expanded:true},
      {kind:'assistant', text:'Active agents remain visually separate while they work. Completed child activity folds into the receipt, and every child transcript opens read-only in the file editor panel.'}
    ],
    archive: [
      {kind:'user', text:'This is an archived historical thread. Keep it searchable and make restoration explicit.'},
      {kind:'assistant', text:'Archived threads remain searchable through both the history filter and global thread search. Restoring a thread returns it to Recent without changing its original transcript.'}
    ]
  };

  return {themes,families,recipes,providers,models,personas,modes,planThoroughness,permissions,worktrees,capabilities,threads,workingStates,subagents,todos,artifacts,fileChanges,questions,demos,slashCommands,transcriptScenarios};
})();
