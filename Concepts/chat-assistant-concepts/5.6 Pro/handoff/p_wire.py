from pathlib import Path
app=Path("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/app.js")
t=app.read_text()
def sub(old,new,n=1):
    global t
    if t.count(old)!=n: raise SystemExit(f"ANCHOR FAIL ({t.count(old)}/{n}):\n{old[:200]}")
    t=t.replace(old,new,n)

# ============ 15g: dead state fields ============
sub("""    threads:clone(D.threads), editorTabs:['plan-query'], activeEditor:'plan-query', editorMode:{},""",
    """    threads:clone(D.threads), editorTabs:['plan-query'], activeEditor:'plan-query',""")
sub("""    artifactState:{quizAnswer:null,dataFilter:'all',mermaidSource:false,chartMetric:'p95',retrying:false},
    activityFilter:null, demoAutoStart:true, newMessageCount:0
  };""",
    """    artifactState:{quizAnswer:null,dataFilter:'all',mermaidSource:false,chartMetric:'p95',retrying:false},
    demoAutoStart:true
  };""")

# planStatus becomes readable on the durable plan card
sub("""<span class="sub"> · Revision ${state.planRevision}</span></div><span class="spacer"></span><span class="meta-pill">${m.deep?'Exhaustive':'Thorough'}</span>""",
    """<span class="sub"> · Revision ${state.planRevision}</span></div><span class="spacer"></span><span class="meta-pill">${esc(state.planStatus)}</span><span class="meta-pill">${m.deep?'Exhaustive':'Thorough'}</span>""")
# questionQueue becomes readable on the questionnaire head
sub("""<strong>Deployment questionnaire</strong><span class="meta-pill">${answered}/${state.questions.length} answered</span>""",
    """<strong>Deployment questionnaire</strong><span class="meta-pill">${answered}/${state.questions.length} answered</span>${state.questionQueue?`<span class="meta-pill">${state.questionQueue} queued</span>`:''}""")
# draftHistory becomes readable and restorable from the composer
sub("""<div class="composer-tools"><button class="icon-button" data-action="attach" title="Attach files or images">${icon('attach',14)}</button>""",
    """<div class="composer-tools"><button class="icon-button" data-action="attach" title="Attach files or images">${icon('attach',14)}</button>${drafts.length?`<button class="text-button" data-action="restore-draft" title="Restore the previous draft saved for this thread">${icon('history',11)}<span>Drafts (${drafts.length})</span></button>`:''}""")
sub("""  function renderComposer(){
    const m=selectedModel();
    const caps=[];""",
    """  function renderComposer(){
    const m=selectedModel();
    /* handleSend() has always pushed every sent draft here; nothing ever read
       it back, so the store was write-only. It is now a real affordance. */
    const drafts=state.draftHistory[state.selectedThread]||[];
    const caps=[];""")
sub("""    if(a==='attach'){addReceipt('attachment','Uploading design-reference.png','82% · image preview and artifact registration in progress.');return;}""",
    """    if(a==='restore-draft'){const list=state.draftHistory[state.selectedThread]||[];if(!list.length){toast('No earlier draft','Nothing has been sent from this thread yet.');return;}state.composer=list[list.length-1];state.drafts[state.selectedThread]=state.composer;renderApp();toast('Draft restored',`Restored the most recent of ${list.length} saved drafts.`);return;}
    if(a==='attach'){addReceipt('attachment','Uploading design-reference.png','82% · image preview and artifact registration in progress.');return;}""")

# ============ 15d: buttons that only raised a toast ============
sub("""  function renderMermaidEditor(art){
    const source=`flowchart LR""",
    """  /* Hoisted so copy-mermaid can copy the real source instead of claiming to. */
  const MERMAID_SOURCE=`flowchart LR
  Chat[Chat Thread] --> Work[Inline Working Animation]
  Chat --> Activity[Chat Activity Bar]
  Activity --> Detail[Activity Detail]
  Detail --> Editor[File Editor]
  Work --> Agents[Read-only Child Threads]
  Chat --> Artifact[Native Visual Artifacts]`;
  function renderMermaidEditor(art){
    const source=MERMAID_SOURCE;
    const _unusedSource=`flowchart LR""")
sub("""  Work --> Agents[Read-only Child Threads]
  Chat --> Artifact[Native Visual Artifacts]`;
    if(state.artifactState.mermaidSource)""",
    """  Work --> Agents[Read-only Child Threads]
  Chat --> Artifact[Native Visual Artifacts]`;
    void _unusedSource;
    if(state.artifactState.mermaidSource)""")

sub("""    if(a==='copy-message'){toast('Message copied','The visible message text was copied without thread mutation.');return;}""",
    """    if(a==='copy-message'){const msg=activeThread().messages.find(x=>x.id===btn.dataset.id);copyText(msg?(msg.body||msg.title||msg.detail||''):'','Message copied','The visible message text was copied without thread mutation.');return;}""")
sub("""    if(a==='copy-mermaid'){toast('Mermaid source copied','The source artifact remains independently editable.');return;}""",
    """    if(a==='copy-mermaid'){copyText(MERMAID_SOURCE,'Mermaid source copied','The source artifact remains independently editable.');return;}""")
sub("""    if(a==='dismiss-event'){toast('Receipt dismissed','The intervention remains available in thread history.');return;}""",
    """    if(a==='dismiss-event'){const id=btn.dataset.id;const th=state.threads.find(x=>x.messages.some(m=>m.id===id));if(!th){toast('Nothing to dismiss','That receipt is no longer in any transcript.');return;}th.messages=th.messages.filter(m=>m.id!==id);renderApp();toast('Receipt dismissed','Removed from this transcript; the underlying event stays in thread history.');return;}""")
sub("""    if(a==='export-context'){toast('Redacted context exported','Secrets and provider credentials were excluded.');return;}""",
    """    if(a==='export-context'){exportContextJson();return;}""")

sub("""  function openDialog(d){ state.dialog=d; renderOverlays(); }""",
    """  /* 15d: this claimed "Redacted context exported" and exported nothing. A
     standalone file:// page can still hand the browser a real file through a
     blob URL, so it does -- and if the browser refuses the download it says
     so rather than lying about it. */
  function exportContextJson(){
    const th=activeThread();
    const payload={
      exportedAt:new Date().toISOString(), redacted:true,
      note:'Secrets, tokens and provider credentials are excluded by construction.',
      thread:{id:th.id,title:th.title,status:th.status,messages:th.messages.length},
      route:{provider:selectedModel().provider,account:selectedModel().account,model:selectedModel().name,effort:state.effort,fast:state.fast,mode:state.mode,persona:state.persona,worktree:state.worktree},
      capabilities:{...state.capabilities},
      context:{compacted:state.context.compacted}
    };
    let url=null;
    try{
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
      url=URL.createObjectURL(blob);
      const link=document.createElement('a');
      const name=`pm56-context-${th.id}.json`;
      link.href=url; link.download=name; link.style.display='none';
      document.body.appendChild(link); link.click(); link.remove();
      toast('Redacted context exported',`${name} · secrets and provider credentials excluded.`);
    }catch(err){
      toast('Export unavailable','This browser blocked the download. Use Raw projection to read the same projection on screen.');
    }finally{ if(url) setTimeout(()=>URL.revokeObjectURL(url),2000); }
  }

  function openDialog(d){ state.dialog=d; renderOverlays(); }""")

# goal lifecycle stubs: keep the honest fallback, name the override point
sub("""    if(a==='pause-goal'||a==='resume-goal'||a==='stop-goal'||a==='clear-goal'){toast('Goal lifecycle',a.replace('-goal','').replace(/^./,c=>c.toUpperCase()));return;}""",
    """    /* The four goal-lifecycle verbs stay honest stubs until there is a goal
       model to act on. They are dispatched through PM56_EXT like everything
       else, so the Wave 2 Goals agent takes them over from goals.js with
       PM56_EXT.action('pause-goal', ...) -- no edit to this file. */
    if(a==='pause-goal'||a==='resume-goal'||a==='stop-goal'||a==='clear-goal'){toast(`Goal ${a.replace('-goal','')}`,'Not simulated yet: this concept has no goal model to act on.');return;}""")

# ============ 15f: measure things the renderer actually emits ============
sub("""        activityDomains: qa('[data-activity-domain], .activity-domain, .activity-chip').length,
        artifacts: qa('.artifact-card, [data-artifact-id]').length,
        menus: qa('[role="menu"]:not([hidden]), .popup-menu:not([hidden]), .menu-panel:not([hidden])').length,""",
    """        /* These three used to name .activity-domain / .activity-chip /
           .popup-menu / .menu-panel -- class names no renderer has ever
           emitted -- so all three were structurally incapable of being
           non-zero, and any harness reading them saw three permanent zeros as
           measurements. They now point at what renderActivityBar,
           renderMenu and the artifact renderers actually produce. */
        activityDomains: qa('.activity-item[data-hover-domain]').length,
        artifacts: qa('[data-artifact-id]').length,
        menus: qa('.overlay-menu').length,""")

app.write_text(t)
print("15d/15f/15g applied")
