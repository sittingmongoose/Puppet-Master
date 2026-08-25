from pathlib import Path
app=Path("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/app.js")
t=app.read_text()
def sub(old,new,n=1):
    global t
    if t.count(old)!=n: raise SystemExit(f"ANCHOR FAIL ({t.count(old)}/{n}):\n{old[:200]}")
    t=t.replace(old,new,n)

# --- item 5: modelView default removed; favourites move out of the fixture ---
sub("""    model:'sonnet46', modelView:'favorites', modelProvider:'all', modelSearch:'', effort:'High', fast:true,""",
    """    model:'sonnet46', modelProvider:'all', modelSearch:'', effort:'High', fast:true,
    favorites:D.models.filter(m=>m.favorite).map(m=>m.id),""")

sub("""  let state = clone(DEFAULT);""",
    """  /* Two handlers write through to the shared fixture -- toggle-favorite used
     to flip D.models[].favorite and retry-artifact still sets art.status --
     so Reset has to be able to put the fixture back. Favourites now live in
     state (un-starring every model no longer leaves a permanently empty
     picker); this snapshot covers what is left. */
  const FIXTURE0 = {models:clone(D.models), artifacts:clone(D.artifacts)};

  let state = clone(DEFAULT);""")

sub("""clearInterval(workTimer);safeStorage.del('pm56-prefs');state=clone(DEFAULT);state.threads=clone(D.threads);state.questions=clone(D.questions);renderApp(false);""",
    """clearInterval(workTimer);safeStorage.del('pm56-prefs');D.models=clone(FIXTURE0.models);D.artifacts=clone(FIXTURE0.artifacts);state=clone(DEFAULT);state.threads=clone(D.threads);state.questions=clone(D.questions);renderApp(false);""")

# --- item 5: one filter for the menu and its height; the height chain ---
sub("""  function renderModelMenu(){
    const q=state.modelSearch.toLowerCase().trim();
    let models=D.models.filter(x=>!q||`${x.name} ${x.provider} ${x.account}`.toLowerCase().includes(q));
    if(state.modelProvider!=='all'&&state.modelProvider!=='favorites') models=models.filter(x=>x.provider===state.modelProvider);
    if(state.modelProvider==='favorites'||state.modelView==='favorites') models=models.filter(x=>x.favorite);
    const providers=[...new Set(D.models.map(x=>x.provider))];
    return `<div class="model-layout">""",
    """  function isFavorite(id){ return state.favorites.includes(id); }
  /* One filter, shared by the menu and by its height. These used to be two
     hand-maintained copies that had already diverged (the height copy ignored
     the account field), and both consulted a second, redundant `modelView`
     flag that defaulted to 'favorites' while the rail drew "All configured
     providers" as the active tab -- which is why only 3 of 6 models showed.
     The rail (state.modelProvider) is now the only source of truth. */
  function filteredModels(){
    const q=state.modelSearch.toLowerCase().trim();
    let models=D.models.filter(x=>!q||`${x.name} ${x.provider} ${x.account}`.toLowerCase().includes(q));
    if(state.modelProvider==='favorites') models=models.filter(x=>isFavorite(x.id));
    else if(state.modelProvider!=='all') models=models.filter(x=>x.provider===state.modelProvider);
    return models;
  }
  function renderModelMenu(){
    const models=filteredModels();
    const providers=[...new Set(D.models.map(x=>x.provider))];
    /* height:100% is the whole fix for "the model list cannot scroll".
       .overlay-menu.model-menu carries a definite inline height and
       overflow:hidden, but .model-layout is a block-level grid with
       height:auto, so it never stretched to that height -- which left
       .model-main's minmax(0,1fr) row unbounded and .model-scroll's
       overflow:auto permanently inert, clipping the list with no scrollbar.
       max-height:none hands the viewport clamp to modelMenuHeight() so the
       two cannot disagree. */
    return `<div class="model-layout" style="height:100%;max-height:none">""")

sub("""  function modelMenuHeight(){
    const q=state.modelSearch.toLowerCase().trim();let n=D.models.filter(x=>!q||`${x.name} ${x.provider} ${x.account}`.toLowerCase().includes(q)).length;
    if(state.modelProvider==='favorites'||state.modelView==='favorites')n=D.models.filter(x=>x.favorite&&(!q||`${x.name} ${x.provider}`.toLowerCase().includes(q))).length;else if(state.modelProvider!=='all')n=D.models.filter(x=>x.provider===state.modelProvider&&(!q||`${x.name} ${x.provider}`.toLowerCase().includes(q))).length;
    const groups=Math.min(n,4);return clamp(78+n*44+groups*18,190,520);
  }""",
    """  /* Measured, not guessed: a .model-row is 44px min-height + 5/6px padding
     and the rows sit 2px apart, so 54 is the real pitch (the old 44 assumed
     the padding away). Provider labels are counted, not capped at four -- the
     "All configured providers" view yields more than four groups, and the cap
     is what truncated it. The viewport clamp lives here now because
     .model-layout no longer carries its own max-height. */
  const MODEL_ROW_H=54, MODEL_GROUP_H=20, MODEL_HEAD_H=46, MODEL_LIST_PAD=13;
  function modelMenuHeight(){
    const models=filteredModels();
    const groups=new Set(models.map(x=>x.provider)).size;
    const content=models.length?models.length*MODEL_ROW_H+groups*MODEL_GROUP_H:64;
    return clamp(MODEL_HEAD_H+MODEL_LIST_PAD+content,190,Math.min(560,window.innerHeight-24));
  }""")

sub("""${state.model===m.id&&state.fast&&m.fast?icon('lightning',10,'fast-bolt'):''}</strong><span>${esc(m.account)} · ${esc(m.efforts.join(' / '))}</span></span><button class="favorite ${m.favorite?'active':''}" data-action="toggle-favorite" data-value="${esc(m.id)}" title="${m.favorite?'Remove from':'Add to'} favorites">""",
    """${state.model===m.id&&state.fast&&m.fast?icon('lightning',10,'fast-bolt'):''}</strong><span>${esc(m.account)} · ${esc(m.efforts.join(' / '))}</span></span><button class="favorite ${isFavorite(m.id)?'active':''}" data-action="toggle-favorite" data-value="${esc(m.id)}" title="${isFavorite(m.id)?'Remove from':'Add to'} favorites">""")

sub("""    if(a==='model-provider'){state.modelProvider=btn.dataset.value;state.modelView=btn.dataset.value==='favorites'?'favorites':'all';renderOverlays();return;}""",
    """    if(a==='model-provider'){state.modelProvider=btn.dataset.value;renderOverlays();return;}""")
sub("""    if(a==='toggle-favorite'){e.stopPropagation();const m=D.models.find(x=>x.id===btn.dataset.value);if(m)m.favorite=!m.favorite;renderOverlays();return;}""",
    """    if(a==='toggle-favorite'){e.stopPropagation();const id=btn.dataset.value;state.favorites=isFavorite(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];renderOverlays();return;}""")

# --- item 3: the flyout carried no variant, so all 8 history takes collapsed to take 0 ---
sub("""if(state.historyMode==='floating') parts.push(`<aside class="history-flyout">${renderHistoryContent(true)}</aside>`);""",
    """if(state.historyMode==='floating') parts.push(`<aside class="history-flyout" data-history-variant="${state.variants[1]}">${renderHistoryContent(true)}</aside>`);""")

# --- item 7: the two hardcoded chips, identical across all five domains ---
sub("""<div class="hover-stats"><span class="hover-stat">${esc(d.count)}</span><span class="hover-stat">Click for all five categories</span><span class="hover-stat">Pin or resize</span></div>""",
    """<div class="hover-stats"><span class="hover-stat">${esc(d.count)}</span></div>""")

# --- item 11: New thread in the chat header, OUTSIDE the pinned-history ternary ---
sub("""      ${state.historyMode!=='pinned'?`<button class="icon-button" data-action="toggle-history" title="Open thread history">${icon('history',14)}</button>`:''}
      <div class="chat-title">""",
    """      ${state.historyMode!=='pinned'?`<button class="icon-button" data-action="toggle-history" title="Open thread history">${icon('history',14)}</button>`:''}
      <button class="icon-button" data-action="new-thread" title="Start a new thread">${icon('plus',14)}</button>
      <div class="chat-title">""")

# --- item 10: the plan's EDITOR view had no action row (only the transcript card did) ---
sub("""<h2>Revision history</h2><p>Revision 3 added the rollback gate, materialized-view fallback, owner, and benchmark evidence package.</p>${extRender('planEditorActions',{art})}`;""",
    """<h2>Revision history</h2><p>Revision 3 added the rollback gate, materialized-view fallback, owner, and benchmark evidence package.</p><div class="plan-actions"><button class="soft-button" data-action="revise-plan" data-id="${esc(art.id)}">${icon('edit',13)} Revise</button><button class="primary-button" data-action="build-plan" data-id="${esc(art.id)}">${icon('play',13)} Build</button></div>${extRender('planEditorActions',{art})}`;""")

# --- item 8 (partial): assistant actions were pinned visible by .always ---
sub("""<div class="message-actions ${m.role==='assistant'?'always':''}">""",
    """<div class="message-actions">""")

# --- item 12 (partial): the orbit nodes become the control ---
sub("""  const CHROME_OPTS={0:{noRows:true},4:{keepBody:true},6:{keepBody:true},8:{noChrome:true,keepBody:true},11:{noRows:true},15:{noRows:true}};""",
    """  const CHROME_OPTS={0:{noRows:true},1:{keepBody:true},4:{keepBody:true},6:{keepBody:true},8:{noChrome:true,keepBody:true},11:{noRows:true},15:{noRows:true}};""")
sub("""`<span class="orbit-node ${i<state.work.step?'done':i===state.work.step?'current':''}" data-k="node:${sx.id}" style="--angle:${i*seg}deg" title="${esc(sx.label)}">${icon(sx.icon,13)}</span>`""",
    """`<span class="orbit-node ${i<state.work.step?'done':i===state.work.step?'current':''}" data-k="node:${sx.id}" data-action="inspect-work-step" data-value="${i}" role="button" tabindex="0" style="--angle:${i*seg}deg;pointer-events:auto;cursor:pointer" title="${esc(sx.label)}">${icon(sx.icon,13)}</span>`""")

app.write_text(t)
print("app.js-resident fixes (part 1) applied")
