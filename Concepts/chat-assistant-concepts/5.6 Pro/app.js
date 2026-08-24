(() => {
  'use strict';

  const D = window.PM56_DATA;
  const M = window.PM56_MOTION;
  if (!D) throw new Error('PM56_DATA was not loaded.');

  const clone = (v) => JSON.parse(JSON.stringify(v));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const safeStorage = {
    get(k){ try { return localStorage.getItem(k); } catch { return null; } },
    set(k,v){ try { localStorage.setItem(k,v); } catch {} },
    del(k){ try { localStorage.removeItem(k); } catch {} }
  };
  const uid = (p='id') => `${p}-${Math.random().toString(36).slice(2,9)}-${Date.now().toString(36)}`;

  const PATHS = {
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    settings:'<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.55-1.03H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1.03-1.55V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9c.2.6.8 1 1.55 1H21v4h-.08c-.75 0-1.35.4-1.52 1Z"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>', down:'<path d="m6 9 6 6 6-6"/>', up:'<path d="m18 15-6-6-6 6"/>', left:'<path d="m15 18-6-6 6-6"/>',
    check:'<path d="m5 12 4 4L19 6"/>', plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>',
    pin:'<path d="m12 17 0 5M5 3l14 0M7 3l1 8-3 3h14l-3-3 1-8"/>', unpin:'<path d="m5 3 14 18M7 3l1 8-3 3h9M17 3l-1 6M12 17v5"/>',
    archive:'<path d="M4 7v13h16V7M3 3h18v4H3zM9 11h6"/>', restore:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>', edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>', fork:'<circle cx="6" cy="4" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="20" r="2"/><path d="M6 6v12M8 9c5 0 5-3 8-3"/>',
    copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>', branch:'<path d="M6 3v12a4 4 0 0 0 4 4h8"/><circle cx="6" cy="3" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 9h7a4 4 0 0 0 4-4V3"/><circle cx="17" cy="3" r="2"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', play:'<path d="m8 5 11 7-11 7Z"/>', pause:'<path d="M9 5v14M15 5v14"/>', step:'<path d="m7 5 9 7-9 7zM18 5v14"/>', stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',
    send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>', attach:'<path d="m21 11-8.5 8.5a6 6 0 0 1-8.5-8.5L13 2a4 4 0 0 1 5.7 5.7l-9 9a2 2 0 0 1-2.8-2.8L15 5.8"/>', wand:'<path d="m15 4 5 5L8 21H3v-5Z"/><path d="m14 5 5 5M6 4V2M5 3H3M20 17v-2M21 16h2M19 3V1M18 2h-2"/>',
    sparkles:'<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z"/><path d="m5 14 .8 1.7L8 16.5l-2.2.8L5 19l-.8-1.7L2 16.5l2.2-.8Z"/>',
    goal:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M20 4 15 9"/>', todo:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2"/>', users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>', changes:'<path d="M4 7h11M4 17h16M15 4l3 3-3 3M9 14l-3 3 3 3"/>', artifact:'<path d="M4 3h12l4 4v14H4z"/><path d="M16 3v5h5M8 13h8M8 17h6"/>',
    brain:'<path d="M9.5 4A3.5 3.5 0 0 0 6 7.5v.4A3.5 3.5 0 0 0 4 11a3.5 3.5 0 0 0 2.2 3.25A3.5 3.5 0 0 0 9.5 19H11V4ZM14.5 4A3.5 3.5 0 0 1 18 7.5v.4a3.5 3.5 0 0 1 2 3.1 3.5 3.5 0 0 1-2.2 3.25A3.5 3.5 0 0 1 14.5 19H13V4Z"/><path d="M7 10h4M13 8h4M13 14h4"/>',
    'folder-search':'<path d="M3 5h6l2 2h10v12H3z"/><circle cx="12" cy="13" r="3"/><path d="m14.5 15.5 2 2"/>', download:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>', globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>', terminal:'<path d="m4 7 5 5-5 5M11 17h9"/>', 'file-edit':'<path d="M4 3h11l5 5v13H4z"/><path d="M15 3v5h5M9 17l1-4 6-6 3 3-6 6Z"/>', 'monitor-play':'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4M10 7l5 3-5 3Z"/>', flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 14h8"/>', 'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>', chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>', eyeoff:'<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.5 5.2A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-2.1 2.8M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.8 9.8 0 0 0 4.4-1"/>',
    filter:'<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>', collapse:'<path d="m8 3 4 4 4-4M8 21l4-4 4 4"/>', expand:'<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>',
    lightning:'<path d="M13 2 4 14h7l-1 8 10-13h-7Z"/>', star:'<path d="m12 2 3 6 7 .9-5 4.8 1.3 6.8L12 17l-6.3 3.5L7 13.7 2 8.9 9 8Z"/>',
    document:'<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/>', image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>', code:'<path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 4l-4 16"/>',
    warning:'<path d="M12 3 2 21h20Z"/><path d="M12 9v5M12 17h.01"/>', lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>', refresh:'<path d="M20 11a8 8 0 1 0-2 5.3M20 4v7h-7"/>'
  };
  function icon(name, size=15, cls='') {
    const paths = PATHS[name] || PATHS.info;
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  const DEFAULT = {
    theme:'basic-dark', recipe:0, variants:[0,0,0,0,0,0,0], selectedThread:'query',
    threads:clone(D.threads), editorTabs:['plan-query'], activeEditor:'plan-query', editorMode:{},
    historyMode:'pinned', historySearch:'', historyWidth:224, editorWidth:54, activityWidth:310,
    activity:{open:false,pinned:false,domain:'goal',filterVisible:true,expanded:['goal','todo','subagents','changes','artifacts']},
    context:{compact:false,details:false,compacted:false},
    menu:null, hover:null, dialog:null, toast:[],
    model:'sonnet46', modelView:'favorites', modelProvider:'all', modelSearch:'', effort:'High', fast:true,
    persona:'Product Manager', mode:'Agent', thoroughness:'Thorough', permissions:'Auto', worktree:'feature/query-index',
    capabilities:{goal:true,crew:false,bsd:'Auto',context:'Auto',eli5:false,thought:'Auto'},
    messageExpanded:{}, messageDetails:{}, work:{step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null},
    decision:null, questionIndex:0, questions:clone(D.questions), questionQueue:2,
    composer:'', drafts:{}, draftHistory:{}, planRevision:3, planStatus:'ready',
    artifactState:{quizAnswer:null,dataFilter:'all',mermaidSource:false,chartMetric:'p95',retrying:false},
    activityFilter:null, demoAutoStart:true, newMessageCount:0
  };

  let state = clone(DEFAULT);
  let workTimer = null;
  let hoverTimer = null;
  let submenuTimer = null;
  let dragState = null;

  function activeThread() { return state.threads.find(t => t.id === state.selectedThread) || state.threads[0]; }
  function selectedModel() { return D.models.find(m => m.id === state.model) || D.models[0]; }
  function workStep() { return D.workSteps[clamp(state.work.step,0,D.workSteps.length-1)]; }
  function isNarrow() { return window.innerWidth < 821; }
  function isPhone() { return window.innerWidth < 591; }
  function savePrefs() {
    safeStorage.set('pm56-prefs', JSON.stringify({theme:state.theme,historyMode:state.historyMode,historyWidth:state.historyWidth,editorWidth:state.editorWidth,activityWidth:state.activityWidth,model:state.model,effort:state.effort,fast:state.fast,capabilities:state.capabilities}));
  }
  function loadPrefs() {
    const raw = safeStorage.get('pm56-prefs'); if (!raw) return;
    try { Object.assign(state, JSON.parse(raw)); } catch {}
  }
  loadPrefs();

  function statusLabel(s){ return ({working:'Working',reviewing:'Reviewing',waiting:'Waiting',idle:'Ready',complete:'Complete',blocked:'Blocked',failed:'Failed',paused:'Paused',recovering:'Recovering'}[s] || s); }
  function renderStatus(thread, variant=0) {
    const s=thread.status, p=s==='complete'?100:s==='working'?68:s==='reviewing'?52:s==='blocked'?31:44;
    if (variant===0) return `<span class="status-dot ${s}" title="${esc(statusLabel(s))}"></span>`;
    if (variant===1) return `<span class="status-ring" style="--progress:${p}%" title="${esc(statusLabel(s))}"></span>`;
    if (variant===2) return `<span class="status-bars" title="${esc(statusLabel(s))}"><i></i><i></i><i></i></span>`;
    if (variant===3) return `<span class="status-branch" title="${esc(statusLabel(s))}"></span>`;
    if (variant===4) return `<span class="status-word" title="${esc(statusLabel(s))}">${esc(statusLabel(s).slice(0,4))}</span>`;
    if (variant===5) return `<span class="status-orbit" title="${esc(statusLabel(s))}"></span>`;
    if (variant===6) return `<span class="status-clock" title="${esc(statusLabel(s))}"></span>`;
    return `<span class="status-underline" title="${esc(statusLabel(s))}"></span>`;
  }

  function renderHeader() {
    return `<header class="app-header">
      <div class="brand"><i class="brand-mark"></i><span>Puppet Master</span><small>Assistant Concept Lab</small></div>
      <div class="header-spacer"></div>
      <div class="header-actions">
        <button class="header-chip" data-action="toggle-history" title="Thread history">${icon('history',14)}<span class="optional">Threads</span></button>
        <button class="header-chip" data-action="open-demo" title="Open the complete demo and component mixer">${icon('sparkles',14)}<span class="label">Demo Studio</span></button>
        <button class="header-chip" data-action="reset-all" title="Reset the entire concept to its stock state">${icon('reset',14)}<span class="optional">Reset</span></button>
      </div>
    </header>`;
  }

  function renderEditor() {
    return `<section class="editor-pane">
      <div class="editor-tabs">${state.editorTabs.map(id => {
        const a=D.artifacts.find(x=>x.id===id); const ag=D.subagents.find(x=>`thread-${x.id}`===id); const label=a?.title || ag?.name || (id==='goal-artifact'?'Active Goal':'Untitled');
        return `<button class="editor-tab ${state.activeEditor===id?'active':''}" data-action="select-editor" data-id="${esc(id)}" title="${esc(label)}"><span class="editor-tab-label">${esc(label)}</span><span class="close" data-action="close-editor" data-id="${esc(id)}">${icon('close',12)}</span></button>`;
      }).join('')}</div>
      <div class="editor-body" data-scroll-key="editor">${renderEditorBody()}</div>
    </section>`;
  }

  function renderEditorBody() {
    const id=state.activeEditor;
    if (!id) return `<div class="editor-empty">${icon('document',28)}<div><strong>No artifact open</strong><br><span>Plans, files, visual artifacts, links, and child-agent threads open here.</span></div></div>`;
    const agent=D.subagents.find(a=>`thread-${a.id}`===id);
    if (agent) return renderAgentEditor(agent);
    if (id==='goal-artifact') return renderGoalEditor();
    const art=D.artifacts.find(a=>a.id===id);
    if (art) return renderArtifactEditor(art);
    if (id.startsWith('file:')) return renderFileEditor(id.slice(5));
    return `<article class="editor-doc"><h1>${esc(id)}</h1><p>This editor tab demonstrates a durable Puppet Master file-editor destination.</p></article>`;
  }

  function renderGoalEditor(){
    return `<article class="editor-doc"><h1>Optimize analytics query performance</h1><div class="editor-meta"><span class="meta-pill">Running</span><span class="meta-pill">Revision 4</span><span class="meta-pill">Goal Mode</span><span class="meta-pill">feature/query-index</span></div><p>Reduce the tenant-scoped analytics query p95 below 100 ms without exceeding the accepted write-amplification threshold, while preserving a verified rollback path.</p><h2>Current phase</h2><p>Evaluating composite index column order and reconciling the Query Analyzer recommendation with the blocked Schema Reviewer.</p><h2>Acceptance evidence</h2><div class="code-block">p95 baseline       482 ms
p95 candidate       71 ms
unit/integration     42 passed
browser assertions  14 passed
write overhead       +4.8%</div><h2>Subgoals</h2><p>1. Measure the current path. 2. Remove N+1 fan-out. 3. Validate the migration and browser workflow. 4. Produce durable evidence and rollback guidance.</p></article>`;
  }

  function renderAgentEditor(agent){
    return `<article class="editor-doc"><h1>${esc(agent.name)}</h1><div class="editor-meta"><span class="meta-pill">Read-only child thread</span><span class="meta-pill">${esc(agent.status)}</span><span class="meta-pill">${esc(agent.model)}</span><span class="meta-pill">${esc(agent.elapsed)}</span></div><p><strong>Parent:</strong> ${esc(agent.parent)} · <strong>Current:</strong> ${esc(agent.current)}</p>${agent.blocker?`<div class="event-card danger"><span class="event-icon">${icon('lock',14)}</span><div class="event-copy"><strong>Blocked</strong><p>${esc(agent.blocker)}</p></div></div>`:''}<h2>Live transcript</h2>${agent.messages.map(m=>m.type==='text'?`<div class="system-card" style="margin:8px 0"><div class="system-card-head"><span class="title">${esc(agent.name)}</span><span class="sub">${esc(agent.model)}</span></div><div class="system-card-body">${formatText(m.body)}</div></div>`:`<div class="event-card ${m.type==='blocked'?'danger':''}" style="margin:8px 0"><span class="event-icon">${icon(m.type==='blocked'?'lock':'artifact',14)}</span><div class="event-copy"><strong>${esc(m.title||m.type)}</strong><p>${esc(m.detail||'')}</p></div></div>`).join('')}<p class="chat-meta">This child transcript updates live but has no composer or mutation controls.</p></article>`;
  }
  function renderArtifactEditor(art){
    const meta=`<div class="editor-meta"><span class="meta-pill">${esc(art.kind)}</span><span class="meta-pill">Version ${art.version}</span><span class="meta-pill">${esc(art.status)}</span><span class="meta-pill">${esc(art.updated)}</span></div>`;
    let body='';
    if (art.kind==='plan') body=renderPlanDocument(art);
    else if (art.kind==='mermaid') body=renderMermaidEditor(art);
    else if (art.kind==='dashboard') body=renderDashboardEditor(art);
    else if (art.kind==='data') body=renderDataExplorer(art);
    else if (art.kind==='quiz') body=renderQuizEditor(art);
    else if (art.kind==='periodic') body=renderPeriodicEditor(art);
    else if (art.kind==='architecture') body=renderArchitectureEditor(art);
    else if (art.kind==='flowchart') body=renderFlowEditor(art);
    else if (art.kind==='chart') body=renderChartEditor(art);
    else if (art.kind==='image') body=renderImageEditor(art);
    else if (art.kind==='evidence') body=renderEvidenceEditor(art);
    else body=`<p>${esc(art.summary)}</p><div class="code-block">Artifact source, versions, lineage, export, retry, and fallback views appear here.</div>`;
    return `<article class="editor-doc"><h1>${esc(art.title)}</h1>${meta}${art.status==='stale'?`<div class="event-card warning"><span class="event-icon">${icon('warning',14)}</span><div class="event-copy"><strong>A newer source revision exists</strong><p>Open version history, refresh this view, or keep the pinned version.</p></div></div>`:''}${art.status==='error'?`<div class="event-card danger"><span class="event-icon">${icon('warning',14)}</span><div class="event-copy"><strong>Renderer failed safely</strong><p>The source artifact is intact. Use source fallback or retry the native renderer.</p></div><button class="soft-button" data-action="retry-artifact" data-id="${esc(art.id)}">${icon('refresh',13)} Retry</button></div>`:''}${body}</article>`;
  }

  function renderPlanDocument(art){
    return `<p>${esc(art.summary)}</p><h2>Decision</h2><p>Use a tenant-first composite index as the reversible first step. Remove N+1 fan-out in the same change. Keep the materialized-view design as an explicitly gated follow-up.</p><h2>Build sequence</h2><div class="code-block">1. Capture baseline EXPLAIN ANALYZE evidence
2. Add concurrent tenant_id + created_at index
3. Batch event lookup and remove N+1 queries
4. Run unit, integration, browser, and benchmark gates
5. Compare write amplification against the 8% limit
6. Approve, revise, cancel, or build from the durable chat card</div><h2>Acceptance</h2><p>p95 below 100 ms, no incorrect tenant crossover, write overhead below 8%, all tests green, and a rehearsed forward rollback migration.</p><h2>Revision history</h2><p>Revision 3 added the rollback gate, materialized-view fallback, owner, and benchmark evidence package.</p>`;
  }

  function renderMermaidEditor(art){
    const source=`flowchart LR
  Chat[Chat Thread] --> Work[Inline Working Animation]
  Chat --> Activity[Chat Activity Bar]
  Activity --> Detail[Activity Detail]
  Detail --> Editor[File Editor]
  Work --> Agents[Read-only Child Threads]
  Chat --> Artifact[Native Visual Artifacts]`;
    if(state.artifactState.mermaidSource) return `<div class="plan-actions"><button class="soft-button" data-action="toggle-mermaid-source">${icon('eye',13)} Render</button><button class="soft-button" data-action="copy-mermaid">${icon('copy',13)} Copy source</button></div><div class="code-block">${esc(source)}</div>`;
    return `<div class="plan-actions"><button class="soft-button" data-action="toggle-mermaid-source">${icon('code',13)} Source</button><button class="soft-button" data-action="open-artifact" data-id="${esc(art.id)}">${icon('expand',13)} Fit</button></div><div class="artifact-preview mermaid" style="min-height:330px"><svg viewBox="0 0 760 300" width="100%" height="100%"><defs><linearGradient id="mg" x1="0" x2="1"><stop stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--muted)"/></marker></defs>${[['Chat Thread',30,120],['Working Animation',225,42],['Activity Bar',225,120],['Visual Artifacts',225,198],['Activity Detail',440,120],['Editor + Child Threads',575,120]].map((n,i)=>`<g><rect x="${n[1]}" y="${n[2]}" width="150" height="48" rx="12" fill="${i===0?'url(#mg)':'var(--surface-3)'}" stroke="var(--border-strong)"/><text x="${n[1]+75}" y="${n[2]+29}" fill="${i===0?'white':'var(--text)'}" text-anchor="middle" font-size="12" font-family="var(--font-ui)">${n[0]}</text></g>`).join('')}<g fill="none" stroke="var(--muted)" stroke-width="2" marker-end="url(#arr)"><path d="M180 144 C205 144 205 66 225 66"/><path d="M180 144H225"/><path d="M180 144 C205 144 205 222 225 222"/><path d="M375 144H440"/><path d="M590 144H575"/></g></svg></div>`;
  }

  function renderDashboardEditor(){
    const metrics=[['p50','31 ms','−79%'],['p95','71 ms','−86%'],['Throughput','1,840/s','+164%'],['Cache hit','78%','+21 pt'],['Write overhead','4.8%','within gate'],['Rows scanned','1.2k','−98%']];
    return `<div class="plan-actions"><button class="soft-button" data-action="chart-metric" data-value="p95">p95</button><button class="soft-button" data-action="chart-metric" data-value="throughput">Throughput</button><button class="soft-button" data-action="chart-metric" data-value="cache">Cache</button></div><div class="metric-grid" style="grid-template-columns:repeat(3,1fr)">${metrics.map(m=>`<div class="metric-card"><label>${m[0]}</label><strong>${m[1]}</strong><span style="color:var(--positive);font-size:9px">${m[2]}</span></div>`).join('')}</div><h2>${esc(state.artifactState.chartMetric)} comparison</h2><div class="artifact-preview" style="min-height:280px"><div class="mini-graph" style="height:260px">${[38,62,45,82,56,91,68,43,77,100,72,88].map((h,i)=>`<i style="height:${h}%;animation-delay:${i*35}ms" title="Run ${i+1}: ${h}"></i>`).join('')}</div></div>`;
  }

  function renderDataExplorer(){
    const rows=[['tenant-084','dashboard','71 ms','hit','Index Scan'],['tenant-021','export','83 ms','miss','Index Scan'],['tenant-084','cohort','52 ms','hit','Index Only'],['tenant-103','dashboard','109 ms','miss','Index Scan'],['tenant-021','events','41 ms','hit','Index Only']];
    const filter=state.artifactState.dataFilter;
    const shown=filter==='all'?rows:rows.filter(r=>r[3]===filter);
    return `<div class="plan-actions"><button class="soft-button" data-action="data-filter" data-value="all">All</button><button class="soft-button" data-action="data-filter" data-value="hit">Cache hits</button><button class="soft-button" data-action="data-filter" data-value="miss">Cache misses</button></div><div class="code-block" style="white-space:normal;padding:0;overflow:auto"><table style="width:100%;border-collapse:collapse;font:11px var(--font-mono)"><thead><tr>${['Tenant','Route','Duration','Cache','Plan'].map(h=>`<th style="text-align:left;padding:9px;border-bottom:1px solid var(--border)">${h}</th>`).join('')}</tr></thead><tbody>${shown.map(r=>`<tr>${r.map(c=>`<td style="padding:9px;border-bottom:1px solid var(--border);color:${c==='hit'?'var(--positive)':c==='miss'?'var(--warning)':'inherit'}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function renderQuizEditor(){
    const ans=state.artifactState.quizAnswer;
    return `<p>Which index order best matches a query filtered by equality on <code>tenant_id</code> and sorted by newest <code>created_at</code>?</p><div class="choice-grid">${['created_at, tenant_id','tenant_id, created_at','event_type, tenant_id','created_at only'].map((x,i)=>`<button class="choice ${ans===i?'selected':''}" data-action="quiz-answer" data-value="${i}">${esc(x)}</button>`).join('')}</div>${ans!==null?`<div class="event-card ${ans===1?'positive':'warning'}" style="margin-top:10px"><span class="event-icon">${icon(ans===1?'check':'info',14)}</span><div class="event-copy"><strong>${ans===1?'Correct':'Review the leading-column rule'}</strong><p>${ans===1?'Equality on tenant_id belongs first; created_at then supports the ordered range.':'The leading column should match the stable equality predicate in this workload.'}</p></div></div>`:''}`;
  }

  function renderPeriodicEditor(){
    const cells=[['FE','Frontend','A'],['BE','Backend','A'],['DB','Database','S'],['BR','Browser','A'],['MO','Motion','S'],['PL','Planning','A'],['AU','Audit','S'],['RS','Rust','A'],['SL','Slint','A'],['SE','Security','B'],['DX','Developer UX','A'],['ML','Models','S']];
    return `<p>Capability cells combine qualification, freshness, specialty, model cost, and current availability.</p><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:7px">${cells.map((c,i)=>`<button class="choice" data-action="periodic-cell" data-value="${esc(c[1])}" style="aspect-ratio:1;display:grid;place-items:center;text-align:center;background:${i%3===0?'color-mix(in srgb,var(--accent) 12%,var(--surface-3))':'var(--surface-3)'}"><strong style="font-size:18px">${c[0]}</strong><span style="font-size:8px;color:var(--muted)">${c[1]}</span><b style="font-size:9px;color:var(--positive)">${c[2]}</b></button>`).join('')}</div>`;
  }

  function renderArchitectureEditor(){
    return `<div class="artifact-preview" style="min-height:360px"><svg viewBox="0 0 820 360" width="100%" height="100%">${[['TrueNAS Server',330,130,160,76],['Windows Host',50,45,150,58],['Mac Client',55,255,150,58],['Linux Host',620,45,150,58],['Web Client',615,255,150,58]].map((n,i)=>`<g><rect x="${n[1]}" y="${n[2]}" width="${n[3]}" height="${n[4]}" rx="14" fill="${i===0?'color-mix(in srgb,var(--accent) 22%,var(--surface-3))':'var(--surface-3)'}" stroke="var(--border-strong)"/><text x="${n[1]+n[3]/2}" y="${n[2]+n[4]/2}" fill="var(--text)" text-anchor="middle" font-family="var(--font-ui)" font-size="13">${n[0]}</text></g>`).join('')}<g stroke="var(--accent-2)" fill="none" stroke-width="2" stroke-dasharray="6 5"><path d="M200 74 330 150"/><path d="M205 284 330 190"/><path d="M620 74 490 150"/><path d="M615 284 490 190"/></g></svg></div>`;
  }
  function renderFlowEditor(){ return `<div class="artifact-preview" style="min-height:320px"><svg viewBox="0 0 760 300" width="100%" height="100%"><g font-family="var(--font-ui)" font-size="12" text-anchor="middle">${[['Plan created',40,120,130],['Review',210,120,110],['Approve',390,45,110],['Revise',390,120,110],['Cancel',390,195,110],['Build',580,45,110],['Durable card',580,160,130]].map((n,i)=>`<g><rect x="${n[1]}" y="${n[2]}" width="${n[3]}" height="46" rx="12" fill="${i===0?'var(--accent)':'var(--surface-3)'}" stroke="var(--border-strong)"/><text x="${n[1]+n[3]/2}" y="${n[2]+28}" fill="${i===0?'white':'var(--text)'}">${n[0]}</text></g>`).join('')}</g><g stroke="var(--muted)" fill="none" stroke-width="2"><path d="M170 143H210M320 143C350 143 350 68 390 68M320 143H390M320 143C350 143 350 218 390 218M500 68H580M500 143C540 143 540 183 580 183M500 218C540 218 540 183 580 183"/></g></svg></div>`; }
  function renderChartEditor(){ return renderDashboardEditor(); }
  function renderImageEditor(){ return `<div class="artifact-preview" style="min-height:520px"><div class="generated-scene"></div><div style="position:absolute;inset:12%;border:1px solid rgb(255 255 255/.18);border-radius:28px;background:rgb(8 10 22/.55);backdrop-filter:blur(16px);display:grid;grid-template-columns:180px 1fr;overflow:hidden"><div style="border-right:1px solid rgb(255 255 255/.12);padding:20px"><div style="height:14px;width:80%;border-radius:7px;background:rgb(255 255 255/.18);margin-bottom:18px"></div>${[1,2,3,4,5].map(i=>`<div style="height:32px;border-radius:10px;background:${i===2?'rgb(171 130 255/.35)':'rgb(255 255 255/.07)'};margin:7px 0"></div>`).join('')}</div><div style="padding:28px"><div style="height:26px;width:44%;border-radius:8px;background:rgb(255 255 255/.18)"></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:25px">${[1,2,3,4,5,6].map((_,i)=>`<div style="height:${i<3?110:160}px;border-radius:18px;background:linear-gradient(145deg,rgb(255 255 255/.13),rgb(255 255 255/.05));border:1px solid rgb(255 255 255/.12)"></div>`).join('')}</div></div></div></div>`; }
  function renderEvidenceEditor(){ return `<p>Browser, console, network, screenshot, and benchmark evidence are grouped by acceptance gate.</p><div class="metric-grid"><div class="metric-card"><label>Assertions</label><strong>14 / 14</strong></div><div class="metric-card"><label>Console errors</label><strong>0</strong></div><div class="metric-card"><label>Network failures</label><strong>0</strong></div></div><h2>Evidence log</h2><div class="code-block">09:41:12  Opened dashboard at 1440 × 900
09:41:14  Query card visible; no clipping
09:41:18  Opened Model picker and effort sidecar
09:41:22  Sidecar remained on root-menu side
09:41:28  Started browser-control Working Animation
09:41:43  Completed questionnaire morph
09:41:51  Console: clean
09:41:52  Network: clean</div>`; }

  function renderFileEditor(path){
    const c=D.changes.find(x=>x.path===path);
    const line=c?.line||1;
    return `<article class="editor-doc"><h1>${esc(path)}</h1><div class="editor-meta"><span class="meta-pill">Modified</span><span class="meta-pill">Focused at line ${line}</span><span class="meta-pill">${c?`+${c.add} −${c.del}`:'Working tree'}</span></div><p>${esc(c?.summary||'File opened from the Chat Activity Detail panel.')}</p><div class="code-block">${Array.from({length:18},(_,i)=>{const n=line-4+i;const cls=n===line?'focus':n>line&&n<line+4?'add':'';const txt=n===line?'CREATE INDEX CONCURRENTLY idx_events_tenant_created':n===line+1?'ON analytics_events (tenant_id, created_at DESC);':n===line+2?'-- rollback: DROP INDEX CONCURRENTLY idx_events_tenant_created;':'-- surrounding source and migration context';return `<span class="diff-line ${cls}">${String(n).padStart(4)}  ${esc(txt)}</span>`}).join('\n')}</div></article>`;
  }

  function renderHistoryContent(flyout=false){
    const q=state.historySearch.trim().toLowerCase();
    const filtered=state.threads.filter(t=>!q || `${t.title} ${t.summary} ${t.messages.map(m=>m.body||m.title||m.detail||'').join(' ')}`.toLowerCase().includes(q));
    const groups=[['Pinned',filtered.filter(t=>!t.archived&&t.pinned)],['Recent',filtered.filter(t=>!t.archived&&!t.pinned)],['Archived',filtered.filter(t=>t.archived)]];
    return `<div class="history-head"><button class="soft-button" data-action="new-thread">${icon('plus',13)} New thread</button><button class="icon-button" data-action="${flyout?'pin-history':'unpin-history'}" title="${flyout?'Pin history':'Unpin history'}">${icon(flyout?'pin':'unpin',13)}</button><button class="icon-button" data-action="close-history" title="Close history">${icon('close',13)}</button></div><div class="history-search"><label class="input-wrap">${icon('search',13)}<input data-input="history-search" value="${esc(state.historySearch)}" placeholder="Search active and archived threads…"></label></div><div class="history-scroll" data-scroll-key="history">${groups.map(([name,items])=>`<section><div class="section-head"><span>${name}</span><span class="count">${items.length}</span></div>${items.length?items.map(renderThreadRow).join(''):`<div style="padding:7px;color:var(--subtle);font-size:10px">No matching ${name.toLowerCase()} threads.</div>`}</section>`).join('')}</div>`;
  }

  function renderThreadRow(t){
    return `<div class="thread-row ${t.id===state.selectedThread?'active':''}" data-action="select-thread" data-id="${esc(t.id)}" tabindex="0"><span class="thread-status-slot">${renderStatus(t,state.variants[1])}</span><div class="thread-copy"><div class="thread-title"><span>${esc(t.title)}</span>${t.unread?`<span class="thread-unread">${t.unread}</span>`:''}</div><div class="thread-sub"><span>${esc(t.updated)}</span><span>·</span><span class="summary">${esc(t.summary)}</span></div></div><button class="icon-button thread-more" data-action="thread-menu" data-id="${esc(t.id)}" data-menu-anchor="thread-${esc(t.id)}" title="Thread options">${icon('more',14)}</button></div>`;
  }

  function renderHistory(){ return `<aside class="history-panel" data-history-variant="${state.variants[1]}">${renderHistoryContent(false)}<div class="panel-resize" data-resize="history"></div></aside>`; }
  function formatText(body){
    return esc(body).split(/\n{2,}/).map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
  }

  function renderChat(){
    const t=activeThread();
    return `<section class="chat-stage" data-shell="${state.variants[0]}">
      ${renderChatHeader(t)}
      <div class="transcript" data-variant="${state.variants[5]}" data-scroll-key="transcript"><div class="transcript-inner">${t.messages.map(m=>renderMessage(m,t)).join('')}</div></div>
      ${renderDecisionHost()}
      ${renderActivityBar()}
      ${renderComposer()}
      ${state.activity.open&&!state.activity.pinned?renderActivityPanel(true):''}
    </section>`;
  }

  function renderChatHeader(t){
    const m=selectedModel();
    return `<div class="chat-header">
      ${state.historyMode!=='pinned'?`<button class="icon-button" data-action="toggle-history" title="Open thread history">${icon('history',14)}</button>`:''}
      <div class="chat-title"><span>${esc(t.title)}</span><span class="chat-state"><i class="status-dot ${t.status}"></i>${esc(statusLabel(t.status))}</span></div>
      <span class="chat-meta">${esc(m.name)} · ${esc(state.mode)} · ${esc(state.worktree)}</span>
      <span class="chat-head-spacer"></span>
      <button class="icon-button" data-action="thread-search" data-menu-anchor="thread-search" title="Search this thread or every thread">${icon('search',14)}</button>
      <button class="context-ring" style="--context-pct:64" data-action="context-menu" data-menu-anchor="context-ring" data-value="64" title="Context 64% used"></button>
    </div>`;
  }

  function renderMessage(m,t){
    if(m.type==='text') return renderTextMessage(m);
    if(m.type==='working') return renderWorkingAnimation();
    if(m.type==='plan-card') return renderPlanCard(m);
    if(m.type==='artifact') return renderArtifactMessage(m);
    if(m.type==='live-agents') return renderLiveAgentsCard();
    return renderEventMessage(m);
  }

  /* Ordinal and wall-clock for a message, derived rather than stored so the
     fixtures need no change. The clock walks forward from a fixed start so a
     timeline reads sensibly and stays deterministic between renders. */
  function msgIndex(id){
    const t=activeThread(); if(!t) return 0;
    const i=t.messages.findIndex(x=>x.id===id);
    return i<0?0:i;
  }
  function msgClock(m){
    const i=msgIndex(m.id);
    const mins=(11*60+42)+i*3;
    return String(Math.floor(mins/60)%24).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');
  }

  function renderTextMessage(m){
    const expanded=!!state.messageExpanded[m.id], details=!!state.messageDetails[m.id];
    const isLong=m.long || String(m.body).length>460;
    return `<article class="message message-${m.role}" data-message-id="${esc(m.id)}" data-speaker="${m.role==='user'?'You':'Assistant'}" data-index="${msgIndex(m.id)}" data-time="${esc(msgClock(m))}" style="--msg-index:${msgIndex(m.id)}"><div class="message-surface">${m.role==='assistant'?`<div class="message-role">${icon('sparkles',12)} Assistant</div>`:''}<div class="message-body ${isLong&&!expanded?'long-fade':''}">${formatText(m.body)}</div>${isLong?`<button class="text-button" data-action="toggle-message" data-id="${esc(m.id)}">${icon(expanded?'collapse':'expand',12)} ${expanded?'Collapse':'Expand response'}</button>`:''}<div class="message-actions ${m.role==='assistant'?'always':''}"><button class="text-button" data-action="copy-message" data-id="${esc(m.id)}" title="Copy this message without changing the thread">${icon('copy',11)}<span>Copy</span></button>${m.role==='user'?`<button class="text-button" data-action="edit-message" data-id="${esc(m.id)}" title="Edit this user message and create a new branch from here">${icon('edit',11)}<span>Edit & branch</span></button>`:`<button class="text-button" data-action="reanswer-message" data-id="${esc(m.id)}" title="Create a new branch and answer again from the preceding user message">${icon('branch',11)}<span>Re-answer</span></button>`}<button class="text-button" data-action="message-details" data-id="${esc(m.id)}" title="Show model, provider, timing, context, cache, token, and cost details">${icon('info',11)}<span>More details</span></button></div>${details?renderMessageDetails(m):''}</div></article>`;
  }

  function renderMessageDetails(m){
    const model=m.role==='user'?'—':selectedModel().name;
    const vals=[['Provider',m.role==='user'?'Local':selectedModel().provider],['Account',m.role==='user'?'—':selectedModel().account],['Model',model],['Effort',m.role==='user'?'—':state.effort],['Persona',m.role==='user'?'—':state.persona],['Mode',state.mode],['Started','11:42:08'],['Completed','11:42:19'],['Duration',m.role==='user'?'—':'11.2s'],['Input tokens',m.role==='user'?'—':'12,840'],['Output tokens',m.role==='user'?'—':'1,486'],['Context used','64%'],['Cache hit',m.role==='user'?'—':'78%'],['Estimated cost',m.role==='user'?'—':'$0.084'],['Turn ID',m.id],['Terminal reason',m.role==='user'?'submitted':'complete']];
    return `<div class="message-details">${vals.map(v=>`<div class="detail-kv"><label>${esc(v[0])}</label><strong>${esc(v[1])}</strong></div>`).join('')}</div>`;
  }

  function renderPlanCard(m){
    const art=D.artifacts.find(a=>a.id===m.artifactId)||D.artifacts[0];
    return `<article class="system-card plan-card"><div class="system-card-head"><span class="event-icon">${icon('document',14)}</span><div><span class="title">${m.deep?'Deep Plan':'Created Plan'}</span><span class="sub"> · Revision ${state.planRevision}</span></div><span class="spacer"></span><span class="meta-pill">${m.deep?'Exhaustive':'Thorough'}</span></div><div class="system-card-body"><h3>${esc(art.title)}</h3><p>${esc(art.summary)}</p><div class="plan-actions"><button class="soft-button" data-action="open-artifact" data-id="${esc(art.id)}">${icon('eye',13)} View Plan</button><button class="soft-button" data-action="revise-plan" data-id="${esc(art.id)}">${icon('edit',13)} Revise</button><button class="primary-button" data-action="build-plan" data-id="${esc(art.id)}">${icon('play',13)} Build</button></div></div></article>`;
  }

  function renderArtifactMessage(m){
    const art=D.artifacts.find(a=>a.id===m.artifactId); if(!art) return '';
    let preview='';
    if(art.kind==='mermaid') preview=`<div class="artifact-preview mermaid"><svg viewBox="0 0 500 120" width="100%" height="100%"><g font-family="var(--font-ui)" font-size="10" text-anchor="middle"><rect x="20" y="38" width="100" height="42" rx="10" fill="var(--accent)"/><text x="70" y="63" fill="white">Chat</text><rect x="200" y="38" width="110" height="42" rx="10" fill="var(--surface-3)" stroke="var(--border-strong)"/><text x="255" y="63" fill="var(--text)">Activity</text><rect x="390" y="38" width="90" height="42" rx="10" fill="var(--surface-3)" stroke="var(--border-strong)"/><text x="435" y="63" fill="var(--text)">Editor</text></g><path d="M120 59h80M310 59h80" stroke="var(--muted)" stroke-width="2"/></svg></div>`;
    else if(art.kind==='dashboard'||art.kind==='chart') preview=`<div class="artifact-preview"><div class="mini-graph">${[35,58,42,76,51,91,67,84].map((h,i)=>`<i style="height:${h}%;animation-delay:${i*45}ms"></i>`).join('')}</div></div>`;
    else if(art.kind==='image') preview=`<div class="artifact-preview"><div class="generated-scene"></div></div>`;
    else preview=`<div class="artifact-preview" style="display:grid;place-items:center;color:var(--accent)">${icon(art.kind==='document'?'document':'chart',36)}</div>`;
    return `<article class="system-card"><div class="system-card-head"><span class="event-icon">${icon(art.kind==='image'?'image':art.kind==='mermaid'?'code':'artifact',14)}</span><div><span class="title">${esc(art.title)}</span><span class="sub"> · ${esc(art.kind)}</span></div><span class="spacer"></span><span class="meta-pill">${esc(art.status)}</span></div><div class="system-card-body">${preview}<div class="artifact-card"><div><strong>${esc(art.title)}</strong><p style="margin:3px 0 0;color:var(--muted);font-size:10px">${esc(art.summary)}</p></div><button class="soft-button" data-action="open-artifact" data-id="${esc(art.id)}">${icon('expand',13)} Open</button></div></div></article>`;
  }

  function renderLiveAgentsCard(){
    return `<article class="system-card"><div class="system-card-head"><span class="event-icon">${icon('users',14)}</span><div><span class="title">Live subagents</span><span class="sub"> · visible while working</span></div><span class="spacer"></span><span class="chat-state"><i class="status-dot working"></i>3 active</span></div><div class="system-card-body"><div class="live-agent-list">${D.subagents.slice(0,4).map(renderLiveAgentRow).join('')}</div></div></article>`;
  }

  function renderLiveAgentRow(a){
    return `<button class="live-agent-row" data-action="open-agent" data-id="${esc(a.id)}" title="Open the read-only live child thread"><span class="agent-avatar">${esc(a.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</span><span><span class="agent-name">${esc(a.name)}</span><span class="agent-now">${esc(a.current)}</span><span class="agent-progress"><i style="width:${a.progress}%"></i></span></span><span class="agent-state ${a.status}">${esc(a.status)}</span></button>`;
  }

  function renderEventMessage(m){
    const map={
      'question-receipt':['todo','Questionnaire waiting','warning'],'bsd-evaluating':['search','BSD evaluating',''],'bsd-advice':['warning','Back Seat Driver','warning'],'context-focus':['filter','Context Lens · Focus','positive'],'context-mute':['eyeoff','Context Lens · Mute',''],'context-subcompact':['collapse','Context Lens · Subcompact',''],'offline':['warning','Offline queue','warning'],'reconnected':['refresh','Reconnected','positive'],'attachment':['attach','Attachment','positive'],'attachment-error':['warning','Attachment routing','warning'],'tool-error':['warning','Tool failure','danger'],'permission':['lock','Permission request','warning'],'goal-receipt':['goal','Goal state',''],'route-change':['changes','Route change',''],'crew':['users','Crew',''],'new-message':['down','New messages',''],'model-unavailable':['warning','Model availability','danger'],'agent-work':['artifact','Agent work',''],'blocked':['lock','Blocked','danger'],'waiting':['pause','Waiting','']
    };
    const d=map[m.type]||['info',m.title||m.type,''];
    const actions=[];
    if(m.type==='question-receipt') actions.push(`<button class="soft-button" data-action="open-questionnaire">Resume</button>`);
    if(m.type==='bsd-advice') actions.push(`<button class="soft-button" data-action="open-bsd-details">${icon('eye',12)} Evidence</button><button class="text-button" data-action="dismiss-event" data-id="${esc(m.id)}">Dismiss</button>`);
    if(m.type.startsWith('context-')) actions.push(`<button class="soft-button" data-action="context-details">${icon('info',12)} Details</button>`);
    if(m.type==='permission') actions.push(`<button class="soft-button" data-action="open-permission">Review</button>`);
    if(m.type==='tool-error') actions.push(`<button class="soft-button" data-action="trigger-work-recovery">Recover</button>`);
    return `<article class="event-card ${d[2]}"><span class="event-icon">${icon(d[0],14)}</span><div class="event-copy"><strong>${esc(m.title||d[1])}</strong><p>${esc(m.detail||'')}</p>${m.type==='bsd-advice'?`<p><strong>Impact:</strong> The primary agent changed from rewriting history to a forward migration with rollback evidence.</p>`:''}</div>${actions.length?`<div class="plan-actions">${actions.join('')}</div>`:''}</article>`;
  }
  function renderWorkingAnimation(){
    const v=state.variants[2], step=workStep(), pct=Math.round((state.work.step/(D.workSteps.length-1))*100);
    const co=CHROME_OPTS[v]||{}, ctx=makeWorkCtx(step,pct), shut=state.work.completed&&state.work.openPhase==null;
    return `<article class="working-card working-variant-${v}" data-working-variant="${v}" data-step-kind="${esc(step.kind)}" data-k="workcard"><div class="working-head"><span class="work-phase-icon">${icon(step.icon,14)}</span><div><strong>${state.work.completed?'Completed work':'Working'}</strong><span class="sub"> · ${esc(step.label)} · ${formatElapsed(state.work.elapsed)}</span></div><span class="spacer"></span><div class="working-controls">${state.work.running?`<button class="icon-button" data-action="pause-working" title="Pause the live demo">${icon('pause',13)}</button>`:`<button class="icon-button" data-action="start-working" title="Start or resume the complete work sequence">${icon('play',13)}</button>`}<button class="icon-button" data-action="step-working" title="Advance one operation">${icon('step',13)}</button><button class="icon-button" data-action="complete-working" title="Complete the sequence">${icon('check',13)}</button><button class="icon-button" data-action="reset-working" title="Reset to Preparing">${icon('reset',13)}</button><button class="icon-button ${state.work.expanded?'active':''}" data-action="toggle-work-history" title="${state.work.expanded?'Hide':'Show'} organized work history and evidence">${icon(state.work.expanded?'collapse':'expand',13)}</button></div></div><div class="working-body" data-flip data-k="wv:${v}">${co.noChrome?'':renderPhaseChrome(ctx,co)}${(shut&&!co.keepBody)?'':renderWorkingVariant(v,step,pct)}${renderLiveAgentInline(step)}${state.work.expanded?renderWorkHistory():''}</div></article>`;
  }

  /* Everything a working-animation take needs, so takes can live outside
     this IIFE (see motion.js / variants-*.js) and still reach state, the
     fixtures and the shared render helpers. */
  /* Families are 8 options wide except Working Animation, whose length is
     whatever data.js declares. */
  /* Takes that already render child agents themselves must not also get
     the shared inline list appended underneath. */
  const AGENT_OWNING_TAKES=new Set([6]);
  function takeOwnsAgents(v){ return AGENT_OWNING_TAKES.has(v) || !!(window.PM56_WORKING&&window.PM56_WORKING[v]&&window.PM56_WORKING[v].ownsAgents); }
  const FAMILY_SIZES={2:()=>D.workingTakes.length, 5:()=>D.transcriptTakes.length};
  function familyMax(f){ const g=FAMILY_SIZES[f]; return (g?g():8) - 1; }
  /* Shared working-chrome opts per take. Take 8 (Step Rail) implements the
     full reference mechanic privately — trail, rows, compaction and
     per-step reopen — so it gets neither the chrome nor the shut-body
     gate (keepBody). Takes 0/11/15 already print concrete per-step rows
     in their bodies, so the chrome skips its row block for them. Takes
     4/6 end on a meaningful final stage that should stay visible after
     compaction. */
  const CHROME_OPTS={0:{noRows:true},4:{keepBody:true},6:{keepBody:true},8:{noChrome:true,keepBody:true},11:{noRows:true},15:{noRows:true}};
  function makeWorkCtx(step,pct){
    return {
      state, D, step, pct,
      steps: D.workSteps,
      index: state.work.step,
      total: D.workSteps.length,
      running: state.work.running,
      completed: state.work.completed,
      elapsed: state.work.elapsed,
      icon, esc, formatElapsed, commandForStep,
      workReceipt: renderWorkReceipt,
      M: window.PM56_MOTION
    };
  }

  /* The reference-video chrome shared by every take: an icon trail of
     phases, a bold verb + grey count, concrete readable rows for what is
     actually happening right now; on completion it compacts to the trail
     plus an "N steps" roll and the work receipt, and clicking any disc
     re-expands that phase's rows. data-k discipline follows variants-a.js:
     constant keys survive the tick, step/phase-keyed nodes remount and
     replay their entrance animation. */
  function renderPhaseChrome(ctx,opts){
    const {D,step,index,running,completed,M,esc,icon}=ctx;
    const open=state.work.openPhase;
    const shut=completed&&open==null;
    const phases=[];
    for(const s of D.workSteps){
      const p=D.phaseGroups[s.kind]||s.kind;
      const g=phases[phases.length-1];
      if(g&&g.phase===p){g.steps.push(s);}else{phases.push({phase:p,first:s,steps:[s]});}
    }
    const cur=phases.find(g=>g.steps.some(s=>s.id===step.id))||phases[phases.length-1];
    const activeIdx=completed?phases.length-1:phases.indexOf(cur);
    const trail=phases.map((g,i)=>{
      const meta=D.phaseMeta[g.first.kind]||{};
      const cls='pm-rail-item wa-disc '+(completed||i<activeIdx?'done':i===activeIdx?'current enter':'')+(open===g.phase?' open':'');
      const act=completed?` data-action="toggle-work-phase" data-value="${g.phase}"`:'';
      return `<button type="button" class="${cls}" data-k="wa:${g.phase}"${act} title="${esc(meta.past||meta.verb||g.phase)} ${esc(meta.count||'')}" aria-label="${esc(meta.past||meta.verb||g.phase)}">${icon(g.first.icon,11)}</button>`;
    }).join('');
    const rowsFor=(s)=>{
      const rows=(D.phaseRows[s.kind]&&D.phaseRows[s.kind][s.id])||s.evidence.slice(0,3).map(t=>({text:t}));
      return rows.map((r,j)=>{
        const body=r.stream?`<span class="wa-prose pm-stream">${M.words(r.text)}</span>`:`<span class="wa-rowtext">${esc(r.text)}</span>`;
        const metaBit=r.add!=null?`<span class="wa-meta"><b class="wa-add">+${r.add}</b>${r.del!=null?` <b class="wa-del">−${r.del}</b>`:''}</span>`:r.tag?`<span class="wa-meta"><b class="wa-tag">${esc(r.tag)}</b></span>`:'';
        return `<span class="wa-row pm-materialize" data-k="war:${s.id}:${j}" style="--pm-stagger:${j}">${body}${metaBit}</span>`;
      }).join('');
    };
    let label;
    if(shut){
      label=`<b class="wa-verb" data-k="wv2:sum">${M.roll(index+1)} steps</b>`;
    }else if(open){
      const g=phases.find(x=>x.phase===open)||cur, m=D.phaseMeta[g.first.kind]||{};
      label=`<b class="wa-verb" data-k="wv2:${open}">${esc(m.past)}</b><i class="wa-count" data-k="wc2:${open}">${esc(m.count)}</i>`;
    }else{
      const meta=D.phaseMeta[cur.first.kind]||{};
      label=`<b class="wa-verb ${running?'pm-shimmer':'pm-shimmer pm-settled'}" data-k="wv2:${cur.phase}">${esc(meta.verb)}</b><i class="wa-count" data-k="wc2:${cur.phase}">${esc(meta.count)}</i>`;
    }
    const chev=completed?`<button type="button" class="wa-chev${open?' open':''}" data-k="wchev" data-action="toggle-work-phase" data-value="${open||(D.phaseGroups[step.kind]||step.kind)}" title="${open?'Collapse phase details':'Show phase details'}">${icon('down',12)}</button>`:'';
    let under='';
    if(shut){ under=`<div class="wa-under wa-shut" data-k="wau">${ctx.workReceipt()}</div>`; }
    else if(!opts.noRows){
      const g=open?phases.find(x=>x.phase===open):null;
      const rows=(g?g.steps:[step]).map(rowsFor).join('');
      under=`<div class="wa-under pm-rows" data-k="wau:${open||'live'}">${rows}</div>`;
    }
    return `<div class="wa-chrome" data-k="wac"><div class="wa-head" data-k="wah"><span class="pm-rail wa-track" data-k="wat">${trail}</span><span class="wa-label" data-k="wal">${label}</span><span class="wa-spacer"></span>${chev}</div>${under}</div>`;
  }
  function renderWorkingVariant(v,step,pct){
    const take = window.PM56_WORKING && window.PM56_WORKING[v];
    if(typeof take==='function') return take(makeWorkCtx(step,pct));
    if(v===0) return `<div class="reference-stage" data-k="stage"><span class="work-phase-icon" data-k="wicon:${step.id}">${icon(step.icon,14)}</span><div><div class="morph-slot" data-k="morph:${step.id}"><div class="work-verb${state.work.running?' pm-shimmer':''}">${esc(step.verb)}</div><div class="work-detail">${esc(step.detail)}</div></div><div class="work-progress" data-k="prog"><i style="width:${pct}%"></i></div><div class="work-evidence" data-k="ev">${step.evidence.slice(0,3).map((x,i)=>`<div class="evidence-line pm-materialize" style="--pm-stagger:${i}" data-k="ev:${step.id}:${i}">${icon('check',10)}<span>${esc(x)}</span></div>`).join('')}</div><div class="phase-list" data-k="dots">${D.workSteps.map((s,i)=>`<i class="phase-dot ${i<state.work.step?'done':i===state.work.step?'current':''}" data-k="dot:${i}" title="${esc(s.label)}"></i>`).join('')}</div></div></div>${state.work.completed?renderWorkReceipt():''}`;
    if(v===1){
      /* Every step gets a station, not just steps 1-8: the old slice(1,9)
         left steps 0 and 9-13 with no node at all, so the ring sat frozen
         through the whole last third of a run. The ring itself counter-
         rotates so the active station always arrives at the top -- that
         travel is the animation. */
      const nodes=D.workSteps, seg=360/nodes.length;
      return `<div class="orbit-stage" data-k="orbit" style="--seg:${seg}deg;--orbit-rot:${-state.work.step*seg}deg"><i class="orbit-track"></i><div class="orbit-ring" data-k="ring">${nodes.map((sx,i)=>`<span class="orbit-node ${i<state.work.step?'done':i===state.work.step?'current':''}" data-k="node:${sx.id}" style="--angle:${i*seg}deg" title="${esc(sx.label)}">${icon(sx.icon,13)}</span>`).join('')}</div><div class="orbit-core" data-k="core"><div><span class="orbit-core-icon" data-k="coreicon:${step.id}">${icon(step.icon,22)}</span><strong data-k="corelabel:${step.id}">${esc(step.label)}</strong><div class="work-detail">${pct}%</div></div></div></div><div class="orbit-caption work-detail" data-k="cap:${step.id}">${esc(step.detail)}</div>${state.work.completed?renderWorkReceipt():''}`;
    }
    if(v===2){
      /* A real deck. Cards share one origin and differ only by depth, so
         the front card occludes the ones behind it -- which is what stops
         the text collisions the old absolute-offset layout produced (six
         overlapping siblings, three titles printed on top of each other).
         Keying by step id means the card that was current *transitions*
         back to depth 1 as the run advances, instead of being rebuilt. */
      const win=[state.work.step-2,state.work.step-1,state.work.step,state.work.step+1].filter(i=>i>=0&&i<D.workSteps.length);
      return `<div class="step-stack" data-k="deck">${win.map(idx=>{const sx=D.workSteps[idx],rel=idx-state.work.step;
        return `<div class="stack-card ${rel===0?'current':rel<0?'done':'next'}" data-k="card:${sx.id}" style="--depth:${Math.abs(rel)};--dir:${rel<0?-1:1}"><div class="stack-label">${idx+1} / ${D.workSteps.length} · ${esc(sx.label)}</div><div class="stack-body"><span class="work-phase-icon">${icon(sx.icon,13)}</span><div><div class="work-verb${rel===0&&state.work.running?' pm-shimmer':''}">${esc(sx.verb)}</div><div class="work-detail">${esc(sx.detail)}</div></div></div></div>`;}).join('')}</div>${state.work.completed?renderWorkReceipt():''}`;
    }
    if(v===3){
      /* All 14 tools, and the track slides so the active one stays centred
         -- the old slice(1,12) meant steps 0, 12 and 13 highlighted nothing.
         The command line types itself with a steps() reveal sized to the
         string, and keeps a block caret while the run is live. */
      const items=D.workSteps, cmd=commandForStep(step);
      return `<div class="tool-ribbon" data-k="ribbon"><i class="ribbon-spot"></i><div class="ribbon-track" data-k="track" style="--active:${state.work.step}">${items.map((sx,i)=>`<span class="ribbon-item ${i<state.work.step?'done':i===state.work.step?'current':''}" data-k="tool:${sx.id}" title="${esc(sx.label)}">${icon(sx.icon,12)}<span>${esc(sx.label)}</span></span>`).join('')}</div></div><div class="ribbon-focus" data-k="focus"><div class="ribbon-command${state.work.running?' typing':''}" data-k="cmd:${step.id}" style="--ch:${cmd.length}">${esc(cmd)}</div><div class="ribbon-output" data-k="out">${step.evidence.slice(0,3).map((x,i)=>`<span class="ribbon-line pm-materialize" style="--pm-stagger:${i}" data-k="ol:${step.id}:${i}">${esc(x)}</span>`).join('')}</div><div class="work-progress" data-k="prog"><i style="width:${pct}%"></i></div></div>${state.work.completed?renderWorkReceipt():''}`;
    }
    if(v===4){
      /* The receipt prints itself: every metric rolls to its new value
         rather than snapping, and the build bar is a real element whose
         width transitions -- the old ::after animated a gradient, which
         does not interpolate, so it jumped. */
      const tools=Math.min(14,Math.max(0,state.work.step)); const files=Math.min(3,Math.floor(state.work.step/3)); const agents=state.work.step>=7?Math.min(2,state.work.step-6):0; const tests=state.work.step>=10?(state.work.step-9)*7:0;
      const cells=[['Elapsed',formatElapsed(state.work.elapsed)],['Tools',tools],['Files',files],['Agents',agents],['Tests',Math.min(42,tests)],['Evidence',Math.min(18,state.work.step+1)],['p95',`${Math.max(71,482-state.work.step*32)} ms`],['State',state.work.completed?'Ready':step.label]];
      return `<div class="receipt-stage" data-k="receipt">${cells.map(([k,val],i)=>`<div class="receipt-metric pm-materialize" style="--pm-stagger:${i}" data-k="metric:${k}"><label>${esc(k)}</label><strong>${M.roll(val)}</strong></div>`).join('')}<div class="receipt-building" data-k="building"><span class="work-phase-icon" data-k="ricon:${step.id}">${icon(step.icon,13)}</span><div class="receipt-copy"><div class="work-verb${state.work.running?' pm-shimmer':''}">${esc(step.verb)}</div><div class="work-detail">The completion receipt is assembling as evidence arrives.</div></div><span class="receipt-bar" data-k="rbar"><i style="width:${pct}%"></i></span></div></div>`;
    }
    if(v===5){
      /* The panels hand off: what was the current operation becomes Next,
         so each panel is keyed by the step it describes and slides through
         the bench rather than being rebuilt in place. */
      const next=D.workSteps[Math.min(D.workSteps.length-1,state.work.step+1)];
      const panels=[
        ['Current operation', step.verb, step.detail, 'active', `cur:${step.id}`],
        ['Next', next.label, next.verb, '', `next:${next.id}`],
        ['Evidence', step.evidence[0], step.evidence[1]||'Collecting supporting evidence', '', `ev:${step.id}`],
        ['Resources', state.work.step>=8?'3 files changed':'Reading safely', state.work.step>=7?'2 agents participating':'No mutations yet', '', `res:${state.work.step>=8?'a':'b'}`]
      ];
      return `<div class="workbench" data-k="bench">${panels.map(([lab,head,sub,cls,k],i)=>`<div class="bench-panel ${cls}" data-k="bench:${i}">${cls?'<i class="bench-scan"></i>':''}<label>${esc(lab)}</label><span class="bench-slot pm-materialize" style="--pm-stagger:${i}" data-k="${k}"><strong class="${cls&&state.work.running?'pm-shimmer':''}">${esc(head)}</strong><p>${esc(sub)}</p></span></div>`).join('')}</div><div class="work-progress" data-k="prog"><i style="width:${pct}%"></i></div>${state.work.completed?renderWorkReceipt():''}`;
    }
    if(v===6){
      /* Lanes promote and demote with a spring, and a blocked lane shakes
         once when it becomes blocked -- keyed on the status so the shake
         fires on the transition, not on every render. */
      const parentStatus=state.work.completed?'done':'';
      return `<div class="agent-stage" data-k="stage"><div class="agent-lane parent ${parentStatus}" data-k="lane:parent"><span class="lane-avatar">PM</span><span class="lane-copy"><strong class="${state.work.running?'pm-shimmer':''}">Parent · ${esc(step.label)}</strong><span data-k="pverb:${step.id}">${esc(step.verb)}</span></span>${state.work.running?`<span class="lane-wave"><i></i><i></i><i></i></span>`:icon(state.work.completed?'check':'pause',13)}${state.work.running?'<i class="lane-pulse"></i>':''}</div>${(()=>{const pool=D.subagents.slice(0,4);const able=pool.filter(x=>x.status!=='blocked');const baton=able.length?able[state.work.step%able.length].id:null;const lead=pool.filter(x=>x.id===baton);return lead.concat(pool.filter(x=>x.id!==baton));})().map((a,i)=>{const able=D.subagents.slice(0,4).filter(x=>x.status!=='blocked');const baton=able.length?able[state.work.step%able.length].id:null;const live=a.status!=='blocked'&&a.id===baton&&!state.work.completed;const st=a.status==='blocked'?'blocked':state.work.completed?'done':'';const line=live?(step.evidence[i%step.evidence.length]||a.current):a.current;const lanePct=live?Math.max(6,Math.min(100,pct+(i%2?-9:7))):(state.work.completed?100:0);return `<button class="agent-lane ${st} ${live?'live':''}" data-flip-move style="--lane-pct:${lanePct}%" data-k="lane:${esc(a.id)}" data-action="open-agent" data-id="${esc(a.id)}"><span class="lane-avatar">${esc(a.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</span><span class="lane-copy"><strong>${esc(a.name)}</strong><span class="pm-materialize ${live&&state.work.running?'pm-shimmer':''}" data-k="ln:${esc(a.id)}:${esc(line)}">${esc(line)}</span></span>${live&&state.work.running?`<span class="lane-wave"><i></i><i></i><i></i></span>`:(()=>{const lbl=a.status==='blocked'?'blocked':state.work.completed?'done':live?'working':'queued';return `<span class="agent-state ${lbl}">${esc(lbl)}</span>`;})()}<i class="lane-track"><b></b></i>${state.work.running&&!state.work.completed?'<i class="lane-pulse"></i>':''}</button>`;}).join('')}</div>${state.work.completed?renderWorkReceipt():''}`;
    }
    /* The calmest take: nothing arrives, it simply becomes. The glyph
       breathes, the palette drifts with --pm-step as phases change, and a
       single travelling marker slides along the dot track. */
    return `<div class="calm-stage" data-k="calm"><div><span class="calm-glyph" data-k="glyph:${step.id}">${icon(step.icon,20)}</span><div class="calm-verb${state.work.running?' pm-shimmer':''}" data-k="cverb:${step.id}">${esc(step.verb)}</div><div class="calm-detail pm-stream" data-k="cdet:${step.id}">${M.words(step.detail)}</div><div class="calm-dots" data-k="cdots" style="--travel:${state.work.step}"><i class="calm-marker"></i>${D.workSteps.map((s,i)=>`<i class="${i<state.work.step?'done':''}" data-k="cdot:${i}"></i>`).join('')}</div></div></div>${state.work.completed?renderWorkReceipt():''}`;
  }

  function renderLiveAgentInline(step){
    if(step.kind!=='agents'||takeOwnsAgents(state.variants[2])) return '';
    return `<div style="margin-top:10px;padding-top:9px;border-top:1px solid var(--border)"><div class="section-head" style="padding:0 0 5px"><span>Live child agents</span><span class="count">2</span></div><div class="live-agent-list">${D.subagents.slice(0,2).map(renderLiveAgentRow).join('')}</div></div>`;
  }
  function renderWorkReceipt(){ return `<div class="work-receipt"><span class="receipt-chip">Worked for ${formatElapsed(state.work.elapsed)}</span><span class="receipt-chip">14 tools</span><span class="receipt-chip">3 files</span><span class="receipt-chip">2 agents</span><span class="receipt-chip">42 tests</span><span class="receipt-chip">2 artifacts</span></div>`; }
  function renderWorkHistory(){
    return `<div class="work-history"><div class="section-head" style="padding:0 2px 3px"><span>Organized work stream and evidence</span><span class="count">${state.work.step+1}</span></div>${D.workSteps.slice(0,state.work.step+1).map((s,i)=>`<button class="history-step ${i===state.work.step?'current':'done'}" data-action="inspect-work-step" data-value="${i}"><span class="work-phase-icon" style="width:20px;height:20px;border-radius:6px">${icon(i<state.work.step?'check':s.icon,10)}</span><span><strong style="display:block;font-size:9px">${esc(s.label)} · ${esc(s.verb)}</strong><span style="font-size:9px;color:var(--muted)">${esc(s.evidence.join(' · '))}</span></span><span class="time">${i===state.work.step?'now':`${Math.max(1,(state.work.step-i)*8)}s ago`}</span></button>`).join('')}</div>`;
  }
  function commandForStep(step){
    const map={prepare:'pm resolve --thread query-performance',thought:'reasoning: compare index selectivity and write pressure',files:'read src/analytics/{queries,schema}.rs', 'web-search':'web search "PostgreSQL multicolumn index leading column"','web-fetch':'fetch docs/postgresql/indexes-multicolumn','browser':'browser control dashboard/query-performance','bash':'cargo bench analytics_query -- --profile','agents':'spawn query-analyzer schema-reviewer','edit':'apply migration 0043 + batch query patch','app':'control database-inspector --refresh-schema','test':'browser test query-dashboard --widths all','validate':'cargo test && cargo clippy && pm audit','artifact':'render benchmark-dashboard + mermaid','complete':'complete: evidence package ready'};
    return map[step.kind]||step.verb;
  }
  function formatElapsed(s){ const m=Math.floor(s/60),sec=String(s%60).padStart(2,'0');return `${m}m ${sec}s`; }

  const activityDefs={
    goal:{icon:'goal',label:'Goal',count:'3/4',state:'live',summary:'Optimizing tenant-scoped analytics queries',detail:'Running · Phase 2 of 4 · one schema-policy blocker'},
    todo:{icon:'todo',label:'Todo',count:'2/8',state:'changed',summary:'Compare composite index order',detail:'2 done · 1 active · 1 blocked · 1 skipped'},
    subagents:{icon:'users',label:'Subagents',count:'2',state:'live',summary:'Two agents active, one blocked',detail:'Query Analyzer working · Schema Reviewer blocked'},
    changes:{icon:'changes',label:'Changes',count:'3',state:'changed',summary:'3 files changed',detail:'+100 −17 · exact ranges available in the editor'},
    artifacts:{icon:'artifact',label:'Artifacts',count:'13',state:'changed',summary:'Plan, Mermaid, dashboard, and more',detail:'11 ready · 1 stale · 1 recoverable renderer error'}
  };

  function renderActivityBar(){
    return `<div class="activity-wrap"><div class="activity-bar" data-variant="${state.variants[3]}">${Object.entries(activityDefs).map(([id,d])=>`<button class="activity-item ${state.activity.open&&state.activity.domain===id?'active':''}" data-action="open-activity" data-domain="${id}" data-hover-domain="${id}"><i class="state-mark ${d.state}"></i>${icon(d.icon,12)}<span class="label">${d.label}</span><span class="count">${d.count}</span></button>`).join('')}</div></div>`;
  }

  function renderActivityPanel(transient=false){
    const d=state.activity.domain;
    return `<aside class="activity-panel ${transient?'transient':''}" data-variant="${state.variants[4]}"><div class="activity-panel-head"><span class="event-icon">${icon(activityDefs[d].icon,13)}</span><strong>Activity Detail</strong><span class="spacer"></span><button class="icon-button" data-action="toggle-activity-filter" title="Show or hide category filter">${icon('filter',13)}</button><button class="icon-button" data-action="${state.activity.pinned?'unpin-activity':'pin-activity'}" title="${state.activity.pinned?'Unpin':'Pin'} Activity Detail">${icon(state.activity.pinned?'unpin':'pin',13)}</button><button class="icon-button" data-action="close-activity" title="Close Activity Detail">${icon('close',13)}</button></div><div class="activity-filter ${state.activity.filterVisible?'':'hidden'}">${Object.entries(activityDefs).map(([id,x])=>`<button class="${d===id?'active':''}" data-action="focus-activity" data-domain="${id}" title="Focus ${x.label}">${icon(x.icon,11)}<span>${x.label}</span></button>`).join('')}</div><div class="activity-scroll" data-scroll-key="activity"><div class="activity-summary-card"><strong>${esc(D.artifacts[0].title)}</strong><p>${esc(D.artifacts[0].summary)}</p><button class="soft-button" data-action="open-artifact" data-id="plan-query">${icon('eye',12)} Open full plan</button></div>${['goal','todo','subagents','changes','artifacts'].map(renderActivitySection).join('')}</div><div class="panel-resize" data-resize="activity"></div></aside>`;
  }

  function renderActivitySection(id){
    const d=activityDefs[id], open=state.activity.expanded.includes(id);
    return `<section class="activity-section" data-domain-section="${id}"><button class="activity-section-head" data-action="toggle-activity-section" data-domain="${id}"><span class="event-icon" style="width:24px;height:24px">${icon(d.icon,12)}</span><strong>${d.label}</strong><span style="font-size:9px;color:var(--muted)">${esc(d.summary)}</span><span class="spacer"></span><span class="meta-pill">${d.count}</span>${icon(open?'up':'down',11)}</button>${open?`<div class="activity-section-body">${renderActivitySectionBody(id)}</div>`:''}</section>`;
  }

  function renderActivitySectionBody(id){
    if(id==='goal') return `<div class="activity-line"><span class="status-dot working"></span><div class="copy"><strong>Optimize analytics query performance</strong><span>Running · Phase 2/4 · 68% · Revision 4</span></div><span class="right">2m 06s</span></div><div class="activity-line"><span class="event-icon" style="width:20px;height:20px">${icon('warning',10)}</span><div class="copy"><strong>Exact blocker</strong><span>Production schema modification requires explicit approval.</span></div></div><div class="plan-actions"><button class="soft-button" data-action="open-goal">View Goal</button><button class="soft-button" data-action="edit-goal">Edit</button><button class="soft-button" data-action="pause-goal">Pause</button><button class="soft-button" data-action="resume-goal">Resume</button><button class="soft-button" data-action="stop-goal">Stop</button><button class="text-button danger" data-action="clear-goal">Clear</button></div>`;
    if(id==='todo') return D.todos.map(x=>`<div class="activity-line"><span class="event-icon" style="width:20px;height:20px;color:${x.status==='done'?'var(--positive)':x.status==='blocked'?'var(--danger)':'var(--accent)'}">${icon(x.status==='done'?'check':x.status==='blocked'?'lock':'todo',10)}</span><div class="copy"><strong>${esc(x.label)}</strong><span>${esc(x.source)}${x.blocker?` · ${esc(x.blocker)}`:''}</span></div><span class="right">${esc(x.status)}</span></div>`).join('');
    if(id==='subagents') return D.subagents.map(a=>`<button class="activity-line" data-action="open-agent" data-id="${esc(a.id)}"><span class="agent-avatar" style="width:22px;height:22px;border-radius:7px">${esc(a.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</span><span class="copy"><strong>${esc(a.name)} · ${esc(a.model)}</strong><span>${esc(a.current)}${a.blocker?` · ${esc(a.blocker)}`:''}</span></span><span class="right">${esc(a.status)} · ${esc(a.elapsed)}</span></button>`).join('');
    if(id==='changes') return D.changes.map(c=>`<button class="activity-line" data-action="open-change" data-path="${esc(c.path)}"><span class="event-icon" style="width:20px;height:20px">${icon('file-edit',10)}</span><span class="copy"><strong>${esc(c.path)}:${c.line}</strong><span>${esc(c.summary)}</span></span><span class="right" style="color:var(--positive)">+${c.add} <i style="color:var(--danger)">−${c.del}</i></span></button>`).join('');
    return D.artifacts.map(a=>`<button class="activity-line" data-action="open-artifact" data-id="${esc(a.id)}"><span class="event-icon" style="width:20px;height:20px;color:${a.status==='error'?'var(--danger)':a.status==='stale'?'var(--warning)':'var(--accent)'}">${icon(a.kind==='image'?'image':a.kind==='mermaid'?'code':'artifact',10)}</span><span class="copy"><strong>${esc(a.title)}</strong><span>${esc(a.kind)} · version ${a.version} · ${esc(a.summary)}</span></span><span class="right">${esc(a.status)}</span></button>`).join('');
  }
  function renderDecisionHost(){
    if(!state.decision) return `<div class="decision-host empty" data-variant="${state.variants[6]}"></div>`;
    const type=state.decision.type;
    let body='';
    if(type==='question') body=renderQuestionDecision();
    else if(type==='question-preparing') body=renderPreparingDecision();
    else if(type==='question-submitting') body=renderSubmittingDecision();
    else if(type==='plan') body=renderPlanDecision();
    else if(type==='permission') body=renderPermissionDecision();
    else if(type==='conflict') body=renderConflictDecision();
    return `<div class="decision-host" data-variant="${state.variants[6]}">${body}</div>`;
  }

  function renderPreparingDecision(){ return `<section class="decision-surface"><div class="decision-top"><span class="event-icon">${icon('sparkles',13)}</span><strong>Preparing questions…</strong><span class="spacer"></span><button class="icon-button" data-action="close-decision">${icon('close',12)}</button></div><div class="decision-body"><div class="work-progress"><i style="width:72%;animation:activity-scan 1.6s linear infinite"></i></div><p style="color:var(--muted);font-size:10px;margin:9px 0 0">Resolving what is already known so the assistant asks only material questions.</p></div></section>`; }
  function renderSubmittingDecision(){ return `<section class="decision-surface"><div class="decision-top"><span class="event-icon">${icon('send',13)}</span><strong>Submitting answers…</strong></div><div class="decision-body"><div class="work-progress"><i style="width:100%"></i></div><p style="color:var(--muted);font-size:10px;margin:9px 0 0">Answers are being attached to the durable thread and planning context.</p></div></section>`; }
  function renderQuestionDecision(){
    const q=state.questions[state.questionIndex];
    const answered=state.questions.filter(x=>Array.isArray(x.answer)?x.answer.length:String(x.answer||'').trim()).length;
    let input='';
    if(q.type==='choice') input=`<div class="choice-grid">${q.options.map(o=>`<button class="choice ${q.answer===o?'selected':''}" data-action="answer-choice" data-value="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
    else if(q.type==='multi') input=`<div class="choice-grid">${q.options.map(o=>`<button class="choice ${Array.isArray(q.answer)&&q.answer.includes(o)?'selected':''}" data-action="answer-multi" data-value="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
    else if(q.type==='text') input=`<textarea class="decision-textarea" data-input="question-text" placeholder="Optional constraints…">${esc(q.answer||'')}</textarea>`;
    else input=`<div class="decision-evidence" style="display:block"><strong>Resolved deployment</strong><p>Server: ${esc(state.questions[0].answer||'Not answered')}</p><p>Windows execution: ${esc((state.questions[1].answer||[]).join(', ')||'Not answered')}</p><p>Fallback: ${esc(state.questions[2].answer||'Not answered')}</p></div>`;
    return `<section class="decision-surface"><div class="decision-top"><span class="event-icon">${icon('todo',13)}</span><strong>Deployment questionnaire</strong><span class="meta-pill">${answered}/${state.questions.length} answered</span><span class="spacer"></span><button class="text-button" data-action="skip-question">Skip</button><button class="icon-button" data-action="close-decision" title="Close and return later; answers are preserved">${icon('close',12)}</button></div><div class="decision-body"><div class="question-progress">${state.questions.map((x,i)=>`<i class="${i<state.questionIndex?'done':i===state.questionIndex?'current':''}"></i>`).join('')}</div><div class="question-prompt">${esc(q.prompt)} ${q.required?'<span style="color:var(--danger)">*</span>':''}</div>${input}<div class="decision-evidence"><strong>Why this matters</strong><p>This answer changes host selection, fallback routing, and the resulting Plan artifact.</p></div><div class="decision-actions"><button class="soft-button" data-action="cancel-questionnaire">Cancel questionnaire</button><span style="flex:1"></span><button class="soft-button" data-action="prev-question" ${state.questionIndex===0?'disabled':''}>${icon('left',12)} Back</button>${state.questionIndex===state.questions.length-1?`<button class="primary-button" data-action="submit-questionnaire">Submit answers ${icon('send',12)}</button>`:`<button class="primary-button" data-action="next-question">Next ${icon('chevron',12)}</button>`}</div></div></section>`;
  }

  function renderPlanDecision(){
    const revise=state.decision.mode==='revise';
    return `<section class="decision-surface"><div class="decision-top"><span class="event-icon">${icon('document',13)}</span><strong>${revise?'Revise the Plan':'Plan ready for review'}</strong><span class="meta-pill">Revision ${state.planRevision}</span><span class="spacer"></span><button class="icon-button" data-action="close-decision">${icon('close',12)}</button></div><div class="decision-body"><strong>${esc(D.artifacts[0].title)}</strong><p style="color:var(--muted);font-size:10px;margin:4px 0 8px">${esc(D.artifacts[0].summary)}</p>${revise?`<textarea class="decision-textarea" data-input="plan-feedback" placeholder="Describe what the next immutable Plan revision should change…">${esc(state.decision.feedback||'')}</textarea>`:`<div class="decision-evidence"><strong>Material evidence</strong><p>p95 482 → 71 ms · 42 tests passed · write overhead +4.8% · rollback gate included</p></div>`}<div class="decision-actions"><button class="text-button" data-action="cancel-plan">Cancel</button><button class="soft-button" data-action="open-artifact" data-id="plan-query">${icon('eye',12)} View full Plan</button>${revise?`<button class="primary-button" data-action="submit-plan-revision">Create revision</button>`:`<button class="soft-button" data-action="revise-plan">${icon('edit',12)} Revise</button><button class="primary-button" data-action="approve-plan">Approve And Build</button>`}</div></div></section>`;
  }

  function renderPermissionDecision(){ return `<section class="decision-surface"><div class="decision-top"><span class="event-icon">${icon('lock',13)}</span><strong>Permission required</strong><span class="meta-pill">Execution host</span><span class="spacer"></span><button class="icon-button" data-action="close-decision">${icon('close',12)}</button></div><div class="decision-body"><div class="question-prompt">Reconnect to Windows execution host and resume browser control?</div><p style="color:var(--muted);font-size:10px">The prior host connection dropped during step 7. The checkpoint is intact; no command will be replayed twice.</p><div class="decision-evidence"><strong>Command scope</strong><p>Reconnect host · restore browser session · continue from checkpoint · no schema mutation</p></div><div class="decision-actions"><button class="soft-button" data-action="deny-permission">Deny</button><button class="primary-button" data-action="approve-permission">Approve once</button></div></div></section>`; }

  function renderConflictDecision(){ return `<section class="decision-surface"><div class="decision-top"><span class="event-icon">${icon('warning',13)}</span><strong>Resolve agent recommendation</strong><span class="spacer"></span><button class="icon-button" data-action="close-decision">${icon('close',12)}</button></div><div class="decision-body"><div class="question-prompt">Choose the next safe implementation path</div><div class="choice-grid"><button class="choice" data-action="resolve-conflict" data-value="indexes"><strong>Approve indexes</strong><br><span style="font-size:9px;color:var(--muted)">Fast, reversible first step</span></button><button class="choice" data-action="resolve-conflict" data-value="views"><strong>Use materialized views</strong><br><span style="font-size:9px;color:var(--muted)">Faster reads, refresh state</span></button><button class="choice" data-action="resolve-conflict" data-value="override"><strong>Override policy</strong><br><span style="font-size:9px;color:var(--muted)">Permit schema reviewer changes</span></button></div><div class="decision-evidence"><strong>Parent mediation</strong><p>Given the 95% read workload and modest write rate, the composite index is the safer first step. Materialized views remain a follow-up after measuring index performance.</p></div></div></section>`; }

  function renderComposer(){
    const m=selectedModel();
    const caps=[];
    if(state.capabilities.goal)caps.push(['goal','goal']); if(state.capabilities.crew)caps.push(['users','crew']); if(state.capabilities.bsd!=='Off')caps.push(['warning','bsd']); if(state.capabilities.context!=='Off')caps.push(['filter','context']); if(state.capabilities.eli5)caps.push(['sparkles','eli5']);
    return `<div class="composer"><div class="composer-box"><textarea class="composer-input" data-input="composer" placeholder="Ask Puppet Master, use natural language, or type / for commands…">${esc(state.composer)}</textarea><div class="composer-tools"><button class="icon-button" data-action="attach" title="Attach files or images">${icon('attach',14)}</button><span class="capability-indicators">${caps.slice(0,5).map(c=>`<span class="capability-dot ${c[1]}" title="${esc(c[1])} active">${icon(c[0],11)}</span>`).join('')}</span><button class="selector-button active" data-kind="persona" data-action="open-menu" data-menu="persona" data-menu-anchor="persona"><span>${esc(state.persona)}</span></button><button class="selector-button active" data-kind="model" data-action="open-menu" data-menu="model" data-menu-anchor="model"><span>${esc(m.name)}</span>${state.fast&&m.fast?icon('lightning',11,'fast-bolt'):''}</button><button class="selector-button active" data-kind="mode" data-action="open-menu" data-menu="mode" data-menu-anchor="mode"><span>${esc(state.mode)}</span></button><button class="selector-button active" data-kind="permissions" data-action="open-menu" data-menu="permissions" data-menu-anchor="permissions"><span>${esc(state.permissions)}</span></button><button class="selector-button active" data-kind="worktree" data-action="open-menu" data-menu="worktree" data-menu-anchor="worktree"><span>${esc(state.worktree)}</span></button><button class="icon-button ${Object.values(state.capabilities).some(x=>x===true||x==='On'||x==='Focus'||x==='Expanded')?'active':''}" data-action="open-menu" data-menu="wand" data-menu-anchor="wand" title="Capabilities and Goal Mode">${icon('wand',14)}</button><span style="flex:1"></span><button class="send-button" data-action="send" title="Send message">${icon('send',14)}</button></div><div class="composer-hint">${esc(state.persona)} · ${esc(m.name)} · ${esc(state.mode)} · ${esc(state.permissions)} · ⌘↵ to send</div></div></div>`;
  }

  function renderStatusBar(){ return `<footer class="status-bar"><span>${icon('check-circle',10)} Agent · ${esc(selectedModel().name)} · ${formatElapsed(state.work.elapsed)}</span><span class="center">${esc(state.worktree)} · Local server</span><span class="right">Ready · ${state.context.compacted?'Context compacted':'Context 64%'} ${icon('info',10)}</span></footer>`; }

  /* ---------------------------------------------------------------------
     Keyed DOM patch.
     renderApp() used to assign innerHTML wholesale, which destroyed and
     rebuilt every node on the 1050ms work tick. That restarted every
     entrance animation forever and made all CSS transitions unreachable,
     because a transition needs a node that survives the change.
     pmPatch() reconciles the new markup into the living tree instead:
     nodes are matched by data-k when present and by tag/position otherwise,
     attributes and text are updated in place, and only genuinely new nodes
     are created. Give an element a data-k that encodes the thing it
     represents (e.g. the step id) and it will be replaced -- and so replay
     its entrance -- exactly when that thing actually changes.
     --------------------------------------------------------------------- */
  const PM_KEY='data-k';
  function pmKey(n){ return n.nodeType===1 ? n.getAttribute(PM_KEY) : null; }
  function pmSameType(a,b){
    if(a.nodeType!==b.nodeType) return false;
    return a.nodeType!==1 || a.tagName===b.tagName;
  }
  function pmSyncAttrs(el,src){
    const skipValue = el===document.activeElement && ('value' in el);
    const seen=new Set();
    for(const at of src.attributes){
      seen.add(at.name);
      if(skipValue && (at.name==='value'||at.name==='checked')) continue;
      if(el.getAttribute(at.name)!==at.value) el.setAttribute(at.name,at.value);
    }
    for(const at of [...el.attributes]) if(!seen.has(at.name)) el.removeAttribute(at.name);
    // Form controls keep their live property in step with the attribute,
    // except while the user is actually typing into them.
    if(!skipValue){
      if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'){
        const v=src.getAttribute('value');
        if(v!=null && el.value!==v) el.value=v;
      }
      if(el.tagName==='SELECT'){
        const opt=src.querySelector('option[selected]');
        if(opt && el.value!==opt.getAttribute('value')) el.value=opt.getAttribute('value');
      }
    }
  }
  function pmPatchNode(el,src){
    if(el.nodeType!==1){ if(el.nodeValue!==src.nodeValue) el.nodeValue=src.nodeValue; return; }
    pmSyncAttrs(el,src);
    // A subtree owned by JS (streamed words, canvases) opts out of patching.
    if(el.hasAttribute('data-pm-keep')) return;
    pmPatchChildren(el,src);
  }
  function pmPatchChildren(parent,src){
    const news=[...src.childNodes];
    const olds=[...parent.childNodes];
    const keyed=new Map();
    for(const n of olds){ const k=pmKey(n); if(k && !keyed.has(k)) keyed.set(k,n); }
    const used=new Set();
    const out=[];
    let scan=0;
    for(const nn of news){
      const k=pmKey(nn);
      let match=null;
      if(k){
        const cand=keyed.get(k);
        if(cand && !used.has(cand) && pmSameType(cand,nn)) match=cand;
      } else {
        while(scan<olds.length && (used.has(olds[scan])||pmKey(olds[scan]))) scan++;
        if(scan<olds.length && pmSameType(olds[scan],nn)){ match=olds[scan]; scan++; }
      }
      if(match){ used.add(match); pmPatchNode(match,nn); out.push(match); }
      else out.push(document.importNode(nn,true));
    }
    for(const n of olds) if(!used.has(n) && n.parentNode===parent) parent.removeChild(n);
    out.forEach((n,i)=>{ const at=parent.childNodes[i]; if(at!==n) parent.insertBefore(n,at||null); });
    while(parent.childNodes.length>out.length) parent.removeChild(parent.lastChild);
  }
  function pmPatch(container,html){
    const tpl=document.createElement('template');
    tpl.innerHTML=html;
    const active=document.activeElement;
    const keepSel = active && container.contains(active) && ('selectionStart' in active);
    const selStart=keepSel?active.selectionStart:null, selEnd=keepSel?active.selectionEnd:null;
    pmPatchChildren(container,tpl.content);
    if(active && active.isConnected && container.contains(active)){
      if(document.activeElement!==active) active.focus({preventScroll:true});
      if(keepSel){ try{ active.setSelectionRange(selStart,selEnd); }catch(e){} }
    }
  }

  /* Theme changes were a hard cut. Rather than leave a permanent colour
     transition on everything -- which would drag on hovers and on the takes'
     own colour work -- arm one for the length of the swap and disarm it. */
  let themeFadeTimer=null;
  function applyTheme(id){
    if(!D.themes.some(t=>t.id===id)) return;
    state.theme=id;
    document.body.classList.add('pm-theming');
    clearTimeout(themeFadeTimer);
    themeFadeTimer=setTimeout(()=>document.body.classList.remove('pm-theming'), 320);
    renderApp();
  }
  function renderApp(preserve=true){
    const positions=preserve?captureScroll():{};
    const flipTargets=[...document.querySelectorAll('[data-flip]')];
    const flipBefore=new Map(flipTargets.map(el=>[el, el.getBoundingClientRect().height]));
    const rollBefore=new Map([...document.querySelectorAll('.pm-roll')].map(el=>[el, el.textContent]));
    const moveTargets=[...document.querySelectorAll('[data-flip-move]')];
    const moveBefore=new Map(moveTargets.map(el=>{const r=el.getBoundingClientRect();return [el,{x:r.left,y:r.top}];}));
    document.body.dataset.theme=state.theme;
    const historyPinned=state.historyMode==='pinned'&&!isNarrow();
    const activityPinned=state.activity.open&&state.activity.pinned&&!isPhone();
    const gridClass=`assistant-grid ${historyPinned?'':'history-closed'} ${activityPinned?'activity-pinned':''}`;
    document.documentElement.style.setProperty('--editor-w',`${state.editorWidth}%`);
    document.documentElement.style.setProperty('--history-w',`${state.historyWidth}px`);
    document.documentElement.style.setProperty('--activity-w',`${state.activityWidth}px`);
    pmPatch(document.getElementById('pmRoot'),`<main class="pm-shell">${renderHeader()}<div class="workspace">${renderEditor()}<div class="resizer main-resizer" data-resize="editor"></div><section class="assistant-pane"><div class="${gridClass}">${historyPinned?renderHistory():''}${activityPinned?renderActivityPanel(false):''}${renderChat()}</div></section></div>${renderStatusBar()}</main>`);
    document.getElementById('pmRoot').setAttribute('aria-busy','false');
    flipHeights(flipTargets, flipBefore);
    flipMoves(moveTargets, moveBefore);
    rollDigits(rollBefore);
    restoreScroll(positions);
    renderOverlays();
  }

  /* height:auto is not animatable, so a card that gains a receipt or an
     agent list used to snap open. Measure before the patch, animate the
     delta after it, and clip for the duration so growing content does not
     spill past the edge mid-flight. */
  /* A counter that changes should read as an odometer, not a flicker. The
     incoming digit is animated by CSS when pmPatch replaces it; this keeps
     the outgoing value alive as a ghost for the same 260ms so the box is
     never empty. Works for every M.roll() call site without touching them,
     because it reads the old text off the live DOM before the patch. */
  /* Reordering keyed nodes moves them instantly, because the patch just
     re-inserts them. Capture where they were, then play the delta back so
     the rearrangement is something you can watch. */
  function flipMoves(targets, before){
    if(window.PM56_MOTION && window.PM56_MOTION.reduced()) return;
    for(const el of targets){
      if(!el.isConnected) continue;
      const b=before.get(el); if(!b) continue;
      const r=el.getBoundingClientRect();
      const dx=b.x-r.left, dy=b.y-r.top;
      if(Math.abs(dx)<1 && Math.abs(dy)<1) continue;
      el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],
        {duration:420, easing:'cubic-bezier(.22,.80,.28,1)'});
    }
  }

  function rollDigits(before){
    if(window.PM56_MOTION && window.PM56_MOTION.reduced()) return;
    for(const [el, oldText] of before){
      if(!el.isConnected) continue;
      const now=el.textContent;
      if(now===oldText || oldText==null || oldText==='') continue;
      el.querySelectorAll(':scope > .pm-roll-ghost').forEach(g=>g.remove());
      const ghost=document.createElement('i');
      ghost.className='pm-roll-ghost';
      ghost.textContent=oldText;
      el.appendChild(ghost);
      const done=()=>{ if(ghost.parentNode) ghost.remove(); };
      const a=ghost.getAnimations()[0];
      if(a) a.finished.then(done, done);
      setTimeout(done, 320);
    }
  }

  function flipHeights(targets, before){
    if(window.PM56_MOTION && window.PM56_MOTION.reduced()) return;
    for(const el of targets){
      if(!el.isConnected) continue;
      const h0=before.get(el); if(h0==null) continue;
      const h1=el.getBoundingClientRect().height;
      if(Math.abs(h1-h0)<4) continue;
      const prevOverflow=el.style.overflow;
      el.style.overflow='hidden';
      const a=el.animate([{height:`${h0}px`},{height:`${h1}px`}],
        {duration:320, easing:'cubic-bezier(.22,.80,.28,1)'});
      a.finished.then(()=>{el.style.overflow=prevOverflow;}, ()=>{el.style.overflow=prevOverflow;});
    }
  }

  function captureScroll(){
    const out={}; document.querySelectorAll('[data-scroll-key]').forEach(el=>out[el.dataset.scrollKey]=el.scrollTop); return out;
  }
  function restoreScroll(pos){ requestAnimationFrame(()=>document.querySelectorAll('[data-scroll-key]').forEach(el=>{if(pos&&pos[el.dataset.scrollKey]!=null)el.scrollTop=pos[el.dataset.scrollKey]})); }
  function renderOverlays(){
    const root=document.getElementById('pmOverlayRoot');
    const parts=[];
    if(state.historyMode==='floating') parts.push(`<aside class="history-flyout">${renderHistoryContent(true)}</aside>`);
    if(state.context.details) parts.push(renderContextDrawer());
    if(state.dialog) parts.push(renderDialog());
    if(state.menu) parts.push(renderMenu());
    if(state.hover) parts.push(renderHoverCard());
    if(state.toast.length) parts.push(`<div class="toast-stack">${state.toast.slice(-3).map(t=>`<div class="toast"><strong>${esc(t.title)}</strong><span>${esc(t.detail||'')}</span></div>`).join('')}</div>`);
    pmPatch(root,parts.join(''));
    requestAnimationFrame(positionOverlays);
  }

  function renderMenu(){
    const m=state.menu;
    let content='';
    if(m.type==='persona') content=renderSimpleMenu('Persona',[['Product Manager','Product planning, product judgment, and coordination'],['Architect','Architecture, contracts, boundaries, and trade-offs'],['Implementer','Code, tests, and working product slices'],['Reviewer','Adversarial review, evidence, and risk'],['Teacher','Explanations, tours, and approachable guidance']],state.persona,'set-persona');
    else if(m.type==='permissions') content=renderSimpleMenu('Permissions',[['Ask for approval','Pause before edits, commands, and external effects'],['Auto accept edits','Accept file edits but ask for other effects'],['Auto','Use policy-aware automatic approval'],['Full Access','Allow all permitted actions without prompting']],state.permissions,'set-permissions');
    else if(m.type==='worktree') content=renderSimpleMenu('Worktree',[['main','Canonical branch'],['feature/query-index','Active query-performance work'],['concept/chat-5-6-pro','Assistant concept lab'],['review/query-benchmarks','Read-only benchmark review']],state.worktree,'set-worktree');
    else if(m.type==='mode') content=renderModeMenu();
    else if(m.type==='wand') content=renderWandMenu();
    else if(m.type==='model') content=renderModelMenu();
    else if(m.type==='context') content=renderContextCompactMenu();
    else if(m.type==='thread') content=renderThreadMenu(m.threadId);
    else if(m.type==='thread-search') content=renderThreadSearchMenu();
    const cls=`overlay-menu ${m.type==='model'?'model-menu':''} ${['context','thread-search'].includes(m.type)?'compact':''}`;
    const root=`<div class="${cls}" data-overlay="root-menu" data-side="${m.side||'left'}" style="${m.type==='model'?`height:${modelMenuHeight()}px`:''}">${m.compactSub?renderCompactSubmenu(m.compactSub):content}</div>`;
    const side=m.sub&&!m.compactSub?`<div class="overlay-menu sidecar" data-overlay="sidecar" data-side="${m.side||'left'}">${renderSubmenu(m.sub)}</div>`:'';
    return root+side;
  }

  function renderSimpleMenu(title,items,current,action){
    return `<div class="menu-head"><strong>${esc(title)}</strong><span class="spacer"></span><span class="chat-meta">Current · ${esc(current)}</span></div>${items.map(x=>`<button class="menu-item ${current===x[0]?'active':''}" data-action="${action}" data-value="${esc(x[0])}"><span class="menu-copy"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></span>${current===x[0]?`<span class="check">${icon('check',12)}</span>`:''}</button>`).join('')}`;
  }

  function renderModeMenu(){
    const items=[['Ask','Answer without making changes',''],['Plan','Create a durable implementation plan','plan'],['Deep Plan','Create an exhaustive, evidence-heavy plan','deep-plan'],['Agent','Execute the requested work',''],['Debug','Run an instrumented debugging workflow','']];
    return `<div class="menu-head"><strong>Mode</strong><span class="spacer"></span><span class="chat-meta">/${state.mode.toLowerCase().replace(' ','-')}</span></div>${items.map(x=>`<button class="menu-item ${state.mode===x[0]?'active':''}" data-action="set-mode" data-value="${esc(x[0])}" ${x[2]?`data-submenu="${x[2]}"`:''}><span class="menu-icon">${icon(x[0]==='Ask'?'info':x[0].includes('Plan')?'document':x[0]==='Debug'?'warning':'sparkles',13)}</span><span class="menu-copy"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></span>${x[2]?`<span class="chevron">${icon('chevron',11)}</span>`:state.mode===x[0]?`<span class="check">${icon('check',11)}</span>`:''}</button>`).join('')}`;
  }

  function renderWandMenu(){
    const rows=[
      ['goal','Goal Mode','Create and manage a durable goal','goal-menu',state.capabilities.goal?'On':'Off','goal'],
      ['crew','Crew','Coordinate a role-based group of agents','crew-menu',state.capabilities.crew?'On':'Off','users'],
      ['bsd','Back Seat Driver','Independent review and intervention','bsd-menu',state.capabilities.bsd,'warning'],
      ['context','Context Lens','Focus, Mute, and staged Subcompact','context-lens',state.capabilities.context,'filter'],
      ['eli5','ELI5','Explain selected output more simply','eli5-menu',state.capabilities.eli5?'On':'Off','sparkles'],
      ['thought','Thought Stream','Control permitted reasoning visibility','thought-menu',state.capabilities.thought,'brain']
    ];
    return `<div class="menu-head"><strong>Assistant capabilities</strong><span class="spacer"></span>${icon('wand',13)}</div>${rows.map(r=>`<button class="menu-item" data-submenu="${r[3]}"><span class="menu-icon">${icon(r[5],13)}</span><span class="menu-copy"><strong>${r[1]}</strong><span>${r[2]}</span></span><span class="shortcut">${esc(r[4])}</span><span class="chevron">${icon('chevron',11)}</span></button>`).join('')}`;
  }

  function renderModelMenu(){
    const q=state.modelSearch.toLowerCase().trim();
    let models=D.models.filter(x=>!q||`${x.name} ${x.provider} ${x.account}`.toLowerCase().includes(q));
    if(state.modelProvider!=='all'&&state.modelProvider!=='favorites') models=models.filter(x=>x.provider===state.modelProvider);
    if(state.modelProvider==='favorites'||state.modelView==='favorites') models=models.filter(x=>x.favorite);
    const providers=[...new Set(D.models.map(x=>x.provider))];
    return `<div class="model-layout"><div class="provider-rail"><button class="provider-button ${state.modelProvider==='favorites'?'active':''}" data-action="model-provider" data-value="favorites" title="Favorites">${icon('star',14)}</button><button class="provider-button ${state.modelProvider==='all'?'active':''}" data-action="model-provider" data-value="all" title="All configured providers">${icon('users',14)}</button>${providers.map(p=>`<button class="provider-button ${state.modelProvider===p?'active':''}" data-action="model-provider" data-value="${esc(p)}" title="${esc(p)}">${providerInitial(p)}</button>`).join('')}</div><div class="model-main"><div class="menu-search"><label class="input-wrap">${icon('search',12)}<input data-input="model-search" value="${esc(state.modelSearch)}" placeholder="Search configured models…"></label></div><div class="model-scroll">${models.length?groupModels(models):`<div style="padding:18px;text-align:center;color:var(--muted);font-size:10px">No configured model matches this view.</div>`}</div></div></div>`;
  }
  function groupModels(models){
    const by={};models.forEach(m=>(by[m.provider]??=[]).push(m));
    return Object.entries(by).map(([p,list])=>`<div class="menu-section-label">${esc(p)}</div>${list.map(m=>`<div class="model-row ${state.model===m.id?'active':''}" data-action="set-model" data-value="${esc(m.id)}" data-submenu="model:${esc(m.id)}"><span class="provider-mark">${providerInitial(m.provider)}</span><span class="model-copy"><strong>${esc(m.name)} ${state.model===m.id&&state.fast&&m.fast?icon('lightning',10,'fast-bolt'):''}</strong><span>${esc(m.account)} · ${esc(m.efforts.join(' / '))}</span></span><button class="favorite ${m.favorite?'active':''}" data-action="toggle-favorite" data-value="${esc(m.id)}" title="${m.favorite?'Remove from':'Add to'} favorites">${icon('star',12)}</button></div>`).join('')}`).join('');
  }
  function providerInitial(p){ return esc(p.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase()); }
  function modelMenuHeight(){
    const q=state.modelSearch.toLowerCase().trim();let n=D.models.filter(x=>!q||`${x.name} ${x.provider} ${x.account}`.toLowerCase().includes(q)).length;
    if(state.modelProvider==='favorites'||state.modelView==='favorites')n=D.models.filter(x=>x.favorite&&(!q||`${x.name} ${x.provider}`.toLowerCase().includes(q))).length;else if(state.modelProvider!=='all')n=D.models.filter(x=>x.provider===state.modelProvider&&(!q||`${x.name} ${x.provider}`.toLowerCase().includes(q))).length;
    const groups=Math.min(n,4);return clamp(78+n*44+groups*18,190,520);
  }

  function renderContextCompactMenu(){
    return `<div class="menu-head"><strong>Context</strong><span class="spacer"></span><span class="meta-pill">64%</span></div><div style="padding:9px"><div class="context-big"><strong>83.9K</strong><span>of 131K tokens loaded</span></div><div class="context-bar"><i></i></div><div class="metric-grid" style="grid-template-columns:1fr 1fr;margin-top:8px"><div class="metric-card"><label>Cache hit</label><strong>78%</strong></div><div class="metric-card"><label>Available</label><strong>47.1K</strong></div></div><div class="composition-bar" style="margin-top:8px"><i></i><i></i><i></i><i></i><i></i></div><div style="display:flex;justify-content:space-between;color:var(--subtle);font-size:8px;margin-top:4px"><span>Source composition</span><span>5 source groups</span></div></div><div class="menu-divider"></div><button class="menu-item" data-action="compact-now"><span class="menu-icon">${icon('collapse',13)}</span><span class="menu-copy"><strong>Compact Now</strong><span>Preview and apply a source-aware compaction</span></span></button><button class="menu-item" data-action="context-details"><span class="menu-icon">${icon('info',13)}</span><span class="menu-copy"><strong>More Details</strong><span>Window, tokens, cache, composition, cost, and raw projection</span></span>${icon('chevron',11)}</button>`;
  }

  function renderThreadMenu(id){
    const t=state.threads.find(x=>x.id===id);if(!t)return '';
    return `<div class="menu-head"><strong>${esc(t.title)}</strong><span class="spacer"></span><span class="chat-meta">${esc(statusLabel(t.status))}</span></div>${!t.archived?`<button class="menu-item" data-action="toggle-thread-pin" data-id="${esc(id)}"><span class="menu-icon">${icon(t.pinned?'unpin':'pin',13)}</span><span class="menu-copy"><strong>${t.pinned?'Unpin':'Pin'} thread</strong><span>${t.pinned?'Move to Recent':'Keep at the top'}</span></span></button><button class="menu-item" data-action="rename-thread" data-id="${esc(id)}"><span class="menu-icon">${icon('edit',13)}</span><span class="menu-copy"><strong>Rename</strong><span>Change the thread title</span></span></button><button class="menu-item" data-action="fork-thread" data-id="${esc(id)}"><span class="menu-icon">${icon('fork',13)}</span><span class="menu-copy"><strong>Fork thread</strong><span>Create a child branch with lineage</span></span></button><button class="menu-item" data-action="archive-thread" data-id="${esc(id)}"><span class="menu-icon">${icon('archive',13)}</span><span class="menu-copy"><strong>Archive</strong><span>Hide from active groups but keep searchable</span></span></button>`:`<button class="menu-item" data-action="restore-thread" data-id="${esc(id)}"><span class="menu-icon">${icon('restore',13)}</span><span class="menu-copy"><strong>Restore thread</strong><span>Return it to Recent</span></span></button><button class="menu-item" data-action="fork-thread" data-id="${esc(id)}"><span class="menu-icon">${icon('fork',13)}</span><span class="menu-copy"><strong>Fork archived thread</strong><span>Create an active child branch</span></span></button>`}`;
  }

  function renderThreadSearchMenu(){
    const q=state.menu.query||'';const lq=q.toLowerCase();const results=q?state.threads.flatMap(t=>t.messages.filter(m=>`${m.body||''} ${m.title||''} ${m.detail||''}`.toLowerCase().includes(lq)).map(m=>({thread:t,msg:m}))).slice(0,12):[];
    return `<div class="menu-head"><strong>Search threads</strong><span class="spacer"></span><span class="chat-meta">Current + archived</span></div><div class="menu-search"><label class="input-wrap">${icon('search',12)}<input data-input="thread-global-search" value="${esc(q)}" placeholder="Search exact message text…"></label></div>${q?(results.length?results.map(r=>`<button class="menu-item" data-action="jump-search-result" data-thread="${esc(r.thread.id)}" data-message="${esc(r.msg.id)}"><span class="menu-icon">${icon('search',12)}</span><span class="menu-copy"><strong>${esc(r.thread.title)}</strong><span>${esc((r.msg.body||r.msg.title||r.msg.detail||'').slice(0,110))}</span></span></button>`).join(''):`<div style="padding:15px;text-align:center;color:var(--muted);font-size:10px">No active or archived message matches.</div>`):`<button class="menu-item" data-action="search-current-demo"><span class="menu-icon">${icon('search',12)}</span><span class="menu-copy"><strong>Search current thread</strong><span>Find and jump to exact messages without losing your draft</span></span></button><button class="menu-item" data-action="show-archived"><span class="menu-icon">${icon('archive',12)}</span><span class="menu-copy"><strong>Browse archived threads</strong><span>Archived threads remain searchable and restorable</span></span></button>`}`;
  }
  function renderSubmenu(id){
    if(id.startsWith('model:')){
      const model=D.models.find(x=>x.id===id.slice(6))||selectedModel();
      return `<div class="menu-head"><strong>${esc(model.name)}</strong><span class="spacer"></span><span class="chat-meta">Effort</span></div>${model.efforts.map(e=>`<button class="effort-row ${state.model===model.id&&state.effort===e?'active':''}" data-action="set-effort" data-model="${esc(model.id)}" data-value="${esc(e)}"><i class="effort-dot"></i><span style="flex:1">${esc(e)}</span>${state.model===model.id&&state.effort===e?icon('check',11):''}</button>`).join('')}${model.fast?`<div class="menu-divider"></div><button class="menu-item" data-action="toggle-fast" data-model="${esc(model.id)}"><span class="menu-icon">${icon('lightning',13)}</span><span class="menu-copy"><strong>Fast mode</strong><span>Use the configured provider’s faster route when eligible</span></span><span class="check">${state.model===model.id&&state.fast?icon('check',11):''}</span></button>`:''}`;
    }
    if(id==='plan'||id==='deep-plan'){
      const opts=id==='plan'?[['Quick','Concise implementation route'],['Thorough','Detailed plan and acceptance gates'],['Exhaustive','Full evidence and edge-case pass']]:[['Thorough','Deep analysis with dependencies'],['Exhaustive','Maximum evidence and adversarial review']];
      return `<div class="menu-head"><strong>${id==='plan'?'Plan':'Deep Plan'} thoroughness</strong></div>${opts.map(o=>`<button class="menu-item ${state.thoroughness===o[0]?'active':''}" data-action="set-thoroughness" data-mode="${id==='plan'?'Plan':'Deep Plan'}" data-value="${o[0]}"><span class="menu-copy"><strong>${o[0]}</strong><span>${o[1]}</span></span>${state.thoroughness===o[0]?icon('check',11):''}</button>`).join('')}`;
    }
    if(id==='goal-menu')return renderCapabilitySub('Goal Mode',[['On','Enable natural-language, /goal, and button invocation'],['Off','Disable the visible Goal Mode capability']],state.capabilities.goal?'On':'Off','set-goal-cap');
    if(id==='crew-menu')return renderCapabilitySub('Crew',[['On','Allow role-based agent crews'],['Off','Keep crew coordination disabled']],state.capabilities.crew?'On':'Off','set-crew-cap');
    if(id==='bsd-menu')return renderCapabilitySub('Back Seat Driver',[['Off','Never run independent review'],['Auto','Intervene only when material'],['On','Review every substantial turn']],state.capabilities.bsd,'set-bsd-cap');
    if(id==='context-lens')return `<div class="menu-head"><strong>Context Lens</strong></div>${[['Auto','Use source-aware automatic selection'],['Focus','Prioritize selected current sources'],['Mute','Omit selected superseded sources'],['Subcompact','Preview a staged context reduction'],['Off','Disable Context Lens receipts']].map(o=>`<button class="menu-item ${state.capabilities.context===o[0]?'active':''}" data-action="set-context-cap" data-value="${o[0]}"><span class="menu-copy"><strong>${o[0]}</strong><span>${o[1]}</span></span>${state.capabilities.context===o[0]?icon('check',11):''}</button>`).join('')}${state.capabilities.context==='Subcompact'?`<div class="menu-divider"></div><div style="padding:7px"><p style="font-size:9px;color:var(--muted);margin:0 0 7px">Preview: remove 18.4K tokens while retaining provenance.</p><div class="plan-actions"><button class="soft-button" data-action="cancel-subcompact">Cancel</button><button class="primary-button" data-action="apply-subcompact">Apply</button></div></div>`:''}`;
    if(id==='eli5-menu')return renderCapabilitySub('ELI5',[['On','Show a simpler explanation after selected responses'],['Off','Keep standard response depth']],state.capabilities.eli5?'On':'Off','set-eli5-cap');
    if(id==='thought-menu')return renderCapabilitySub('Thought Stream',[['Auto','Expand only when permitted and useful'],['Expanded','Keep the permitted live thought stream open']],state.capabilities.thought,'set-thought-cap');
    return '';
  }
  function renderCapabilitySub(title,items,current,action){ return `<div class="menu-head"><strong>${esc(title)}</strong></div>${items.map(o=>`<button class="menu-item ${current===o[0]?'active':''}" data-action="${action}" data-value="${esc(o[0])}"><span class="menu-copy"><strong>${esc(o[0])}</strong><span>${esc(o[1])}</span></span>${current===o[0]?icon('check',11):''}</button>`).join('')}`; }
  function renderCompactSubmenu(id){ return `<div class="menu-head"><button class="icon-button" data-action="submenu-back">${icon('left',12)}</button><strong>Back</strong></div>${renderSubmenu(id)}`; }

  function renderContextDrawer(){
    return `<aside class="drawer"><div class="drawer-head"><span class="event-icon">${icon('info',13)}</span><strong>Context More Details</strong><span class="meta-pill">Curated</span><span class="spacer"></span><button class="icon-button" data-action="close-context-details">${icon('close',13)}</button></div><div class="drawer-scroll"><div class="context-hero"><div class="context-big"><strong>64%</strong><span>current window used · 83,900 / 131,000 tokens</span></div><div class="context-bar"><i></i></div></div><div class="metric-grid"><div class="metric-card"><label>Tokens loaded</label><strong>83.9K</strong></div><div class="metric-card"><label>Cache hit</label><strong>78%</strong></div><div class="metric-card"><label>Cached tokens</label><strong>65.4K</strong></div><div class="metric-card"><label>Available</label><strong>47.1K</strong></div><div class="metric-card"><label>Input this turn</label><strong>12.8K</strong></div><div class="metric-card"><label>Output this turn</label><strong>1.5K</strong></div></div><section class="context-section"><h3>Source composition</h3><div class="context-section-body"><div class="composition-bar"><i></i><i></i><i></i><i></i><i></i></div><div class="composition-key">${[['Conversation','34%','var(--accent)'],['Plans and specifications','22%','var(--accent-2)'],['Files and code','18%','var(--positive)'],['Tool and browser evidence','14%','var(--warning)'],['System and provider','12%','var(--subtle)']].map(x=>`<div><i style="background:${x[2]}"></i><span>${x[0]}</span><b style="margin-left:auto">${x[1]}</b></div>`).join('')}</div></div></section><section class="context-section"><h3>Context growth</h3><div class="context-section-body"><div class="growth-chart"><svg viewBox="0 0 420 90" preserveAspectRatio="none"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs><path d="M0 82 C50 78 52 70 95 68 S150 58 185 60 238 42 275 46 325 26 360 31 400 17 420 12V90H0Z" fill="url(#cg)"/><path d="M0 82 C50 78 52 70 95 68 S150 58 185 60 238 42 275 46 325 26 360 31 400 17 420 12" fill="none" stroke="var(--accent)" stroke-width="2"/></svg></div></div></section><section class="context-section"><h3>Effective route</h3><div class="context-section-body"><div class="activity-line"><div class="copy"><strong>${esc(selectedModel().provider)} · ${esc(selectedModel().account)}</strong><span>${esc(selectedModel().name)} · ${esc(state.effort)} effort · ${state.fast?'Fast eligible route':'Standard route'}</span></div></div><div class="activity-line"><div class="copy"><strong>${esc(state.mode)} · ${esc(state.persona)}</strong><span>Worker route: ${esc(state.worktree)} · local execution server</span></div></div></div></section><section class="context-section"><h3>Cost and cache</h3><div class="context-section-body"><div class="metric-grid"><div class="metric-card"><label>API billed</label><strong>$0.084</strong></div><div class="metric-card"><label>Plan estimated</label><strong>$0.031</strong></div><div class="metric-card"><label>Combined est.</label><strong>$0.115</strong></div></div><p style="font-size:9px;color:var(--muted)">65.4K cached tokens avoided repeat input billing. Local browser context contributes 4.8K tokens.</p></div></section><section class="context-section"><h3>Compaction preview</h3><div class="context-section-body"><p style="font-size:10px;color:var(--muted)">A source-aware compaction would remove 18.4K tokens, retain all active requirements, preserve provenance, and leave 65.5K tokens loaded.</p><div class="context-actions"><button class="soft-button" data-action="compact-now">${icon('collapse',12)} Preview Compact</button><button class="soft-button" data-action="export-context">${icon('download',12)} Redacted JSON</button><button class="soft-button" data-action="raw-context">${icon('code',12)} Raw projection</button></div></div></section></div></aside>`;
  }

  function renderHoverCard(){
    const h=state.hover;
    if(h.type==='activity'){
      const d=activityDefs[h.domain];return `<div class="hover-card" data-overlay="hover"><strong>${esc(d.label)} · ${esc(d.summary)}</strong><p>${esc(d.detail)}</p><div class="hover-stats"><span class="hover-stat">${esc(d.count)}</span><span class="hover-stat">Click for all five categories</span><span class="hover-stat">Pin or resize</span></div></div>`;
    }
    return '';
  }

  function renderDialog(){
    if(state.dialog.type==='demo') return renderDemoDialog();
    if(state.dialog.type==='rename') return `<section class="dialog"><div class="drawer-head"><strong>Rename thread</strong><span class="spacer"></span><button class="icon-button" data-action="close-dialog">${icon('close',13)}</button></div><div class="dialog-body"><label class="input-wrap"><input data-input="rename-thread" value="${esc(state.dialog.value)}"></label><div class="decision-actions"><button class="soft-button" data-action="close-dialog">Cancel</button><button class="primary-button" data-action="save-thread-name">Rename</button></div></div></section>`;
    if(state.dialog.type==='compact') return `<section class="dialog" style="width:min(620px,calc(100vw - 20px))"><div class="drawer-head"><strong>Compact context</strong><span class="meta-pill">Preview</span><span class="spacer"></span><button class="icon-button" data-action="close-dialog">${icon('close',13)}</button></div><div class="dialog-body"><div class="metric-grid"><div class="metric-card"><label>Before</label><strong>83.9K</strong></div><div class="metric-card"><label>Removed</label><strong>18.4K</strong></div><div class="metric-card"><label>After</label><strong>65.5K</strong></div></div><p style="color:var(--muted)">Superseded concept sources and duplicated tool receipts will be compressed. Current requirements, active files, decisions, artifacts, and provenance remain available.</p><div class="decision-actions"><button class="soft-button" data-action="close-dialog">Cancel</button><button class="primary-button" data-action="apply-compaction">Apply compaction</button></div></div></section>`;
    if(state.dialog.type==='bsd') return `<section class="dialog" style="width:min(700px,calc(100vw - 20px))"><div class="drawer-head"><strong>Back Seat Driver evidence</strong><span class="meta-pill">Material intervention</span><span class="spacer"></span><button class="icon-button" data-action="close-dialog">${icon('close',13)}</button></div><div class="dialog-body"><div class="event-card warning"><span class="event-icon">${icon('warning',14)}</span><div class="event-copy"><strong>Unsafe assumption detected</strong><p>The requested rewrite would mutate already-applied migration history and undermine rollback evidence.</p></div></div><h3>What changed</h3><p>The parent agent rejected history rewriting, created a forward migration, added a rollback gate, and preserved the prior migration lineage.</p><h3>Supporting evidence</h3><div class="code-block">migrations/0042_events.sql     already applied
schema_migrations                 checksum recorded
production policy                 forward-only history
recommended path                  migration 0043 + rollback</div></div></section>`;
    return '';
  }

  function renderDemoDialog(){
    const families=['Assistant body & composer','Thread history','Working Animation','Chat Activity Bar','Activity Detail','Transcript','Question & decision'];
    const optionNames=[
      ['PM7 Refined','Floating Focus','Split Command','Console Dense','Reading First','Operations Dock','Ribbon Composer','Layered Studio'],
      ['PM7 Pinned','Status Rail','Worktree Branches','Dense Operations','Grouped Recency','Preview Rows','Minimal Reading','Command History'],
      D.workingTakes.slice(),
      ['Extended PM7','Segmented Pill','Icon Dock','Domain Grid','Capsule Stack','Technical Strip','Pulse Rail','Minimal Command'],
      ['Accordion Inspector','Status Board','Goal Tree','Split Master/Detail','Agent Board','File Ledger','Live Work Feed','Overview Dashboard'],
      D.transcriptTakes.slice(),
      ['Stable Card','Morphing Composer','Anchored Sheet','Side Inspector','Step Sequence','Technical Decision','Queue Stack','Evidence Split']
    ];
    const triggerGroups={
      'Work lifecycle':['Start complete work','Pause work','Step work','Complete work','Reset work','Show work history','Live subagents','Blocked subagent','Conflict mediation','Crew coordination'],
      'Every Working Animation state':D.workSteps.map(x=>`Work · ${x.label}`),
      'Questions and decisions':['Prepare questions','Open questionnaire','Queue questionnaire','Plan approval','Plan revision','Plan cancellation','Permission request','Permission denial','Conflict resolution','Cancel and return'],
      'Artifacts':['Mermaid artifact','Interactive dashboard','Data explorer','Architecture map','Interactive quiz','Periodic table','Flowchart','Interactive chart','Generated image','Test evidence','Document artifact','Deep Plan artifact','Artifact stale','Artifact failure'],
      'Capabilities':['BSD intervention','BSD silent check','BSD timeout','BSD unavailable','BSD quota limited','Context Focus','Context Mute','Subcompact preview','Subcompact applied','Subcompact cancelled','ELI5 receipt','Goal replanning','Goal paused','Goal blocked'],
      'Thread and message states':['Plain text conversation','Archived threads','Cross-thread search','Long response','Message details','Edit and branch','Restore from point','Draft history','New message anchor'],
      'System states':['Browser debug','Web search','Web fetch','Bash','App control','Browser testing','Program testing','LSP analysis','MCP tool','Offline queue','Reconnect replay','Attachment upload','Unsupported attachment','Provider route change','Provider auth failure','Provider quota','No models']
    };
    return `<section class="dialog"><div class="drawer-head"><span class="event-icon">${icon('sparkles',13)}</span><strong>Demo Studio</strong><span class="meta-pill">${D.workingTakes.length} working takes · 7 families</span><span class="spacer"></span><button class="soft-button" data-action="reset-all">${icon('reset',12)} Reset all</button><button class="icon-button" data-action="close-dialog">${icon('close',13)}</button></div><div class="dialog-body"><section class="demo-section" style="margin-bottom:8px"><h3>Curated complete recipes and themes</h3><div class="demo-section-body" style="display:grid;grid-template-columns:1fr 1fr;gap:7px"><div class="mixer-row"><label>Recipe</label><select data-input="recipe">${D.recipes.map((r,i)=>`<option value="${i}" ${state.recipe===i?'selected':''}>${esc(r.name)}</option>`).join('')}</select></div><div class="mixer-row"><label>Theme</label><select data-input="theme">${D.themes.map(t=>`<option value="${t.id}" ${state.theme===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></div><p style="grid-column:1/-1;color:var(--muted);font-size:10px;margin:0">${esc(D.recipes[state.recipe]?.desc||'Custom mix')}</p></div></section><section class="demo-section" style="margin-bottom:8px"><h3>Independently swappable concept families</h3><div class="demo-section-body" style="display:block">${families.map((f,i)=>`<div class="mixer-row"><label>${esc(f)}</label><select data-input="variant" data-family="${i}">${optionNames[i].map((n,j)=>`<option value="${j}" ${state.variants[i]===j?'selected':''}>${j+1}. ${esc(n)}</option>`).join('')}</select></div>`).join('')}</div></section><div class="demo-grid">${Object.entries(triggerGroups).map(([name,items])=>`<section class="demo-section"><h3>${esc(name)}</h3><div class="demo-section-body">${items.map(x=>`<button class="demo-trigger" data-action="demo-trigger" data-trigger="${esc(x)}">${esc(x)}</button>`).join('')}</div></section>`).join('')}</div></div></section>`;
  }

  function positionOverlays(){
    if(state.menu){
      const anchor=document.querySelector(`[data-menu-anchor="${CSS.escape(state.menu.anchor)}"]`), root=document.querySelector('[data-overlay="root-menu"]');
      if(anchor&&root){
        const ar=anchor.getBoundingClientRect(), rr=root.getBoundingClientRect(), gap=7;
        let left=state.menu.side==='right'?ar.right-rr.width:ar.left;
        if(state.menu.type==='model'||state.menu.type==='context'||state.menu.type==='thread-search') left=ar.right-rr.width;
        left=clamp(left,8,window.innerWidth-rr.width-8);
        const below=window.innerHeight-ar.bottom-8, above=ar.top-8;
        let top=below>=rr.height+gap?ar.bottom+gap:Math.max(8,ar.top-rr.height-gap);
        top=clamp(top,8,window.innerHeight-rr.height-8);
        root.style.left=`${left}px`;root.style.top=`${top}px`;root.style.setProperty('--origin-x',`${clamp(ar.left+ar.width/2-left,18,rr.width-18)}px`);root.style.setProperty('--origin-y',top>ar.bottom?'0px':'100%');
        const side=document.querySelector('[data-overlay="sidecar"]');
        if(side){
          const sr=side.getBoundingClientRect();let sl=state.menu.side==='right'?left+rr.width+gap:left-sr.width-gap;
          if(sl<8||sl+sr.width>window.innerWidth-8){state.menu.side=state.menu.side==='right'?'left':'right';sl=state.menu.side==='right'?left+rr.width+gap:left-sr.width-gap;}
          sl=clamp(sl,8,window.innerWidth-sr.width-8);let st=clamp(top,8,window.innerHeight-sr.height-8);side.style.left=`${sl}px`;side.style.top=`${st}px`;
        }
      }
    }
    if(state.hover){
      const anchor=document.querySelector(`[data-hover-domain="${CSS.escape(state.hover.domain)}"]`), el=document.querySelector('[data-overlay="hover"]');
      if(anchor&&el){const ar=anchor.getBoundingClientRect(),r=el.getBoundingClientRect();let left=clamp(ar.left+ar.width/2-r.width/2,8,window.innerWidth-r.width-8);let top=ar.top-r.height-8;if(top<8)top=ar.bottom+8;el.style.left=`${left}px`;el.style.top=`${clamp(top,8,window.innerHeight-r.height-8)}px`;}
    }
  }
  function openMenu(type,anchor,extra={}){
    const anchorEl=document.querySelector(`[data-menu-anchor="${CSS.escape(anchor)}"]`);
    const rect=anchorEl?.getBoundingClientRect();
    const side=rect&&rect.left<window.innerWidth*.53?'right':'left';
    state.menu={type,anchor,side,sub:null,compactSub:null,query:'',...extra};state.hover=null;renderOverlays();
  }
  function closeMenu(){state.menu=null;renderOverlays();}
  function setSubmenu(id){
    if(!state.menu)return;
    clearTimeout(submenuTimer);
    if(isPhone()){state.menu.compactSub=id;state.menu.sub=null;} else {state.menu.sub=id;state.menu.compactSub=null;}
    renderOverlays();
  }
  function toast(title,detail=''){
    const t={id:uid('toast'),title,detail};state.toast.push(t);renderOverlays();setTimeout(()=>{state.toast=state.toast.filter(x=>x.id!==t.id);renderOverlays();},2800);
  }
  function openEditor(id){ if(!state.editorTabs.includes(id))state.editorTabs.push(id);state.activeEditor=id;renderApp(); }
  function closeEditor(id){ const i=state.editorTabs.indexOf(id);state.editorTabs=state.editorTabs.filter(x=>x!==id);if(state.activeEditor===id)state.activeEditor=state.editorTabs[Math.max(0,i-1)]||state.editorTabs[0]||null;renderApp(); }
  function switchThread(id){
    const t=state.threads.find(x=>x.id===id);if(!t)return;
    const prev=activeThread(); if(prev) state.drafts[prev.id]=state.composer;
    state.selectedThread=id;t.unread=0;state.composer=state.drafts[id]||'';state.menu=null;state.hover=null;state.decision=null;
    renderApp(false);requestAnimationFrame(()=>{const tr=document.querySelector('[data-scroll-key="transcript"]');if(tr)tr.scrollTop=tr.scrollHeight;});
  }
  function mutateThread(id,fn){const t=state.threads.find(x=>x.id===id);if(t)fn(t);renderApp();}
  function appendMessage(msg,thread=activeThread()){thread.messages.push(msg);thread.updated='now';renderApp();requestAnimationFrame(()=>{const tr=document.querySelector('[data-scroll-key="transcript"]');if(tr)tr.scrollTop=tr.scrollHeight;});}

  function startWorking(reset=false){
    if(reset||state.work.completed){state.work={step:0,running:false,expanded:false,started:true,completed:false,elapsed:0,openPhase:null};}
    state.work.started=true;state.work.running=true;clearInterval(workTimer);renderApp();
    workTimer=setInterval(()=>{state.work.elapsed+=2;if(state.work.step<D.workSteps.length-1){state.work.step++;if(state.work.step===D.workSteps.length-1){state.work.completed=true;state.work.running=false;clearInterval(workTimer);}}else{state.work.completed=true;state.work.running=false;clearInterval(workTimer);}renderApp();},2000);
  }
  function pauseWorking(){state.work.running=false;clearInterval(workTimer);renderApp();}
  function stepWorking(){clearInterval(workTimer);state.work.running=false;state.work.started=true;state.work.elapsed+=3;state.work.step=clamp(state.work.step+1,0,D.workSteps.length-1);state.work.completed=state.work.step===D.workSteps.length-1;renderApp();}
  function completeWorking(){clearInterval(workTimer);state.work.running=false;state.work.started=true;state.work.step=D.workSteps.length-1;state.work.elapsed=Math.max(state.work.elapsed,134);state.work.completed=true;state.work.expanded=false;state.work.openPhase=null;renderApp();}
  function resetWorking(){clearInterval(workTimer);state.work=clone(DEFAULT.work);renderApp();}

  function globalReset(){
    clearInterval(workTimer);safeStorage.del('pm56-prefs');state=clone(DEFAULT);state.threads=clone(D.threads);state.questions=clone(D.questions);renderApp(false);toast('Concept reset','All recipes, components, panels, threads, answers, artifacts, and working states returned to stock.');setTimeout(()=>{if(state.demoAutoStart)startWorking(true);},900);
  }

  function applyRecipe(i){i=Number(i);const r=D.recipes[i];if(!r)return;state.recipe=i;state.variants=[...r.choices];renderApp();}
  function addReceipt(type,title,detail){appendMessage({id:uid(type),role:'system',type,title,detail,time:new Date().toISOString()});}

  function handleSend(){
    const raw=state.composer.trim();if(!raw)return;
    const t=activeThread();state.draftHistory[t.id]??=[];state.draftHistory[t.id].push(raw);state.composer='';
    t.messages.push({id:uid('user'),role:'user',type:'text',body:raw,time:new Date().toISOString()});
    const low=raw.toLowerCase();
    if(low.startsWith('/goal')||/create|start|set/.test(low)&&low.includes('goal')){state.capabilities.goal=true;addReceipt('goal-receipt','Goal Mode started','A durable goal artifact was created. View, edit, pause, resume, stop, clear, and inspect evidence in Activity Detail.');openEditor('goal-artifact');}
    else if(low.startsWith('/deep-plan')||low.includes('deep plan')){state.mode='Deep Plan';state.decision={type:'plan',mode:'review'};t.messages.push({id:uid('plan'),role:'system',type:'plan-card',artifactId:'plan-query',deep:true});openEditor('plan-query');}
    else if(low.startsWith('/plan')||/make|create|write/.test(low)&&low.includes('plan')){state.mode='Plan';state.decision={type:'plan',mode:'review'};t.messages.push({id:uid('plan'),role:'system',type:'plan-card',artifactId:'plan-query'});openEditor('plan-query');}
    else if(low.startsWith('/ask')){state.mode='Ask';t.messages.push({id:uid('assistant'),role:'assistant',type:'text',body:'Ask mode is active. I will answer and explain without making changes.',time:new Date().toISOString()});}
    else if(low.startsWith('/debug')||low.includes('debug')){state.mode='Debug';t.messages.push({id:uid('work'),role:'system',type:'working',title:'Debugging'});state.work=clone(DEFAULT.work);startWorking(true);}
    else if(low.startsWith('/compact')){state.dialog={type:'compact'};}
    else if(low.startsWith('/todo')){state.activity={...state.activity,open:true,domain:'todo'};}
    else if(low.startsWith('/web')){state.work.step=3;state.work.started=true;state.work.running=false;t.messages.push({id:uid('work'),role:'system',type:'working',title:'Web research'});}
    else{t.messages.push({id:uid('assistant'),role:'assistant',type:'text',body:'I added this as a normal conversational turn so you can evaluate the reading rhythm, message actions, wide response layout, and persistent More Details surface.',time:new Date().toISOString()});}
    renderApp();
  }

  function runDemoTrigger(name){
    state.dialog=null;
    if(name.startsWith('Work · ')){
      const label=name.slice(7);const idx=D.workSteps.findIndex(x=>x.label===label);
      switchThread('query');state.work={step:Math.max(0,idx),running:false,expanded:true,started:true,completed:idx===D.workSteps.length-1,elapsed:Math.max(4,idx*11)};renderApp();return;
    }
    const threadMap={'Live subagents':'subagents','Blocked subagent':'subagents','Crew coordination':'crew','BSD intervention':'bsd','BSD silent check':'bsd','BSD timeout':'bsd','Context Focus':'context','Context Mute':'context','Subcompact preview':'context','Browser debug':'debug','Offline queue':'offline','Reconnect replay':'offline','Attachment upload':'attachments','Unsupported attachment':'attachments','Provider route change':'route','Provider auth failure':'no-models','Provider quota':'route','No models':'no-models','New message anchor':'new-message','Artifact failure':'artifact-error','Goal replanning':'goal-replan'};
    if(threadMap[name])switchThread(threadMap[name]);
    if(name==='Start complete work'){switchThread('query');startWorking(true);return;}
    if(name==='Pause work'){pauseWorking();return;}
    if(name==='Step work'){stepWorking();return;}
    if(name==='Complete work'){completeWorking();return;}
    if(name==='Reset work'){resetWorking();return;}
    if(name==='Show work history'){state.work.expanded=true;renderApp();return;}
    if(name==='Conflict mediation'||name==='Conflict resolution'){state.decision={type:'conflict'};renderApp();return;}
    if(name==='Prepare questions'){state.decision={type:'question-preparing'};renderApp();setTimeout(()=>{if(state.decision?.type==='question-preparing'){state.decision={type:'question'};renderApp();}},1200);return;}
    if(name==='Open questionnaire'||name==='Queue questionnaire'||name==='Cancel and return'){switchThread('questions');state.decision={type:'question'};renderApp();return;}
    if(name==='Plan approval'){state.decision={type:'plan',mode:'review'};renderApp();return;}
    if(name==='Plan revision'){state.decision={type:'plan',mode:'revise',feedback:''};renderApp();return;}
    if(name==='Plan cancellation'){state.decision={type:'plan',mode:'review'};state.planStatus='ready';renderApp();return;}
    if(name==='Permission request'||name==='Permission denial'){state.decision={type:'permission'};renderApp();return;}
    const artifactMap={'Mermaid artifact':'mermaid-runtime','Interactive dashboard':'dashboard-query','Data explorer':'data-explorer','Architecture map':'architecture-map','Interactive quiz':'quiz-indexes','Periodic table':'periodic-capabilities','Flowchart':'flow-plan','Interactive chart':'chart-cost','Generated image':'generated-image','Test evidence':'test-evidence','Document artifact':'report-query','Deep Plan artifact':'plan-query','Artifact stale':'report-query'};
    if(artifactMap[name]){switchThread('visuals');openEditor(artifactMap[name]);return;}
    if(name==='ELI5 receipt'){state.capabilities.eli5=true;addReceipt('context-focus','ELI5 explanation','In simple terms: the new index lets the database jump directly to the right tenant and newest rows instead of checking almost everything.');return;}
    if(name==='Subcompact applied'){state.context.compacted=true;addReceipt('context-subcompact','Subcompact applied','18.4K tokens removed while active requirements and provenance remain available.');return;}
    if(name==='Subcompact cancelled'){addReceipt('context-subcompact','Subcompact cancelled','The preview was discarded and the active context was not changed.');return;}
    if(name==='Goal paused'||name==='Goal blocked'){switchThread('goal-replan');addReceipt('goal-receipt',name,name==='Goal blocked'?'Exact blocker: migration policy requires explicit approval.':'The current goal is paused and remains resumable.');return;}
    if(['BSD unavailable','BSD quota limited'].includes(name)){switchThread('bsd');addReceipt('bsd-advice',name,'The primary agent continued safely; independent review degraded gracefully without blocking the turn.');return;}
    if(name==='Plain text conversation'){switchThread('plain');return;}
    if(name==='Archived threads'){state.historyMode=isNarrow()?'floating':'pinned';state.historySearch='Archived';renderApp();return;}
    if(name==='Cross-thread search'){openMenu('thread-search','thread-search',{query:'context'});return;}
    if(name==='Long response'){switchThread('plain');state.messageExpanded={};renderApp();return;}
    if(name==='Message details'){switchThread('plain');const msg=activeThread().messages.find(x=>x.role==='assistant');if(msg)state.messageDetails[msg.id]=true;renderApp();return;}
    if(name==='Edit and branch'){toast('Edit and branch','The selected user message would open in a new child branch with lineage.');return;}
    if(name==='Restore from point'){toast('Restore from point','A restorable checkpoint would create a new branch without mutating history.');return;}
    if(name==='Draft history'){switchThread('plain');state.composer='An unfinished per-thread draft restored from history.';state.draftHistory.plain=['First draft','A clearer second draft','An unfinished per-thread draft restored from history.'];renderApp();return;}
    const stepMap={'Web search':3,'Web fetch':4,'Browser debug':5,'Bash':6,'App control':9,'Browser testing':10,'Program testing':10,'LSP analysis':11,'MCP tool':7};
    if(stepMap[name]!=null){switchThread('debug');state.work={step:stepMap[name],running:false,expanded:true,started:true,completed:false,elapsed:52};renderApp();return;}
    renderApp();
  }

  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-action]');
    const sub=e.target.closest('[data-submenu]');
    if(sub&&state.menu&&!btn){ e.stopPropagation(); setSubmenu(sub.dataset.submenu); return; }
    if(!btn){if(state.menu&&!e.target.closest('.overlay-menu'))closeMenu();return;}
    const a=btn.dataset.action;
    if(a==='open-menu'){e.stopPropagation();const type=btn.dataset.menu,anchor=btn.dataset.menuAnchor;if(state.menu?.type===type)closeMenu();else openMenu(type,anchor);return;}
    if(a==='context-menu'){e.stopPropagation();openMenu('context','context-ring');return;}
    if(a==='thread-menu'){e.stopPropagation();openMenu('thread',`thread-${btn.dataset.id}`,{threadId:btn.dataset.id});return;}
    if(a==='thread-search'){e.stopPropagation();openMenu('thread-search','thread-search');return;}
    if(a==='open-demo'){state.dialog={type:'demo'};state.menu=null;renderOverlays();return;}
    if(a==='close-dialog'){state.dialog=null;renderOverlays();return;}
    if(a==='reset-all'){globalReset();return;}
    if(a==='toggle-history'){const m=state.historyMode;state.historyMode = m==='floating' ? 'closed' : m==='pinned' ? (isNarrow()?'floating':'closed') : (isNarrow()?'floating':'pinned');renderApp();savePrefs();return;}
    if(a==='unpin-history'){state.historyMode='floating';renderApp();savePrefs();return;}
    if(a==='pin-history'){state.historyMode='pinned';renderApp();savePrefs();return;}
    if(a==='close-history'){state.historyMode='closed';renderApp();savePrefs();return;}
    if(a==='new-thread'){const id=uid('thread');state.threads.unshift({id,title:'Untitled thread',status:'idle',pinned:false,archived:false,updated:'now',unread:0,model:selectedModel().name,summary:'New assistant conversation',messages:[]});switchThread(id);return;}
    if(a==='select-thread'){if(e.target.closest('.thread-more'))return;switchThread(btn.dataset.id);return;}
    if(a==='toggle-thread-pin'){mutateThread(btn.dataset.id,t=>t.pinned=!t.pinned);state.menu=null;return;}
    if(a==='archive-thread'){mutateThread(btn.dataset.id,t=>{t.archived=true;t.pinned=false});state.menu=null;return;}
    if(a==='restore-thread'){mutateThread(btn.dataset.id,t=>{t.archived=false;t.updated='now'});state.menu=null;return;}
    if(a==='rename-thread'){const t=state.threads.find(x=>x.id===btn.dataset.id);state.dialog={type:'rename',threadId:t.id,value:t.title};state.menu=null;renderOverlays();return;}
    if(a==='save-thread-name'){const t=state.threads.find(x=>x.id===state.dialog.threadId);if(t)t.title=state.dialog.value.trim()||t.title;state.dialog=null;renderApp();return;}
    if(a==='fork-thread'){const src=state.threads.find(x=>x.id===btn.dataset.id);const id=uid('fork');state.threads.unshift({...clone(src),id,title:`${src.title} · Fork`,pinned:false,archived:false,updated:'now',summary:`Forked from ${src.title}`});state.menu=null;switchThread(id);toast('Thread forked',`Created a child branch from ${src.title}.`);return;}
    if(a==='select-editor'){if(e.target.closest('[data-action="close-editor"]'))return;state.activeEditor=btn.dataset.id;renderApp();return;}
    if(a==='close-editor'){e.stopPropagation();closeEditor(btn.dataset.id);return;}
    if(a==='open-artifact'){state.decision=null;openEditor(btn.dataset.id);return;}
    if(a==='open-agent'){openEditor(`thread-${btn.dataset.id}`);return;}
    if(a==='open-change'){openEditor(`file:${btn.dataset.path}`);return;}
    if(a==='toggle-message'){state.messageExpanded[btn.dataset.id]=!state.messageExpanded[btn.dataset.id];renderApp();return;}
    if(a==='message-details'){state.messageDetails[btn.dataset.id]=!state.messageDetails[btn.dataset.id];renderApp();return;}
    if(a==='copy-message'){toast('Message copied','The visible message text was copied without thread mutation.');return;}
    if(a==='edit-message'){toast('Edit and branch','A new child branch would open with the user message editable.');return;}
    if(a==='reanswer-message'){toast('Re-answer branch','A new branch would answer again from the preceding user turn.');return;}
    if(a==='start-working'){startWorking();return;}if(a==='pause-working'){pauseWorking();return;}if(a==='step-working'){stepWorking();return;}if(a==='complete-working'){completeWorking();return;}if(a==='reset-working'){resetWorking();return;}if(a==='toggle-work-history'){state.work.expanded=!state.work.expanded;renderApp();return;}if(a==='inspect-work-step'){state.work.step=Number(btn.dataset.value);state.work.running=false;clearInterval(workTimer);renderApp();return;}if(a==='toggle-work-phase'){const k=btn.dataset.value;state.work.openPhase=(state.work.openPhase===k?null:k);renderApp();return;}
    if(a==='open-activity'){state.activity.open=true;state.activity.domain=btn.dataset.domain;if(!state.activity.expanded.includes(btn.dataset.domain))state.activity.expanded.push(btn.dataset.domain);state.hover=null;renderApp();return;}
    if(a==='focus-activity'){state.activity.domain=btn.dataset.domain;if(!state.activity.expanded.includes(btn.dataset.domain))state.activity.expanded.push(btn.dataset.domain);renderApp();return;}
    if(a==='toggle-activity-section'){const id=btn.dataset.domain;state.activity.expanded=state.activity.expanded.includes(id)?state.activity.expanded.filter(x=>x!==id):[...state.activity.expanded,id];renderApp();return;}
    if(a==='toggle-activity-filter'){state.activity.filterVisible=!state.activity.filterVisible;renderApp();return;}
    if(a==='pin-activity'){state.activity.pinned=true;state.activity.open=true;renderApp();return;}
    if(a==='unpin-activity'){state.activity.pinned=false;renderApp();return;}
    if(a==='close-activity'){state.activity.open=false;state.activity.pinned=false;renderApp();return;}
    if(a==='context-details'){state.context.details=true;state.menu=null;renderApp();return;}
    if(a==='close-context-details'){state.context.details=false;renderOverlays();return;}
    if(a==='compact-now'){state.menu=null;state.dialog={type:'compact'};renderOverlays();return;}
    if(a==='apply-compaction'||a==='apply-subcompact'){state.context.compacted=true;state.capabilities.context='Auto';state.dialog=null;state.menu=null;addReceipt('context-subcompact','Context compacted','18.4K tokens removed · active requirements and provenance retained.');return;}
    if(a==='cancel-subcompact'){state.capabilities.context='Auto';state.menu.sub='context-lens';renderOverlays();return;}
    if(a==='export-context'){toast('Redacted context exported','Secrets and provider credentials were excluded.');return;}
    if(a==='raw-context'){toast('Raw projection opened','A redacted source-by-source projection would open in the editor.');return;}
    if(a==='set-persona'){state.persona=btn.dataset.value;closeMenu();renderApp();return;}
    if(a==='set-permissions'){state.permissions=btn.dataset.value;closeMenu();renderApp();return;}
    if(a==='set-worktree'){state.worktree=btn.dataset.value;closeMenu();renderApp();return;}
    if(a==='set-mode'){state.mode=btn.dataset.value;if(!['Plan','Deep Plan'].includes(state.mode)){closeMenu();renderApp();}else{setSubmenu(state.mode==='Plan'?'plan':'deep-plan');}return;}
    if(a==='set-thoroughness'){state.mode=btn.dataset.mode;state.thoroughness=btn.dataset.value;closeMenu();renderApp();return;}
    if(a==='model-provider'){state.modelProvider=btn.dataset.value;state.modelView=btn.dataset.value==='favorites'?'favorites':'all';renderOverlays();return;}
    if(a==='set-model'){state.model=btn.dataset.value;const model=selectedModel();if(!model.efforts.includes(state.effort))state.effort=model.efforts[model.efforts.length-1];setSubmenu(`model:${model.id}`);renderApp();return;}
    if(a==='toggle-favorite'){e.stopPropagation();const m=D.models.find(x=>x.id===btn.dataset.value);if(m)m.favorite=!m.favorite;renderOverlays();return;}
    if(a==='set-effort'){state.model=btn.dataset.model;state.effort=btn.dataset.value;renderApp();renderOverlays();savePrefs();return;}
    if(a==='toggle-fast'){state.model=btn.dataset.model;state.fast=!state.fast;renderApp();renderOverlays();savePrefs();return;}
    if(a==='submenu-back'){state.menu.compactSub=null;state.menu.sub=null;renderOverlays();return;}
    if(a==='set-goal-cap'){state.capabilities.goal=btn.dataset.value==='On';closeMenu();renderApp();savePrefs();return;}
    if(a==='set-crew-cap'){state.capabilities.crew=btn.dataset.value==='On';closeMenu();renderApp();savePrefs();return;}
    if(a==='set-bsd-cap'){state.capabilities.bsd=btn.dataset.value;closeMenu();renderApp();savePrefs();return;}
    if(a==='set-context-cap'){state.capabilities.context=btn.dataset.value;if(btn.dataset.value==='Subcompact'){state.menu.sub='context-lens';renderOverlays();}else{closeMenu();addReceipt(btn.dataset.value==='Focus'?'context-focus':'context-mute',`Context Lens · ${btn.dataset.value}`,btn.dataset.value==='Focus'?'Current files and final references prioritized.':'Selected superseded sources omitted from the active projection.');}return;}
    if(a==='set-eli5-cap'){state.capabilities.eli5=btn.dataset.value==='On';closeMenu();renderApp();return;}
    if(a==='set-thought-cap'){state.capabilities.thought=btn.dataset.value;closeMenu();renderApp();return;}
    if(a==='open-questionnaire'){state.decision={type:'question'};renderApp();return;}
    if(a==='prev-question'){state.questionIndex=Math.max(0,state.questionIndex-1);renderApp();return;}
    if(a==='next-question'){const q=state.questions[state.questionIndex];if(q.required&&!(Array.isArray(q.answer)?q.answer.length:String(q.answer||'').trim())){toast('Answer required','Complete this question or use Skip to return later.');return;}state.questionIndex=Math.min(state.questions.length-1,state.questionIndex+1);renderApp();return;}
    if(a==='answer-choice'){state.questions[state.questionIndex].answer=btn.dataset.value;renderApp();return;}
    if(a==='answer-multi'){const q=state.questions[state.questionIndex];q.answer=Array.isArray(q.answer)?q.answer:[];q.answer=q.answer.includes(btn.dataset.value)?q.answer.filter(x=>x!==btn.dataset.value):[...q.answer,btn.dataset.value];renderApp();return;}
    if(a==='skip-question'){state.questionIndex=Math.min(state.questions.length-1,state.questionIndex+1);toast('Question skipped','It remains queued and can be answered later.');renderApp();return;}
    if(a==='close-decision'){state.decision=null;renderApp();return;}
    if(a==='cancel-questionnaire'){state.decision=null;addReceipt('question-receipt','Questionnaire cancelled','The explicit cancellation is recorded. Existing answers remain in thread history.');return;}
    if(a==='submit-questionnaire'){const missing=state.questions.find(q=>q.required&&!(Array.isArray(q.answer)?q.answer.length:String(q.answer||'').trim()));if(missing){toast('Required answers remain',missing.prompt);return;}state.decision={type:'question-submitting'};renderApp();setTimeout(()=>{state.decision=null;state.questionQueue=Math.max(0,state.questionQueue-1);addReceipt('question-receipt','Questionnaire submitted','5 answers attached to the deployment planning context.');},950);return;}
    if(a==='revise-plan'){state.decision={type:'plan',mode:'revise',feedback:''};renderApp();return;}
    if(a==='build-plan'){state.decision={type:'plan',mode:'review'};renderApp();return;}
    if(a==='cancel-plan'){state.decision=null;state.planStatus='cancelled';toast('Plan decision closed','The durable plan card remains in the transcript with View, Revise, and Build.');renderApp();return;}
    if(a==='submit-plan-revision'){state.planRevision++;state.decision={type:'plan',mode:'review'};toast('Plan revision created',`Revision ${state.planRevision} is open in the editor and ready for review.`);openEditor('plan-query');return;}
    if(a==='approve-plan'){state.decision=null;state.planStatus='building';state.mode='Agent';addReceipt('goal-receipt','Plan approved · Build started','The assistant switched from planning to execution and preserved the Plan artifact.');startWorking(true);return;}
    if(a==='open-permission'){state.decision={type:'permission'};renderApp();return;}
    if(a==='deny-permission'){state.decision=null;addReceipt('permission','Permission denied','The checkpoint remains available; no action was replayed.');return;}
    if(a==='approve-permission'){state.decision=null;state.work.step=5;startWorking();return;}
    if(a==='resolve-conflict'){state.decision=null;addReceipt('route-change','Parent mediation resolved',btn.dataset.value==='indexes'?'Composite indexes approved as the reversible first step.':btn.dataset.value==='views'?'Materialized-view follow-up selected.':'Explicit schema-policy override recorded.');return;}
    if(a==='trigger-work-recovery'){state.decision={type:'permission'};renderApp();return;}
    if(a==='open-goal'){openEditor('goal-artifact');return;}
    if(a==='edit-goal'){toast('Goal edited','A material edit created Revision 5 and moved the Goal into Replanning.');addReceipt('goal-receipt','Goal replanning','Revision 5 · material scope change detected.');return;}
    if(a==='pause-goal'||a==='resume-goal'||a==='stop-goal'||a==='clear-goal'){toast('Goal lifecycle',a.replace('-goal','').replace(/^./,c=>c.toUpperCase()));return;}
    if(a==='open-bsd-details'){state.dialog={type:'bsd'};renderOverlays();return;}
    if(a==='dismiss-event'){toast('Receipt dismissed','The intervention remains available in thread history.');return;}
    if(a==='attach'){addReceipt('attachment','Uploading design-reference.png','82% · image preview and artifact registration in progress.');return;}
    if(a==='send'){handleSend();return;}
    if(a==='demo-trigger'){runDemoTrigger(btn.dataset.trigger);return;}
    if(a==='jump-search-result'){state.menu=null;switchThread(btn.dataset.thread);setTimeout(()=>{const el=document.querySelector(`[data-message-id="${CSS.escape(btn.dataset.message)}"]`);el?.scrollIntoView({block:'center',behavior:'smooth'});},50);return;}
    if(a==='show-archived'){state.historySearch='';state.historyMode=isNarrow()?'floating':'pinned';state.menu=null;renderApp();requestAnimationFrame(()=>{const hs=document.querySelector('[data-scroll-key="history"]');if(hs)hs.scrollTop=hs.scrollHeight;});return;}
    if(a==='search-current-demo'){state.menu.query='query';renderOverlays();return;}
    if(a==='toggle-mermaid-source'){state.artifactState.mermaidSource=!state.artifactState.mermaidSource;renderApp();return;}
    if(a==='copy-mermaid'){toast('Mermaid source copied','The source artifact remains independently editable.');return;}
    if(a==='chart-metric'){state.artifactState.chartMetric=btn.dataset.value;renderApp();return;}
    if(a==='data-filter'){state.artifactState.dataFilter=btn.dataset.value;renderApp();return;}
    if(a==='quiz-answer'){state.artifactState.quizAnswer=Number(btn.dataset.value);renderApp();return;}
    if(a==='periodic-cell'){toast(btn.dataset.value,'Capability details would open in a linked inspector.');return;}
    if(a==='retry-artifact'){state.artifactState.retrying=true;toast('Renderer retrying','Source fallback remains available during recovery.');setTimeout(()=>{const art=D.artifacts.find(x=>x.id===btn.dataset.id);if(art)art.status='ready';state.artifactState.retrying=false;renderApp();},900);return;}
  });

  document.addEventListener('input',e=>{
    const k=e.target.dataset.input;if(!k)return;
    if(k==='composer'){state.composer=e.target.value;state.drafts[state.selectedThread]=state.composer;return;}
        if(k==='history-search'){state.historySearch=e.target.value;renderApp();return;}
        if(k==='model-search'){state.modelSearch=e.target.value;renderOverlays();return;}
        if(k==='thread-global-search'){state.menu.query=e.target.value;renderOverlays();return;}
    if(k==='rename-thread'){state.dialog.value=e.target.value;return;}
    if(k==='question-text'){state.questions[state.questionIndex].answer=e.target.value;return;}
    if(k==='plan-feedback'){state.decision.feedback=e.target.value;return;}
  });

  document.addEventListener('change',e=>{
    const k=e.target.dataset.input;if(!k)return;
    if(k==='recipe'){applyRecipe(e.target.value);state.dialog={type:'demo'};renderOverlays();return;}
    if(k==='theme'){applyTheme(e.target.value);savePrefs();return;}
    if(k==='variant'){const f=Number(e.target.dataset.family);state.variants[f]=clamp(Number(e.target.value),0,familyMax(f));state.recipe=-1;renderApp();return;}
  });

  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&document.activeElement?.matches('[data-input="composer"]')){e.preventDefault();handleSend();}
    if(e.key==='Escape'){
      if(state.menu){closeMenu();return;}
      if(state.dialog){state.dialog=null;renderOverlays();return;}
      if(state.context.details){state.context.details=false;renderOverlays();return;}
      if(state.historyMode==='floating'){state.historyMode='closed';renderApp();return;}
      if(state.decision){state.decision=null;renderApp();}
    }
  });

  document.addEventListener('pointerover',e=>{
    const sub=e.target.closest('[data-submenu]');
    if(sub&&state.menu){clearTimeout(submenuTimer);setSubmenu(sub.dataset.submenu);return;}
    const act=e.target.closest('[data-hover-domain]');
    if(act){clearTimeout(hoverTimer);state.hover={type:'activity',domain:act.dataset.hoverDomain};renderOverlays();}
  });
  document.addEventListener('pointerout',e=>{
    const act=e.target.closest('[data-hover-domain]');
    if(act&&!act.contains(e.relatedTarget)){clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{if(!document.querySelector('.hover-card:hover')){state.hover=null;renderOverlays();}},160);}
  });

  document.addEventListener('pointerdown',e=>{
    const handle=e.target.closest('[data-resize]');if(!handle)return;
    e.preventDefault();handle.setPointerCapture?.(e.pointerId);dragState={kind:handle.dataset.resize,startX:e.clientX,editor:state.editorWidth,history:state.historyWidth,activity:state.activityWidth};handle.classList.add('dragging');
  });
  document.addEventListener('pointermove',e=>{
    if(!dragState)return;
    const dx=e.clientX-dragState.startX;
    if(dragState.kind==='editor')state.editorWidth=clamp(dragState.editor+(dx/window.innerWidth)*100,25,72);
    if(dragState.kind==='history')state.historyWidth=clamp(dragState.history+dx,170,360);
    if(dragState.kind==='activity')state.activityWidth=clamp(dragState.activity+dx,240,470);
    document.documentElement.style.setProperty('--editor-w',`${state.editorWidth}%`);document.documentElement.style.setProperty('--history-w',`${state.historyWidth}px`);document.documentElement.style.setProperty('--activity-w',`${state.activityWidth}px`);
  });
  document.addEventListener('pointerup',()=>{if(dragState){document.querySelectorAll('.dragging').forEach(x=>x.classList.remove('dragging'));dragState=null;savePrefs();}});

  window.addEventListener('resize',()=>{if(state.menu||state.hover)renderOverlays();if(isNarrow()&&state.historyMode==='pinned')renderApp();});

  // Public deterministic concept API used by the Demo Studio and automated inspection.
  window.PM56_DEMO={
    getState:()=>clone(state),
    reset:globalReset,
    setTheme:(id)=>applyTheme(id),
    setRecipe:(i)=>applyRecipe(i),
    setVariant:(family,option)=>{const f=Number(family);state.variants[f]=clamp(Number(option),0,familyMax(f));state.recipe=-1;renderApp();},
    selectThread:switchThread,
    openActivity:(domain)=>{if(activityDefs[domain]){state.activity.open=true;state.activity.domain=domain;renderApp();}},
    pinActivity:()=>{state.activity.open=true;state.activity.pinned=true;renderApp();},
    openContext:()=>{state.context.details=true;renderOverlays();},
    openQuestionnaire:()=>{state.decision={type:'question'};renderApp();},
    openPlan:()=>{state.decision={type:'plan',mode:'review'};renderApp();},
    openPermission:()=>{state.decision={type:'permission'};renderApp();},
    startWorking:()=>startWorking(true),pauseWorking,stepWorking,completeWorking,resetWorking,
    setWorkStep:(i)=>{clearInterval(workTimer);state.work.step=clamp(Number(i),0,D.workSteps.length-1);state.work.started=true;state.work.running=false;state.work.completed=state.work.step===D.workSteps.length-1;renderApp();},
    trigger:runDemoTrigger,
    listTriggers:()=>['Start complete work','Pause work','Complete work','Show work history','Live subagents','Blocked subagent','Conflict mediation','Crew coordination','Prepare questions','Open questionnaire','Queue questionnaire','Plan approval','Plan revision','Permission request','Conflict resolution','Cancel and return','Mermaid artifact','Interactive dashboard','Data explorer','Architecture map','Interactive quiz','Periodic table','Flowchart','Generated image','Artifact failure','BSD intervention','BSD silent check','BSD timeout','Context Focus','Context Mute','Subcompact preview','ELI5 receipt','Goal replanning','Browser debug','Web search','Web fetch','Bash','App control','Browser testing','Offline queue','Reconnect replay','Attachment upload','Provider route change','No models','New message anchor'],
    openArtifact:openEditor,
    snapshot:()=>({theme:state.theme,recipe:state.recipe,variants:[...state.variants],thread:state.selectedThread,work:{...state.work},decision:state.decision?.type||null,activity:clone(state.activity)})
  };

  // Initial full render and a real, one-shot working sequence so the first open is not static.
  renderApp(false);
  requestAnimationFrame(()=>{const tr=document.querySelector('[data-scroll-key="transcript"]');if(tr)tr.scrollTop=tr.scrollHeight;});
  setTimeout(()=>{if(state.demoAutoStart&&!state.work.started&&state.selectedThread==='query')startWorking(true);},250);
})();


/* === PM56 FINAL RUNTIME DIAGNOSTICS === */
(() => {
  const runtime = {
    errors: [],
    rejections: [],
    startedAt: Date.now(),
    get ready() { return Boolean(window.__PM56_BOOT_OK || document.body?.dataset?.pm56Ready === 'true'); },
    snapshot() {
      const q = (s) => document.querySelector(s);
      const qa = (s) => [...document.querySelectorAll(s)];
      return {
        ready: this.ready,
        title: document.title,
        bodyText: (document.body?.innerText || '').length,
        threads: qa('.thread-row, .thread-item').length,
        messages: qa('.message, [data-message-id]').length,
        activityDomains: qa('[data-activity-domain], .activity-domain, .activity-chip').length,
        artifacts: qa('.artifact-card, [data-artifact-id]').length,
        menus: qa('[role="menu"]:not([hidden]), .popup-menu:not([hidden]), .menu-panel:not([hidden])').length,
        decisionVisible: Boolean(q('.decision-host:not([hidden])')?.textContent?.trim()),
        errors: [...this.errors],
        rejections: [...this.rejections]
      };
    }
  };
  window.PM56_RUNTIME = runtime;
  window.addEventListener('error', (event) => {
    runtime.errors.push({ message: String(event.message || event.error || 'error'), source: event.filename || '', line: event.lineno || 0 });
  });
  window.addEventListener('unhandledrejection', (event) => {
    runtime.rejections.push(String(event.reason?.stack || event.reason || 'unhandled rejection'));
  });
  const markReady = () => {
    const populated = document.body && document.body.innerText.length > 500;
    if (populated) {
      document.body.dataset.pm56Ready = 'true';
      window.__PM56_BOOT_OK = true;
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(markReady, 0), { once: true });
  else setTimeout(markReady, 0);
  setTimeout(markReady, 250);
  setTimeout(markReady, 1000);
})();
