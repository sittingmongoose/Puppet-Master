from pathlib import Path
app=Path("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/app.js")
t=app.read_text()
def sub(old,new,n=1):
    global t
    if t.count(old)!=n: raise SystemExit(f"ANCHOR FAIL ({t.count(old)}/{n}):\n{old[:200]}")
    t=t.replace(old,new,n)

EFFECTS = r'''  /* 15e: nineteen Demo Studio triggers used to funnel through one
     thread-switch map with no further branch, so they collapsed to nine
     distinguishable demos -- "BSD intervention", "BSD silent check" and "BSD
     timeout" all just selected the BSD thread and stopped. Every entry here
     lands on a state you can tell apart on screen. */
  const DEMO_EFFECTS={
    'Live subagents':()=>{switchThread('subagents');state.work={step:7,running:true,expanded:false,started:true,completed:false,elapsed:47,openPhase:null};state.activity={...state.activity,open:true,domain:'subagents'};renderApp();},
    'Blocked subagent':()=>{switchThread('subagents');state.work={step:7,running:false,expanded:true,started:true,completed:false,elapsed:96,openPhase:null};state.activity={...state.activity,open:true,domain:'subagents'};renderApp();addReceipt('blocked','Schema Reviewer blocked','Production schema modification requires explicit approval. The other agents continued.');},

    'BSD intervention':()=>{switchThread('bsd');addReceipt('bsd-advice','Back Seat Driver intervened','Rewriting applied migration history would destroy rollback evidence, so a forward migration was substituted.');openDialog({type:'bsd'});},
    'BSD silent check':()=>{switchThread('bsd');addReceipt('bsd-evaluating','Back Seat Driver checked silently','The turn was reviewed and found materially sound, so nothing interrupted the primary agent.');},
    'BSD timeout':()=>{switchThread('bsd');addReceipt('tool-error','Back Seat Driver timed out','Independent review exceeded its budget. The primary turn was not blocked and no advice was recorded.');},

    'Context Focus':()=>{switchThread('context');state.capabilities.context='Focus';addReceipt('context-focus','Context Lens · Focus','Current files and final references prioritized; six superseded sources dropped in rank.');},
    'Context Mute':()=>{switchThread('context');state.capabilities.context='Mute';addReceipt('context-mute','Context Lens · Mute','Four superseded sources omitted from the active projection and still rehydratable.');},
    'Subcompact preview':()=>{switchThread('context');state.capabilities.context='Subcompact';openDialog({type:'compact'});},

    'Offline queue':()=>{switchThread('offline');addReceipt('offline','Offline · three turns queued','The execution host is unreachable. Sends are queued locally and nothing was lost.');},
    'Reconnect replay':()=>{switchThread('offline');addReceipt('reconnected','Reconnected · queue replayed','Three queued turns replayed in order; no command executed twice.');},

    'Attachment upload':()=>{switchThread('attachments');addReceipt('attachment','design-reference.png attached','Registered as an artifact and available to the model for this turn.');},
    'Unsupported attachment':()=>{switchThread('attachments');addReceipt('attachment-error','schema.dmp could not be attached','The selected model has no route for that type. The file stays available to tools.');},

    'Provider route change':()=>{switchThread('route');addReceipt('route-change','Route changed · Anthropic to Moonshot','The configured fallback account took the turn. Effort and persona were preserved.');},
    'Provider quota':()=>{switchThread('route');addReceipt('model-unavailable','Quota exhausted on the Anthropic work account','It resets in 3h 12m. The remaining accounts are still routable.');},

    'Provider auth failure':()=>{switchThread('no-models');addReceipt('model-unavailable','Authentication failed · z.ai','The stored credential was rejected. Re-authenticate to restore that provider.');},
    'No models':()=>{switchThread('no-models');addReceipt('model-unavailable','No configured model is reachable','Every account is unauthenticated, quota-limited, or offline.');openMenu('model','model');},

    'Open questionnaire':()=>{switchThread('questions');state.questionIndex=0;state.decision={type:'question'};renderApp();},
    'Queue questionnaire':()=>{switchThread('questions');state.decision=null;state.questionQueue+=1;addReceipt('question-receipt','Questionnaire queued','It waits in the transcript and can be resumed without losing the draft.');},
    'Cancel and return':()=>{switchThread('questions');state.decision=null;addReceipt('question-receipt','Questionnaire cancelled','The explicit cancellation is recorded. Existing answers remain in thread history.');},

    'Plan approval':()=>{state.decision={type:'plan',mode:'review'};renderApp();},
    'Plan cancellation':()=>{state.decision=null;state.planStatus='cancelled';addReceipt('goal-receipt','Plan cancelled','The durable plan card stays in the transcript with View, Revise and Build.');},

    'Permission request':()=>{state.decision={type:'permission'};renderApp();},
    'Permission denial':()=>{state.decision=null;addReceipt('permission','Permission denied','The checkpoint remains available; no command was replayed.');},

    'Conflict mediation':()=>{state.decision={type:'conflict'};renderApp();},
    'Conflict resolution':()=>{state.decision=null;addReceipt('route-change','Parent mediation resolved','Composite indexes approved as the reversible first step; materialized views deferred.');},

    'Browser testing':()=>{switchThread('debug');state.work={step:10,running:false,expanded:true,started:true,completed:false,elapsed:52,openPhase:null};renderApp();},
    'Program testing':()=>{switchThread('debug');state.work={step:11,running:false,expanded:true,started:true,completed:false,elapsed:64,openPhase:null};renderApp();addReceipt('agent-work','Program test suite','42 unit and integration tests passed against the candidate index.');}
  };

'''
sub("  function runDemoTrigger(name){", EFFECTS+"  function runDemoTrigger(name){")

sub("""      switchThread('query');state.work={step:Math.max(0,idx),running:false,expanded:true,started:true,completed:idx===D.workSteps.length-1,elapsed:Math.max(4,idx*11)};renderApp();return;
    }
    const threadMap={'Live subagents':'subagents','Blocked subagent':'subagents','Crew coordination':'crew','BSD intervention':'bsd','BSD silent check':'bsd','BSD timeout':'bsd','Context Focus':'context','Context Mute':'context','Subcompact preview':'context','Browser debug':'debug','Offline queue':'offline','Reconnect replay':'offline','Attachment upload':'attachments','Unsupported attachment':'attachments','Provider route change':'route','Provider auth failure':'no-models','Provider quota':'route','No models':'no-models','New message anchor':'new-message','Artifact failure':'artifact-error','Goal replanning':'goal-replan'};
    if(threadMap[name])switchThread(threadMap[name]);""",
    """      switchThread('query');state.work={step:Math.max(0,idx),running:false,expanded:true,started:true,completed:idx===D.workSteps.length-1,elapsed:Math.max(4,idx*11)};renderApp();return;
    }
    if(DEMO_EFFECTS[name]){DEMO_EFFECTS[name]();return;}
    /* What is left here is genuinely one-thread-per-trigger; everything that
       shared a destination moved into DEMO_EFFECTS above. */
    const threadMap={'Crew coordination':'crew','Browser debug':'debug','New message anchor':'new-message','Artifact failure':'artifact-error','Goal replanning':'goal-replan'};
    if(threadMap[name])switchThread(threadMap[name]);""")

for dead in [
"""    if(name==='Conflict mediation'||name==='Conflict resolution'){state.decision={type:'conflict'};renderApp();return;}\n""",
"""    if(name==='Open questionnaire'||name==='Queue questionnaire'||name==='Cancel and return'){switchThread('questions');state.decision={type:'question'};renderApp();return;}\n""",
"""    if(name==='Plan approval'){state.decision={type:'plan',mode:'review'};renderApp();return;}\n""",
"""    if(name==='Plan cancellation'){state.decision={type:'plan',mode:'review'};state.planStatus='ready';renderApp();return;}\n""",
"""    if(name==='Permission request'||name==='Permission denial'){state.decision={type:'permission'};renderApp();return;}\n""",
]:
    sub(dead,"")

sub("""    const stepMap={'Web search':3,'Web fetch':4,'Browser debug':5,'Bash':6,'App control':9,'Browser testing':10,'Program testing':10,'LSP analysis':11,'MCP tool':7};""",
    """    const stepMap={'Web search':3,'Web fetch':4,'Browser debug':5,'Bash':6,'App control':9,'LSP analysis':11,'MCP tool':7};""")

app.write_text(t)
print("15e applied")
