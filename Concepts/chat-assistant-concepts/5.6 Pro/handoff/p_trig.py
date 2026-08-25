from pathlib import Path
app=Path("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/app.js")
t=app.read_text()
def sub(old,new,n=1):
    global t
    if t.count(old)!=n: raise SystemExit(f"ANCHOR FAIL ({t.count(old)}/{n}):\n{old[:200]}")
    t=t.replace(old,new,n)

# ---- real artifact nodes so PM56_RUNTIME.snapshot().artifacts can be non-zero ----
sub("""    return `<article class="system-card"><div class="system-card-head"><span class="event-icon">${icon(art.kind==='image'?'image':art.kind==='mermaid'?'code':'artifact',14)}</span>""",
    """    return `<article class="system-card" data-artifact-id="${esc(art.id)}"><div class="system-card-head"><span class="event-icon">${icon(art.kind==='image'?'image':art.kind==='mermaid'?'code':'artifact',14)}</span>""")
sub("""    return `<article class="editor-doc"><h1>${esc(art.title)}</h1>${meta}""",
    """    return `<article class="editor-doc" data-artifact-id="${esc(art.id)}"><h1>${esc(art.title)}</h1>${meta}""")
sub("""    return D.artifacts.map(a=>`<button class="activity-line" data-action="open-artifact" data-id="${esc(a.id)}">""",
    """    return D.artifacts.map(a=>`<button class="activity-line" data-action="open-artifact" data-id="${esc(a.id)}" data-artifact-id="${esc(a.id)}">""")

# ---- hoist the Demo Studio's own trigger list; listTriggers derives from it ----
sub("""  function renderDemoDialog(){
    const families=""",
    """  /* The Demo Studio's trigger list is the ONLY trigger list. It used to live
     inside renderDemoDialog as a local, with PM56_DEMO.listTriggers() keeping a
     hand-maintained duplicate that had drifted 29 entries behind it. */
  function demoTriggerGroups(){
    return {
      'Work lifecycle':['Start complete work','Pause work','Step work','Complete work','Reset work','Show work history','Live subagents','Blocked subagent','Conflict mediation','Crew coordination'],
      'Every Working Animation state':D.workSteps.map(x=>`Work · ${x.label}`),
      'Questions and decisions':['Prepare questions','Open questionnaire','Queue questionnaire','Plan approval','Plan revision','Plan cancellation','Permission request','Permission denial','Conflict resolution','Cancel and return'],
      'Artifacts':['Mermaid artifact','Interactive dashboard','Data explorer','Architecture map','Interactive quiz','Periodic table','Flowchart','Interactive chart','Generated image','Test evidence','Document artifact','Deep Plan artifact','Artifact stale','Artifact failure'],
      'Capabilities':['BSD intervention','BSD silent check','BSD timeout','BSD unavailable','BSD quota limited','Context Focus','Context Mute','Subcompact preview','Subcompact applied','Subcompact cancelled','ELI5 receipt','Goal replanning','Goal paused','Goal blocked'],
      'Thread and message states':['Plain text conversation','Archived threads','Cross-thread search','Long response','Message details','Edit and branch','Restore from point','Draft history','New message anchor'],
      'System states':['Browser debug','Web search','Web fetch','Bash','App control','Browser testing','Program testing','LSP analysis','MCP tool','Offline queue','Reconnect replay','Attachment upload','Unsupported attachment','Provider route change','Provider auth failure','Provider quota','No models']
    };
  }
  function allDemoTriggers(){ return Object.values(demoTriggerGroups()).flat(); }

  function renderDemoDialog(){
    const families=""")
sub("""    const triggerGroups={
      'Work lifecycle':['Start complete work','Pause work','Step work','Complete work','Reset work','Show work history','Live subagents','Blocked subagent','Conflict mediation','Crew coordination'],
      'Every Working Animation state':D.workSteps.map(x=>`Work · ${x.label}`),
      'Questions and decisions':['Prepare questions','Open questionnaire','Queue questionnaire','Plan approval','Plan revision','Plan cancellation','Permission request','Permission denial','Conflict resolution','Cancel and return'],
      'Artifacts':['Mermaid artifact','Interactive dashboard','Data explorer','Architecture map','Interactive quiz','Periodic table','Flowchart','Interactive chart','Generated image','Test evidence','Document artifact','Deep Plan artifact','Artifact stale','Artifact failure'],
      'Capabilities':['BSD intervention','BSD silent check','BSD timeout','BSD unavailable','BSD quota limited','Context Focus','Context Mute','Subcompact preview','Subcompact applied','Subcompact cancelled','ELI5 receipt','Goal replanning','Goal paused','Goal blocked'],
      'Thread and message states':['Plain text conversation','Archived threads','Cross-thread search','Long response','Message details','Edit and branch','Restore from point','Draft history','New message anchor'],
      'System states':['Browser debug','Web search','Web fetch','Bash','App control','Browser testing','Program testing','LSP analysis','MCP tool','Offline queue','Reconnect replay','Attachment upload','Unsupported attachment','Provider route change','Provider auth failure','Provider quota','No models']
    };
    const g=clampDemoGeom""",
    """    const triggerGroups=demoTriggerGroups();
    const g=clampDemoGeom""")
old_list=t[t.index("    listTriggers:()=>["):t.index("\n",t.index("    listTriggers:()=>["))+1]
sub(old_list,"    listTriggers:allDemoTriggers,\n")

app.write_text(t)
print("artifact hooks + trigger list hoisted")
