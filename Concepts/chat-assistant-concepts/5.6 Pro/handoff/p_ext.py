from pathlib import Path
app=Path("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/app.js")
t=app.read_text()
def sub(old,new,n=1):
    global t
    if t.count(old)!=n: raise SystemExit(f"ANCHOR FAIL ({t.count(old)}/{n}):\n{old[:200]}")
    t=t.replace(old,new,n)

REGISTRY = r'''
  /* =====================================================================
     window.PM56_EXT -- the feature-module extension registry.
     ---------------------------------------------------------------------
     app.js is closed after Wave 1. Every later feature lives in its own
     source file (activity-panel.js, goals.js, orbit.js, ...) which build.py
     concatenates AFTER data.js/motion.js/variants-*.js and BEFORE app.js.
     Those modules reach the app through this registry instead of editing it,
     exactly the way window.PM56_WORKING already lets a working-animation take
     live outside this IIFE.

     Two things can be registered.

     1. RENDER SLOTS -- named points in the markup.
          window.PM56_EXT.slot('activityPanelBody', ctx => `<div ...>`);
        Several modules may register the same slot; their output is
        concatenated in registration order. An "append" slot (headerExtras,
        historyChrome, messageMeta, messageAffordance, messageOverflow,
        threadMenu, planEditorActions) adds to what is already there. A
        "replace" slot (activityPanelBody, activityHoverCard, threadRowStatus,
        goalSection, contextCompactMenu, contextDrawer, questionSurface,
        workingTake:N) substitutes the built-in markup entirely -- but only if
        something is registered, so the stock concept still renders alone.

     2. ACTION HANDLERS -- delegated click behaviour.
          window.PM56_EXT.action('my-thing', (ctx, btn, ev) => { ... });
        Registered actions are consulted BEFORE app.js's own if-chain, so a
        module can add a new data-action or override a built-in one (that is
        how the Wave 2 Goals agent takes over pause-goal / resume-goal /
        stop-goal / clear-goal, which ship here as toast-only fallbacks).
        Return false to decline and let the built-in chain run. Use
          window.PM56_EXT.actionAfter('my-thing', fn)
        instead to run only when nothing built in matched.

     THE data-k RULE -- read this before emitting anything.
     Rendering is a keyed reconcile (pmPatch, below): a node whose data-k is
     unchanged is patched in place, a node without one is matched positionally,
     and a node whose key changed is REMOUNTED -- which replays its CSS
     entrance animation. The work tick re-renders the whole app every 2s, so
     anything a slot emits inside a surface that survives that tick (the
     transcript, the activity panel, the working card, the decision host, a
     thread row) MUST carry a stable data-k, or it will visibly re-animate
     twice a second. Use a constant key for a fixed element (data-k="lensbtn")
     and a subject-keyed one when a replay IS wanted on change
     (data-k="phase:${id}"). Overlays (menus, hover cards, drawers) are torn
     down and rebuilt anyway, so they need no key.

     The ctx object passed to every slot and action carries the fixtures, the
     render helpers, and the mutators that trigger the correct re-render --
     never write to the DOM directly and never re-render by hand.
     ===================================================================== */
  const EXT_SLOTS = ['headerExtras','activityPanelBody','activityHoverCard','threadRowStatus',
    'historyChrome','messageMeta','messageAffordance','messageOverflow','threadMenu','goalSection',
    'contextCompactMenu','contextDrawer','planEditorActions','questionSurface','workingTake:N'];

  function ensureExt(){
    /* Keep in sync with EXT_SHIM in build.py: whichever of the two runs first
       creates the collector, the other upgrades it in place, so a module that
       loads before app.js never loses its registrations. */
    const ext = window.PM56_EXT || (window.PM56_EXT = {});
    ext._slots = ext._slots || Object.create(null);
    ext._actions = ext._actions || Object.create(null);
    ext._after = ext._after || Object.create(null);
    if(!ext.slot) ext.slot = function(name,fn){ (this._slots[name]=this._slots[name]||[]).push(fn); return this; };
    if(!ext.action) ext.action = function(name,fn){ this._actions[name]=fn; return this; };
    if(!ext.actionAfter) ext.actionAfter = function(name,fn){ this._after[name]=fn; return this; };
    ext.has = function(name){ return !!(this._slots[name] && this._slots[name].length); };
    ext.SLOTS = EXT_SLOTS;
    ext.version = 1;
    return ext;
  }
  const EXT = ensureExt();

  function extCtx(extra){
    return Object.assign({
      /* data */
      state, D, M, clone, clamp, esc, uid, icon,
      thread: activeThread(), model: selectedModel(),
      activeThread, selectedModel, statusLabel, activityDefs, workStep,
      formatText, formatElapsed, msgIndex, msgClock, isNarrow, isPhone,
      /* mutators -- each triggers the render the change actually needs */
      renderApp, renderOverlays, toast, addReceipt, openEditor, closeEditor,
      switchThread, mutateThread, appendMessage, openMenu, closeMenu, setSubmenu,
      openDialog, closeDialog, copyText, savePrefs, extRender
    }, extra);
  }
  function extEach(name, extra, each){
    const fns = EXT._slots[name];
    if(!fns || !fns.length) return null;
    const ctx = extCtx(extra);
    const out = [];
    for(const fn of fns){
      try { const html = fn(ctx); if(html) out.push(html); }
      catch(err){ console.error(`PM56_EXT slot "${name}" threw`, err); }
    }
    return each ? each(out) : out.join('');
  }
  /* Append: the built-in markup stays, the slot adds to it. */
  function extRender(name, extra){ return extEach(name, extra) || ''; }
  /* Replace: the slot substitutes the built-in markup, but only if a module
     registered one -- so the concept still renders with no modules loaded. */
  function extReplace(name, extra, fallback){
    const html = extEach(name, extra);
    return (html===null || html==='') ? fallback : html;
  }
  function extRun(action, btn, ev, extra){
    const fn = EXT._actions[action]; if(!fn) return false;
    try { return fn(extCtx(Object.assign({action}, extra)), btn, ev) !== false; }
    catch(err){ console.error(`PM56_EXT action "${action}" threw`, err); return false; }
  }
  function extRunAfter(action, btn, ev, extra){
    const fn = EXT._after[action]; if(!fn) return false;
    try { return fn(extCtx(Object.assign({action}, extra)), btn, ev) !== false; }
    catch(err){ console.error(`PM56_EXT actionAfter "${action}" threw`, err); return false; }
  }
  EXT.ctx = extCtx; EXT.render = extRender; EXT.replace = extReplace;
  EXT.run = extRun; EXT.runAfter = extRunAfter;

  function openDialog(d){ state.dialog=d; renderOverlays(); }
  function closeDialog(){ if(state.dialog?.type==='demo'&&state.dialog.geom)lastDemoGeom={...state.dialog.geom}; state.dialog=null; renderOverlays(); }
  /* The concept had no clipboard write at all -- copy-message and copy-mermaid
     only raised a toast. Async Clipboard first, execCommand second (file://
     pages without a secure context still need it), and an honest failure
     toast third: never claim a copy that did not happen. */
  function copyText(text, okTitle='Copied', okDetail=''){
    const done = ()=>toast(okTitle, okDetail);
    const fallback = ()=>{
      try{
        const ta=document.createElement('textarea');
        ta.value=text; ta.setAttribute('readonly','');
        ta.style.cssText='position:fixed;top:0;left:-9999px;opacity:0';
        document.body.appendChild(ta); ta.select();
        const ok=document.execCommand&&document.execCommand('copy');
        ta.remove();
        if(ok) done(); else toast('Copy unavailable','This browser blocked clipboard access. Select the text and copy manually.');
      }catch(err){ toast('Copy unavailable','This browser blocked clipboard access. Select the text and copy manually.'); }
    };
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
  }
'''

sub("""  function activeThread() { return state.threads.find(t => t.id === state.selectedThread) || state.threads[0]; }""",
    REGISTRY + """
  function activeThread() { return state.threads.find(t => t.id === state.selectedThread) || state.threads[0]; }""")

# ---- emit sites -------------------------------------------------------
# headerExtras (between chat search and the context ring)
sub("""title="Search this thread or every thread">${icon('search',14)}</button>
      <button class="context-ring\"""",
    """title="Search this thread or every thread">${icon('search',14)}</button>
      ${extRender('headerExtras',{thread:t})}
      <button class="context-ring\"""")

# activityPanelBody
sub("""${['goal','todo','subagents','changes','artifacts'].map(renderActivitySection).join('')}</div><div class="panel-resize" data-resize="activity"></div></aside>`;""",
    """${extReplace('activityPanelBody',{domain:d,transient},['goal','todo','subagents','changes','artifacts'].map(renderActivitySection).join(''))}</div><div class="panel-resize" data-resize="activity"></div></aside>`;""")

# goalSection
sub("""    if(id==='goal') return `<div class="activity-line">""",
    """    if(id==='goal') return extReplace('goalSection',{}, `<div class="activity-line">""")
sub("""<button class="text-button danger" data-action="clear-goal">Clear</button></div>`;""",
    """<button class="text-button danger" data-action="clear-goal">Clear</button></div>`);""")

# activityHoverCard
sub("""      const d=activityDefs[h.domain];return `<div class="hover-card" data-overlay="hover">""",
    """      const d=activityDefs[h.domain];return extReplace('activityHoverCard',{domain:h.domain,def:d}, `<div class="hover-card" data-overlay="hover">""")
sub("""<span class="hover-stat">Pin or resize</span></div></div>`;
    }""",
    """<span class="hover-stat">Pin or resize</span></div></div>`);
    }""")

# threadRowStatus
sub("""<span class="thread-status-slot">${renderStatus(t,state.variants[1])}</span>""",
    """<span class="thread-status-slot">${extReplace('threadRowStatus',{thread:t,variant:state.variants[1]},renderStatus(t,state.variants[1]))}</span>""")

# historyChrome
sub("""<div class="history-search"><label class="input-wrap">${icon('search',13)}""",
    """${extRender('historyChrome',{flyout,groups})}<div class="history-search"><label class="input-wrap">${icon('search',13)}""")

# threadMenu
sub("""<strong>Fork archived thread</strong><span>Create an active child branch</span></span></button>`}`;
  }""",
    """<strong>Fork archived thread</strong><span>Create an active child branch</span></span></button>`}${extRender('threadMenu',{thread:t,id})}`;
  }""")

# contextCompactMenu
sub("""  function renderContextCompactMenu(){
    return `<div class="menu-head"><strong>Context</strong>""",
    """  function renderContextCompactMenu(){
    return extReplace('contextCompactMenu',{}, `<div class="menu-head"><strong>Context</strong>""")
sub("""<span>Window, tokens, cache, composition, cost, and raw projection</span></span>${icon('chevron',11)}</button>`;
  }""",
    """<span>Window, tokens, cache, composition, cost, and raw projection</span></span>${icon('chevron',11)}</button>`);
  }""")

# contextDrawer
sub("""  function renderContextDrawer(){
    return `<aside class="drawer">""",
    """  function renderContextDrawer(){
    return extReplace('contextDrawer',{}, `<aside class="drawer">""")
sub("""<button class="soft-button" data-action="raw-context">${icon('code',12)} Raw projection</button></div></div></section></div></aside>`;
  }""",
    """<button class="soft-button" data-action="raw-context">${icon('code',12)} Raw projection</button></div></div></section></div></aside>`);
  }""")

# questionSurface (whole decision body, so 15a can restructure any of the six)
sub("""    else if(type==='conflict') body=renderConflictDecision();
    return `<div class="decision-host" data-variant="${state.variants[6]}">${body}</div>`;""",
    """    else if(type==='conflict') body=renderConflictDecision();
    body=extReplace('questionSurface',{type,decision:state.decision,variant:state.variants[6]},body);
    return `<div class="decision-host" data-variant="${state.variants[6]}">${body}</div>`;""")

# working-take override
sub("""  function renderWorkingVariant(v,step,pct){
    const take = window.PM56_WORKING && window.PM56_WORKING[v];""",
    """  function renderWorkingVariant(v,step,pct){
    /* A module may replace a whole take without touching this file or
       PM56_WORKING: slot 'workingTake:1' is the Orbit override Wave 4 uses. */
    const slotted = extEach(`workingTake:${v}`, {v,step,pct,ctx:makeWorkCtx(step,pct)});
    if(slotted) return slotted;
    const take = window.PM56_WORKING && window.PM56_WORKING[v];""")

# message slots
sub("""style="--msg-index:${msgIndex(m.id)}"><div class="message-surface">""",
    """style="--msg-index:${msgIndex(m.id)}">${extRender('messageAffordance',{message:m})}<div class="message-surface">""")
sub("""${expanded?'Collapse':'Expand response'}</button>`:''}<div class="message-actions""",
    """${expanded?'Collapse':'Expand response'}</button>`:''}${extRender('messageMeta',{message:m})}<div class="message-actions""")
sub("""title="Show model, provider, timing, context, cache, token, and cost details">${icon('info',11)}<span>More details</span></button></div>""",
    """title="Show model, provider, timing, context, cache, token, and cost details">${icon('info',11)}<span>More details</span></button>${extRender('messageOverflow',{message:m})}</div>""")

# planEditorActions
sub("""<h2>Revision history</h2><p>Revision 3 added the rollback gate, materialized-view fallback, owner, and benchmark evidence package.</p>`;""",
    """<h2>Revision history</h2><p>Revision 3 added the rollback gate, materialized-view fallback, owner, and benchmark evidence package.</p>${extRender('planEditorActions',{art})}`;""")

# ---- action dispatch --------------------------------------------------
sub("""    const a=btn.dataset.action;
    if(a==='open-menu')""",
    """    const a=btn.dataset.action;
    /* Feature modules first, so a module can add an action or override one. */
    if(extRun(a,btn,e))return;
    if(a==='open-menu')""")
sub("""setTimeout(()=>{const art=D.artifacts.find(x=>x.id===btn.dataset.id);if(art)art.status='ready';state.artifactState.retrying=false;renderApp();},900);return;}
  });""",
    """setTimeout(()=>{const art=D.artifacts.find(x=>x.id===btn.dataset.id);if(art)art.status='ready';state.artifactState.retrying=false;renderApp();},900);return;}
    /* Nothing built in matched: give late-registered module handlers a turn. */
    if(extRunAfter(a,btn,e))return;
  });""")

app.write_text(t)
print("PM56_EXT registry + emit sites applied")
