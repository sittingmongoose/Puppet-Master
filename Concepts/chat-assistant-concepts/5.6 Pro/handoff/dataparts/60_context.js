
  /* =====================================================================
     contextSources[] + contextWindow -- absent before this wave.

     Every context figure in app.js was a literal: `64%`, `83.9K`, `78%`,
     `47.1K`, five hardcoded composition percentages with no token counts,
     and a growth chart drawn from two bare <path> elements. All of it now
     comes from here.

     Two rules the sibling concepts enforce and this fixture keeps:
       * `tokens` is an INTEGER count and is authoritative. `pct` is
         derived display sugar; where the two disagree, tokens wins.
       * segment colour is keyed to the FAMILY NAME, never to the array
         index, so a family keeps its colour between threads even when a
         thread has a different mix.

     The record differs per thread: `contextByThread` is keyed by thread
     id, and `D.contextSources` / `D.contextWindow` are the ACTIVE-thread
     view (thread `query`) for renderers that want the flat shape. A
     renderer that wants the current thread should read
     `contextByThread[threadId] || {sources: contextSources, window: contextWindow}`.

     Consumed by the Wave 3 Context agent (item 6). See DATA_HANDOFF.md.
     ===================================================================== */
  const CONTEXT_FAMILIES = {
    conversation: { family:'Conversation',              colour:'var(--accent)' },
    plans:        { family:'Plans and specifications',  colour:'var(--accent-2)' },
    files:        { family:'Files and code',            colour:'var(--positive)' },
    tools:        { family:'Tool and browser evidence', colour:'var(--warning)' },
    system:       { family:'System and provider',       colour:'var(--subtle)' },
    attachments:  { family:'Attachments and images',    colour:'var(--user)' }
  };

  /* mix: [familyId, tokens, superseded, detail] */
  function contextRecord(spec) {
    const used = spec.mix.reduce((s, m) => s + m[1], 0);
    const sources = spec.mix.map((m) => {
      const f = CONTEXT_FAMILIES[m[0]];
      return {
        id: m[0], family: f.family, colour: f.colour,
        tokens: m[1],
        pct: Math.round(m[1] / used * 1000) / 10,
        supersededTokens: m[2] || 0,
        detail: m[3]
      };
    });
    const cached = Math.round(used * spec.cacheHitPct / 100);
    return {
      threadId: spec.threadId,
      sources,
      window: {
        limit: spec.limit, used,
        cached, cacheHitPct: spec.cacheHitPct,
        available: spec.limit - used,
        pct: Math.round(used / spec.limit * 1000) / 10,
        inputThisTurn: spec.inputThisTurn, outputThisTurn: spec.outputThisTurn,
        product: 'Puppet Master Pro', connection: spec.connection,
        model: spec.model, account: spec.account,
        costApiUsd: spec.costApiUsd, costPlanUsd: spec.costPlanUsd,
        growth: spec.growth.map((g) => ({ at: at(g[0]), tokens: g[1] }))
      },
      compactionPreview: spec.compaction,
      /* u11's plan-limits block: product and connection meters with reset
         times. Invented for this concept, not ported. */
      limits: spec.limits
    };
  }

  const contextByThread = {};
  [
    { threadId:'query', limit:131000, cacheHitPct:78, inputThisTurn:12840, outputThisTurn:1486,
      connection:'anthropic-work', model:'Claude Sonnet 4.6', account:'Work · anthropic-work',
      costApiUsd:0.084, costPlanUsd:0.031,
      mix:[
        ['conversation', 28526, 0,    '18 turns in this thread, none superseded yet.'],
        ['plans',        18458, 4210, 'Plan revisions 1-3 are superseded by revision 4 and still loaded.'],
        ['files',        15102, 0,    '9 source files, 2 migrations, 1 benchmark fixture.'],
        ['tools',        11746, 1180, 'EXPLAIN ANALYZE output, 3 browser traces, 2 benchmark runs.'],
        ['system',        6068, 0,    'System prompt, tool definitions, provider policy.'],
        ['attachments',   4000, 0,    'One schema diagram, downsampled to 1024px.']
      ],
      growth:[[12,12400],[96,24800],[150,38200],[214,49600],[268,58400],[360,66900],[452,74100],[506,79200],[539,83900]],
      compaction:{ wouldRemove:18420, wouldRetain:65480, retains:['All active requirements','Every provenance handle','The current plan revision'],
        drops:['Plan revisions 1-3','Superseded browser traces','Duplicated file reads'],
        estimatedSeconds:9, reversible:true,
        note:'A source-aware compaction removes 18,420 tokens and leaves 65,480 loaded. Provenance handles survive so every dropped source can be rehydrated.' },
      limits:[
        { id:'session', label:'Session', used:64, resetAt:at(600), note:'Five-hour rolling window' },
        { id:'weekly', label:'Weekly', used:38, resetAt:at(6120), note:'Resets Monday 09:00 UTC' },
        { id:'output', label:'Output tokens', used:22, resetAt:at(600), note:'Per five-hour window' }
      ] },

    { threadId:'plain', limit:131000, cacheHitPct:91, inputThisTurn:3240, outputThisTurn:2180,
      connection:'anthropic-work', model:'Claude Sonnet 4.6', account:'Work · anthropic-work',
      costApiUsd:0.021, costPlanUsd:0.009,
      mix:[
        ['conversation', 41200, 0,   '26 prose turns; this thread is almost entirely conversation.'],
        ['plans',         2100, 0,   'One design note referenced twice.'],
        ['files',            0, 0,   'No files read in this thread.'],
        ['tools',            0, 0,   'No tools used in this thread.'],
        ['system',        6068, 0,   'System prompt, tool definitions, provider policy.'],
        ['attachments',      0, 0,   'None.']
      ],
      growth:[[20,4200],[60,9800],[140,18400],[240,27100],[340,35600],[440,43900],[500,47800],[539,49368]],
      compaction:{ wouldRemove:6100, wouldRetain:43268, retains:['Every decision and its reason','The rejected options and why'],
        drops:['Restatements of decisions already recorded'],
        estimatedSeconds:4, reversible:true,
        note:'A prose thread compacts poorly and this one is only 38% of the window, so compaction is offered but not recommended.' },
      limits:[
        { id:'session', label:'Session', used:64, resetAt:at(600), note:'Five-hour rolling window' },
        { id:'weekly', label:'Weekly', used:38, resetAt:at(6120), note:'Resets Monday 09:00 UTC' }
      ] },

    { threadId:'subagents', limit:196000, cacheHitPct:64, inputThisTurn:21400, outputThisTurn:980,
      connection:'anthropic-work', model:'Claude Opus 5', account:'Work · anthropic-work',
      costApiUsd:0.412, costPlanUsd:0.164,
      mix:[
        ['conversation', 19800, 0,     '14 parent turns.'],
        ['plans',         8400, 0,     'The concept plan and the fixture schema contract.'],
        ['files',        52600, 12400, '41 files harvested; 12,400 tokens are re-reads of files already in context.'],
        ['tools',        31200, 0,     'Class harvest, orphan gate output, theme sweep results.'],
        ['system',        9100, 0,     'Larger tool surface: 14 tools plus child-agent policy.'],
        ['attachments',      0, 0,     'None.']
      ],
      growth:[[120,18200],[200,38400],[300,61800],[400,88200],[470,104600],[510,114900],[539,121100]],
      compaction:{ wouldRemove:34800, wouldRetain:86300, retains:['The class union','Every gate result','Child-agent conclusions'],
        drops:['12,400 tokens of duplicate file reads','Intermediate harvest output superseded by the union'],
        estimatedSeconds:14, reversible:true,
        note:'This is the thread where compaction actually pays: 12,400 tokens are literal duplicate file reads.' },
      limits:[
        { id:'session', label:'Session', used:81, resetAt:at(600), note:'Five-hour rolling window · approaching the cap' },
        { id:'weekly', label:'Weekly', used:52, resetAt:at(6120), note:'Resets Monday 09:00 UTC' },
        { id:'opus', label:'Opus 5 share', used:74, resetAt:at(600), note:'Opus draws from the same session budget at 5x weight' }
      ] },

    { threadId:'debug', limit:200000, cacheHitPct:52, inputThisTurn:8600, outputThisTurn:640,
      connection:'kimi-main', model:'Kimi K3', account:'Kimi Coding · kimi-main',
      costApiUsd:0.032, costPlanUsd:0.011,
      mix:[
        ['conversation', 12400, 0,    '16 debugging turns, mostly short.'],
        ['plans',         1800, 0,    'The probe conversion note.'],
        ['files',        14900, 0,    'The probe suite and two renderers.'],
        ['tools',        48200, 9400, 'Console logs, network waterfalls, and 118 page loads of reproduction evidence.'],
        ['system',        7100, 0,    'Browser program tool definitions.'],
        ['attachments',  11600, 0,    'Six screenshots of the blank dashboard.']
      ],
      growth:[[196,14200],[260,32800],[330,51400],[420,71900],[490,86200],[520,93100],[539,96000]],
      compaction:{ wouldRemove:26800, wouldRetain:69200, retains:['The three reproductions','The route-change correlation'],
        drops:['9,400 tokens of network waterfalls from loads that did not reproduce','Four near-duplicate screenshots'],
        estimatedSeconds:11, reversible:true,
        note:'115 of 118 page loads produced nothing. Their evidence is the obvious thing to drop.' },
      limits:[
        { id:'session', label:'Session', used:19, resetAt:at(720), note:'Moonshot bills per token, no rolling cap' }
      ] },

    { threadId:'context', limit:131000, cacheHitPct:83, inputThisTurn:4200, outputThisTurn:1120,
      connection:'kimi-main', model:'Kimi K3', account:'Kimi Coding · kimi-main',
      costApiUsd:0.014, costPlanUsd:0.006,
      mix:[
        ['conversation', 16800, 3400, '12 turns; 3,400 tokens are already muted and retained for rehydration.'],
        ['plans',         5200, 0,    'The Context Lens requirement extract.'],
        ['files',        22400, 8900, 'Six superseded concept folders, muted but still resident.'],
        ['tools',         3100, 0,    'One subcompact preview.'],
        ['system',        6068, 0,    'System prompt, tool definitions, provider policy.'],
        ['attachments',      0, 0,    'None.']
      ],
      growth:[[44,6200],[140,14800],[240,22400],[340,32900],[440,42600],[500,50100],[539,53568]],
      compaction:{ wouldRemove:12300, wouldRetain:41268, retains:['Every rehydration handle','The current renderer and its tests'],
        drops:['The six superseded concept folders, permanently rather than muted'],
        estimatedSeconds:6, reversible:false,
        note:'This one is NOT reversible: it drops sources that are currently muted-but-resident, so their rehydration handles go with them.' },
      limits:[
        { id:'session', label:'Session', used:19, resetAt:at(720), note:'Moonshot bills per token, no rolling cap' }
      ] },

    { threadId:'no-models', limit:128000, cacheHitPct:0, inputThisTurn:0, outputThisTurn:0,
      connection:'none', model:'No configured model', account:'—',
      costApiUsd:0, costPlanUsd:0,
      mix:[
        ['conversation',  2100, 0, 'Two turns before the route failed.'],
        ['plans',            0, 0, 'None.'],
        ['files',            0, 0, 'None.'],
        ['tools',            0, 0, 'None.'],
        ['system',        6068, 0, 'System prompt and provider policy are loaded even with no route.'],
        ['attachments',      0, 0, 'None.']
      ],
      growth:[[500,2100],[520,8168],[539,8168]],
      compaction:{ wouldRemove:0, wouldRetain:8168, retains:['Everything'], drops:[],
        estimatedSeconds:0, reversible:true,
        note:'Nothing to compact: the thread never got a route. Compact Now is offered and correctly reports no gain.' },
      limits:[] }
  ].forEach((spec) => { contextByThread[spec.threadId] = contextRecord(spec); });

  /* Flat active-thread view, for renderers that want one array. */
  const contextSources = contextByThread.query.sources;
  const contextWindow = contextByThread.query.window;
  const contextCompaction = contextByThread.query.compactionPreview;

  /* The seven outcomes a Compact Now state machine has to be able to
     report. "Compact Now" that always succeeds is a placeholder, not a
     concept. */
  const compactionOutcomes = [
    { id:'completed', tone:'ok', title:'Context compacted', detail:'Removed 18,420 tokens. 65,480 loaded. Every dropped source kept its rehydration handle.' },
    { id:'no-gain', tone:'info', title:'Nothing to compact', detail:'No superseded or duplicated sources were found. The window is already minimal.' },
    { id:'partial', tone:'ok', title:'Partly compacted', detail:'Removed 6,100 of a possible 18,420 tokens. The rest is pinned by active requirements.' },
    { id:'deferred', tone:'info', title:'Deferred', detail:'A turn is in flight. Compaction will run once it completes rather than mid-stream.' },
    { id:'timed-out', tone:'warn', title:'Timed out', detail:'The compaction pass exceeded 30s and was abandoned. Nothing was changed.' },
    { id:'failed', tone:'warn', title:'Compaction failed', detail:'A source could not be re-read, so the pass was rolled back rather than applied partially.' },
    { id:'declined', tone:'info', title:'Not recommended', detail:'This thread is at 38% of its window. Compaction is available but would cost more provenance than it saves.' }
  ];
