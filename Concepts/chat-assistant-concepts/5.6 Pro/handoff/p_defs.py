from pathlib import Path
app=Path("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/app.js")
t=app.read_text()
def sub(old,new,n=1):
    global t
    if t.count(old)!=n: raise SystemExit(f"ANCHOR FAIL ({t.count(old)}/{n}):\n{old[:200]}")
    t=t.replace(old,new,n)

OLD = """  const activityDefs={
    goal:{icon:'goal',label:'Goal',count:'3/4',state:'live',summary:'Optimizing tenant-scoped analytics queries',detail:'Running · Phase 2 of 4 · one schema-policy blocker'},
    todo:{icon:'todo',label:'Todo',count:'2/8',state:'changed',summary:'Compare composite index order',detail:'2 done · 1 active · 1 blocked · 1 skipped'},
    subagents:{icon:'users',label:'Subagents',count:'2',state:'live',summary:'Two agents active, one blocked',detail:'Query Analyzer working · Schema Reviewer blocked'},
    changes:{icon:'changes',label:'Changes',count:'3',state:'changed',summary:'3 files changed',detail:'+100 −17 · exact ranges available in the editor'},
    artifacts:{icon:'artifact',label:'Artifacts',count:'13',state:'changed',summary:'Plan, Mermaid, dashboard, and more',detail:'11 ready · 1 stale · 1 recoverable renderer error'}
  };
"""

NEW = r'''  /* ---------------------------------------------------------------------
     activityDefs() is DERIVED, not authored.
     It used to be five object literals, and they had already drifted from the
     fixtures they describe: Subagents said "2" while data.js holds 5, and four
     separate renderers printed four different subagent counts. Everything here
     is computed from whatever collections D actually has, each field with a
     fallback, so the Wave 2 Demo Data agent can enrich or add a collection and
     these headline rows follow automatically -- no circular dependency, and no
     second place to keep in step. Field shapes are in FIXTURE_SCHEMA.md.

     `state` stays in the vocabulary styles.css already understands
     (live | changed | anything-else-is-idle). `tone` is the richer signal
     (working | blocked | done | idle) for the Wave 2 Activity Bar agent, which
     lights the icons instead of the .state-mark dot.
     --------------------------------------------------------------------- */
  const DONE_STATES=['done','completed'];
  const ACTIVE_STATES=['doing','in_progress','running','next','pending'];
  const RUNNING_STATES=['doing','in_progress','running','working'];
  const plural=(n,one,many)=>`${n} ${n===1?one:many}`;
  /* Until data.js grows a `goal` record (Wave 2, item 2) the Goal row has no
     fixture to derive from. One clearly-labelled fallback beats five literals
     scattered through the renderers; delete it when D.goal lands. */
  const GOAL_FALLBACK={title:'Optimize analytics query performance',status:'active',phasesDone:1,phasesTotal:4,blocker:'Production schema modification requires explicit approval.'};

  function goalSummary(){
    const g=D.goal;
    if(!g) return {...GOAL_FALLBACK, derived:false};
    const phases=Array.isArray(g.phases)?g.phases:[];
    return {
      title:g.title||g.objective||GOAL_FALLBACK.title,
      status:g.status||'active',
      phasesDone:phases.filter(p=>p.status==='completed').length,
      phasesTotal:phases.length,
      blocker:(g.blocker&&(g.blocker.cause||g.blocker.label))||phases.find(p=>p.status==='blocked')?.blocker?.cause||'',
      derived:true
    };
  }
  function mostRecentArtifact(){
    const list=D.artifacts||[];
    if(!list.length) return null;
    const dated=list.filter(a=>a.updatedAt);
    if(!dated.length) return list[0];
    return dated.slice().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];
  }
  function activityDefs(){
    const g=goalSummary();
    const todos=D.todos||[];
    const tDone=todos.filter(x=>DONE_STATES.includes(x.status)).length;
    const tActive=todos.filter(x=>RUNNING_STATES.includes(x.status)).length;
    const tOpen=todos.filter(x=>ACTIVE_STATES.includes(x.status)).length;
    const tBlocked=todos.filter(x=>x.status==='blocked').length;
    const tSkipped=todos.filter(x=>x.status==='skipped').length;
    const tNow=todos.find(x=>RUNNING_STATES.includes(x.status))||todos.find(x=>ACTIVE_STATES.includes(x.status))||todos[0];

    const agents=D.subagents||[];
    const aWorking=agents.filter(a=>a.status==='working').length;
    const aBlocked=agents.filter(a=>a.status==='blocked').length;
    const aWaiting=agents.filter(a=>a.status==='waiting').length;

    const changes=D.changes||[];
    const cAdd=changes.reduce((s,c)=>s+(Number(c.add)||0),0);
    const cDel=changes.reduce((s,c)=>s+(Number(c.del)||0),0);

    const arts=D.artifacts||[];
    const artReady=arts.filter(a=>a.status==='ready').length;
    const artStale=arts.filter(a=>a.status==='stale').length;
    const artError=arts.filter(a=>a.status==='error').length;
    const artLoading=arts.filter(a=>a.status==='loading').length;
    const recent=mostRecentArtifact();

    return {
      goal:{icon:'goal',label:'Goal',
        count:g.phasesTotal?`${g.phasesDone}/${g.phasesTotal}`:'—',
        state:g.status==='active'?'live':'changed',
        tone:g.blocker?'blocked':g.status==='active'?'working':g.status==='complete'?'done':'idle',
        summary:g.title,
        detail:[g.status.replace(/^./,c=>c.toUpperCase()),g.phasesTotal?`phase ${Math.min(g.phasesDone+1,g.phasesTotal)} of ${g.phasesTotal}`:null,g.blocker?'one blocker':null].filter(Boolean).join(' · ')},
      todo:{icon:'todo',label:'Todo',
        count:`${tDone}/${todos.length}`,
        state:tActive?'live':'changed',
        tone:tBlocked?'blocked':tActive?'working':tOpen?'idle':'done',
        summary:tNow?tNow.label:'No todos recorded',
        detail:`${tDone} done · ${tActive} active · ${tBlocked} blocked · ${tSkipped} skipped`},
      subagents:{icon:'users',label:'Subagents',
        count:String(agents.length),
        state:aWorking?'live':'changed',
        tone:aBlocked?'blocked':aWorking?'working':aWaiting?'idle':'done',
        summary:agents.length?`${plural(aWorking,'agent','agents')} working, ${aBlocked} blocked`:'No child agents',
        detail:agents.slice(0,2).map(a=>`${a.name} ${a.status}`).join(' · ')||'No child agents'},
      changes:{icon:'changes',label:'Changes',
        count:String(changes.length),
        state:'changed', tone:changes.length?'working':'idle',
        summary:`${plural(changes.length,'file','files')} changed`,
        detail:`+${cAdd} −${cDel} · exact ranges available in the editor`},
      artifacts:{icon:'artifact',label:'Artifacts',
        count:String(arts.length),
        state:artLoading?'live':'changed',
        tone:artError?'blocked':artLoading?'working':'done',
        summary:recent?recent.title:'No artifacts',
        detail:[`${artReady} ready`,artStale?`${artStale} stale`:null,artError?`${plural(artError,'recoverable renderer error','recoverable renderer errors')}`:null,artLoading?`${artLoading} loading`:null].filter(Boolean).join(' · ')}
    };
  }
'''
sub(OLD, NEW)

# call sites
sub("""    return `<div class="activity-wrap"><div class="activity-bar" data-variant="${state.variants[3]}">${Object.entries(activityDefs).map(""",
    """    return `<div class="activity-wrap"><div class="activity-bar" data-variant="${state.variants[3]}">${Object.entries(activityDefs()).map(""")
sub("""  function renderActivityPanel(transient=false){
    const d=state.activity.domain;
    return `<aside class="activity-panel ${transient?'transient':''}" data-variant="${state.variants[4]}"><div class="activity-panel-head"><span class="event-icon">${icon(activityDefs[d].icon,13)}</span>""",
    """  function renderActivityPanel(transient=false){
    const d=state.activity.domain, defs=activityDefs(), recent=mostRecentArtifact();
    return `<aside class="activity-panel ${transient?'transient':''}" data-variant="${state.variants[4]}"><div class="activity-panel-head"><span class="event-icon">${icon((defs[d]||defs.goal).icon,13)}</span>""")
sub("""<div class="activity-filter ${state.activity.filterVisible?'':'hidden'}">${Object.entries(activityDefs).map(""",
    """<div class="activity-filter ${state.activity.filterVisible?'':'hidden'}">${Object.entries(defs).map(""")
sub("""<div class="activity-summary-card"><strong>${esc(D.artifacts[0].title)}</strong><p>${esc(D.artifacts[0].summary)}</p><button class="soft-button" data-action="open-artifact" data-id="plan-query">${icon('eye',12)} Open full plan</button></div>""",
    """<div class="activity-summary-card"><strong>${esc(recent?recent.title:'No artifacts')}</strong><p>${esc(recent?recent.summary:'')}</p>${recent?`<button class="soft-button" data-action="open-artifact" data-id="${esc(recent.id)}">${icon('eye',12)} Open ${esc(recent.kind==='plan'?'full plan':recent.kind)}</button>`:''}</div>""")
sub("""  function renderActivitySection(id){
    const d=activityDefs[id], open=state.activity.expanded.includes(id);""",
    """  function renderActivitySection(id){
    const d=activityDefs()[id], open=state.activity.expanded.includes(id);""")
sub("""      const d=activityDefs[h.domain];return extReplace('activityHoverCard'""",
    """      const d=activityDefs()[h.domain];return extReplace('activityHoverCard'""")
sub("""    openActivity:(domain)=>{if(activityDefs[domain]){state.activity.open=true;state.activity.domain=domain;renderApp();}},""",
    """    openActivity:(domain)=>{if(activityDefs()[domain]){state.activity.open=true;state.activity.domain=domain;renderApp();}},""")

# the other three renderers that disagreed about the same numbers
sub("""<span class="chat-state"><i class="status-dot working"></i>3 active</span></div><div class="system-card-body"><div class="live-agent-list">${D.subagents.slice(0,4).map(renderLiveAgentRow).join('')}</div>""",
    """<span class="chat-state"><i class="status-dot working"></i>${(D.subagents||[]).filter(a=>a.status==='working').length} active</span></div><div class="system-card-body"><div class="live-agent-list">${(D.subagents||[]).slice(0,5).map(renderLiveAgentRow).join('')}</div>""")
sub("""<span class="receipt-chip">3 files</span><span class="receipt-chip">2 agents</span><span class="receipt-chip">42 tests</span><span class="receipt-chip">2 artifacts</span>""",
    """<span class="receipt-chip">${(D.changes||[]).length} files</span><span class="receipt-chip">${(D.subagents||[]).length} agents</span><span class="receipt-chip">42 tests</span><span class="receipt-chip">${(D.artifacts||[]).length} artifacts</span>""")

app.write_text(t)
print("activityDefs derived")
