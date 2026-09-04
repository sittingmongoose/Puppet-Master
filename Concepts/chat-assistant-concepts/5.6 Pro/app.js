(() => {
  'use strict';

  const D = window.PM56_DATA;
  const M = window.PM56_MOTION;
  if (!D) throw new Error('PM56_DATA was not loaded.');

  const clone = (v) => JSON.parse(JSON.stringify(v));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  /* Stylized hover label (not a native title tooltip). Unique key anchors the card. */
  function hoverAttrs(key, text){
    return ` data-hover-key="${esc(key)}" data-hover-tip="${esc(text)}" aria-label="${esc(text)}"`;
  }
  const CAP_HOVER = {goal:'Goal', crew:'Crew', bsd:'Back Seat Driver', context:'Context Lens', eli5:'ELI5'};
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
    pin:'<path d="M12 17v5"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>',
    unpin:'<path d="M2 2l20 20"/><path d="M12 17v5"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h12"/><path d="M15 9.34V6h1a2 2 0 0 0 0-4H7.89"/>',
    archive:'<path d="M4 7v13h16V7M3 3h18v4H3zM9 11h6"/>', restore:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>', edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>', fork:'<circle cx="6" cy="4" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="20" r="2"/><path d="M6 6v12M8 9c5 0 5-3 8-3"/>',
    copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>', branch:'<path d="M6 3v12a4 4 0 0 0 4 4h8"/><circle cx="6" cy="3" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 9h7a4 4 0 0 0 4-4V3"/><circle cx="17" cy="3" r="2"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', play:'<path d="m8 5 11 7-11 7Z"/>', pause:'<path d="M9 5v14M15 5v14"/>', step:'<path d="m7 5 9 7-9 7zM18 5v14"/>',     stop:'<rect x="7.5" y="7.5" width="9" height="9" rx="1.75"/>',
    send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>', attach:'<path d="m21 11-8.5 8.5a6 6 0 0 1-8.5-8.5L13 2a4 4 0 0 1 5.7 5.7l-9 9a2 2 0 0 1-2.8-2.8L15 5.8"/>', wand:'<path d="m15 4 5 5L8 21H3v-5Z"/><path d="m14 5 5 5M6 4V2M5 3H3M20 17v-2M21 16h2M19 3V1M18 2h-2"/>',
    sparkles:'<path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z"/><path d="m5 14 .8 1.7L8 16.5l-2.2.8L5 19l-.8-1.7L2 16.5l2.2-.8Z"/>',
    goal:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M20 4 15 9"/>', todo:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2"/>', users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>', changes:'<path d="M4 7h11M4 17h16M15 4l3 3-3 3M9 14l-3 3 3 3"/>', artifact:'<path d="M4 3h12l4 4v14H4z"/><path d="M16 3v5h5M8 13h8M8 17h6"/>',
    brain:'<path d="M9.5 4A3.5 3.5 0 0 0 6 7.5v.4A3.5 3.5 0 0 0 4 11a3.5 3.5 0 0 0 2.2 3.25A3.5 3.5 0 0 0 9.5 19H11V4ZM14.5 4A3.5 3.5 0 0 1 18 7.5v.4a3.5 3.5 0 0 1 2 3.1 3.5 3.5 0 0 1-2.2 3.25A3.5 3.5 0 0 1 14.5 19H13V4Z"/><path d="M7 10h4M13 8h4M13 14h4"/>',
    'folder-search':'<path d="M3 5h6l2 2h10v12H3z"/><circle cx="12" cy="13" r="3"/><path d="m14.5 15.5 2 2"/>', download:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>', globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>', terminal:'<path d="m4 7 5 5-5 5M11 17h9"/>', 'file-edit':'<path d="M4 3h11l5 5v13H4z"/><path d="M15 3v5h5M9 17l1-4 6-6 3 3-6 6Z"/>', 'monitor-play':'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4M10 7l5 3-5 3Z"/>', flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 14h8"/>', 'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>', chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>', eyeoff:'<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.5 5.2A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-2.1 2.8M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.8 9.8 0 0 0 4.4-1"/>',
    filter:'<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>', collapse:'<path d="m8 3 4 4 4-4M8 21l4-4 4 4"/>', expand:'<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>',
    lightning:'<path d="M13 2 4 14h7l-1 8 10-13h-7Z"/>', plug:'<path d="M9 7V2M15 7V2"/><path d="M6 7h12v4a6 6 0 0 1-12 0Z"/><path d="M12 17v5"/>', star:'<path d="m12 2 3 6 7 .9-5 4.8 1.3 6.8L12 17l-6.3 3.5L7 13.7 2 8.9 9 8Z"/>',
    document:'<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/>', image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>', code:'<path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 4l-4 16"/>',
    warning:'<path d="M12 3 2 21h20Z"/><path d="M12 9v5M12 17h.01"/>', lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>', refresh:'<path d="M20 11a8 8 0 1 0-2 5.3M20 4v7h-7"/>',
    lens:'<circle cx="12" cy="12" r="7"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="15" x2="16" y2="15"/>',
    effort:'<circle cx="12" cy="12" r="7"/>'
  };
  function icon(name, size=15, cls='') {
    const paths = PATHS[name] || PATHS.info;
    /* Stop is a filled media-player square (not a stroked Lucide rect). */
    if(name==='stop'){
      return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">${PATHS.stop}</svg>`;
    }
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }
  /* Filled provider marks (rail + model rows). Stroke `icon()` cannot draw
     brand silhouettes; these are SVG-only, currentColor, viewBox 24. */
  const PROVIDER_MARKS = {
    OpenAI:'<path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.182a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.778-2.758a.795.795 0 0 0 .393-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.758a.771.771 0 0 0 .78 0l5.843-3.368v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.972V11.6a.766.766 0 0 0 .388.676l5.814 3.354-2.02 1.168a.076.076 0 0 1-.071.01l-4.83-2.787A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387 2.015-1.164a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.104v-5.677a.79.79 0 0 0-.407-.667zm2.01-3.023-.142-.085-4.773-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zM8.306 12.863l-2.02-1.164a.08.08 0 0 1-.038-.052V6.075a4.5 4.5 0 0 1 7.376-3.453l-.142.08L8.704 5.459a.795.795 0 0 0-.393.681zm1.098-2.365 2.602-1.5 2.607 1.5v3l-2.597 1.5-2.607-1.5z"/>',
    Anthropic:'<path d="M12 3.2 13.15 8.4 18.8 7 15.2 12 18.8 17 13.15 15.6 12 20.8 10.85 15.6 5.2 17 8.8 12 5.2 7 10.85 8.4Z"/>',
    Alibaba:'<path d="M4.2 10.2c0-3.4 2.9-6.2 7.8-6.2 4.9 0 7.8 2.8 7.8 6.2 0 .6-.1 1.2-.2 1.7 1.6.7 2.6 1.9 2.6 3.4 0 2.3-2.4 4.1-7.2 4.1H8.2C4.6 19.4 2 17.4 2 14.8c0-1.6 1.1-2.9 2.8-3.6-.2-.6-.6-1.3-.6-1zM8 13.6v2.6h8v-2.6H8zm1.4-4.2h5.2v1.6H9.4V9.4z"/>',
    Moonshot:'<path d="M16.2 3.4A9 9 0 1 0 20.6 16.4 7.2 7.2 0 0 1 16.2 3.4z"/>',
    'z.ai':'<path d="M6 5h12l-8.8 11.2H18V18.6H6l8.8-11.2H6z"/>',
    Cursor:'<path d="M5 3.2 19.5 12.1l-7.6 1.6-2.2 6.6z"/>'
  };
  function providerMark(p, size=16){
    const d=PROVIDER_MARKS[p];
    if(!d) return icon('sparkles', size);
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${d}</svg>`;
  }
  function modeGlyph(mode, size=13){
    if(mode==='Ask') return icon('info', size);
    if(String(mode).includes('Plan')) return icon('document', size);
    if(mode==='Debug') return icon('warning', size);
    return icon('sparkles', size);
  }

  const DEFAULT = {
    theme:'basic-dark', recipe:-1, variants:[7,5,1,0,1,0,8], selectedThread:'query',
    threads:clone(D.threads), editorTabs:['plan-query'], activeEditor:'plan-query',
    historyMode:'pinned', historySearch:'', historyWidth:224, editorWidth:54, activityWidth:280,
    historySections:{pinned:true, recent:true, archived:false},
    activity:{open:false,pinned:false,domain:'goal',scope:'all',filterVisible:true,expanded:['goal','todo','subagents','crew','changes','artifacts']},
    context:{
      compact:false,details:false,compacted:false,drawerView:'curated',dispatchSeq:0,
      projections:clone(D.contextByThread||{})
    },
    menu:null, hover:null, dialog:null, toast:[],
    model:'sonnet46', modelProvider:'all', modelSearch:'', effort:'', fast:true,
    favorites:D.models.filter(m=>m.favorite).map(m=>m.id),
    persona:'Product Manager', mode:'Agent', thoroughness:'Thorough', permissions:'Auto', worktree:'feature/query-index',
    /* Assistant-redesign selectors. planStrategy/deepPlanStrategy are the six exact
       choices; grillMe is the persistent Deep Plan check; reviewStrategy chooses the
       Review submenu entry. `thoroughness` above is retained only so older fixtures and
       harnesses that read it keep working -- nothing new writes it. */
    planStrategy:'Standard', deepPlanStrategy:'Thorough', grillMe:false, reviewStrategy:'Multi-Pass Review',
    capabilities:{goal:true,crew:false,bsd:'Auto',context:'Auto',eli5:false,thought:'Auto'},
    activityCaps:{goal:{},crew:{}},
    messageExpanded:{}, messageDetails:{}, copyFlashId:null, workTerminal:{}, work:{step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null}, works:{},
    decision:null, questionIndex:0, questions:clone(D.questions), questionQueue:2,
    composer:'', sendQueue:{}, drafts:{}, draftHistory:{}, planRevision:((D.artifacts||[]).find(x=>x.id==='plan-query')||{}).version||3 /* one quantity,
      one source: the durable plan artifact's version. A separate literal here drifted to 3
      while the artifact said 4, so the card and the artifact disagreed about the same plan. */, planStatus:'ready',
    artifactState:{quizAnswer:null,dataFilter:'all',mermaidSource:false,chartMetric:'p95',retrying:false},
    demoAutoStart:true
  };

  /* Two handlers write through to the shared fixture -- toggle-favorite used
     to flip D.models[].favorite and retry-artifact still sets art.status --
     so Reset has to be able to put the fixture back. Favourites now live in
     state (un-starring every model no longer leaves a permanently empty
     picker); this snapshot covers what is left. */
  const FIXTURE0 = {models:clone(D.models), artifacts:clone(D.artifacts)};

  let state = clone(DEFAULT);
  let workTimer = null;
  let seqTimer = null;
  let hoverTimer = null;
  let copyFlashTimer = null;
  let submenuTimer = null;
  let dragState = null;
  let lastDemoGeom = null;
  const DEMO_MIN_W = 360, DEMO_MIN_H = 280;

  function defaultDemoGeom(){
    const width=Math.min(820,window.innerWidth-20);
    const height=Math.min(Math.round(window.innerHeight*0.72),window.innerHeight-20);
    return {left:Math.round((window.innerWidth-width)/2),top:Math.round((window.innerHeight-height)/2),width,height};
  }
  function clampDemoGeom(g){
    const width=clamp(g.width,DEMO_MIN_W,window.innerWidth-8);
    const height=clamp(g.height,DEMO_MIN_H,window.innerHeight-8);
    const left=clamp(g.left,4,Math.max(4,window.innerWidth-width-4));
    const top=clamp(g.top,4,Math.max(4,window.innerHeight-height-4));
    return {left,top,width,height};
  }
  function openDemoDialog(){
    const geom=clampDemoGeom((state.dialog?.type==='demo'&&state.dialog.geom)||lastDemoGeom||defaultDemoGeom());
    state.dialog={type:'demo',geom};state.menu=null;renderOverlays();
  }
  function applyDemoGeomStyles(el,g){
    if(!el||!g)return;
    el.style.left=`${g.left}px`;el.style.top=`${g.top}px`;el.style.width=`${g.width}px`;el.style.height=`${g.height}px`;el.style.transform='none';
  }
  function demoResizeHandles(){
    return ['n','e','s','w','ne','nw','se','sw'].map(d=>`<div class="demo-resize" data-dialog-resize="${d}"></div>`).join('');
  }


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
        concatenated in registration order. An "append" slot (headerLeading,
        headerExtras, historyChrome, messageMeta, messageAffordance, messageOverflow,
        messageOverflowPanel, threadMenu, planEditorActions) adds to what is already there. A
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
  const EXT_SLOTS = ['headerLeading','headerExtras','activityPanelBody','activityHoverCard','threadRowStatus',
    'historyChrome','messageMeta','messageAffordance','messageOverflow','messageOverflowPanel','threadMenu','goalSection','goalEditor',
    'contextCompactMenu','contextLensMenu','contextDrawer','dialog','systemCardActions','threadSearchMenu','planEditorActions','questionSurface','workingTake:N',
    /* Assistant-redesign wave. transcriptMessage is a DECLINE-able replace slot: return ''
       and the built-in renderMessage chain runs. composerTray/composerRibbon/composerBelow
       are append slots inside the composer; wandRows and modeRows extend those two menus
       without reopening this file again. */
    'transcriptMessage','composerTray','composerRibbon','composerBelow','wandRows','submenu','modeRows',
    /* Append points inside context.js's own replace-slot output, so BSD adds a row and a
       section without re-registering (and therefore duplicating) the whole Context menu. */
    'contextBsdRow','contextBsdSection'];

  function ensureExt(){
    /* Keep in sync with EXT_SHIM in build.py: whichever of the two runs first
       creates the collector, the other upgrades it in place, so a module that
       loads before app.js never loses its registrations. */
    const ext = window.PM56_EXT || (window.PM56_EXT = {});
    ext._slots = ext._slots || Object.create(null);
    ext._actions = ext._actions || Object.create(null);
    /* Collisions are recorded here as well as logged: a console scan does not survive a
       reload and cannot name the action, so harnesses assert PM56_EXT.collisions.length===0
       instead of gating on console warnings. Downgraded warn->info for the same reason --
       a legitimately collision-free build must not look red. */
    ext.collisions = ext.collisions || [];
    ext._after = ext._after || Object.create(null);
    if(!ext.slot) ext.slot = function(name,fn){ (this._slots[name]=this._slots[name]||[]).push(fn); return this; };
    /* Duplicate registrations used to be a SILENT last-wins assignment: two modules claiming
       the same action left the earlier one dead with no diagnostic. That killed History's
       pin FLIP and Goals' reset restore. Now it chains -- later handler first, returning
       false falls through -- and warns, so a collision is visible instead of inferred.
       KEEP IN SYNC with EXT_SHIM in build.py. */
    /* action() = I own this action. chainAction() = I deliberately extend an existing one
       and will return false to fall through. Only UNDECLARED duplicates land in
       collections[], so `PM56_EXT.collisions.length === 0` is a true invariant a harness
       can gate on without punishing intentional chains. KEEP IN SYNC with build.py. */
    if(!ext._reg) ext._reg = function(name,fn,intentional){ var prev=this._actions[name]; if(prev){ if(!intentional){ (this.collisions=this.collisions||[]).push(name); console.info('PM56_EXT: UNDECLARED duplicate action "'+name+'" - chaining; declare it with chainAction() if deliberate'); } this._actions[name]=function(c,b,e){ var r=fn(c,b,e); return r===false?prev(c,b,e):r; }; } else { this._actions[name]=fn; } return this; };
    if(!ext.action) ext.action = function(name,fn){ return this._reg(name,fn,false); };
    if(!ext.chainAction) ext.chainAction = function(name,fn){ return this._reg(name,fn,true); };
    /* actionAfter() was still a silent last-wins assignment after action()/chainAction()
       were fixed -- the same defect one function over. `_after` has 0 keys today so it was
       latent, which is exactly how it would have been found the expensive way later.
       Both handlers run (after-hooks are observers, not owners). KEEP IN SYNC with build.py. */
    if(!ext.actionAfter) ext.actionAfter = function(name,fn){ var prev=this._after[name]; if(prev){ (this.collisions=this.collisions||[]).push('after:'+name); console.info('PM56_EXT: duplicate actionAfter "'+name+'" - chaining both'); this._after[name]=function(c,b,e){ prev(c,b,e); return fn(c,b,e); }; } else { this._after[name]=fn; } return this; };
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
      activeThread, selectedModel, statusLabel, activityDefs, activityScope, workStep,
      formatText, formatElapsed, msgIndex, msgClock, isNarrow, isPhone,
      /* mutators -- each triggers the render the change actually needs */
      renderApp, renderGoals: renderGoalSurfaces, renderOverlays, toast, addReceipt, openEditor, closeEditor,
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

  /* 15d: this claimed "Redacted context exported" and exported nothing. A
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

  function activeThread() { return state.threads.find(t => t.id === state.selectedThread) || state.threads[0]; }
  function selectedModel() { return D.models.find(m => m.id === state.model) || D.models[0]; }
  function workStep() { return D.workSteps[clamp(state.work.step,0,D.workSteps.length-1)]; }
  function isNarrow() { return window.innerWidth < 821; }
  function isPhone() { return window.innerWidth < 591; }
  function assistantLayoutWidth() {
    const pane=document.querySelector('.assistant-pane');
    const measured=pane?.getBoundingClientRect().width;
    if(measured>0) return measured;
    if(isNarrow()) return window.innerWidth;
    return Math.max(0,window.innerWidth*(1-state.editorWidth/100)-5);
  }
  function activityPinnedInLayout() {
    return !!(state.activity.open && state.activity.pinned && !isPhone() && assistantLayoutWidth()>=540);
  }
  function focusActivityControl(selector) {
    requestAnimationFrame(() => {
      const el=document.querySelector(selector);
      if(el && typeof el.focus==='function') el.focus({preventScroll:true});
    });
  }
  function focusActivityBarDomain(domain) {
    if(window.PM56_AB) window.PM56_AB.suppressNextFocusPreview=true;
    focusActivityControl(`[data-hover-domain="${CSS.escape(domain||'')}"]`);
  }
  let phoneLayout=isPhone();
  let activityPinLayout=activityPinnedInLayout();
  function savePrefs() {
    safeStorage.set('pm56-prefs', JSON.stringify({theme:state.theme,historyMode:state.historyMode,historyWidth:state.historyWidth,editorWidth:state.editorWidth,activityWidth:state.activityWidth,model:state.model,effort:state.effort||'',effortChosen:!!state.effort,fast:state.fast,capabilities:state.capabilities}));
  }
  function loadPrefs() {
    const raw = safeStorage.get('pm56-prefs'); if (!raw) return;
    try {
      const p = JSON.parse(raw);
      const chosen = !!p.effortChosen;
      delete p.effortChosen;
      Object.assign(state, p);
      if (!chosen) state.effort = '';
    } catch {}
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

  function parseWorkDoc(id){
    const i=String(id||'').indexOf(':');
    const kind=i<0?id:id.slice(0,i);
    const rest=i<0?'':id.slice(i+1);
    const pipe=rest.indexOf('|');
    const dec=s=>{ try { return decodeURIComponent(s); } catch { return s; } };
    const a=dec(pipe<0?rest:rest.slice(0,pipe));
    const b=pipe<0?'':dec(rest.slice(pipe+1));
    return {kind, a, b};
  }
  function editorTabLabel(id){
    const a=D.artifacts.find(x=>x.id===id);
    if(a) return a.title;
    const ag=D.subagents.find(x=>`thread-${x.id}`===id);
    if(ag) return ag.name;
    if(id==='goal-artifact') return 'Active Goal';
    if(String(id).startsWith('file:')){
      const p=id.slice(5);
      return p.split('/').pop()||p||'File';
    }
    if(String(id).startsWith('search:')){
      const q=parseWorkDoc(id).a;
      return q.length>28?q.slice(0,27)+'\u2026':(q||'Search');
    }
    if(String(id).startsWith('link:')){
      const d=parseWorkDoc(id);
      return d.b||d.a||'Fetched page';
    }
    if(String(id).startsWith('mcp:')) return parseWorkDoc(id).a||'MCP';
    if(String(id).startsWith('app:')) return 'Database inspector';
    return 'Untitled';
  }
  function renderEditor() {
    return `<section class="editor-pane">
      <div class="editor-tabs">${state.editorTabs.map(id => {
        const label=editorTabLabel(id);
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
    if (id==='goal-artifact') return extReplace('goalEditor',{}, renderGoalEditor());
    const art=D.artifacts.find(a=>a.id===id);
    if (art) return renderArtifactEditor(art);
    if (id.startsWith('file:')) return renderFileEditor(id.slice(5));
    if (/^(search|link|mcp|app):/.test(id)) return renderWorkDoc(id);
    return `<article class="editor-doc"><h1>${esc(id)}</h1><p>This editor tab demonstrates a durable Puppet Master file-editor destination.</p></article>`;
  }

  function renderWorkDoc(id){
    const d=parseWorkDoc(id);
    if(d.kind==='search'){
      const tag=d.b||'results';
      return `<article class="editor-doc" data-k="${esc(id)}"><h1>Search</h1><div class="editor-meta"><span class="meta-pill">Web search</span><span class="meta-pill">${esc(tag)}</span></div><p>Query: <strong>${esc(d.a)}</strong></p><p>This is the search-results destination opened from a working-activity row. Live web results are not fetched in this concept.</p><div class="code-block">${esc(d.a)}\n${esc(tag)}</div></article>`;
    }
    if(d.kind==='link'){
      const host=d.a||'fetched page';
      const title=d.b||host;
      return `<article class="editor-doc" data-k="${esc(id)}"><h1>${esc(title)}</h1><div class="editor-meta"><span class="meta-pill">Fetched page</span><span class="meta-pill">${esc(host)}</span></div><p>Opened from a working-activity fetch row. The live document is not retrieved in this concept; the host and title are the durable record.</p></article>`;
    }
    if(d.kind==='mcp'){
      const tool=d.a||'MCP';
      return `<article class="editor-doc" data-k="${esc(id)}"><h1>MCP · ${esc(tool)}</h1><div class="editor-meta"><span class="meta-pill">MCP call</span><span class="meta-pill">${esc(tool)}</span></div><p>${esc(d.b||'Tool call record opened from a working-activity row.')}</p><div class="code-block">${esc(tool)}</div></article>`;
    }
    if(d.kind==='app'){
      return `<article class="editor-doc" data-k="${esc(id)}"><h1>Database inspector</h1><div class="editor-meta"><span class="meta-pill">App control</span><span class="meta-pill">local</span></div><p>Schema metadata refreshed. The planner selects <strong>idx_events_tenant_created</strong>.</p><div class="code-block">index idx_events_tenant_created (tenant_id, created_at)\nplanner: index-only capable on the tenant-scoped analytics path</div></article>`;
    }
    return `<article class="editor-doc"><h1>${esc(id)}</h1><p>Opened from a working-activity row.</p></article>`;
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
    /* Assistant-redesign wave: ONE Plan truth, in the header chrome too. This row
       read the legacy artifact record, so the pane's own header said
       "Version 4 · Ready" directly above a card that said "Plan · V5" -- the same
       two-surfaces-disagree defect the body already had. When plans.js owns this
       artifact, the header reads the owner's version and Build state. */
    let ver=`Version ${art.version}`, stat=esc(lblOf('artifactStatus',art.status));
    if(art.kind==='plan' && window.PM56_PLANS && window.PM56_PLANS.editorPlanId){
      const pid=window.PM56_PLANS.editorPlanId(art.id);
      const rec=pid && window.PM56_PLANS.get(pid);
      if(rec){ ver=`V${rec.version}`; stat=esc(window.PM56_PLANS.buildLabel(pid)||stat); }
    }
    const meta=`<div class="editor-meta"><span class="meta-pill">${esc(art.kind)}</span><span class="meta-pill">${esc(ver)}</span><span class="meta-pill">${stat}</span><span class="meta-pill">${esc(art.updated)}</span></div>`;
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
    return `<article class="editor-doc" data-artifact-id="${esc(art.id)}"><h1>${esc(art.title)}</h1>${meta}${art.status==='stale'?`<div class="event-card warning"><span class="event-icon">${icon('warning',14)}</span><div class="event-copy"><strong>A newer source revision exists</strong><p>Open version history, refresh this view, or keep the pinned version.</p></div></div>`:''}${art.status==='error'?`<div class="event-card danger"><span class="event-icon">${icon('warning',14)}</span><div class="event-copy"><strong>Renderer failed safely</strong><p>The source artifact is intact. Use source fallback or retry the native renderer.</p></div><button class="soft-button" data-action="retry-artifact" data-id="${esc(art.id)}">${icon('refresh',13)} Retry</button></div>`:''}${body}</article>`;
  }

  function renderPlanDocument(art){
    /* Assistant-redesign wave: ONE Plan truth. plans.js owns the document, its
       version and its single Build control, so this pane renders the SAME
       record rather than a second hard-coded copy of the body. The literal
       string below said "Version 4 / Revision 3" while the transcript card
       said V5 -- two surfaces disagreeing about one plan. It is kept only as
       the fallback for a build with plans.js dropped from MODULES. */
    if(window.PM56_PLANS && window.PM56_PLANS.editorBody){
      const owned = window.PM56_PLANS.editorBody(art.id);
      if(owned) return owned + extRender('planEditorActions',{art});
    }
    return `<p>${esc(art.summary)}</p><h2>Decision</h2><p>Use a tenant-first composite index as the reversible first step. Remove N+1 fan-out in the same change. Keep the materialized-view design as an explicitly gated follow-up.</p><h2>Build sequence</h2><div class="code-block">1. Capture baseline EXPLAIN ANALYZE evidence
2. Add concurrent tenant_id + created_at index
3. Batch event lookup and remove N+1 queries
4. Run unit, integration, browser, and benchmark gates
5. Compare write amplification against the 8% limit
6. Approve, revise, cancel, or build from the durable chat card</div><h2>Acceptance</h2><p>p95 below 100 ms, no incorrect tenant crossover, write overhead below 8%, all tests green, and a rehearsed forward rollback migration.</p><h2>Revision history</h2><p>Revision 3 added the rollback gate, materialized-view fallback, owner, and benchmark evidence package.</p><div class="plan-actions"><button class="soft-button" data-action="revise-plan" data-id="${esc(art.id)}">${icon('edit',13)} Revise</button><button class="primary-button" data-action="build-plan" data-id="${esc(art.id)}">${icon('play',13)} Build</button></div>${extRender('planEditorActions',{art})}`;
  }

  /* Hoisted so copy-mermaid can copy the real source instead of claiming to. */
  const MERMAID_SOURCE=`flowchart LR
  Chat[Chat Thread] --> Work[Inline Working Animation]
  Chat --> Activity[Chat Activity Bar]
  Activity --> Detail[Activity Detail]
  Detail --> Editor[File Editor]
  Work --> Agents[Read-only Child Threads]
  Chat --> Artifact[Native Visual Artifacts]`;
  function renderMermaidEditor(art){
    const source=MERMAID_SOURCE;
    if(state.artifactState.mermaidSource) return `<div class="plan-actions"><button class="soft-button" data-action="toggle-mermaid-source">${icon('eye',13)} Render</button><button class="soft-button" data-action="copy-mermaid">${icon('copy',13)} Copy source</button></div><div class="code-block">${esc(source)}</div>`;
    return `<div class="plan-actions"><button class="soft-button" data-action="toggle-mermaid-source">${icon('code',13)} Source</button><button class="soft-button" data-action="open-artifact" data-id="${esc(art.id)}">${icon('expand',13)} Fit</button></div><div class="artifact-preview mermaid" style="min-height:330px"><svg viewBox="0 0 760 300" width="100%" height="100%"><defs><linearGradient id="mg" x1="0" x2="1"><stop stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--muted)"/></marker></defs>${[['Chat Thread',30,120],['Working Animation',225,42],['Activity Bar',225,120],['Visual Artifacts',225,198],['Activity Detail',440,120],['Editor + Child Threads',575,120]].map((n,i)=>`<g><rect x="${n[1]}" y="${n[2]}" width="150" height="48" rx="12" fill="${i===0?'url(#mg)':'var(--surface-3)'}" stroke="var(--border-strong)"/><text x="${n[1]+75}" y="${n[2]+29}" fill="${i===0?'white':'var(--text)'}" text-anchor="middle" font-size="12" font-family="var(--font-ui)">${n[0]}</text></g>`).join('')}<g fill="none" stroke="var(--muted)" stroke-width="2" marker-end="url(#arr)"><path d="M180 144 C205 144 205 66 225 66"/><path d="M180 144H225"/><path d="M180 144 C205 144 205 222 225 222"/><path d="M375 144H440"/><path d="M590 144H575"/></g></svg></div>`;
  }

  function renderDashboardEditor(){
    const metrics=[['p50','31 ms','−79%'],['p95','71 ms','−86%'],['Throughput','1,840/s','+164%'],['Cache hit','78%','+21 pt'],['Write overhead','4.8%','within gate'],['Rows scanned','1.2k','−98%']];
    return `<div class="plan-actions"><button class="soft-button" data-action="chart-metric" data-value="p95">p95</button><button class="soft-button" data-action="chart-metric" data-value="throughput">Throughput</button><button class="soft-button" data-action="chart-metric" data-value="cache">Cache</button></div><div class="metric-grid" style="grid-template-columns:repeat(3,1fr)">${metrics.map(m=>`<div class="metric-card"><label>${m[0]}</label><strong>${m[1]}</strong><span style="color:var(--positive);font-size:10px">${m[2]}</span></div>`).join('')}</div><h2>${esc(state.artifactState.chartMetric)} comparison</h2><div class="artifact-preview" style="min-height:280px"><div class="mini-graph" style="height:260px">${[38,62,45,82,56,91,68,43,77,100,72,88].map((h,i)=>`<i style="height:${h}%;animation-delay:${i*35}ms" title="Run ${i+1}: ${h}"></i>`).join('')}</div></div>`;
  }

  function renderDataExplorer(){
    const rows=[['tenant-084','dashboard','71 ms','hit','Index Scan'],['tenant-021','export','83 ms','miss','Index Scan'],['tenant-084','cohort','52 ms','hit','Index Only'],['tenant-103','dashboard','109 ms','miss','Index Scan'],['tenant-021','events','41 ms','hit','Index Only']];
    const filter=state.artifactState.dataFilter;
    const shown=filter==='all'?rows:rows.filter(r=>r[3]===filter);
    return `<div class="plan-actions"><button class="soft-button" data-action="data-filter" data-value="all">All</button><button class="soft-button" data-action="data-filter" data-value="hit">Cache hits</button><button class="soft-button" data-action="data-filter" data-value="miss">Cache misses</button></div><div class="code-block" style="white-space:normal;padding:0;overflow:auto"><table style="width:100%;border-collapse:collapse;font:12px var(--font-mono)"><thead><tr>${['Tenant','Route','Duration','Cache','Plan'].map(h=>`<th style="text-align:left;padding:9px;border-bottom:1px solid var(--border)">${h}</th>`).join('')}</tr></thead><tbody>${shown.map(r=>`<tr>${r.map(c=>`<td style="padding:9px;border-bottom:1px solid var(--border);color:${c==='hit'?'var(--positive)':c==='miss'?'var(--warning)':'inherit'}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function renderQuizEditor(){
    const ans=state.artifactState.quizAnswer;
    return `<p>Which index order best matches a query filtered by equality on <code>tenant_id</code> and sorted by newest <code>created_at</code>?</p><div class="choice-grid">${['created_at, tenant_id','tenant_id, created_at','event_type, tenant_id','created_at only'].map((x,i)=>`<button class="choice ${ans===i?'selected':''}" data-action="quiz-answer" data-value="${i}">${esc(x)}</button>`).join('')}</div>${ans!==null?`<div class="event-card ${ans===1?'positive':'warning'}" style="margin-top:10px"><span class="event-icon">${icon(ans===1?'check':'info',14)}</span><div class="event-copy"><strong>${ans===1?'Correct':'Review the leading-column rule'}</strong><p>${ans===1?'Equality on tenant_id belongs first; created_at then supports the ordered range.':'The leading column should match the stable equality predicate in this workload.'}</p></div></div>`:''}`;
  }

  function renderPeriodicEditor(){
    const cells=[['FE','Frontend','A'],['BE','Backend','A'],['DB','Database','S'],['BR','Browser','A'],['MO','Motion','S'],['PL','Planning','A'],['AU','Audit','S'],['RS','Rust','A'],['SL','Slint','A'],['SE','Security','B'],['DX','Developer UX','A'],['ML','Models','S']];
    return `<p>Capability cells combine qualification, freshness, specialty, model cost, and current availability.</p><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:7px">${cells.map((c,i)=>`<button class="choice" data-action="periodic-cell" data-value="${esc(c[1])}" style="aspect-ratio:1;display:grid;place-items:center;text-align:center;background:${i%3===0?'color-mix(in srgb,var(--accent) 12%,var(--surface-3))':'var(--surface-3)'}"><strong style="font-size:18px">${c[0]}</strong><span style="font-size:9px;color:var(--muted)">${c[1]}</span><b style="font-size:10px;color:var(--positive)">${c[2]}</b></button>`).join('')}</div>`;
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

  /* One diff row. Line numbers come from l.old / l.new and are NEVER computed
     here -- doing the arithmetic locally is exactly what produced the fake this
     replaces. `kind` maps straight onto the classes styles.css already carries
     (.diff-line.add / .del / .focus); `meta` has no rule there and Wave 1B has
     closed that file, so its muted tone is inline. */
  function renderDiffLine(l, focusLine, deletedFile){
    const cls = l.kind==='add' ? 'add' : l.kind==='del' ? 'del' : '';
    if(l.kind==='meta') return `<span class="diff-line" style="color:var(--subtle)">      ${esc(l.text)}</span>`;
    /* Focus the row the Activity panel said it was opening at: the NEW line
       number, except in a deleted file where only old numbers exist. */
    const num = l.kind==='del' ? l.old : (l.new!=null ? l.new : l.old);
    const focusNum = deletedFile ? l.old : l.new;
    const focus = focusLine!=null && focusNum===focusLine;
    const sign = l.kind==='add' ? '+' : l.kind==='del' ? '-' : ' ';
    return `<span class="diff-line ${cls}${focus?' focus':''}">${String(num==null?'':num).padStart(4)} ${sign} ${esc(l.text)}</span>`;
  }

  /* Reads changes[].hunks (FIXTURE_SCHEMA.md section 1). Until the Wave 2 Demo
     Data agent shipped that field this renderer FABRICATED its own diff: 18
     generated lines printing the same CREATE INDEX migration for every path,
     so opening three different changed files showed three copies of the same
     SQL. When a record has no hunks the honest empty state is shown -- source
     is not invented here.
     white-space:pre is set inline because the hardening layer (styles.css:419)
     relaxes .code-block to pre-wrap, which is right for prose blocks and wrong
     for a diff: wrapping breaks the gutter alignment. Inline keeps that
     override local to the file editor. */
  function renderFileEditor(path){
    const c=D.changes.find(x=>x.path===path);
    const line=c?.line||null;
    const deleted=c?.status==='deleted';
    const statusLabel=(D.labels&&D.labels.changeStatus&&D.labels.changeStatus[c?.status])
      || (c?.status ? String(c.status).replace(/^./,ch=>ch.toUpperCase()) : 'Working tree');
    const hunks=Array.isArray(c?.hunks)?c.hunks:[];
    const meta=`<div class="editor-meta"><span class="meta-pill">${esc(statusLabel)}</span>${c?.oldPath?`<span class="meta-pill">Renamed from ${esc(c.oldPath)}</span>`:''}${line?`<span class="meta-pill">Focused at line ${line}</span>`:''}${c?.language?`<span class="meta-pill">${esc(c.language)}</span>`:''}<span class="meta-pill">${c?`+${c.add} \u2212${c.del}`:'Working tree'}</span>${hunks.length>1?`<span class="meta-pill">${hunks.length} hunks</span>`:''}</div>`;
    const body = hunks.length
      ? hunks.map(h=>`<div class="code-block" style="white-space:pre" data-k="hunk:${esc(path)}:${esc(h.header||'')}"><span class="diff-line" style="color:var(--subtle)">${esc(h.header||'')}</span>\n${h.lines.map(l=>renderDiffLine(l,line,deleted)).join('\n')}</div>`).join('')
      : `<div class="event-card"><span class="event-icon">${icon('info',14)}</span><div class="event-copy"><strong>No diff recorded for this file</strong><p>This change record carries no hunks, so there is nothing to show. Source is not invented here.</p></div></div>`;
    return `<article class="editor-doc" data-k="file:${esc(path)}"><h1>${esc(path)}</h1>${meta}<p>${esc(c?.summary||'File opened from the Chat Activity Detail panel.')}</p>${body}</article>`;
  }

  function renderHistoryContent(flyout=false){
    const q=state.historySearch.trim().toLowerCase();
    const filtered=state.threads.filter(t=>!q || `${t.title} ${t.summary} ${t.messages.map(m=>m.body||m.title||m.detail||'').join(' ')}`.toLowerCase().includes(q));
    const groups=[
      ['pinned','Pinned',filtered.filter(t=>!t.archived&&t.pinned)],
      ['recent','Recent',filtered.filter(t=>!t.archived&&!t.pinned)],
      ['archived','Archived',filtered.filter(t=>t.archived)]
    ];
    const histPinned=document.body.dataset.phDrawer==='pinned';
    const pinTitle=histPinned?'Unpin — float the drawer over the chat again':'Pin left — reserve a gutter so the transcript stays usable';
    const sections=state.historySections||{pinned:true,recent:true,archived:false};
    const sectionHtml=groups.map(([key,name,items])=>{
      const open=sections[key]!==false;
      return `<section class="history-section" data-section="${key}" data-collapsed="${open?'false':'true'}">`+
        `<button type="button" class="section-head" data-action="toggle-history-section" data-section="${key}" aria-expanded="${open?'true':'false'}">`+
        `<span class="section-chev" aria-hidden="true">${icon('down',11)}</span>`+
        `<span class="section-label">${name}</span></button>`+
        `<div class="section-body">${items.length?items.map(renderThreadRow).join(''):`<div class="section-empty">No matching ${name.toLowerCase()} threads.</div>`}</div></section>`;
    }).join('');
    /* historyChrome still receives [name,items] pairs for any extension chrome. */
    const chromeGroups=groups.map(([,name,items])=>[name,items]);
    return `<div class="history-head"><button class="soft-button hh-new-thread" data-action="new-thread"${hoverAttrs('new-thread','Start a new thread')}>${icon('plus',16,'hh-plus-glyph')}<span class="hh-new-label">New thread</span></button><button class="icon-button ph-head-pin ${histPinned?'is-pinned':''}" data-action="ph-toggle-pin" aria-pressed="${histPinned}"${hoverAttrs('hist-pin',pinTitle)}>${icon(histPinned?'unpin':'pin',13)}</button><button class="icon-button" data-action="close-history"${hoverAttrs('hist-close','Close history')}>${icon('close',13)}</button></div>${extRender('historyChrome',{flyout,groups:chromeGroups})}<div class="history-search"><label class="input-wrap"${hoverAttrs('hist-search','Search active and archived threads')}>${icon('search',13)}<input data-input="history-search" value="${esc(state.historySearch)}" placeholder="Search active and archived threads…" aria-label="Search active and archived threads"></label></div><div class="history-scroll" data-scroll-key="history">${sectionHtml}</div>`;
  }

  function renderThreadRow(t){
    return `<div class="thread-row ${t.id===state.selectedThread?'active':''}" data-k="thread:${esc(t.id)}" data-action="select-thread" data-id="${esc(t.id)}" tabindex="0"${hoverAttrs('thread-st-'+t.id,statusLabel(t.status))}><span class="thread-lead"><span class="thread-status-slot">${extReplace('threadRowStatus',{thread:t,variant:state.variants[1]},renderStatus(t,state.variants[1]))}</span><button class="icon-button thread-more" data-action="thread-menu" data-id="${esc(t.id)}" data-menu-anchor="thread-${esc(t.id)}"${hoverAttrs('thread-more-'+t.id,'Thread options')}>${icon('more',14)}</button></span><div class="thread-copy"><div class="thread-title"><span class="thread-time">${esc(t.updated)}</span><span class="thread-name">${esc(t.title)}</span></div><div class="thread-sub"><span class="summary">${esc(t.summary)}</span></div></div></div>`;
  }

  function renderHistory(){ return `<aside class="history-panel" data-history-variant="${state.variants[1]}">${renderHistoryContent(false)}<div class="panel-resize" data-resize="history"></div></aside>`; }
  function formatText(body){
    return esc(body).split(/\n{2,}/).map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
  }

  function renderChat(){
    const t=activeThread();
    return `<section class="chat-stage" data-shell="${state.variants[0]}">
      ${renderChatHeader(t)}
      <div class="transcript" data-variant="${state.variants[5]}" data-scroll-key="transcript"><div class="transcript-inner">${t.messages.filter(messageVisible).map(m=>renderMessage(m,t)).join('')}</div></div>
      ${renderDecisionHost()}
      ${renderChatFloat()}
      ${renderComposer()}
      ${state.activity.open&&!activityPinnedInLayout()?renderActivityPanel(true):''}
    </section>`;
  }

  function renderChatHeader(t){
    /* Context ring percentage. The ring's value is an INLINE style attribute, so no
       module stylesheet can reach it -- it has to be resolved here. PM56_CTX comes from
       context.js; the fallback is the historical literal, so this line is a no-op when
       that module is absent. */
    const cp=(window.PM56_CTX&&window.PM56_CTX.ringPct)?window.PM56_CTX.ringPct():64;
    return `<div class="chat-header">
      <button class="icon-button" data-action="toggle-history"${hoverAttrs('open-history','Open thread history')}>${icon('history',14)}</button>
      <button class="icon-button" data-action="new-thread"${hoverAttrs('new-thread','Start a new thread')}>${icon('plus',16,'hh-plus-glyph')}</button>
      <div class="chat-title"><span>${esc(t.title)}</span><span class="chat-state"><i class="status-dot ${t.status}"></i>${esc(statusLabel(t.status))}</span></div>
      <span class="chat-head-spacer"></span>
      ${extRender('headerLeading',{thread:t})}
      <button class="icon-button" data-action="thread-search" data-menu-anchor="thread-search"${hoverAttrs('thread-search','Search this thread or every thread')}>${icon('search',14)}</button>
      ${extRender('headerExtras',{thread:t})}
      <button class="context-ring" style="--context-pct:${cp}" data-action="context-menu" data-menu-anchor="context-ring" data-value="${cp}"${hoverAttrs('context-ring','Context '+cp+'% used')}></button>
    </div>`;
  }

  /* Turn playback gating: a message with `revealAfter` waits for that work
     run to complete, and a working card with a `workId` waits for its record
     to exist (the sequencer creates the record when the burst actually
     starts, so the card appears the moment its work begins). */
  function messageVisible(m){
    if(m.revealAfter&&!(state.works[m.revealAfter]&&state.works[m.revealAfter].completed)) return false;
    if(m.type==='working'&&m.workId&&!state.works[m.workId]) return false;
    return true;
  }
  function renderMessage(m,t){
    /* Assistant-redesign wave: feature modules own whole transcript card families
       (Plan cards, collaborative run cards, BSD advice, attachment-bearing turns).
       They register `transcriptMessage` and return '' to decline, which falls
       through to the built-in chain below -- so an unregistered type still renders
       exactly as it did before any module loaded. This is the one engine hook the
       wave needs: without it every new card type would have to be bolted into this
       if-chain, which is precisely the app.js growth the module split exists to stop. */
    const ext = extRender('transcriptMessage', {m, t});
    if(ext) return ext;
    if(m.type==='text') return renderTextMessage(m);
    if(m.type==='working') return renderWorkingAnimation(m);
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
    /* Prefer the fixture's authoritative wall clock -- every message ships sentAt --
       rendered in the VIEWER's locale. Takes 11 and 14 print content:attr(data-time),
       so if this kept inventing a clock those two takes would contradict the meta row
       on the same message. The invented walk survives only for a message with no
       timestamp at all. */
    const iso = m && (m.sentAt || m.time);
    if(iso){
      const d = new Date(iso);
      if(!isNaN(d.getTime())) return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    }
    const i=msgIndex(m.id);
    const mins=(11*60+42)+i*3;
    return String(Math.floor(mins/60)%24).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');
  }

  function renderTextMessage(m){
    const expanded=!!state.messageExpanded[m.id], details=!!state.messageDetails[m.id];
    const isLong=m.long || String(m.body).length>460;
    const expandTip=expanded?'Collapse the response':'Expand the full response';
    const copied=state.copyFlashId===m.id;
    const copyBtn=`<button class="text-button icon-only${copied?' is-copied':''}" data-action="copy-message" data-id="${esc(m.id)}"${hoverAttrs('msg-copy-'+m.id,copied?'Copied':'Copy this message without changing the thread')}>${icon(copied?'check':'copy',13)}<span>Copy</span></button>`;
    const editBtn=m.role==='user'&&m.eligibleForEdit?`<button class="text-button" data-action="edit-message" data-id="${esc(m.id)}"${hoverAttrs('msg-edit-'+m.id,'Edit this user message and create a new branch from here')}>${icon('edit',11)}<span>Edit & branch</span></button>`:'';
    const detailsBtn=`<button class="text-button icon-only" data-action="message-details" data-id="${esc(m.id)}"${hoverAttrs('msg-details-'+m.id,'Show model, provider, timing, context, cache, token, and cost details')}>${icon('info',13)}<span>More details</span></button>`;
    const overflowBtn=extRender('messageOverflow',{message:m});
    const overflowPanel=extRender('messageOverflowPanel',{message:m});
    const actions=`<div class="message-actions">${copyBtn}${editBtn}${detailsBtn}${overflowBtn}</div>`;
    const overflowOpen=window.PM56_MSG_OVERFLOW&&window.PM56_MSG_OVERFLOW.isOpen(m.id);
    const chromeCls=`message-chrome${m.role==='user'?' message-chrome-user':''}${overflowOpen?' is-overflow-open':''}`;
    const chrome=`<div class="${chromeCls}">${extRender('messageMeta',{message:m})}${actions}${overflowPanel}</div>`;
    return `<article class="message message-${m.role}" data-message-id="${esc(m.id)}" data-speaker="${m.role==='user'?'You':'Assistant'}" data-index="${msgIndex(m.id)}" data-time="${esc(msgClock(m))}" style="--msg-index:${msgIndex(m.id)}">${extRender('messageAffordance',{message:m})}<div class="message-surface">${m.role==='assistant'?`<div class="message-role">${icon('sparkles',12)} Assistant</div>`:''}<div class="message-body ${isLong&&!expanded?'long-fade':''}">${formatText(m.body)}</div>${isLong?`<button class="text-button" data-action="toggle-message" data-id="${esc(m.id)}"${hoverAttrs('msg-expand-'+m.id,expandTip)}>${icon(expanded?'collapse':'expand',12)} ${expanded?'Collapse':'Expand response'}</button>`:''}${details?renderMessageDetails(m):''}</div>${chrome}</article>`;
  }

  function renderMessageDetails(m){
    /* Every field here used to come from selectedModel() and a row of literals, so all 16
       were byte-identical on every message in every thread EXCEPT Turn ID -- and the Model
       row actively misattributed the turn: a Qwen turn printed the Anthropic route. Telling
       a reviewer something false is worse than telling them nothing. Read the per-message
       runtime the fixture ships; fall back to the old behaviour only when it is absent. */
    const r=m.runtime;
    const clock=iso=>{const d=iso?new Date(iso):null;return d&&!isNaN(d.getTime())?d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'}):null;};
    const num=v=>typeof v==='number'?v.toLocaleString():null;
    /* Fixed 4dp. transcript.js prints 'API billed' and 'Plan estimated' beside this row,
       and three adjacent money values at 2/3/4dp read as three different quantities. */
    const usd=v=>typeof v==='number'?'$'+v.toFixed(4):null;
    /* One source of truth for display labels: if D.labels defines a label for a value the
       panel MUST print the label, never the key. A raw enum on screen is a defect even when
       it happens to look like a word -- 'complete' reads fine and is still the wrong string. */
    const lbl=(map,v)=>{const m=(D.labels&&D.labels[map])||null;if(v==null)return null;
      return (m&&(m[v]||m[String(v).toLowerCase()]))||v;};
    const dash=m.role==='user'?'—':null;
    if(!r){
      /* No runtime means the route is NOT KNOWN. Borrowing selectedModel() here is what
         produced the original misattribution -- a turn claiming a route it never ran on.
         An honest blank beats a confident default. */
      const vals=[['Provider',m.role==='user'?'Local':'—'],['Account','—'],['Model','—'],['Effort','—'],['Persona','—'],['Mode',lbl('mode',state.mode)||'—'],['Started',clock(m.sentAt)||'—'],['Completed','—'],['Duration','—'],['Input tokens','—'],['Output tokens','—'],['Context used','—'],['Cache hit','—'],['Total estimated','—'],['Turn ID',m.id],['Terminal reason',lbl('terminal',m.role==='user'?'submitted':'complete')]];
      return `<div class="message-details">${vals.map(v=>`<div class="detail-kv"><label>${esc(v[0])}</label><strong>${esc(v[1])}</strong></div>`).join('')}</div>`;
    }
    const ctx=r.context||{}, tok=r.tokens||{}, cost=r.cost||{};
    const pct=(typeof ctx.used==='number'&&ctx.limit)?Math.round(ctx.used/ctx.limit*100)+'%':null;
    const dur=typeof r.workedSeconds==='number'?r.workedSeconds+'s':(typeof r.durationMs==='number'?(r.durationMs/1000).toFixed(1)+'s':null);
    const vals=[
      ['Provider', dash||r.provider||'—'],
      ['Account', dash||r.account||'—'],
      ['Model', dash||r.model||'—'],
      ['Effort', dash||lbl('effort',r.effort)||'—'],
      ['Persona', dash||r.persona||'—'],
      ['Mode', lbl('mode',r.mode)||'—'],
      ['Started', clock(r.startedAt||m.sentAt)||'—'],
      ['Completed', dash||clock(r.completedAt)||'—'],
      ['Duration', dash||dur||'—'],
      ['Input tokens', dash||num(tok.input)||'—'],
      ['Output tokens', dash||num(tok.output)||'—'],
      ['Context used', pct||'—'],
      ['Cache hit', dash||(typeof ctx.cacheHitPct==='number'?ctx.cacheHitPct+'%':null)||'—'],
      ['Total estimated', dash||usd(cost.totalUsd)||'—'],
      ['Turn ID', m.id],
      ['Terminal reason', lbl('terminal', r.terminal||(m.role==='user'?'submitted':'complete'))]
    ];
    return `<div class="message-details">${vals.map(v=>`<div class="detail-kv"><label>${esc(v[0])}</label><strong>${esc(v[1])}</strong></div>`).join('')}</div>`;
  }

  function renderPlanCard(m){
    const art=D.artifacts.find(a=>a.id===m.artifactId)||D.artifacts[0];
    return `<article class="system-card plan-card"><div class="system-card-head"><span class="event-icon">${icon('document',14)}</span><div><span class="title">${m.deep?'Deep Plan':'Created Plan'}</span><span class="sub"> · Revision ${state.planRevision}</span></div><span class="spacer"></span><span class="meta-pill">${esc(state.planStatus)}</span><span class="meta-pill">${m.deep?'Exhaustive':'Thorough'}</span></div><div class="system-card-body"><h3>${esc(art.title)}</h3><p>${esc(art.summary)}</p><div class="plan-actions"><button class="soft-button" data-action="open-artifact" data-id="${esc(art.id)}">${icon('eye',13)} View Plan</button><button class="soft-button" data-action="revise-plan" data-id="${esc(art.id)}">${icon('edit',13)} Revise</button><button class="primary-button" data-action="build-plan" data-id="${esc(art.id)}">${icon('play',13)} Build</button></div></div></article>`;
  }

  function renderArtifactMessage(m){
    const art=D.artifacts.find(a=>a.id===m.artifactId); if(!art) return '';
    let preview='';
    if(art.kind==='mermaid') preview=`<div class="artifact-preview mermaid"><svg viewBox="0 0 500 120" width="100%" height="100%"><g font-family="var(--font-ui)" font-size="10" text-anchor="middle"><rect x="20" y="38" width="100" height="42" rx="10" fill="var(--accent)"/><text x="70" y="63" fill="white">Chat</text><rect x="200" y="38" width="110" height="42" rx="10" fill="var(--surface-3)" stroke="var(--border-strong)"/><text x="255" y="63" fill="var(--text)">Activity</text><rect x="390" y="38" width="90" height="42" rx="10" fill="var(--surface-3)" stroke="var(--border-strong)"/><text x="435" y="63" fill="var(--text)">Editor</text></g><path d="M120 59h80M310 59h80" stroke="var(--muted)" stroke-width="2"/></svg></div>`;
    else if(art.kind==='dashboard'||art.kind==='chart') preview=`<div class="artifact-preview"><div class="mini-graph">${[35,58,42,76,51,91,67,84].map((h,i)=>`<i style="height:${h}%;animation-delay:${i*45}ms"></i>`).join('')}</div></div>`;
    else if(art.kind==='image') preview=`<div class="artifact-preview"><div class="generated-scene"></div></div>`;
    else preview=`<div class="artifact-preview" style="display:grid;place-items:center;color:var(--accent)">${icon(art.kind==='document'?'document':'chart',36)}</div>`;
    return `<article class="system-card" data-artifact-id="${esc(art.id)}"><div class="system-card-head"><span class="event-icon">${icon(art.kind==='image'?'image':art.kind==='mermaid'?'code':'artifact',14)}</span><div><span class="title">${esc(art.title)}</span><span class="sub"> · ${esc(art.kind)}</span></div><span class="spacer"></span><span class="meta-pill">${esc(lblOf('artifactStatus',art.status))}</span></div><div class="system-card-body">${preview}<div class="artifact-card"><div><strong>${esc(art.title)}</strong><p style="margin:3px 0 0;color:var(--muted);font-size:11px">${esc(art.summary)}</p></div><button class="soft-button" data-action="open-artifact" data-id="${esc(art.id)}">${icon('expand',13)} Open</button></div></div></article>`;
  }

  function renderLiveAgentsCard(){
    return `<article class="system-card"><div class="system-card-head"><span class="event-icon">${icon('users',14)}</span><div><span class="title">Live subagents</span><span class="sub"> · visible while working</span></div><span class="spacer"></span><span class="chat-state"><i class="status-dot working"></i>${(D.subagents||[]).filter(a=>a.status==='working').length} active</span></div><div class="system-card-body"><div class="live-agent-list">${(D.subagents||[]).slice(0,5).map(renderLiveAgentRow).join('')}</div></div></article>`;
  }

  function renderLiveAgentRow(a){
    return `<button class="live-agent-row" data-action="open-agent" data-id="${esc(a.id)}" title="Open the read-only live child thread"><span class="agent-avatar">${esc(a.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</span><span><span class="agent-name">${esc(a.name)}</span><span class="agent-now">${esc(a.current)}</span><span class="agent-progress"><i style="width:${a.progress}%"></i></span></span><span class="agent-state ${a.status}">${esc(lblOf('subagentStatus',a.status))}</span></button>`;
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
    /* The actions array is a fixed if-chain, so module-rendered system cards (restore
       points, rewound regions) could carry no buttons at all. Emits nothing unregistered. */
    const extActions=extRender('systemCardActions',{message:m}); if(extActions) actions.push(extActions);
    return `<article class="event-card ${d[2]}" data-message-id="${esc(m.id||'')}"${m.dispatchId?` data-dispatch-id="${esc(m.dispatchId)}"`:''}${m.commandId?` data-command-id="${esc(m.commandId)}"`:''}${m.resultStatus?` data-result-status="${esc(m.resultStatus)}"`:''}><span class="event-icon">${icon(d[0],14)}</span><div class="event-copy"><strong>${esc(m.title||d[1])}</strong><p>${esc(m.detail||'')}</p>${m.type==='bsd-advice'?`<p><strong>Impact:</strong> The primary agent changed from rewriting history to a forward migration with rollback evidence.</p>`:''}</div>${actions.length?`<div class="plan-actions">${actions.join('')}</div>`:''}</article>`;
  }
  function renderWorkingAnimation(m){
    const rec=workRecFor(m)||state.work;
    const v=state.variants[2];
    const ctx=makeWorkCtx(rec,m), step=ctx.step, pct=ctx.pct;
    const co=CHROME_OPTS[v]||{}, shut=rec.completed&&rec.openPhase==null;
    const cardId=ctx.cardId, recId=(m&&m.workId)||'primary';
    return `<article class="working-card ${rec.completed?'is-done ':''}working-variant-${v}" data-working-variant="${v}" data-step-kind="${esc(step.kind)}" data-card="${esc(recId)}" data-card-ui="${esc(cardId)}" data-k="workcard:${esc(cardId)}"><div class="working-head"><span class="work-phase-icon">${icon(step.icon,14)}</span><div><strong>${rec.completed?'Completed':'Working'}</strong>${extEach('workingHeadCaption',{message:m,rec,ctx})||''}<span class="sub"> · ${formatElapsed(rec.elapsed)}</span></div><span class="spacer"></span><div class="working-controls">${rec.running?`<button class="icon-button" data-action="pause-working" title="Pause the live demo">${icon('pause',13)}</button>`:`<button class="icon-button" data-action="start-working" title="Start or resume the complete work sequence">${icon('play',13)}</button>`}<button class="icon-button" data-action="step-working" title="Advance one operation">${icon('step',13)}</button><button class="icon-button" data-action="complete-working" title="Complete the sequence">${icon('check',13)}</button><button class="icon-button" data-action="reset-working" title="Reset this work run">${icon('reset',13)}</button><button class="icon-button ${rec.expanded?'active':''}" data-action="toggle-work-history" title="${rec.expanded?'Hide':'Show'} organized work history and evidence">${icon(rec.expanded?'collapse':'expand',13)}</button></div></div><div class="working-body" data-flip data-k="wv:${v}:${esc(cardId)}">${co.noChrome?'':renderPhaseChrome(ctx,co)}${(shut&&!co.keepBody)?'':renderWorkingVariant(v,step,pct,ctx)}${renderLiveAgentInline(step)}${rec.expanded?renderWorkHistory(rec):''}</div>${renderOpenWorkTerminal(cardId,rec)}</article>`;
  }

  /* Everything a working-animation take needs, so takes can live outside
     this IIFE (see motion.js / variants-*.js) and still reach state, the
     fixtures and the shared render helpers. */
  /* Families are 8 options wide except Working Animation (data.js),
     Transcript (data.js), and Question & decision (nine takes). */
  /* Takes that already render child agents themselves must not also get
     the shared inline list appended underneath. */
  const AGENT_OWNING_TAKES=new Set([6]);
  function takeOwnsAgents(v){ return AGENT_OWNING_TAKES.has(v) || !!(window.PM56_WORKING&&window.PM56_WORKING[v]&&window.PM56_WORKING[v].ownsAgents); }
  const FAMILY_SIZES={2:()=>D.workingTakes.length, 5:()=>D.transcriptTakes.length, 6:()=>(window.PM56_QUESTIONS&&window.PM56_QUESTIONS.takes)||9};
  function familyMax(f){ const g=FAMILY_SIZES[f]; return (g?g():8) - 1; }
  function questionFilled(q){
    if(!q) return false;
    if(Array.isArray(q.attachments)&&q.attachments.length) return true;
    if(String(q.other||'').trim()) return true;
    if(Array.isArray(q.answer)) return q.answer.length>0;
    return String(q.answer||'').trim().length>0;
  }
  /* Shared working-chrome opts per take. Take 8 (Step Rail) implements the
     full reference mechanic privately — trail, rows, compaction and
     per-step reopen — so it gets neither the chrome nor the shut-body
     gate (keepBody). Takes 0/11/15 already print concrete per-step rows
     in their bodies, so the chrome skips its row block for them. Takes
     4/6 end on a meaningful final stage that should stay visible after
     compaction. */
  const CHROME_OPTS={0:{noRows:true},1:{noChrome:true,keepBody:true},4:{keepBody:true},6:{keepBody:true},8:{noChrome:true,keepBody:true},11:{noRows:true},15:{noRows:true}};
  /* ---- multi-card work records --------------------------------------
     state.work stays the PRIMARY record every historic consumer targets
     (demo triggers, PM56_DEMO, the status bar, transcript.js). A message
     that names a workId -- the Multi Orbit demo fixtures, /debug, /web --
     gets its own record in state.works. A record may carry a float `clock`
     in demo seconds; a record without one derives clock from step*2, so
     every writer that assigns `step` wholesale keeps working untouched.
     Records with a `runId` follow a scripted timeline from D.workRuns whose
     steps are SUBJECT INSTANCES (duplicates allowed); everything else
     synthesizes the classic 14-step timeline so all other takes keep their
     historic cadence. */
  function workRecFor(m){ return m&&m.workId?state.works[m.workId]:state.work; }
  function workClock(rec){ return rec.clock!=null?rec.clock:rec.step*2; }
  const RUN_CACHE={};
  function rowsFromPhase(s){ return (D.phaseRows[s.kind]&&D.phaseRows[s.kind][s.id])||(s.evidence||[]).slice(0,3).map(t=>({text:t})); }
  function workInstancesFor(rec){
    const runId=rec&&rec.runId, key=runId||'__legacy';
    if(RUN_CACHE[key]) return RUN_CACHE[key];
    let list;
    if(runId&&D.workRuns&&D.workRuns[runId]){
      list=D.workRuns[runId].steps.map((s,i)=>{
        /* `ref` inherits a workSteps base; a ref-less instance (the mcp/skill
           subjects) defines id/kind/label/icon/verb/detail inline. */
        const base=s.ref?(D.workSteps.find(x=>x.id===s.ref)||D.workSteps[0]):{};
        const inst={...base,...s,id:(base.id||s.id||s.kind),uid:`${runId}:${i}`};
        inst.rows=(s.rows||rowsFromPhase(base)).map((r,k)=>({at:r.at!=null?r.at:k*0.55,...r}));
        inst.stat=s.stat||((D.phaseMeta[base.kind]||{}).count||'');
        return inst;
      });
    }else{
      list=D.workSteps.map((s,i)=>({...s,uid:s.id,startAt:i*2,dur:2,
        rows:rowsFromPhase(s).map((r,k)=>({at:k*0.55,...r})),
        stat:(D.phaseMeta[s.kind]||{}).count||''}));
    }
    RUN_CACHE[key]=list; return list;
  }
  function workLiveIndex(rec){
    const list=workInstancesFor(rec), c=workClock(rec);
    let i=0;
    for(let k=0;k<list.length;k++){ if(list[k].startAt<=c+1e-6) i=k; else break; }
    return i;
  }
  function workRunEnd(list){ const last=list[list.length-1]; return last.startAt+(last.dur!=null?last.dur:2); }
  function makeWorkCtx(rec,m){
    rec=rec||state.work;
    const steps=workInstancesFor(rec);
    const index=clamp(workLiveIndex(rec),0,steps.length-1);
    const step=steps[index], total=steps.length;
    const pct=Math.round((index/Math.max(1,total-1))*100);
    return {
      state, D, step, pct, steps, index, total,
      running:rec.running, completed:rec.completed, elapsed:rec.elapsed,
      rec, cardId:(m&&m.id)||'work', clock:workClock(rec),
      rowVisible:(inst,r)=>rec.completed||workClock(rec)>=inst.startAt+((r&&r.at)||0),
      icon, esc, formatElapsed, commandForStep, isShellRow, shellRowWrap, workRowWrap, workRowDest,
      workReceipt:(opts)=>renderWorkReceipt(rec,opts),
      M: window.PM56_MOTION
    };
  }

  /* Working-activity detail rows: streamed prose is never a button.
     Destinations come from explicit row fields first, then text/kind
     inference. Bash-kind alone is not a shell row — only `cmd` or a
     "Ran …" command line opens the inline Shell box. */
  function workDocId(kind, a, b){
    return kind+':'+encodeURIComponent(String(a||''))+(b?'|'+encodeURIComponent(String(b)):'');
  }
  function inferPathFromText(text){
    const m=String(text||'').match(/^(?:Read|Edited|Created|Wrote)\s+(\S+)/i);
    return m?m[1]:null;
  }
  function inferSearchQuery(text){
    const m=String(text||'').match(/^Searched\s+"([^"]+)"/i);
    return m?m[1]:null;
  }
  function inferMcpTool(text){
    const t=String(text||'');
    let m=t.match(/^Called\s+([A-Za-z0-9_.:-]+)/i);
    if(m) return m[1];
    m=t.match(/^MCP\s*·\s*([A-Za-z0-9_.:-]+)/i);
    return m?m[1]:null;
  }
  function inferAgentId(text){
    const t=String(text||'');
    const map=[['Query Analyzer','agent-query'],['Schema Reviewer','agent-schema'],['Benchmark Runner','agent-bench']];
    for(const [name,id] of map) if(t.includes(name)) return id;
    return null;
  }
  function workRowDest(step, row){
    if(!row || row.stream) return null;
    const text=String(row.text||'');
    const kind=(step&&step.kind)||'';
    if(row.cmd) return {kind:'shell'};
    if(row.path) return {kind:'file', path:row.path};
    if(row.artifactId) return {kind:'artifact', id:row.artifactId};
    if(row.agentId) return {kind:'agent', id:row.agentId};
    if(row.url) return {kind:'doc', id:workDocId('link', row.url, text)};
    if(row.query) return {kind:'doc', id:workDocId('search', row.query, row.tag||'')};
    if(row.tool) return {kind:'doc', id:workDocId('mcp', row.tool, text)};
    if(row.doc) return {kind:'doc', id:row.doc};
    if(/^Ran\s+/i.test(text)) return {kind:'shell'};
    const mcpTool=inferMcpTool(text);
    if(mcpTool || kind==='mcp') return {kind:'doc', id:workDocId('mcp', mcpTool||text, text)};
    const path=inferPathFromText(text);
    if(path) return {kind:'file', path};
    const q=inferSearchQuery(text);
    if(q) return {kind:'doc', id:workDocId('search', q, row.tag||'')};
    if(kind==='web-search') return {kind:'doc', id:workDocId('search', text, row.tag||'')};
    if(/^Rendered\s+/i.test(text) || kind==='artifact'){
      if(/mermaid|diagram|architecture|rollout/i.test(text)) return {kind:'artifact', id:'mermaid-runtime'};
      return {kind:'artifact', id:'dashboard-query'};
    }
    const agent=inferAgentId(text);
    if(agent) return {kind:'agent', id:agent};
    if(/console errors/i.test(text)) return null;
    if(kind==='browser' || /^(Opened|Captured)\b/i.test(text)){
      if(/dashboard|p50|p95|trace/i.test(text) || kind==='browser') return {kind:'artifact', id:'dashboard-query'};
    }
    if(/p95\s+\d+/i.test(text) && /→/.test(text)) return {kind:'artifact', id:'dashboard-query'};
    if(kind==='app' || /inspector/i.test(text) || /schema metadata/i.test(text)) return {kind:'doc', id:'app:inspector'};
    if(kind==='test' || /^Replayed\s+/i.test(text)) return {kind:'artifact', id:'test-evidence'};
    if(kind==='skill') return {kind:'artifact', id:'report-query'};
    if(/Attached the benchmark artifact/i.test(text)) return {kind:'artifact', id:'dashboard-query'};
    return null;
  }
  function isShellRow(step, row){
    const d=workRowDest(step, row);
    return !!(d && d.kind==='shell');
  }
  function workRowWrap(cardId, step, row, j, inner, key, extraClass, stagger){
    const dest=workRowDest(step, row);
    const shell=!!(dest && dest.kind==='shell');
    const t=state.workTerminal[cardId];
    const on=!!(shell && t && t.stepUid===step.uid && Number(t.rowIndex)===j);
    const click=!!dest;
    const cls=`${extraClass||'wa-row'} pm-materialize${click?' is-click':''}${shell?' is-shell':''}${on?' is-open':''}`;
    const st=stagger!=null?stagger:j;
    if(!dest) return `<span class="${cls}" data-k="${key}" style="--pm-stagger:${st}">${inner}</span>`;
    let attrs='';
    if(shell){
      attrs=`data-action="work-terminal-open" data-card-ui="${esc(cardId)}" data-step="${esc(step.uid)}" data-row="${j}" aria-expanded="${on?'true':'false'}"`;
    }else if(dest.kind==='file'){
      attrs=`data-action="open-change" data-path="${esc(dest.path)}"`;
    }else if(dest.kind==='artifact'){
      attrs=`data-action="open-artifact" data-id="${esc(dest.id)}" data-artifact-id="${esc(dest.id)}"`;
    }else if(dest.kind==='agent'){
      attrs=`data-action="open-agent" data-id="${esc(dest.id)}"`;
    }else{
      attrs=`data-action="open-work-doc" data-id="${esc(dest.id)}"`;
    }
    return `<button type="button" class="${cls}" data-k="${key}" ${attrs} style="--pm-stagger:${st}">${inner}</button>`;
  }
  function shellRowWrap(cardId, step, row, j, inner, key, extraClass, stagger){
    return workRowWrap(cardId, step, row, j, inner, key, extraClass, stagger);
  }
  function inferShellCmd(step, row){
    if(row && row.cmd) return row.cmd;
    const t=String((row&&row.text)||'');
    if(/^Ran\s+/i.test(t)) return t.replace(/^Ran\s+/i,'');
    return commandForStep(step);
  }
  function formatTermDuration(ms){
    const s=Math.max(1, Math.round((ms||0)/1000));
    const m=Math.floor(s/60), sec=s%60;
    return m?`${m}m ${String(sec).padStart(2,'0')}s`:`${s}s`;
  }
  function renderWorkTerminal(cardId, step, row){
    const cmd=inferShellCmd(step, row);
    const raw=row.output!=null?row.output:(row.tag||row.text||'');
    const lines=Array.isArray(raw)?raw:[raw];
    const exit=row.exitCode!=null?row.exitCode:0;
    const ms=row.durationMs!=null?row.durationMs:(step&&step.dur?step.dur*1000:45000);
    const out=lines.filter(Boolean).map(line=>`<div class="work-terminal-out">${esc(String(line))}</div>`).join('');
    return `<div class="work-terminal" data-k="wterm:${esc(cardId)}">`+
      `<div class="work-terminal-head">${icon('terminal',14)}<span class="work-terminal-ran">Ran command in ${esc(formatTermDuration(ms))}</span></div>`+
      `<div class="work-terminal-box">`+
      `<button type="button" class="icon-button work-terminal-close" data-action="work-terminal-close" data-card-ui="${esc(cardId)}" aria-label="Close the shell output">${icon('close',12)}</button>`+
      `<span class="work-terminal-label">Shell</span>`+
      `<div class="work-terminal-cmd"><span class="work-terminal-prompt">$</span> ${esc(cmd)}</div>`+
      out+
      `<div class="work-terminal-exit">Exit code ${esc(String(exit))}</div>`+
      `</div></div>`;
  }
  function renderOpenWorkTerminal(cardId, rec){
    const t=state.workTerminal[cardId];
    if(!t) return '';
    const steps=workInstancesFor(rec);
    const st=steps.find(s=>s.uid===t.stepUid);
    const row=st&&(st.rows||[])[t.rowIndex];
    if(!st||!row) return '';
    return renderWorkTerminal(cardId, st, row);
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
    const open=ctx.rec.openPhase;
    const shut=completed&&open==null;
    const phases=[];
    for(const s of ctx.steps){
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
      return `<button type="button" class="${cls}" data-k="wa:${i}:${g.phase}"${act} title="${esc(meta.past||meta.verb||g.phase)} ${esc(meta.count||'')}" aria-label="${esc(meta.past||meta.verb||g.phase)}">${icon(g.first.icon,11)}</button>`;
    }).join('');
    /* `off` continues the entrance cascade across the steps of one opened
       phase, so rows always land top-to-bottom in document order. */
    const rowsFor=(s,off=0)=>{
      const rows=(s.rows&&s.rows.length)?s.rows:rowsFromPhase(s);
      let w=off;
      return rows.map((r,j)=>{
        const body=r.stream?`<span class="wa-prose pm-stream">${M.words(r.text,w)}</span>`:`<span class="wa-rowtext">${esc(r.text)}</span>`;
        if(r.stream)w+=M.wordCount(r.text);
        const metaBit=r.add!=null?`<span class="wa-meta"><b class="wa-add">+${r.add}</b>${r.del!=null?` <b class="wa-del">−${r.del}</b>`:''}</span>`:r.url?`<span class="wa-meta"><b class="wa-tag">${esc(r.url)}</b></span>`:r.tag?`<span class="wa-meta"><b class="wa-tag">${esc(r.tag)}</b></span>`:'';
        return workRowWrap(ctx.cardId,s,r,j,body+metaBit,`war:${s.id}:${j}`,'wa-row',off+j);
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
    const chev=completed?`<button type="button" class="wa-chev ${open?'open':''}" data-k="wchev" data-action="toggle-work-phase" data-value="${open||(D.phaseGroups[step.kind]||step.kind)}" title="${open?'Collapse phase details':'Show phase details'}">${icon('down',12)}</button>`:'';
    let under='';
    if(shut){ under=`<div class="wa-under wa-shut" data-k="wau">${ctx.workReceipt()}</div>`; }
    else if(!opts.noRows){
      const g=open?phases.find(x=>x.phase===open):null;
      let off=0;const rows=(g?g.steps:[step]).map(st=>{const h=rowsFor(st,off);off+=((st.rows&&st.rows.length)?st.rows:rowsFromPhase(st)).length;return h;}).join('');
      under=`<div class="wa-under pm-rows pm-materialize" data-k="wau:${open||cur.phase}">${rows}</div>`;
    }
    return `<div class="wa-chrome" data-k="wac"><div class="wa-head" data-k="wah"><span class="pm-rail wa-track" data-k="wat">${trail}</span><span class="wa-label" data-k="wal">${label}</span><span class="wa-spacer"></span>${chev}</div>${under}</div>`;
  }
  function renderWorkingVariant(v,step,pct,ctx){
    /* A module may replace a whole take without touching this file or
       PM56_WORKING: slot 'workingTake:1' is the Orbit override Wave 4 uses. */
    ctx=ctx||makeWorkCtx();
    const slotted = extEach(`workingTake:${v}`, {v,step,pct,ctx});
    if(slotted) return slotted;
    const take = window.PM56_WORKING && window.PM56_WORKING[v];
    if(typeof take==='function') return take(ctx);
    if(v===0) return `<div class="reference-stage" data-k="stage"><span class="work-phase-icon" data-k="wicon:${step.id}">${icon(step.icon,14)}</span><div><div class="morph-slot" data-k="morph:${step.id}"><div class="work-verb${ctx.running?' pm-shimmer':''}">${esc(step.verb)}</div><div class="work-detail">${esc(step.detail)}</div></div><div class="work-progress" data-k="prog"><i style="width:${pct}%"></i></div><div class="work-evidence" data-k="ev">${step.evidence.slice(0,3).map((x,i)=>`<div class="evidence-line pm-materialize" style="--pm-stagger:${i}" data-k="ev:${step.id}:${i}">${icon('check',10)}<span>${esc(x)}</span></div>`).join('')}</div><div class="phase-list" data-k="dots">${ctx.steps.map((s,i)=>`<i class="phase-dot ${i<ctx.index?'done':i===ctx.index?'current':''}" data-k="dot:${i}" title="${esc(s.label)}"></i>`).join('')}</div></div></div>${ctx.completed?ctx.workReceipt():''}`;
    if(v===1){
      /* Every step gets a station, not just steps 1-8: the old slice(1,9)
         left steps 0 and 9-13 with no node at all, so the ring sat frozen
         through the whole last third of a run. The ring itself counter-
         rotates so the active station always arrives at the top -- that
         travel is the animation. */
      const nodes=ctx.steps, seg=360/nodes.length;
      return `<div class="orbit-stage" data-k="orbit" style="--seg:${seg}deg;--orbit-rot:${-ctx.index*seg}deg"><i class="orbit-track"></i><div class="orbit-ring" data-k="ring">${nodes.map((sx,i)=>`<span class="orbit-node ${i<ctx.index?'done':i===ctx.index?'current':''}" data-k="node:${sx.id}" data-action="inspect-work-step" data-value="${i}" role="button" tabindex="0" style="--angle:${i*seg}deg;pointer-events:auto;cursor:pointer" title="${esc(sx.label)}">${icon(sx.icon,13)}</span>`).join('')}</div><div class="orbit-core" data-k="core"><div><span class="orbit-core-icon" data-k="coreicon:${step.id}">${icon(step.icon,22)}</span><strong data-k="corelabel:${step.id}">${esc(step.label)}</strong><div class="work-detail">${pct}%</div></div></div></div><div class="orbit-caption work-detail" data-k="cap:${step.id}">${esc(step.detail)}</div>${ctx.completed?ctx.workReceipt():''}`;
    }
    if(v===2){
      /* A real deck. Cards share one origin and differ only by depth, so
         the front card occludes the ones behind it -- which is what stops
         the text collisions the old absolute-offset layout produced (six
         overlapping siblings, three titles printed on top of each other).
         Keying by step id means the card that was current *transitions*
         back to depth 1 as the run advances, instead of being rebuilt. */
      const win=[ctx.index-2,ctx.index-1,ctx.index,ctx.index+1].filter(i=>i>=0&&i<ctx.total);
      return `<div class="step-stack" data-k="deck">${win.map(idx=>{const sx=ctx.steps[idx],rel=idx-ctx.index;
        return `<div class="stack-card ${rel===0?'current':rel<0?'done':'next'}" data-k="card:${sx.id}" style="--depth:${Math.abs(rel)};--dir:${rel<0?-1:1}"><div class="stack-label">${idx+1} / ${ctx.total} · ${esc(sx.label)}</div><div class="stack-body"><span class="work-phase-icon">${icon(sx.icon,13)}</span><div><div class="work-verb${rel===0&&ctx.running?' pm-shimmer':''}">${esc(sx.verb)}</div><div class="work-detail">${esc(sx.detail)}</div></div></div></div>`;}).join('')}</div>${ctx.completed?ctx.workReceipt():''}`;
    }
    if(v===3){
      /* All 14 tools, and the track slides so the active one stays centred
         -- the old slice(1,12) meant steps 0, 12 and 13 highlighted nothing.
         The command line types itself with a steps() reveal sized to the
         string, and keeps a block caret while the run is live. */
      const items=ctx.steps, cmd=commandForStep(step);
      return `<div class="tool-ribbon" data-k="ribbon"><i class="ribbon-spot"></i><div class="ribbon-track" data-k="track" style="--active:${ctx.index}">${items.map((sx,i)=>`<span class="ribbon-item ${i<ctx.index?'done':i===ctx.index?'current':''}" data-k="tool:${sx.id}" title="${esc(sx.label)}">${icon(sx.icon,12)}<span>${esc(sx.label)}</span></span>`).join('')}</div></div><div class="ribbon-focus" data-k="focus"><div class="ribbon-command${ctx.running?' typing':''}" data-k="cmd:${step.id}" style="--ch:${cmd.length}">${esc(cmd)}</div><div class="ribbon-output" data-k="out">${step.evidence.slice(0,3).map((x,i)=>`<span class="ribbon-line pm-materialize" style="--pm-stagger:${i}" data-k="ol:${step.id}:${i}">${esc(x)}</span>`).join('')}</div><div class="work-progress" data-k="prog"><i style="width:${pct}%"></i></div></div>${ctx.completed?ctx.workReceipt():''}`;
    }
    if(v===4){
      /* The receipt prints itself: every metric rolls to its new value
         rather than snapping, and the build bar is a real element whose
         width transitions -- the old ::after animated a gradient, which
         does not interpolate, so it jumped. */
      const tools=Math.min(14,Math.max(0,ctx.index)); const files=Math.min(3,Math.floor(ctx.index/3)); const agents=ctx.index>=7?Math.min(2,ctx.index-6):0; const tests=ctx.index>=10?(ctx.index-9)*7:0;
      const cells=[['Elapsed',formatElapsed(ctx.elapsed)],['Tools',tools],['Files',files],['Agents',agents],['Tests',Math.min(42,tests)],['Evidence',Math.min(18,ctx.index+1)],['p95',`${Math.max(71,482-ctx.index*32)} ms`],['State',ctx.completed?'Ready':step.label]];
      return `<div class="receipt-stage" data-k="receipt">${cells.map(([k,val],i)=>`<div class="receipt-metric ${k==='State'?'rc-state':''} pm-materialize" style="--pm-stagger:${i}" data-k="metric:${k}"><label>${esc(k)}</label><strong>${M.roll(val)}</strong></div>`).join('')}<div class="receipt-building" data-k="building"><span class="work-phase-icon" data-k="ricon:${step.id}">${icon(step.icon,13)}</span><div class="receipt-copy"><div class="work-verb${ctx.running?' pm-shimmer':''}">${esc(step.verb)}</div><div class="work-detail">The completion receipt is assembling as evidence arrives.</div></div><span class="receipt-bar" data-k="rbar"><i style="width:${pct}%"></i></span></div></div>`;
    }
    if(v===5){
      /* The panels hand off: what was the current operation becomes Next,
         so each panel is keyed by the step it describes and slides through
         the bench rather than being rebuilt in place. */
      const next=ctx.steps[Math.min(ctx.total-1,ctx.index+1)];
      const panels=[
        ['Current operation', step.verb, step.detail, 'active', `cur:${step.id}`],
        ['Next', next.label, next.verb, '', `next:${next.id}`],
        ['Evidence', step.evidence[0], step.evidence[1]||'Collecting supporting evidence', '', `ev:${step.id}`],
        ['Resources', ctx.index>=8?'3 files changed':'Reading safely', ctx.index>=7?'2 agents participating':'No mutations yet', '', `res:${ctx.index>=8?'a':'b'}`]
      ];
      return `<div class="workbench" data-k="bench">${panels.map(([lab,head,sub,cls,k],i)=>`<div class="bench-panel ${cls}" data-k="bench:${i}">${cls?'<i class="bench-scan"></i>':''}<label>${esc(lab)}</label><span class="bench-slot pm-materialize" style="--pm-stagger:${i}" data-k="${k}"><strong class="${cls&&ctx.running?'pm-shimmer':''}">${esc(head)}</strong><p>${esc(sub)}</p></span></div>`).join('')}</div><div class="work-progress" data-k="prog"><i style="width:${pct}%"></i></div>${ctx.completed?ctx.workReceipt():''}`;
    }
    if(v===6){
      /* Lanes promote and demote with a spring, and a blocked lane shakes
         once when it becomes blocked -- keyed on the status so the shake
         fires on the transition, not on every render. */
      const parentStatus=ctx.completed?'done':'';
      return `<div class="agent-stage" data-k="stage"><div class="agent-lane parent ${parentStatus}" data-k="lane:parent"><span class="lane-avatar">PM</span><span class="lane-copy"><strong class="${ctx.running?'pm-shimmer':''}">Parent · ${esc(step.label)}</strong><span data-k="pverb:${step.id}">${esc(step.verb)}</span></span>${ctx.running?`<span class="lane-wave"><i></i><i></i><i></i></span>`:icon(ctx.completed?'check':'pause',13)}${ctx.running?'<i class="lane-pulse"></i>':''}</div>${(()=>{const pool=D.subagents.slice(0,4);const able=pool.filter(x=>x.status!=='blocked');const baton=able.length?able[ctx.index%able.length].id:null;const lead=pool.filter(x=>x.id===baton);return lead.concat(pool.filter(x=>x.id!==baton));})().map((a,i)=>{const able=D.subagents.slice(0,4).filter(x=>x.status!=='blocked');const baton=able.length?able[ctx.index%able.length].id:null;const live=a.status!=='blocked'&&a.id===baton&&!ctx.completed;const st=a.status==='blocked'?'blocked':ctx.completed?'done':'';const line=live?(step.evidence[i%step.evidence.length]||a.current):a.current;const lanePct=live?Math.max(6,Math.min(100,pct+(i%2?-9:7))):(ctx.completed?100:0);return `<button class="agent-lane ${st} ${live?'live':''}" data-flip-move style="--lane-pct:${lanePct}%" data-k="lane:${esc(a.id)}" data-action="open-agent" data-id="${esc(a.id)}"><span class="lane-avatar">${esc(a.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</span><span class="lane-copy"><strong>${esc(a.name)}</strong><span class="pm-materialize ${live&&ctx.running?'pm-shimmer':''}" data-k="ln:${esc(a.id)}:${esc(line)}">${esc(line)}</span></span>${live&&ctx.running?`<span class="lane-wave"><i></i><i></i><i></i></span>`:(()=>{const lbl=a.status==='blocked'?'blocked':ctx.completed?'done':live?'working':'queued';return `<span class="agent-state ${lbl}">${esc(lbl)}</span>`;})()}<i class="lane-track"><b></b></i>${ctx.running&&!ctx.completed?'<i class="lane-pulse"></i>':''}</button>`;}).join('')}</div>${ctx.completed?ctx.workReceipt():''}`;
    }
    /* The calmest take: nothing arrives, it simply becomes. The glyph
       breathes, the palette drifts with --pm-step as phases change, and a
       single travelling marker slides along the dot track. */
    return `<div class="calm-stage" data-k="calm"><div><span class="calm-glyph" data-k="glyph:${step.id}">${icon(step.icon,20)}</span><div class="calm-verb${ctx.running?' pm-shimmer':''}" data-k="cverb:${step.id}">${esc(step.verb)}</div><div class="calm-detail pm-stream" data-k="cdet:${step.id}">${M.words(step.detail)}</div><div class="calm-dots" data-k="cdots" style="--travel:${ctx.index}"><i class="calm-marker"></i>${ctx.steps.map((s,i)=>`<i class="${i<ctx.index?'done':''}" data-k="cdot:${i}"></i>`).join('')}</div></div></div>${ctx.completed?ctx.workReceipt():''}`;
  }

  function renderLiveAgentInline(step){
    if(step.kind!=='agents'||takeOwnsAgents(state.variants[2])) return '';
    return `<div style="margin-top:10px;padding-top:9px;border-top:1px solid var(--border)"><div class="section-head" style="padding:0 0 5px"><span>Live child agents</span><span class="count">2</span></div><div class="live-agent-list">${D.subagents.slice(0,2).map(renderLiveAgentRow).join('')}</div></div>`;
  }
  function renderWorkReceipt(rec,opts){
    rec=rec||state.work; opts=opts||{};
    const run=rec.runId&&D.workRuns&&D.workRuns[rec.runId];
    const chips=[];
    /* The elapsed chip is redundant wherever the card head already prints the
       time -- the compact strips and the rails summary pass {elapsed:false}. */
    if(opts.elapsed!==false) chips.push(`Worked for ${formatElapsed(rec.elapsed)}`);
    if(run&&run.receipt) chips.push(...run.receipt);
    else chips.push('14 tools',`${(D.changes||[]).length} files`,`${(D.subagents||[]).length} agents`,'42 tests',`${(D.artifacts||[]).length} artifacts`);
    return `<div class="work-receipt">${chips.map(c=>`<span class="receipt-chip">${esc(c)}</span>`).join('')}</div>`;
  }
  function renderWorkHistory(rec){
    rec=rec||state.work;
    const list=workInstancesFor(rec);
    const n=clamp(rec.step,0,list.length-1);
    return `<div class="work-history"><div class="section-head" style="padding:0 2px 3px"><span>Organized work stream and evidence</span><span class="count">${n+1}</span></div>${list.slice(0,n+1).map((s,i)=>`<button class="history-step ${i===n?'current':'done'}" data-action="inspect-work-step" data-value="${i}"><span class="work-phase-icon" style="width:20px;height:20px;border-radius:6px">${icon(i<n?'check':s.icon,10)}</span><span><strong style="display:block;font-size:10px">${esc(s.label)} · ${esc(s.verb)}</strong><span style="font-size:10px;color:var(--muted)">${esc((s.rows||[]).map(r=>r.text).slice(0,3).join(' · ')||(s.evidence||[]).join(' · '))}</span></span><span class="time">${i===n?'now':`${Math.max(1,(n-i)*8)}s ago`}</span></button>`).join('')}</div>`;
  }
  function commandForStep(step){
    const map={prepare:'pm resolve --thread query-performance',thought:'reasoning: compare index selectivity and write pressure',files:'read src/analytics/{queries,schema}.rs', 'web-search':'web search "PostgreSQL multicolumn index leading column"','web-fetch':'fetch docs/postgresql/indexes-multicolumn','browser':'browser control dashboard/query-performance','bash':'cargo bench analytics_query -- --profile','agents':'spawn query-analyzer schema-reviewer','edit':'apply migration 0043 + batch query patch','app':'control database-inspector --refresh-schema','test':'browser test query-dashboard --widths all','validate':'cargo test && cargo clippy && pm audit','artifact':'render benchmark-dashboard + mermaid','complete':'complete: evidence package ready'};
    return map[step.kind]||step.verb;
  }
  function formatElapsed(s){ const m=Math.floor(s/60),sec=String(s%60).padStart(2,'0');return `${m}m ${sec}s`; }

  /* ---------------------------------------------------------------------
     activityDefs() is DERIVED, not authored, and it is PER THREAD.
     Counts come from the selected thread's owned collections plus artifacts
     the transcript actually invoked. A domain with nothing on this thread is
     omitted from the returned object, so the bar, filter, and panel cannot
     show Query Performance's Goal 3/6 on a conversation that never ran a goal.
     Field shapes are in FIXTURE_SCHEMA.md.

     `state` stays in the vocabulary styles.css already understands
     (live | changed | anything-else-is-idle). `tone` is the richer shared
     signal (blocked | attention | working | changed | done | idle) consumed by
     the Activity Bar and Activity Detail renderers.
     --------------------------------------------------------------------- */
  const DONE_STATES=['done','completed'];
  const ACTIVE_STATES=['doing','in_progress','running','next','pending','verifying','replanned'];
  const RUNNING_STATES=['doing','in_progress','running','working','verifying'];
  /* Assistant-redesign wave: BrainStorm, Review and Chat Room join the bar. They sit next to
     Crew because they are the other three collaborative kinds, and BEFORE changes/artifacts so
     the compaction tiers drop file-level domains first under width pressure. Subagents stays a
     separate domain -- a Crew member is not a subagent. */
  const ACTIVITY_ORDER=['goal','todo','subagents','crew','brainstorm','review','chat_room','changes','artifacts'];
  const COLLAB_DOMAINS={brainstorm:'BrainStorm',review:'Review',chat_room:'Chat Room'};
  /* collaboration.js owns the runs; app.js only projects whatever is there, so the bar is
     correct with the module absent (no runs -> no domains) and correct with it loaded. */
  function collabRuns(tid){
    const rt=window.PM56_RUNTIME&&window.PM56_RUNTIME.collab;
    const runs=(rt&&Array.isArray(rt.runs))?rt.runs:[];
    return runs.filter(r=>r&&r.threadId===tid);
  }
  const plural=(n,one,many)=>`${n} ${n===1?one:many}`;
  /* Used only when a thread HAS an attached goal but D.goal fields are thin.
     It does not create Goal presence on threads that do not own one. */
  /* Goal V2 fallback: objective, lifecycle, revision. No phase counters -- a Goal has no numerator. */
  const GOAL_FALLBACK={title:'Optimize analytics query performance',status:'active',revision:1,blocker:''};
  const CREW_FALLBACK=[
    {id:'crew-planner', name:'Planner', status:'waiting', current:'Holding the next slice'},
    {id:'crew-impl', name:'Implementer', status:'working', current:'Applying the agreed change'},
    {id:'crew-review', name:'Reviewer', status:'waiting', current:'Waiting on the implementer'},
    {id:'crew-browser', name:'Browser auditor', status:'blocked', current:'Needs a live page'}
  ];

  /* Goal V2: one objective plus a four-value lifecycle. There is no phase count
     to project, so the bar shows the revision instead of a done/total pair --
     a Goal has no numerator. Legacy phase fields are read only to migrate an
     older fixture's text, never to render structure. */
  function goalSummary(){
    const g=D.goal;
    if(!g) return {...GOAL_FALLBACK, derived:false};
    return {
      title:g.objective||g.title||GOAL_FALLBACK.title,
      status:g.status||'active',
      revision:g.revision||1,
      blocker:g.blockedReason||'',
      derived:true
    };
  }
  function mostRecentArtifact(list){
    list=list||D.artifacts||[];
    if(!list.length) return null;
    const dated=list.filter(a=>a.updatedAt);
    if(!dated.length) return list[0];
    return dated.slice().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];
  }
  function threadById(tid){
    return (state.threads||[]).find(t=>t.id===tid) || (D.threads||[]).find(t=>t.id===tid) || null;
  }
  /* Owned collections for `tid`, plus artifacts the transcript invoked
     (`artifact` / `plan-card`). Goal stays when attached (D.goal.thread or
     thread.goalId), when the thread has a goal-receipt / durable goal artifact,
     or when Goal Mode is On with a per-thread stamp (stub, count —). Off
     drops only that stamp; it does not wipe other threads or erase receipts.
     Crew stays when the thread has a `crew` event, or when Crew Mode is On
     on the selected thread (stub). A `crew` event is not Subagents. */
  function crewMembers(tid, msgs){
    const ev=(msgs||[]).find(m=>m.type==='crew');
    const raw=ev&&String(ev.detail||'').replace(/\.$/,'');
    const names=raw?raw.split(/\s*,\s*|\s+and\s+/).map(s=>s.trim()).filter(Boolean):[];
    const src=names.length?names.map((name,i)=>{
      const fb=CREW_FALLBACK[i]||CREW_FALLBACK[CREW_FALLBACK.length-1];
      return {id:`crew-${tid}-${i}`, name:name.replace(/^./,c=>c.toUpperCase()), status:fb.status, current:fb.current};
    }):CREW_FALLBACK.map(x=>({...x, id:`${x.id}-${tid}`}));
    return src;
  }
  function activityScope(tid){
    tid=tid||state.selectedThread;
    const thread=threadById(tid);
    const msgs=(thread&&thread.messages)||[];
    const g=D.goal;
    const hasAttachedGoal=!!(g&&g.status!=='cleared'&&(g.thread===tid||(thread&&thread.goalId&&g.id&&thread.goalId===g.id)));
    const hasGoalReceipt=msgs.some(m=>m.type==='goal-receipt');
    const hasGoalArtifact=(D.artifacts||[]).some(a=>a.threadId===tid&&(a.id==='goal-artifact'||a.kind==='goal'||a.type==='goal'));
    const hasGoalHistory=hasAttachedGoal||hasGoalReceipt||hasGoalArtifact;
    const capGoal=!!(state.activityCaps&&state.activityCaps.goal&&state.activityCaps.goal[tid]);
    const hasGoal=hasGoalHistory||(!!state.capabilities.goal&&capGoal);
    /* Assistant-redesign wave: To-Dos have ONE owner, todos.js (ToDo_Runtime.md).
       The legacy flat `D.todos` fixture is thread-scoped only for `query`, so
       reading it here hid the chip on every other thread that genuinely has a
       list. Project the owner's leaves into the {status,label} shape the
       activityDefs code below already expects, and fall back to the old fixture
       only if the module did not load. */
    const todos=(function(){
      const api=window.PM56_TODOS;
      if(api && api.get){
        const items=api.get(tid);
        if(items) return items
          .filter(x=>!items.some(y=>y.parent_todo_id===x.todo_id))   /* leaves only */
          .map(x=>({id:x.todo_id, threadId:tid, status:x.status, label:x.title}));
      }
      return (D.todos||[]).filter(t=>t.threadId===tid);
    })();
    const subagents=(D.subagents||[]).filter(a=>a.parentThreadId===tid);
    const hasSubagents=subagents.length>0||msgs.some(m=>m.type==='live-agents');
    const hasCrewEvent=msgs.some(m=>m.type==='crew');
    const hasCrew=hasCrewEvent||(!!state.capabilities.crew&&tid===state.selectedThread);
    const crew=hasCrew?crewMembers(tid, msgs):[];
    const changes=(D.changes||[]).filter(c=>c.threadId===tid);
    const invoked=new Set();
    msgs.forEach(m=>{ if((m.type==='artifact'||m.type==='plan-card')&&m.artifactId) invoked.add(m.artifactId); });
    const artifacts=(D.artifacts||[]).filter(a=>a.threadId===tid||invoked.has(a.id));
    const runs=collabRuns(tid);
    const collab={brainstorm:runs.filter(r=>r.kind==='brainstorm'),review:runs.filter(r=>r.kind==='review'),chat_room:runs.filter(r=>r.kind==='chat_room'),crew:runs.filter(r=>r.kind==='crew')};
    return {
      tid, hasAttachedGoal, hasGoalReceipt, hasGoalHistory, capGoal, hasGoal,
      todos, subagents, hasSubagents, hasCrewEvent, hasCrew, crew, changes, artifacts,
      collab,
      live:{
        goal:hasGoal,
        todo:todos.length>0,
        subagents:hasSubagents,
        crew:hasCrew||collab.crew.length>0,
        brainstorm:collab.brainstorm.length>0,
        review:collab.review.length>0,
        chat_room:collab.chat_room.length>0,
        changes:changes.length>0,
        artifacts:artifacts.length>0
      }
    };
  }
  function revealActivityDomain(id){
    if(!state.activity.expanded.includes(id)) state.activity.expanded.push(id);
    state.activity.open=true;
    state.activity.domain=id;
    state.activity.scope='focus';
  }
  function stampActivityCap(kind, on){
    state.activityCaps=state.activityCaps||{goal:{},crew:{}};
    state.activityCaps[kind]=state.activityCaps[kind]||{};
    const tid=state.selectedThread;
    if(on) state.activityCaps[kind][tid]=true;
    else delete state.activityCaps[kind][tid];
  }
  function liveDomainIds(tid){
    const live=activityScope(tid).live;
    return ACTIVITY_ORDER.filter(id=>live[id]);
  }
  function syncActivityDomain(){
    const live=liveDomainIds();
    if(!live.length){
      if(state.activity.open) state.activity.open=false;
      return live;
    }
    if(!live.includes(state.activity.domain)){
      state.activity.domain=live[0];
      if(state.activity.selected&&!live.includes(state.activity.selected.domain)) state.activity.selected=null;
    }
    return live;
  }
  /* Display label from one of D.labels' 11 maps. The MAP MATTERS: artifactStatus maps
     error -> 'Needs retry', subagentStatus maps blocked -> 'Stalled'. Passing a subagent
     status to the artifact map silently returns the raw enum -- right-looking, wrong source.
     Falls back to the raw value so an unmapped key still renders something. */
  function lblOf(map,v){const m=(D.labels&&D.labels[map])||null;return (m&&m[v])||v;}

  function activityDefs(){
    const scope=activityScope();
    const out={};
    if(scope.live.goal){
      if(scope.hasAttachedGoal){
        const g=goalSummary();
        const GSTAT={active:'Running',paused:'Paused',blocked:'Blocked',completed:'Completed'};
        out.goal={icon:'goal',label:'Goal', attached:true,
          count:`V${g.revision}`,
          state:g.status==='active'?'live':'changed',
          tone:g.blocker?'blocked':g.status==='active'?'working':g.status==='completed'?'done':'idle',
          summary:g.title,
          detail:[GSTAT[g.status]||g.status,`revision ${g.revision}`,g.blocker?'blocked':null].filter(Boolean).join(' · ')};
      } else {
        const title=(threadById(scope.tid)||{}).title||'this thread';
        const rec=((threadById(scope.tid)||{}).messages||[]).find(m=>m.type==='goal-receipt');
        const stub=!!(state.capabilities.goal&&scope.capGoal);
        out.goal={icon:'goal',label:'Goal', attached:false,
          count:'—', state:stub?'live':'changed', tone:'idle',
          summary:stub?'Goal Mode is on':((rec&&rec.title)||'Goal history'),
          detail:stub?`No durable goal on ${title} yet · invoke with /goal or Activity Detail`:((rec&&rec.detail)||'Goal receipts remain on this thread')};
      }
    }
    if(scope.live.todo){
      const todos=scope.todos;
      const tDone=todos.filter(x=>DONE_STATES.includes(x.status)).length;
      const tActive=todos.filter(x=>RUNNING_STATES.includes(x.status)).length;
      const tOpen=todos.filter(x=>ACTIVE_STATES.includes(x.status)).length;
      const tBlocked=todos.filter(x=>x.status==='blocked').length;
      const tSkipped=todos.filter(x=>x.status==='skipped').length;
      const tNow=todos.find(x=>RUNNING_STATES.includes(x.status))||todos.find(x=>ACTIVE_STATES.includes(x.status))||todos[0];
      out.todo={icon:'todo',label:'Todo',
        count:`${tDone}/${todos.length}`,
        state:tActive?'live':'changed',
        tone:tBlocked?'blocked':tActive?'working':tOpen?'idle':'done',
        summary:tNow?tNow.label:'No todos recorded',
        detail:`${tDone} done · ${tActive} active · ${tBlocked} blocked · ${tSkipped} skipped`};
    }
    if(scope.live.subagents){
      const agents=scope.subagents;
      const aWorking=agents.filter(a=>a.status==='working').length;
      const aBlocked=agents.filter(a=>a.status==='blocked').length;
      const aWaiting=agents.filter(a=>a.status==='waiting').length;
      out.subagents={icon:'users',label:'Subagents',
        count:String(agents.length),
        state:aWorking?'live':'changed',
        tone:aBlocked?'blocked':aWorking?'working':aWaiting?'idle':'done',
        summary:agents.length?`${plural(aWorking,'agent','agents')} working, ${aBlocked} blocked`:'No child agents',
        detail:agents.slice(0,2).map(a=>`${a.name} ${a.status}`).join(' · ')||'No child agents'};
    }
    if(scope.live.crew){
      const crew=scope.crew;
      const cWorking=crew.filter(c=>c.status==='working').length;
      const cBlocked=crew.filter(c=>c.status==='blocked').length;
      const cWaiting=crew.filter(c=>c.status==='waiting').length;
      out.crew={icon:'users',label:'Crew',
        count:String(crew.length),
        state:cWorking?'live':'changed',
        tone:cBlocked?'blocked':cWorking?'working':cWaiting?'idle':'done',
        summary:crew.length?crew.map(c=>c.name).slice(0,3).join(' · '):'Crew Mode is on',
        detail:`${plural(cWorking,'member','members')} working · ${cBlocked} blocked`};
    }
    if(scope.live.changes){
      const changes=scope.changes;
      const cAdd=changes.reduce((s,c)=>s+(Number(c.add)||0),0);
      const cDel=changes.reduce((s,c)=>s+(Number(c.del)||0),0);
      out.changes={icon:'changes',label:'Changes',
        count:String(changes.length),
        state:'changed', tone:changes.length?'changed':'idle',
        summary:`${plural(changes.length,'file','files')} changed`,
        detail:`+${cAdd} −${cDel} · exact ranges available in the editor`};
    }
    /* One projection for all three collaborative kinds: same count/state/tone grammar, so a
       reviewer can see they are one runtime rather than three. Status wording comes from each
       run's own record; nothing here invents progress. */
    Object.keys(COLLAB_DOMAINS).forEach(id=>{
      if(!scope.live[id]) return;
      const runs=scope.collab[id]||[];
      const running=runs.filter(r=>r.status==='running');
      const failed=runs.filter(r=>r.status==='failed'||r.degraded);
      const done=runs.filter(r=>r.status==='completed');
      const latest=runs[runs.length-1]||{};
      out[id]={icon:id==='review'?'eye':id==='chat_room'?'users':'brain',label:COLLAB_DOMAINS[id],
        count:String(runs.length),
        state:running.length?'live':failed.length?'changed':'changed',
        tone:failed.length?'attention':running.length?'working':done.length?'done':'idle',
        summary:latest.title||COLLAB_DOMAINS[id],
        detail:[running.length?`${running.length} running`:null,done.length?`${done.length} completed`:null,failed.length?`${failed.length} degraded`:null,latest.participants?`${latest.participants.length} participants`:null].filter(Boolean).join(' · ')||'No runs'};
    });
    if(scope.live.artifacts){
      const arts=scope.artifacts;
      const artReady=arts.filter(a=>a.status==='ready').length;
      const artStale=arts.filter(a=>a.status==='stale').length;
      const artError=arts.filter(a=>a.status==='error').length;
      const artLoading=arts.filter(a=>a.status==='loading').length;
      const recent=mostRecentArtifact(arts);
      out.artifacts={icon:'artifact',label:'Artifacts',
        count:String(arts.length),
        state:artLoading?'live':'changed',
        tone:artError||artStale?'attention':artLoading?'working':'done',
        summary:recent?recent.title:'No artifacts',
        detail:[`${artReady} ready`,artStale?`${artStale} stale`:null,artError?`${plural(artError,'recoverable renderer error','recoverable renderer errors')}`:null,artLoading?`${artLoading} loading`:null].filter(Boolean).join(' · ')};
    }
    return out;
  }

  function renderActivityBar(){
    const defs=activityDefs();
    const items=Object.entries(defs);
    if(!items.length) return '';
    return `<div class="activity-wrap" data-k="activity-wrap"><div class="activity-bar" data-variant="${state.variants[3]}" data-domains="${items.length}" aria-label="Thread activity">${items.map(([id,d])=>{const active=state.activity.open&&state.activity.scope==='focus'&&state.activity.domain===id;return `<button class="activity-item ${active?'active':''}" data-action="open-activity" data-domain="${id}" data-hover-domain="${id}" aria-label="${esc(d.label)} activity, ${esc(d.count)}" aria-haspopup="dialog" aria-controls="activity-domain-preview" aria-expanded="${active?'true':'false'}"><i class="state-mark ${d.state}"></i>${icon(d.icon,12)}<span class="label">${d.label}</span><span class="count">${d.count}</span></button>`;}).join('')}</div></div>`;
  }
  function renderJumpBottom(){
    const working=runningRecs().length>0;
    const tip=working?'Scroll to latest':'Scroll to bottom';
    const cls=`jump-bottom${jumpBottomVisible?' is-visible':''}${working?' is-working':''}`;
    return `<button type="button" class="${cls}" data-k="jump-bottom" data-action="scroll-to-bottom"${hoverAttrs('jump-bottom',tip)} aria-label="${esc(tip)}">${icon('down',12)}</button>`;
  }
  function renderChatFloat(){
    const bar=renderActivityBar();
    const q=renderSendQueue();
    const jump=renderJumpBottom();
    if(!bar&&!q&&!jump) return '';
    return `<div class="chat-float" data-k="chat-float">${jump}${bar}${q}</div>`;
  }

  function renderActivityPanel(transient=false){
    const defs=activityDefs();
    const live=ACTIVITY_ORDER.filter(id=>defs[id]);
    if(!live.length) return '';
    const d=defs[state.activity.domain]?state.activity.domain:live[0];
    const allScope=state.activity.scope!=='focus';
    const sections=allScope?live:[d];
    const n=live.length;
    const headDef=defs[d]||defs[live[0]];
    const pinAction=state.activity.pinned?'unpin-activity':'pin-activity';
    const pinLabel=(state.activity.pinned?'Unpin':'Pin')+' Activity Detail';
    const filterButton=`<button class="icon-button activity-head-filter" data-action="toggle-activity-filter" aria-pressed="${state.activity.filterVisible?'true':'false'}"${hoverAttrs('act-filter','Show or hide category filter')}>${icon('filter',13)}</button>`;
    const overflow=`<details class="activity-head-overflow"><summary class="icon-button" aria-label="More Activity Detail actions">${icon('more',13)}</summary><div class="activity-head-menu"><button data-action="toggle-activity-filter" aria-pressed="${state.activity.filterVisible?'true':'false'}">${icon('filter',12)} ${state.activity.filterVisible?'Hide':'Show'} domains</button></div></details>`;
    return `<aside class="activity-panel ${transient?'transient':''}" data-variant="${state.variants[4]}" data-scope="${allScope?'all':'focus'}" data-domain="${esc(d)}" data-pinned="${activityPinnedInLayout()?'true':'false'}" ${transient?'role="dialog" aria-modal="false"':'role="region"'} aria-label="Activity Detail"><div class="activity-panel-head"><span class="event-icon activity-head-icon">${icon(headDef.icon,13)}</span><strong>Activity Detail</strong><span class="spacer"></span>${filterButton}${overflow}<button class="icon-button" data-action="${pinAction}"${hoverAttrs('act-pin',pinLabel)}>${icon(state.activity.pinned?'unpin':'pin',13)}</button><button class="icon-button" data-action="close-activity"${hoverAttrs('act-close','Close Activity Detail')}>${icon('close',13)}</button></div><div class="activity-filter ${state.activity.filterVisible?'':'hidden'}" style="--activity-n:${n}" role="toolbar" aria-label="Activity domains">${live.map(id=>{const x=defs[id],active=!allScope&&d===id;return `<button class="${active?'active':''}" data-action="focus-activity" data-domain="${id}" aria-label="${esc(x.label)} activity, ${esc(x.count)}" aria-pressed="${active?'true':'false'}">${icon(x.icon,13)}<span>${x.label}</span></button>`;}).join('')}</div><div class="activity-scroll" data-scroll-key="activity">${extReplace('activityPanelBody',{domain:d,transient},sections.map(renderActivitySection).join(''))}</div>${transient?'':'<div class="panel-resize" data-resize="activity" aria-hidden="true"></div>'}</aside>`;
  }

  function renderActivitySection(id){
    const d=activityDefs()[id]; if(!d) return '';
    const open=state.activity.expanded.includes(id);
    return `<section class="activity-section" data-domain-section="${id}"><button class="activity-section-head" data-action="toggle-activity-section" data-domain="${id}"><span class="event-icon" style="width:24px;height:24px">${icon(d.icon,12)}</span><strong>${d.label}</strong><span style="font-size:10px;color:var(--muted)">${esc(d.summary)}</span><span class="spacer"></span><span class="meta-pill">${d.count}</span>${icon(open?'up':'down',11)}</button>${open?`<div class="activity-section-body">${renderActivitySectionBody(id)}</div>`:''}</section>`;
  }

  function renderActivitySectionBody(id){
    const scope=activityScope();
    if(id==='goal') return extReplace('goalSection',{}, `<div class="activity-line"><span class="status-dot working"></span><div class="copy"><strong>Optimize analytics query performance</strong><span>Running · Phase 2/4 · 68% · Revision 4</span></div><span class="right">2m 06s</span></div><div class="activity-line"><span class="event-icon" style="width:20px;height:20px">${icon('warning',10)}</span><div class="copy"><strong>Exact blocker</strong><span>Production schema modification requires explicit approval.</span></div></div><div class="plan-actions"><button class="soft-button" data-action="open-goal">View Goal</button><button class="soft-button" data-action="edit-goal">Edit</button><button class="soft-button" data-action="pause-goal">Pause</button><button class="soft-button" data-action="resume-goal">Resume</button><button class="soft-button" data-action="stop-goal">Stop</button><button class="text-button danger" data-action="clear-goal">Clear</button></div>`);
    if(id==='todo') return scope.todos.map(x=>`<div class="activity-line"><span class="event-icon" style="width:20px;height:20px;color:${x.status==='done'?'var(--positive)':x.status==='blocked'?'var(--danger)':'var(--accent)'}">${icon(x.status==='done'?'check':x.status==='blocked'?'lock':'todo',10)}</span><div class="copy"><strong>${esc(x.label)}</strong><span>${esc(x.source)}${x.blocker?` · ${esc(x.blocker)}`:''}</span></div><span class="right">${esc(x.status)}</span></div>`).join('');
    if(id==='subagents') return scope.subagents.map(a=>`<button class="activity-line" data-action="open-agent" data-id="${esc(a.id)}"><span class="agent-avatar" style="width:22px;height:22px;border-radius:7px">${esc(a.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</span><span class="copy"><strong>${esc(a.name)} · ${esc(a.model)}</strong><span>${esc(a.current)}${a.blocker?` · ${esc(a.blocker)}`:''}</span></span><span class="right">${esc(lblOf('subagentStatus',a.status))} · ${esc(a.elapsed)}</span></button>`).join('');
    if(id==='crew') return scope.crew.map(c=>`<div class="activity-line"><span class="agent-avatar" style="width:22px;height:22px;border-radius:7px">${esc(c.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</span><span class="copy"><strong>${esc(c.name)}</strong><span>${esc(c.current||lblOf('subagentStatus',c.status))}</span></span><span class="right">${esc(lblOf('subagentStatus',c.status))}</span></div>`).join('');
    if(id==='changes') return scope.changes.map(c=>`<button class="activity-line" data-action="open-change" data-path="${esc(c.path)}"><span class="event-icon" style="width:20px;height:20px">${icon('file-edit',10)}</span><span class="copy"><strong>${esc(c.path)}:${c.line}</strong><span>${esc(c.summary)}</span></span><span class="right" style="color:var(--positive)">+${c.add} <i style="color:var(--danger)">−${c.del}</i></span></button>`).join('');
    return scope.artifacts.map(a=>`<button class="activity-line" data-action="open-artifact" data-id="${esc(a.id)}" data-artifact-id="${esc(a.id)}"><span class="event-icon" style="width:20px;height:20px;color:${a.status==='error'?'var(--danger)':a.status==='stale'?'var(--warning)':'var(--accent)'}">${icon(a.kind==='image'?'image':a.kind==='mermaid'?'code':'artifact',10)}</span><span class="copy"><strong>${esc(a.title)}</strong><span>${esc(a.kind)} · version ${a.version} · ${esc(a.summary)}</span></span><span class="right">${esc(lblOf('artifactStatus',a.status))}</span></button>`).join('');
  }
  /* D1: .decision-host.empty transitions max-height, but only if children stay
     mounted for the collapse. Snapshot the last surface, render it under .empty,
     then clear after transitionend (or a 600ms fallback). */
  let decisionExit=null;
  function finishDecisionExit(){
    if(!decisionExit) return;
    if(decisionExit.timer) clearTimeout(decisionExit.timer);
    decisionExit=null;
    renderApp();
  }
  function armDecisionExitClear(){
    requestAnimationFrame(()=>{
      const host=document.querySelector('.decision-host.empty');
      if(!host || !decisionExit){ finishDecisionExit(); return; }
      const done=()=>{
        host.removeEventListener('transitionend', onEnd);
        finishDecisionExit();
      };
      const onEnd=(e)=>{
        if(e.target!==host || e.propertyName!=='max-height') return;
        done();
      };
      host.addEventListener('transitionend', onEnd);
      if(decisionExit.timer) clearTimeout(decisionExit.timer);
      decisionExit.timer=setTimeout(done, 600);
    });
  }
  function closeDecision(thenRender=true){
    const host=document.querySelector('.decision-host:not(.empty)');
    const html=host?host.innerHTML:'';
    if(decisionExit?.timer) clearTimeout(decisionExit.timer);
    state.decision=null;
    if(html){
      decisionExit={html, timer:null};
      if(thenRender){ renderApp(); armDecisionExitClear(); }
      else armDecisionExitClear();
    } else {
      decisionExit=null;
      if(thenRender) renderApp();
    }
  }
  function renderDecisionHost(){
    if(decisionExit){
      return `<div class="decision-host empty" data-k="decision-host" data-variant="${state.variants[6]}">${decisionExit.html}</div>`;
    }
    if(!state.decision) return `<div class="decision-host empty" data-k="decision-host" data-variant="${state.variants[6]}"></div>`;
    const type=state.decision.type;
    let body='';
    if(type==='question') body=renderQuestionDecision();
    else if(type==='question-preparing') body=renderPreparingDecision();
    else if(type==='question-submitting') body=renderSubmittingDecision();
    else if(type==='plan') body=renderPlanDecision();
    else if(type==='permission') body=renderPermissionDecision();
    else if(type==='conflict') body=renderConflictDecision();
    body=extReplace('questionSurface',{type,decision:state.decision,variant:state.variants[6]},body);
    return `<div class="decision-host" data-k="decision-host" data-variant="${state.variants[6]}">${body}</div>`;
  }

  function renderPreparingDecision(){ return `<section class="decision-surface"><div class="decision-top"><span class="event-icon">${icon('sparkles',13)}</span><strong>Preparing questions…</strong><span class="spacer"></span><button class="icon-button" data-action="close-decision">${icon('close',12)}</button></div><div class="decision-body"><div class="work-progress"><i style="width:72%;animation:activity-scan 1.6s linear infinite"></i></div><p style="color:var(--muted);font-size:11px;margin:9px 0 0">Resolving what is already known so the assistant asks only material questions.</p></div></section>`; }
  function renderSubmittingDecision(){ return `<section class="decision-surface"><div class="decision-top"><span class="event-icon">${icon('send',13)}</span><strong>Submitting answers…</strong></div><div class="decision-body"><div class="work-progress"><i style="width:100%"></i></div><p style="color:var(--muted);font-size:11px;margin:9px 0 0">Answers are being attached to the durable thread and planning context.</p></div></section>`; }
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
    return `<section class="decision-surface"><div class="decision-top"><span class="event-icon">${icon('document',13)}</span><strong>${revise?'Revise the Plan':'Plan ready for review'}</strong><span class="meta-pill">Revision ${state.planRevision}</span><span class="spacer"></span><button class="icon-button" data-action="close-decision">${icon('close',12)}</button></div><div class="decision-body"><strong>${esc(D.artifacts[0].title)}</strong><p style="color:var(--muted);font-size:11px;margin:4px 0 8px">${esc(D.artifacts[0].summary)}</p>${revise?`<textarea class="decision-textarea" data-input="plan-feedback" placeholder="Describe what the next immutable Plan revision should change…">${esc(state.decision.feedback||'')}</textarea>`:`<div class="decision-evidence"><strong>Material evidence</strong><p>p95 482 → 71 ms · 42 tests passed · write overhead +4.8% · rollback gate included</p></div>`}<div class="decision-actions"><button class="text-button" data-action="cancel-plan">Cancel</button><button class="soft-button" data-action="open-artifact" data-id="plan-query">${icon('eye',12)} View full Plan</button>${revise?`<button class="primary-button" data-action="submit-plan-revision">Create revision</button>`:`<button class="soft-button" data-action="revise-plan">${icon('edit',12)} Revise</button><button class="primary-button" data-action="approve-plan">Approve And Build</button>`}</div></div></section>`;
  }

  function renderPermissionDecision(){ return `<section class="decision-surface"><div class="decision-top"><span class="event-icon">${icon('lock',13)}</span><strong>Permission required</strong><span class="meta-pill">Execution host</span><span class="spacer"></span><button class="icon-button" data-action="close-decision">${icon('close',12)}</button></div><div class="decision-body"><div class="question-prompt">Reconnect to Windows execution host and resume browser control?</div><p style="color:var(--muted);font-size:11px">The prior host connection dropped during step 7. The checkpoint is intact; no command will be replayed twice.</p><div class="decision-evidence"><strong>Command scope</strong><p>Reconnect host · restore browser session · continue from checkpoint · no schema mutation</p></div><div class="decision-actions"><button class="soft-button" data-action="deny-permission">Deny</button><button class="primary-button" data-action="approve-permission">Approve once</button></div></div></section>`; }

  function renderConflictDecision(){ return `<section class="decision-surface"><div class="decision-top"><span class="event-icon">${icon('warning',13)}</span><strong>Resolve agent recommendation</strong><span class="spacer"></span><button class="icon-button" data-action="close-decision">${icon('close',12)}</button></div><div class="decision-body"><div class="question-prompt">Choose the next safe implementation path</div><div class="choice-grid"><button class="choice" data-action="resolve-conflict" data-value="indexes"><strong>Approve indexes</strong><br><span style="font-size:10px;color:var(--muted)">Fast, reversible first step</span></button><button class="choice" data-action="resolve-conflict" data-value="views"><strong>Use materialized views</strong><br><span style="font-size:10px;color:var(--muted)">Faster reads, refresh state</span></button><button class="choice" data-action="resolve-conflict" data-value="override"><strong>Override policy</strong><br><span style="font-size:10px;color:var(--muted)">Permit schema reviewer changes</span></button></div><div class="decision-evidence"><strong>Parent mediation</strong><p>Given the 95% read workload and modest write rate, the composite index is the safer first step. Materialized views remain a follow-up after measuring index performance.</p></div></div></section>`; }

  function renderComposer(){
    const m=selectedModel();
    /* handleSend() has always pushed every sent draft here; nothing ever read
       it back, so the store was write-only. It is now a real affordance --
       icon-only, and only while the composer is empty, because restoring a
       draft over text you are typing is not an offer worth making and a text
       button here costs the five selector chips ~30% of their width. */
    const drafts=state.draftHistory[state.selectedThread]||[];
    const showDrafts=drafts.length&&!state.composer.trim();
    const caps=[];
    if(state.capabilities.goal)caps.push(['goal','goal']); if(state.capabilities.crew)caps.push(['users','crew']); if(state.capabilities.bsd!=='Off')caps.push(['warning','bsd']); if(state.capabilities.context!=='Off')caps.push(['lens','context']); if(state.capabilities.eli5)caps.push(['sparkles','eli5']);
    const sendBtn=sendButtonHtml();
    return `<div class="composer">${extRender('composerBelow',{position:'above'})}<div class="composer-box" data-k="composer-box">${extRender('composerRibbon',{})}${extRender('composerTray',{})}<div class="composer-field"><textarea class="composer-input" data-input="composer" placeholder="Ask Puppet Master, use natural language, or type / for commands…">${esc(state.composer)}</textarea><div class="composer-infield"><div class="composer-infield-l"><button class="icon-button" data-action="attach"${hoverAttrs('attach','Attach files or images')}>${icon('attach',16)}</button><span class="capability-indicators">${caps.slice(0,5).map(c=>`<span class="capability-dot ${c[1]}"${hoverAttrs('cap-'+c[1],(CAP_HOVER[c[1]]||c[1])+' active')}>${icon(c[0],16)}</span>`).join('')}</span></div>${sendBtn}</div></div><div class="composer-tools"><button class="selector-button active" data-kind="persona" data-action="open-menu" data-menu="persona" data-menu-anchor="persona"${hoverAttrs('sel-persona','Persona · '+state.persona)}><span class="sel-icon">${icon('users',13)}</span><span class="sel-label">${esc(state.persona)}</span></button><button class="selector-button active" data-kind="model" data-action="open-menu" data-menu="model" data-menu-anchor="model"${hoverAttrs('sel-model','Model · '+m.name)}><span class="sel-icon">${providerMark(m.provider,13)}</span><span class="sel-label">${esc(m.name)}</span>${state.fast&&m.fast?icon('lightning',11,'fast-bolt'):''}</button><button class="selector-button active" data-kind="mode" data-action="open-menu" data-menu="mode" data-menu-anchor="mode"${hoverAttrs('sel-mode','Mode · '+state.mode)}><span class="sel-icon">${modeGlyph(state.mode,13)}</span><span class="sel-label">${esc(state.mode)}</span></button><button class="selector-button active" data-kind="permissions" data-action="open-menu" data-menu="permissions" data-menu-anchor="permissions"${hoverAttrs('sel-permissions','Permissions · '+state.permissions)}><span class="sel-icon">${icon('lock',13)}</span><span class="sel-label">${esc(state.permissions)}</span></button><button class="icon-button ${Object.values(state.capabilities).some(x=>x===true||x==='On'||x==='Focus'||x==='Expanded')?'active':''}" data-action="open-menu" data-menu="wand" data-menu-anchor="wand"${hoverAttrs('wand','Capabilities and Goal Mode')}>${icon('wand',14)}</button></div><div class="composer-hint">${esc(state.persona)} · ${esc(m.name)} · ${esc(state.mode)} · ${esc(state.permissions)}</div></div></div>`;
  }

  function queueOf(){
    state.sendQueue[state.selectedThread] ??= [];
    return state.sendQueue[state.selectedThread];
  }
  function renderSendQueue(){
    const q=queueOf();
    if(!q.length) return '';
    return `<div class="send-queue" data-k="send-queue">${q.map(e=>`<div class="send-queue-row" data-k="q:${esc(e.id)}"><span class="send-queue-text"${hoverAttrs('q-text-'+e.id,e.text)}>${esc(e.text)}</span><button class="icon-button" data-action="queue-edit" data-id="${esc(e.id)}"${hoverAttrs('q-edit-'+e.id,'Edit')}>${icon('edit',13)}</button><button class="icon-button" data-action="queue-send-now" data-id="${esc(e.id)}"${hoverAttrs('q-send-'+e.id,'Send now')}>${icon('send',13)}</button></div>`).join('')}</div>`;
  }
  function sendButtonHtml(){
    const busy=runningRecs().length>0;
    const qlen=(state.sendQueue[state.selectedThread]||[]).length;
    const queueFull=busy&&qlen>=2;
    if(busy && !state.composer.trim()){
      return `<button class="send-button is-stop" data-k="send-btn" data-action="stop-run"${hoverAttrs('send-btn','Stop the current run')}>${icon('stop',13)}</button>`;
    }
    return `<button class="send-button" data-k="send-btn" data-action="send"${hoverAttrs('send-btn','Send message')} ${queueFull?'disabled':''}>${icon('send',13)}</button>`;
  }
  function syncSendStop(){
    const host=document.querySelector('.composer-infield');
    if(!host) return;
    const cur=host.querySelector('[data-k="send-btn"]');
    if(!cur) return;
    const wrap=document.createElement('div');
    wrap.innerHTML=sendButtonHtml();
    const neu=wrap.firstElementChild;
    if(cur.getAttribute('data-action')===neu.getAttribute('data-action') && cur.className===neu.className && cur.disabled===neu.disabled) return;
    cur.replaceWith(neu);
  }

  function renderStatusBar(){ return `<footer class="status-bar"><span>${icon('check-circle',10)} Agent · ${esc(selectedModel().name)} · ${formatElapsed(state.work.elapsed)}</span><span class="center">${esc(state.worktree)} · Local server</span><span class="right">Ready · ${state.context.compacted?'Context compacted':`Context ${(window.PM56_CTX&&window.PM56_CTX.ringPct)?window.PM56_CTX.ringPct():64}%`} ${icon('info',10)}</span></footer>`; }

  let composerRO=null, composerCompact=false, labeledToolsMin=0, measuringCompact=false;
  let abCompactTier=0, abMeasuring=false;
  function toolsContentWidth(tools){
    const kids=[...tools.children];
    if(!kids.length) return 0;
    const gap=parseFloat(getComputedStyle(tools).gap)||0;
    return kids.reduce((n,el)=>n+el.getBoundingClientRect().width,0)+gap*Math.max(0,kids.length-1);
  }
  function measureLabeledTools(box, tools){
    measuringCompact=true;
    box.classList.add('is-measuring');
    const w=toolsContentWidth(tools);
    box.classList.remove('is-measuring');
    measuringCompact=false;
    return w;
  }
  function syncComposerCompact(){
    if(measuringCompact) return;
    const box=document.querySelector('.composer-box');
    const tools=document.querySelector('.composer-tools');
    if(!box||!tools) return;
    const slack=8;
    if(box.clientWidth<=320){
      composerCompact=true;
      box.classList.add('is-compact');
      return;
    }
    const avail=tools.clientWidth||box.clientWidth;
    const need=measureLabeledTools(box, tools);
    if(need>0) labeledToolsMin=need;
    if(composerCompact) composerCompact=avail<labeledToolsMin+slack;
    else composerCompact=labeledToolsMin>0 && avail<labeledToolsMin+slack;
    box.classList.toggle('is-compact', composerCompact);
  }
  function setStageVar(stage, name, px){
    const v=`${Math.max(0, Math.round(px))}px`;
    if(stage.style.getPropertyValue(name)!==v) stage.style.setProperty(name, v);
  }
  let lensStripObserved=null;
  function observeLensStrip(strip){
    if(!composerRO||!strip) return;
    if(lensStripObserved===strip) return;
    if(lensStripObserved) composerRO.unobserve(lensStripObserved);
    composerRO.observe(strip);
    lensStripObserved=strip;
  }
  function syncChatDock(){
    const stage=document.querySelector('.chat-stage');
    if(!stage) return;
    const composer=stage.querySelector('.composer');
    const dock=composer?composer.getBoundingClientRect().height:0;
    setStageVar(stage, '--chat-dock-h', dock);
    /* Bar is in-flow; do not pad the transcript as if the float overlayed it. */
    setStageVar(stage, '--thread-float-h', 0);
    const host=stage.querySelector('.decision-host');
    const decisionH=(host && !host.classList.contains('empty') && host.offsetHeight)?host.getBoundingClientRect().height:0;
    setStageVar(stage, '--decision-h', decisionH);
    const lensOn=!!(state.menu&&state.menu.type==='lens');
    const strip=lensOn?document.querySelector('.overlay-menu.lens-strip'):null;
    /* offsetHeight is transform-safe; getBoundingClientRect shrinks mid-sprout. */
    const lensH=strip?strip.offsetHeight+8:0;
    setStageVar(stage, '--lens-strip-h', lensH);
    if(lensOn&&strip) observeLensStrip(strip);
    else if(lensStripObserved&&composerRO){ composerRO.unobserve(lensStripObserved); lensStripObserved=null; }
  }
  function activityRowWidth(bar){
    const kids=[...bar.querySelectorAll(':scope > .activity-item')];
    if(!kids.length) return 0;
    const gap=parseFloat(getComputedStyle(bar).columnGap||getComputedStyle(bar).gap)||0;
    return kids.reduce((n,el)=>n+el.getBoundingClientRect().width,0)+gap*Math.max(0,kids.length-1);
  }
  function measureActivityTier(wrap, bar, tier){
    abMeasuring=true;
    wrap.classList.add('is-measuring');
    wrap.classList.toggle('is-ab-compact', tier>=1);
    wrap.classList.toggle('is-ab-icon-only', tier>=2);
    const w=activityRowWidth(bar);
    wrap.classList.remove('is-measuring');
    abMeasuring=false;
    return w;
  }
  function syncActivityCompact(){
    if(abMeasuring) return;
    const wrap=document.querySelector('.activity-wrap');
    const bar=wrap&&wrap.querySelector('.activity-bar');
    if(!wrap||!bar||!bar.querySelector('.activity-item')){
      abCompactTier=0;
      return;
    }
    const cs=getComputedStyle(wrap);
    const avail=wrap.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    const slack=8;
    const labeled=measureActivityTier(wrap, bar, 0);
    const compact=measureActivityTier(wrap, bar, 1);
    let tier=abCompactTier;
    if(tier===0){
      if(avail+0.5<labeled) tier=avail+0.5<compact?2:1;
    } else if(tier===1){
      if(avail>=labeled+slack) tier=0;
      else if(avail+0.5<compact) tier=2;
    } else if(avail>=labeled+slack) tier=0;
    else if(avail>=compact+slack) tier=1;
    abCompactTier=tier;
    wrap.classList.toggle('is-ab-compact', tier>=1);
    wrap.classList.toggle('is-ab-icon-only', tier>=2);
  }
  function syncChatChrome(){
    syncComposerCompact();
    syncChatDock();
    syncActivityCompact();
    syncJumpBottom();
  }
  function armComposerObserver(){
    const box=document.querySelector('.composer-box');
    const stage=document.querySelector('.chat-stage');
    syncChatChrome();
    requestAnimationFrame(syncChatChrome);
    if(composerRO) composerRO.disconnect();
    composerRO=new ResizeObserver(()=>{ if(!measuringCompact&&!abMeasuring) syncChatChrome(); });
    if(box){
      composerRO.observe(box);
      const tools=document.querySelector('.composer-tools');
      if(tools) composerRO.observe(tools);
    }
    if(stage){
      const composer=stage.querySelector('.composer');
      const decision=stage.querySelector('.decision-host');
      const wrap=stage.querySelector('.activity-wrap');
      const float=stage.querySelector('.chat-float');
      if(composer) composerRO.observe(composer);
      if(decision) composerRO.observe(decision);
      if(wrap) composerRO.observe(wrap);
      if(float) composerRO.observe(float);
    }
  }

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
        /* A <textarea> has no `value` attribute -- its value is its child text,
           and once that value is dirty (script set it, or the user typed) the
           child text no longer drives what is displayed. Reading the ATTRIBUTE
           therefore always gave null for a textarea and this branch never ran,
           so a programmatic clear left the old text on screen. */
        const v = el.tagName==='TEXTAREA' ? src.textContent : src.getAttribute('value');
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
    syncActivityDomain();
    const positions=preserve?captureScroll():{};
    /* T6: a working-card height change moves every message below it under a
       stationary cursor unless scrollTop absorbs the delta. Browser scroll
       anchoring is unreliable here (card is overflow:hidden; restores fight
       the anchor), so measure the card before the patch and compensate after. */
    const workBefore=(document.querySelector('.working-card:not(.is-done)')||document.querySelector('.working-card'));
    const workH=workBefore?workBefore.getBoundingClientRect().height:null;
    const flipTargets=[...document.querySelectorAll('[data-flip]')];
    const flipBefore=new Map(flipTargets.map(el=>[el, el.getBoundingClientRect().height]));
    const rollBefore=new Map([...document.querySelectorAll('.pm-roll')].map(el=>[el, el.textContent]));
    const moveTargets=[...document.querySelectorAll('[data-flip-move]')];
    const moveBefore=new Map(moveTargets.map(el=>{const r=el.getBoundingClientRect();return [el,{x:r.left,y:r.top}];}));
    document.body.dataset.theme=state.theme;
    const historyPinned=state.historyMode==='pinned'&&!isNarrow();
    const activityPinned=activityPinnedInLayout();
    activityPinLayout=activityPinned;
    const gridClass=`assistant-grid ${historyPinned?'':'history-closed'} ${activityPinned?'activity-pinned':''}`;
    document.documentElement.style.setProperty('--editor-w',`${state.editorWidth}%`);
    document.documentElement.style.setProperty('--history-w',`${state.historyWidth}px`);
    document.documentElement.style.setProperty('--activity-w',`${state.activityWidth}px`);
    pmPatch(document.getElementById('pmRoot'),`<main class="pm-shell">${renderHeader()}<div class="workspace">${renderEditor()}<div class="resizer main-resizer" data-resize="editor"></div><section class="assistant-pane"><div class="${gridClass}">${historyPinned?renderHistory():''}${activityPinned?renderActivityPanel(false):''}${renderChat()}</div></section></div>${renderStatusBar()}</main>`);
    document.getElementById('pmRoot').setAttribute('aria-busy','false');
    flipHeights(flipTargets, flipBefore);
    flipMoves(moveTargets, moveBefore);
    rollDigits(rollBefore);
    restoreScroll(positions,{workH});
    renderOverlays();
    retainHoverAfterRender();
    armComposerObserver();
    armJumpBottomListener();
    syncJumpBottom();
  }

  /* G2: goal mutations project into a handful of in-tree islands. Patch those
     instead of regenerating the whole shell (bare renderApp ~69ms). Falls back
     to a full render when an expected keyed host is missing. */
  function renderGoalSurfaces(){
    const G=window.PM56_GOAL;
    if(!G||!G.render){ renderApp(); return; }
    const ctx=extCtx();
    const positions=captureScroll();
    const moveTargets=[...document.querySelectorAll('[data-flip-move]')];
    const moveBefore=new Map(moveTargets.map(el=>{const r=el.getBoundingClientRect();return [el,{x:r.left,y:r.top}];}));
    let patched=0;
    const patchKey=(html)=>{
      if(!html||!String(html).trim()) return false;
      const tpl=document.createElement('template');
      tpl.innerHTML=String(html).trim();
      const src=tpl.content.firstElementChild;
      if(!src) return false;
      const k=src.getAttribute('data-k');
      if(!k) return false;
      const live=document.querySelector(`[data-k="${CSS.escape(k)}"]`);
      if(!live) return false;
      pmPatchNode(live,src);
      patched++;
      return true;
    };
    const sectionHost=document.querySelector('[data-domain-section="goal"] .activity-section-body');
    if(sectionHost){
      const html=extReplace('goalSection',{},'');
      if(html){ pmPatch(sectionHost, html); patched++; }
      else { sectionHost.innerHTML=''; patched++; }
    }
    if(state.activeEditor==='goal-artifact'){
      const ed=extReplace('goalEditor',{},'');
      if(ed && !patchKey(ed)){ renderApp(); return; }
    }
    if(typeof G.chip==='function'){
      const chip=G.chip(ctx);
      if(chip){ if(!patchKey(chip) && document.querySelector('.chat-header')){ renderApp(); return; } }
      else {
        const dead=document.querySelector('[data-k="goalheadchip"]');
        if(dead) dead.remove();
      }
    }
    if(typeof G.sidebar==='function'){
      const side=G.sidebar(ctx);
      if(side){ if(!patchKey(side) && document.querySelector('.history-panel')){ renderApp(); return; } }
      else {
        const dead=document.querySelector('[data-k="goalsidebar"]');
        if(dead) dead.remove();
      }
    }
    if(patched===0){ renderApp(); return; }
    flipMoves(moveTargets, moveBefore);
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

  /* A FLIP is only honest if the target it measured is where the box actually
     ends up, and here it often was not. flipHeights runs synchronously one line
     after the pmPatch, so `h1` is read at t=0 of whatever CSS transitions that
     patch just started -- and by spec a transition still presents its OLD value
     at t=0. The Orbit take flips the panel track 0fr <-> 1fr over 420ms
     (orbit.css:206-213, row-axis form at orbit.css:570-579), so the rect came
     back WITHOUT the panel's 188-260px: on an expand h1 was 40px SMALLER than
     h0 and on a collapse 40px LARGER (that residual is the .orbit-caption,
     which exists only while collapsed). The card therefore travelled backwards
     for 320ms and then handed the box back to layout in a single frame --
     +231.4px on expand, -271.0px on collapse, measured at t=338ms.
     Evidence: handoff/w6/flip/e1-expand.json, e1-collapse.json; killing just
     `.orbit-layout`'s transition at runtime drops that frame to +29.9px and
     makes h1 read the correct 384.06px (e4-orbit-transition-none.json), while
     killing `.working-body`'s own min-height transition changes nothing
     (e4-workingbody-transition-none.json) -- so this is the grid track, not
     styles.css:192.

     Deferring the measurement by a frame is not a fix: one rAF later the panel
     has travelled ~1px of 200, so the reading is just as wrong. Instead, watch
     the CONTENT while the FLIP plays. If the children's own heights move at all
     after the patch, `h1` described a layout that no longer exists, and the
     honest thing is to get out of the way: cancel, un-clip, and let the CSS
     transition that is already running own the height. That is take-agnostic --
     it keys off the FLIP subject's own children, not off any take's markup --
     and it degrades to the motion Orbit already does well, since the panel
     track grows smoothly on its own. */
  function flipHeights(targets, before){
    if(window.PM56_MOTION && window.PM56_MOTION.reduced()) return;
    for(const el of targets){
      if(!el.isConnected) continue;
      const h0=before.get(el); if(h0==null) continue;
      const h1=el.getBoundingClientRect().height;
      /* Clock-only work ticks change elapsed text / ring rotation but not
         card height — skip FLIP so messages below do not jitter. */
      if(Math.abs(h1-h0)<1) continue;
      const prevOverflow=el.style.overflow;
      el.style.overflow='hidden';
      const a=el.animate([{height:`${h0}px`},{height:`${h1}px`}],
        {duration:320, easing:'cubic-bezier(.22,.80,.28,1)'});
      /* Start the clock on the NEXT frame, not this one. This frame still has
         to lay out and paint everything pmPatch just wrote, and on a card that
         gains the whole work history that costs 33-50ms -- during which the
         animation clock was already running, so the FIRST frame the user
         actually saw was 36-64% of the way through a 547px travel: a 282-349px
         jump on every one of the 24 takes, measured identically before and
         after the target fix above (handoff/w6/flip/measure-baseline.json vs
         measure-fixed.json). A paused animation still applies its effect, so
         holding at h0 for that one frame shows the old height rather than a
         gap, and the travel afterwards is the plain 19%-per-frame first step
         the easing is supposed to give. */
      a.pause();
      const release=()=>{el.style.overflow=prevOverflow;};
      /* A CANCEL is the guard's business, not a release: it hands over to the
         hold, which is still clipping. Only an honest finish releases here. */
      a.finished.then(release, ()=>{});
      guardFlip(el, a, h0, release, layoutTransitionPending(el));
    }
  }

  /* Properties whose transition, anywhere in this subtree, could change this
     box's height. The `spin 24s` ring, `orbit-pulse` and `.lane-pulse` are
     infinite CSS ANIMATIONS, and they are excluded by the CSSTransition test
     rather than by this list -- getAnimations({subtree:true}) returns them all
     and a naive scan would treat every Orbit card as permanently suspect. */
  const FLIP_LAYOUT_PROPS=new Set(['height','min-height','max-height','flex-basis',
    'grid-template-rows','grid-template-columns','gap','row-gap','column-gap',
    'padding-top','padding-bottom']);
  function layoutTransitionPending(el){
    let list; try{ list=el.getAnimations({subtree:true}); }catch(e){ return false; }
    for(const an of list)
      if(an.constructor.name==='CSSTransition' && an.playState==='running'
         && FLIP_LAYOUT_PROPS.has(an.transitionProperty)) return true;
    return false;
  }

  /* The guard for the above, and the part that keeps the correction itself
     from being a second lurch.

     It watches the CONTENT, summing the children's offsetHeight rather than
     reading the parent's: the parent's height is exactly what the WAAPI
     animation is currently faking, while the children are content-sized and
     immune to it. Transform-immune too, so an entrance that slides or scales a
     row does not register. The comparison is against the sum captured at FLIP
     time, not the previous frame, so a slow 420ms grid track trips it within a
     frame or two instead of creeping under a per-frame threshold.

     Cancelling alone is not enough, twice over.

     First, on an Orbit expand the caption disappears the instant the patch
     lands while the panel needs 420ms to arrive, so the honest live height is
     30px BELOW where the card started -- hand the box straight back to layout
     and it visibly flinches downward before growing. So we HOLD it at h0 until
     layout catches up, and only then let go. The hold is a second WAAPI
     animation pinned at h0; to read the true live height underneath it we
     cancel it, measure, and re-pin inside the SAME rAF callback, which is
     before style and paint, so no unpinned frame is ever rendered and the
     reading needs no arithmetic guess about padding.

     Second, detecting the divergence only AFTER it appears always leaves one
     frame of exposure, and measurement caught it: in 2 of 12 recorded expands
     the grid transition's first content movement landed one frame later than
     the FLIP's first moving frame, and the card rendered a single 7.5px dip
     before the guard could react (handoff/w6/flip/blip-diagnosis.json). So when
     a layout-affecting transition is already running at FLIP time we start
     HELD rather than playing, which has zero exposure by construction. If the
     content then never moves, the target was honest after all -- a descendant
     transition that cannot reach this box, such as take 12's phase register
     inside its fixed-height row (variants-b.css:99) -- and the real FLIP plays,
     five frames late and none the worse. That grace is 5 rather than 3 because
     the slow runs above only moved on the third frame. */
  function guardFlip(el, a, h0, release, suspect){
    const content=()=>{let s=0; for(const c of el.children) s+=c.offsetHeight; return s;};
    const at0=content();
    const t0=performance.now();
    let hold=null, dir=0, grace=0;
    const pinAt=h=>el.animate([{height:`${h}px`},{height:`${h}px`}],{duration:800});
    const pin=()=>pinAt(h0);
    /* A PAUSED animation still applies its effect, so `a` has to be cancelled
       before the live height can be read -- otherwise every measurement comes
       back as h0 and the guard concludes layout has caught up on its very
       first frame. That mistake froze the Orbit card at 224.77px forever
       (handoff/w6/flip/t1-orbit-repeat.json, before this line existed). */
    const letGo=()=>{ if(hold){hold.cancel(); hold=null;} if(a.playState==='paused') a.cancel(); release(); };
    if(suspect) hold=pin();                       // held before this frame paints
    const tick=()=>{
      if(!el.isConnected){ a.cancel(); letGo(); return; }
      const moved=content()-at0;
      if(hold){
        if(dir===0 && Math.abs(moved)>1){ dir=moved; a.cancel(); }
        if(dir!==0){
          hold.cancel(); hold=null;               // read the truth underneath
          const live=el.getBoundingClientRect().height;
          /* 640ms is a hard stop: the longest layout transition the concept
             runs is 520ms (--spring), so anything still moving past that is
             not a handover this FLIP can wait out. */
          if((dir>0 ? live>=h0-0.5 : live<=h0+0.5) || performance.now()-t0>640){ letGo(); return; }
          hold=pin();
        } else if(++grace>5){
          hold.cancel(); hold=null; a.play();
        }
        requestAnimationFrame(tick); return;
      }
      const st=a.playState;
      if(st==='finished'){ letGo(); return; }
      if(st!=='running' && st!=='paused') return; // cancelled by someone else
      if(Math.abs(moved)>1){
        dir=moved; a.cancel();
        /* Direction-aware pin. Pinning at h0 when the content GREW painted
           one frame clipped to the old height -- measured as the reopen's
           black flicker (repro R1: a strip-height band for exactly one
           frame). The cancel+measure happens inside this same rAF callback,
           before style and paint, so pinning at the live height is seamless;
           a SHRINK (the dip this guard exists for) still holds at h0. */
        hold=pinAt(moved>0?el.getBoundingClientRect().height:h0);
        requestAnimationFrame(tick); return;
      }
      if(st==='paused') a.play();                 // clock starts on the SECOND frame
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* --- scroll custody (T2) ---------------------------------------------
     `.transcript` carries scroll-behavior:smooth (styles.css:153), so every
     programmatic scrollTop write ANIMATES. captureScroll/restoreScroll run
     around every patch, and a capture taken while such an animation is in
     flight records a position the scroller is only passing THROUGH; writing
     that back on the next frame cancels the animation and parks the scroller
     there. Measured at boot: 0 -> 847 -> 116 of 2892 -- the transcript came up
     near the top and stayed there permanently.
     So a commanded scroll registers an INTENT, and capture reports the intent
     instead of the live offset until the scroller arrives or the reader takes
     over. 'end' is a sentinel rather than a number so it stays correct even
     when the patch that ran in between grew the content.
     This is deliberately robust to a scroll still in flight rather than being
     a race the fast path happens to win: the same CSS property has now broken
     two measuring instruments on this project as well as this feature. */
  const scrollIntents=new Map();
  let jumpBottomVisible=false;
  let jumpScrollEl=null;
  let jumpResizeRO=null;
  /* A reader who scrolls owns the scroller. keydown is deliberately NOT in
     this list: typing in the composer is not scrolling, and Ctrl+Enter would
     cancel the very intent the send it triggered had just registered. */
  for(const ev of ['wheel','touchstart'])
    document.addEventListener(ev,()=>scrollIntents.clear(),{passive:true,capture:true});
  function scrollKeyEl(key){ return document.querySelector(`[data-scroll-key="${key}"]`); }
  function transcriptAwayFromBottom(){
    const el=scrollKeyEl('transcript');
    if(!el) return false;
    const max=el.scrollHeight-el.clientHeight;
    if(max<=4) return false;
    return max-el.scrollTop>24;
  }
  function syncJumpBottom(){
    const on=transcriptAwayFromBottom();
    jumpBottomVisible=on;
    const btn=document.querySelector('.jump-bottom');
    if(btn) btn.classList.toggle('is-visible', on);
  }
  function onTranscriptScroll(){
    syncJumpBottom();
    requestAnimationFrame(syncJumpBottom);
  }
  function armJumpBottomListener(){
    const tr=scrollKeyEl('transcript');
    if(tr===jumpScrollEl) return;
    if(jumpScrollEl) jumpScrollEl.removeEventListener('scroll', onTranscriptScroll);
    if(jumpResizeRO){ jumpResizeRO.disconnect(); jumpResizeRO=null; }
    jumpScrollEl=tr;
    if(tr){
      tr.addEventListener('scroll', onTranscriptScroll, {passive:true});
      jumpResizeRO=new ResizeObserver(()=>syncJumpBottom());
      jumpResizeRO.observe(tr);
    }
  }
  function scrollToEnd(key,instant=false){
    scrollIntents.set(key,{to:'end',at:performance.now()});
    requestAnimationFrame(()=>{
      const el=scrollKeyEl(key);
      if(!el){ scrollIntents.delete(key); return; }
      if(instant){
        const prev=el.style.scrollBehavior; el.style.scrollBehavior='auto';
        el.scrollTop=el.scrollHeight; el.style.scrollBehavior=prev;
      } else el.scrollTop=el.scrollHeight;
      if(key==='transcript') syncJumpBottom();
      const settle=()=>{
        const cur=scrollIntents.get(key); if(!cur||cur.to!=='end') return;   // reader took over
        const e2=scrollKeyEl(key);
        if(!e2){ scrollIntents.delete(key); return; }
        /* Arrived, or out of time. 1600ms is past the longest smooth scroll
           this transcript can run; an intent that outlived its own animation
           would keep dragging the reader back to the bottom. */
        if(e2.scrollHeight-e2.clientHeight-e2.scrollTop<=2 || performance.now()-cur.at>1600){
          scrollIntents.delete(key); if(key==='transcript') syncJumpBottom(); return;
        }
        requestAnimationFrame(settle);
      };
      requestAnimationFrame(settle);
    });
  }
  function captureScroll(){
    const out={};
    document.querySelectorAll('[data-scroll-key]').forEach(el=>{
      const k=el.dataset.scrollKey, intent=scrollIntents.get(k);
      out[k]=intent?intent.to:el.scrollTop;
    });
    return out;
  }
  function restoreScroll(pos,opts){
    requestAnimationFrame(()=>{
      document.querySelectorAll('[data-scroll-key]').forEach(el=>{
        const v=pos?pos[el.dataset.scrollKey]:null;
        if(v==null) return;
        if(v==='end'){
          /* A commanded scroll owns this scroller. Re-aim it at the bottom --
             the patch may have grown the content out from under the animation --
             and leave scroll-behavior alone so it keeps travelling smoothly
             instead of being snapped there. */
          el.scrollTop=el.scrollHeight; return;
        }
        /* A restore re-applies a position; it is never a journey to one. Left
           smooth, the restore is itself an in-flight scroll for the NEXT render
           to misread, which is how one stale capture became permanent. */
        const prev=el.style.scrollBehavior;
        el.style.scrollBehavior='auto';
        el.scrollTop=v;
        el.style.scrollBehavior=prev;
      });
      /* T6: .working-body[data-flip] animates height over ~320ms, so a one-shot
         delta (measured while the FLIP is paused at h0) under-absorbs. Follow
         the live card height for one FLIP window and fold each frame's growth
         into scrollTop so a hovered message stays under the cursor.
         Clock-only ticks (|Δh| < 1px) must NOT start a new 420ms follower —
         that fights the user's wheel for nearly the entire 500ms tick period. */
      const startH=opts&&opts.workH;
      if(startH!=null){
        const card=(document.querySelector('.working-card:not(.is-done)')||document.querySelector('.working-card'));
        const hNow=card?card.getBoundingClientRect().height:startH;
        if(Math.abs(hNow-startH)>=1) followWorkCardHeight(startH);
      }
      syncJumpBottom();
    });
  }
  function followWorkCardHeight(startH){
    if(startH==null||scrollIntents.has('transcript')) return;
    const tr=document.querySelector('[data-scroll-key="transcript"]');
    if(!tr) return;
    /* Absolute target from the restored scroll baseline — relative += compounds
       with Chromium scroll anchoring while .working-body FLIPs and overshoots. */
    const baseScroll=tr.scrollTop;
    const prevAnchor=tr.style.overflowAnchor;
    tr.style.overflowAnchor='none';
    let cancelled=false;
    const cancel=()=>{cancelled=true; tr.style.overflowAnchor=prevAnchor;};
    document.addEventListener('wheel',cancel,{once:true,passive:true,capture:true});
    document.addEventListener('touchstart',cancel,{once:true,passive:true,capture:true});
    const t0=performance.now();
    const tick=()=>{
      if(cancelled||scrollIntents.has('transcript')||!tr.isConnected){
        tr.style.overflowAnchor=prevAnchor; return;
      }
      const card=(document.querySelector('.working-card:not(.is-done)')||document.querySelector('.working-card'));
      if(!card){ tr.style.overflowAnchor=prevAnchor; return; }
      const h=card.getBoundingClientRect().height;
      const cr=card.getBoundingClientRect(), vr=tr.getBoundingClientRect();
      if(cr.top<vr.bottom){
        const target=baseScroll+(h-startH);
        if(Math.abs(tr.scrollTop-target)>0.5){
          const prev=tr.style.scrollBehavior;
          tr.style.scrollBehavior='auto';
          tr.scrollTop=target;
          tr.style.scrollBehavior=prev;
        }
      }
      if(performance.now()-t0<420) requestAnimationFrame(tick);
      else tr.style.overflowAnchor=prevAnchor;
    };
    requestAnimationFrame(tick);
  }
  let lastOverlayPayload='';
  function renderOverlays(){
    const root=document.getElementById('pmOverlayRoot');
    const parts=[];
    if(state.historyMode==='floating') parts.push(`<aside class="history-flyout" data-history-variant="${state.variants[1]}">${renderHistoryContent(true)}</aside>`);
    if(state.context.details) parts.push(renderContextDrawer());
    if(state.dialog) parts.push(renderDialog());
    if(state.menu) parts.push(renderMenu());
    /* Hover tips are synced after the patch so tip-only updates can avoid
       re-patching menus/drawers (which live in this same overlay root). */
    if(state.toast.length) parts.push(`<div class="toast-stack">${state.toast.slice(-3).map(t=>`<div class="toast"><strong>${esc(t.title)}</strong><span>${esc(t.detail||'')}</span></div>`).join('')}</div>`);
    const payload=parts.join('');
    /* Work ticks re-enter renderApp every 500ms. Re-patching an unchanged
       overlay root fires pointerout on hovered chrome and blinks tips. */
    if(payload!==lastOverlayPayload){
      lastOverlayPayload=payload;
      pmPatch(root,payload);
    }
    syncHoverCard();
    requestAnimationFrame(positionOverlays);
  }

  /* Text hover tips stay available while a menu/drawer is open (those surfaces
     carry tip anchors). Activity hover cards still yield to an open menu. */
  function hoverCardAllowed(){
    if(!state.hover) return false;
    if(state.hover.type==='text') return true;
    if(state.hover.type==='activity') return !state.menu;
    return false;
  }
  function syncHoverCard(){
    const root=document.getElementById('pmOverlayRoot');
    if(!root) return;
    let el=root.querySelector(':scope > [data-overlay="hover"]');
    if(!hoverCardAllowed()){
      if(el) el.remove();
      return;
    }
    const html=renderHoverCard();
    if(!html){ if(el) el.remove(); return; }
    const wrap=document.createElement('div');
    wrap.innerHTML=html;
    const next=wrap.firstElementChild;
    if(!next){ if(el) el.remove(); return; }
    /* Remount only when the tip identity changes. Same key with updated copy
       (e.g. live Orbit disc status) patches text in place so the card does
       not blink across work ticks. */
    const idSig=(state.hover.type||'')+'|'+(state.hover.key||state.hover.domain||'');
    next.dataset.hoverSig=idSig;
    if(!el){
      root.appendChild(next);
      el=next;
    } else if(el.dataset.hoverSig!==idSig){
      el.replaceWith(next);
      el=next;
    } else {
      /* Same tip identity: refresh copy without remounting the card. */
      el.innerHTML=next.innerHTML;
    }
    positionHoverCard(el);
  }
  let lastPointer={x:0,y:0};
  function retainHoverAfterRender(){
    if(!state.hover||state.hover.type!=='text') return;
    const under=document.elementFromPoint(lastPointer.x,lastPointer.y);
    const tip=under&&under.closest&&under.closest('[data-hover-tip]');
    if(tip&&(tip.dataset.hoverKey||'')===(state.hover.key||'')){
      state.hover.tip=tip.dataset.hoverTip||state.hover.tip;
      syncHoverCard();
      requestAnimationFrame(()=>positionHoverCard());
    } else {
      /* The hovered control may have moved or been replaced by a layout
         transition (notably pin/unpin). A text tip without the pointer over
         its matching anchor is stale and must not follow the new control. */
      state.hover=null;
      syncHoverCard();
    }
  }
  function positionHoverCard(el){
    el=el||document.querySelector('#pmOverlayRoot > [data-overlay="hover"]');
    if(!el||!hoverCardAllowed()) return;
    const anchor=state.hover.type==='text'
      ? document.querySelector(`[data-hover-key="${CSS.escape(state.hover.key||'')}"]`)
      : document.querySelector(`[data-hover-domain="${CSS.escape(state.hover.domain)}"]`);
    if(anchor&&el){
      const ar=anchor.getBoundingClientRect(),r=el.getBoundingClientRect();
      let left=clamp(ar.left+ar.width/2-r.width/2,8,window.innerWidth-r.width-8);
      let top=ar.top-r.height-8;
      if(top<8) top=ar.bottom+8;
      el.style.left=`${left}px`;
      el.style.top=`${clamp(top,8,window.innerHeight-r.height-8)}px`;
    } else if(!anchor&&el&&state.hover.type==='text'){
      state.hover=null;
      el.remove();
    }
  }

  function renderMenu(){
    const m=state.menu;
    let content='';
    if(m.type==='persona') content=renderSimpleMenu('Persona',[['Product Manager','Product planning, product judgment, and coordination'],['Architect','Architecture, contracts, boundaries, and trade-offs'],['Implementer','Code, tests, and working product slices'],['Reviewer','Adversarial review, evidence, and risk'],['Teacher','Explanations, tours, and approachable guidance'],['Wonderer','Adjacent domains and overlooked possibilities; leads stay hypotheses until researched']],state.persona,'set-persona');
    else if(m.type==='permissions') content=renderSimpleMenu('Permissions',[['Ask for approval','Pause before edits, commands, and external effects'],['Auto accept edits','Accept file edits but ask for other effects'],['Auto','Use policy-aware automatic approval'],['Full Access','Allow all permitted actions without prompting']],state.permissions,'set-permissions');
    /* Rows come from D.operational.worktrees, not from four string literals:
       the fixture covers unbound / bound-clean / bound-dirty / bound-conflict
       and a literal cannot express any of them. The description is composed
       from the STRUCTURED fields rather than from w.note, because several of
       the notes are authoring commentary aimed at whoever reads the fixture
       ("Deleting this thread must offer to keep the worktree") rather than
       copy for the person choosing a branch. */
    else if(m.type==='worktree') content=renderSimpleMenu('Worktree',
      (D.operational?.worktrees||[{id:state.worktree,stateLabel:'Current worktree'}]).map(w=>[w.id,[
        w.stateLabel||w.state,
        w.dirtyFiles?`${w.dirtyFiles} uncommitted file${w.dirtyFiles===1?'':'s'}`:'',
        w.conflicts&&w.conflicts.length?`${w.conflicts.length} conflicting file${w.conflicts.length===1?'':'s'}`:'',
        (w.ahead||w.behind)?`${w.ahead} ahead · ${w.behind} behind`:'',
        w.path||'no checkout yet'
      ].filter(Boolean).join(' · ')]),
      state.worktree,'set-worktree');
    else if(m.type==='mode') content=renderModeMenu();
    else if(m.type==='wand') content=renderWandMenu();
    else if(m.type==='model') content=renderModelMenu();
    else if(m.type==='context') content=renderContextCompactMenu();
    else if(m.type==='thread') content=renderThreadMenu(m.threadId);
    else if(m.type==='thread-search') content=renderThreadSearchMenu();
    else if(m.type==='lens') content=extReplace('contextLensMenu',{}, '');
    const cls=`overlay-menu ${m.type==='model'?'model-menu':''} ${['context','thread-search'].includes(m.type)?'compact':''} ${m.type==='lens'?'lens-strip':''}`;
    const root=`<div class="${cls}" data-overlay="root-menu" data-side="${m.side||'left'}" style="${m.type==='model'?`height:${modelMenuHeight()}px`:''}">${m.compactSub?renderCompactSubmenu(m.compactSub):content}</div>`;
    const side=m.sub&&!m.compactSub?`<div class="overlay-menu sidecar" data-k="sidecar" data-overlay="sidecar" data-side="${m.side||'left'}">${renderSubmenu(m.sub)}</div>`:'';
    return root+side;
  }

  function renderSimpleMenu(title,items,current,action){
    return `<div class="menu-head"><strong>${esc(title)}</strong><span class="spacer"></span><span class="chat-meta">Current · ${esc(current)}</span></div>${items.map(x=>`<button class="menu-item ${current===x[0]?'active':''}" data-action="${action}" data-value="${esc(x[0])}"><span class="menu-copy"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></span>${current===x[0]?`<span class="check">${icon('check',12)}</span>`:''}</button>`).join('')}`;
  }

  function renderModeMenu(){
    /* Six roots exactly, in the packet's order. Plan/Deep Plan/Review carry sidecars;
       Ask/Agent/Debug do not. Goal, BSD, ELI5, Crew and scheduling are ORTHOGONAL
       controls and deliberately absent here. */
    const items=[['Ask','Answer without making changes',''],['Agent','Execute the requested work',''],['Debug','Run an instrumented debugging workflow',''],['Plan','Create a read-only Plan document and To-Dos','plan'],['Deep Plan','Research through a scoped ledger, then plan','deep-plan'],['Review','Read-only review with fresh context','review']];
    return `<div class="menu-head"><strong>Mode</strong><span class="spacer"></span><span class="chat-meta">/${state.mode.toLowerCase().replace(' ','-')}</span></div>${items.map(x=>`<button class="menu-item ${state.mode===x[0]?'active':''}" data-action="set-mode" data-value="${esc(x[0])}" ${x[2]?`data-submenu="${x[2]}"`:''}><span class="menu-icon">${icon(x[0]==='Ask'?'info':x[0].includes('Plan')?'document':x[0]==='Debug'?'warning':x[0]==='Review'?'eye':'sparkles',13)}</span><span class="menu-copy"><strong>${esc(x[0])}</strong><span>${esc(x[1])}</span></span>${x[2]?`<span class="chevron">${icon('chevron',11)}</span>`:state.mode===x[0]?`<span class="check">${icon('check',11)}</span>`:''}</button>`).join('')}`;
  }

  function renderWandMenu(){
    const rows=[
      ['goal','Goal Mode','Create and manage a durable goal','goal-menu',state.capabilities.goal?'On':'Off','goal'],
      ['crew','Crew','Coordinate a role-based group of agents','crew-menu',state.capabilities.crew?'On':'Off','users'],
      /* Assistant-redesign wave: the BSD and ELI5 rows are gone from here.
         Both were superseded and both now have ONE owner that renders through
         `wandRows`, so leaving these produced two Back Seat Driver rows and two
         ELI5 rows in the same menu with different, contradictory descriptions
         ("Independent review and intervention" vs the packet's passive
         read-only advisor; "Explain selected output more simply" vs the
         independent conversation override). The submenus below are retained so
         `bsd-menu`/`eli5-menu` still resolve if a module is dropped from the
         build, and `set-eli5-cap` is still chained by assistant-features.js. */
      ['thought','Thought Stream','Control permitted reasoning visibility','thought-menu',state.capabilities.thought,'brain']
    ];
    return `<div class="menu-head"><strong>Assistant capabilities</strong><span class="spacer"></span>${icon('wand',13)}</div>${rows.map(r=>`<button class="menu-item" data-submenu="${r[3]}"><span class="menu-icon">${icon(r[5],13)}</span><span class="menu-copy"><strong>${r[1]}</strong><span>${r[2]}</span></span><span class="shortcut">${esc(r[4])}</span><span class="chevron">${icon('chevron',11)}</span></button>`).join('')}${extRender('wandRows',{})}`;
  }

  function isFavorite(id){ return state.favorites.includes(id); }
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
    /* Three inline declarations are the whole fix for "the model list cannot
       scroll". .overlay-menu.model-menu carries a definite inline height and
       overflow:hidden, but .model-layout was a block-level grid with
       height:auto, so it never stretched to that height.
         height:100%                 -- stretch to the menu's definite height.
         grid-template-rows:minmax(0,1fr) -- without this the implicit row is
           `auto`, so a long list makes the ROW 1500px tall inside a 560px box
           and .model-main's own minmax(0,1fr) is handed that 1500px instead of
           the container height. This is the declaration that actually engages
           .model-scroll's overflow:auto.
         max-height:none             -- hand the viewport clamp to
           modelMenuHeight() so the two cannot disagree.
       Measured, not assumed: verified in-browser that .model-scroll's
       scrollHeight exceeds its clientHeight and that it really scrolls. */
    return `<div class="model-layout" style="height:100%;max-height:none;grid-template-rows:minmax(0,1fr)"><div class="provider-rail"><button class="provider-button ${state.modelProvider==='favorites'?'active':''}" data-action="model-provider" data-value="favorites" title="Favorites">${icon('star',14)}</button><button class="provider-button ${state.modelProvider==='all'?'active':''}" data-action="model-provider" data-value="all" title="All configured providers">${icon('users',14)}</button>${providers.map(p=>`<button class="provider-button ${state.modelProvider===p?'active':''}" data-action="model-provider" data-value="${esc(p)}" title="${esc(p)}">${providerMark(p,16)}</button>`).join('')}</div><div class="model-main"><div class="menu-search"><label class="input-wrap">${icon('search',12)}<input data-input="model-search" value="${esc(state.modelSearch)}" placeholder="Search configured models…"></label></div><div class="model-scroll">${models.length?groupModels(models):`<div style="padding:18px;text-align:center;color:var(--muted);font-size:11px">No configured model matches this view.</div>`}</div></div></div>`;
  }
  function effortWords(m){
    return `<span class="effort-words">${m.efforts.map((e,i)=>{
      const lit=!!state.effort && state.model===m.id && state.effort===e;
      return `${i?'<span class="effort-sep"> / </span>':''}<span class="effort-word${lit?' is-lit':''}">${esc(e)}</span>`;
    }).join('')}</span>`;
  }
  function groupModels(models){
    const by={};models.forEach(m=>(by[m.provider]??=[]).push(m));
    return Object.entries(by).map(([p,list])=>`<div class="menu-section-label">${esc(p)}</div>${list.map(m=>`<div class="model-row ${state.model===m.id?'active':''}" data-action="set-model" data-value="${esc(m.id)}" data-submenu="model:${esc(m.id)}"><span class="provider-mark">${providerMark(m.provider,16)}</span><span class="model-copy"><strong>${esc(m.name)} ${state.model===m.id&&state.fast&&m.fast?icon('lightning',10,'fast-bolt'):''}</strong><span class="model-sub"><span class="model-account">${esc(D.accountNick(m.accountId,m.account))}</span>${effortWords(m)}</span></span><button class="favorite ${isFavorite(m.id)?'active':''}" data-action="toggle-favorite" data-value="${esc(m.id)}" title="${isFavorite(m.id)?'Remove from':'Add to'} favorites">${icon('star',12)}</button></div>`).join('')}`).join('');
  }
  /* Measured in-browser at 1440x900, not guessed: .model-row pitch is 44.03
     (min-height:44 with border-box, so its 5/6px padding is inside), a
     .menu-section-label is 22.6, the sticky search header is 47.0, and
     .model-scroll's own padding is 4+7. Provider groups are COUNTED, not
     capped at four -- the "All configured providers" view yields more than
     four groups, and that cap is what truncated the box. The viewport clamp
     lives here now, because .model-layout no longer carries its own
     max-height. */
  const MODEL_ROW_H=44, MODEL_GROUP_H=23, MODEL_HEAD_H=47, MODEL_LIST_PAD=13;
  function modelMenuHeight(){
    const models=filteredModels();
    const groups=new Set(models.map(x=>x.provider)).size;
    const content=models.length?models.length*MODEL_ROW_H+groups*MODEL_GROUP_H:64;
    return clamp(MODEL_HEAD_H+MODEL_LIST_PAD+content,190,Math.min(560,window.innerHeight-24));
  }

  function renderContextCompactMenu(){
    return extReplace('contextCompactMenu',{}, `<div class="menu-head"><strong>Context</strong><span class="spacer"></span><span class="meta-pill">64%</span></div><div style="padding:9px"><div class="context-big"><strong>83.9K</strong><span>of 131K tokens loaded</span></div><div class="context-bar"><i></i></div><div class="metric-grid" style="grid-template-columns:1fr 1fr;margin-top:8px"><div class="metric-card"><label>Cache hit</label><strong>78%</strong></div><div class="metric-card"><label>Available</label><strong>47.1K</strong></div></div><div class="composition-bar" style="margin-top:8px"><i></i><i></i><i></i><i></i><i></i></div><div style="display:flex;justify-content:space-between;color:var(--subtle);font-size:9px;margin-top:4px"><span>Source composition</span><span>5 source groups</span></div></div><div class="menu-divider"></div><button class="menu-item" data-action="compact-now"><span class="menu-icon">${icon('collapse',13)}</span><span class="menu-copy"><strong>Compact Now</strong><span>Preview and apply a source-aware compaction</span></span></button><button class="menu-item" data-action="context-details"><span class="menu-icon">${icon('info',13)}</span><span class="menu-copy"><strong>More Details</strong><span>Window, tokens, cache, composition, cost, and raw projection</span></span>${icon('chevron',11)}</button>`);
  }

  function renderThreadMenu(id){
    const t=state.threads.find(x=>x.id===id);if(!t)return '';
    return `<div class="menu-head"><strong>${esc(t.title)}</strong><span class="spacer"></span><span class="chat-meta">${esc(statusLabel(t.status))}</span></div>${!t.archived?`<button class="menu-item" data-action="toggle-thread-pin" data-id="${esc(id)}"><span class="menu-icon">${icon(t.pinned?'unpin':'pin',13)}</span><span class="menu-copy"><strong>${t.pinned?'Unpin':'Pin'} thread</strong><span>${t.pinned?'Move to Recent':'Keep at the top'}</span></span></button><button class="menu-item" data-action="rename-thread" data-id="${esc(id)}"><span class="menu-icon">${icon('edit',13)}</span><span class="menu-copy"><strong>Rename</strong><span>Change the thread title</span></span></button><button class="menu-item" data-action="fork-thread" data-id="${esc(id)}"><span class="menu-icon">${icon('fork',13)}</span><span class="menu-copy"><strong>Fork thread</strong><span>Create a child branch with lineage</span></span></button><button class="menu-item" data-action="archive-thread" data-id="${esc(id)}"><span class="menu-icon">${icon('archive',13)}</span><span class="menu-copy"><strong>Archive</strong><span>Hide from active groups but keep searchable</span></span></button>`:`<button class="menu-item" data-action="restore-thread" data-id="${esc(id)}"><span class="menu-icon">${icon('restore',13)}</span><span class="menu-copy"><strong>Restore thread</strong><span>Return it to Recent</span></span></button><button class="menu-item" data-action="fork-thread" data-id="${esc(id)}"><span class="menu-icon">${icon('fork',13)}</span><span class="menu-copy"><strong>Fork archived thread</strong><span>Create an active child branch</span></span></button>`}${extRender('threadMenu',{thread:t,id})}`;
  }

  function renderThreadSearchMenu(){
    const q=state.menu.query||'';const lq=q.toLowerCase();const results=q?state.threads.flatMap(t=>t.messages.filter(m=>`${m.body||''} ${m.title||''} ${m.detail||''}`.toLowerCase().includes(lq)).map(m=>({thread:t,msg:m}))).slice(0,12):[];
    return extReplace('threadSearchMenu',{menu:state.menu}, `<div class="menu-head"><strong>Search threads</strong><span class="spacer"></span><span class="chat-meta">Current + archived</span></div><div class="menu-search"><label class="input-wrap">${icon('search',12)}<input data-input="thread-global-search" value="${esc(q)}" placeholder="Search exact message text…"></label></div>${q?(results.length?results.map(r=>`<button class="menu-item" data-action="jump-search-result" data-thread="${esc(r.thread.id)}" data-message="${esc(r.msg.id)}"><span class="menu-icon">${icon('search',12)}</span><span class="menu-copy"><strong>${esc(r.thread.title)}</strong><span>${esc((r.msg.body||r.msg.title||r.msg.detail||'').slice(0,110))}</span></span></button>`).join(''):`<div style="padding:15px;text-align:center;color:var(--muted);font-size:11px">No active or archived message matches.</div>`):`<button class="menu-item" data-action="search-current-demo"><span class="menu-icon">${icon('search',12)}</span><span class="menu-copy"><strong>Search current thread</strong><span>Find and jump to exact messages without losing your draft</span></span></button><button class="menu-item" data-action="show-archived"><span class="menu-icon">${icon('archive',12)}</span><span class="menu-copy"><strong>Browse archived threads</strong><span>Archived threads remain searchable and restorable</span></span></button>`}`);
  }
  function renderSubmenu(id){
    if(id.startsWith('model:')){
      const model=D.models.find(x=>x.id===id.slice(6))||selectedModel();
      return `<div class="menu-head"><strong>${esc(model.name)}</strong><span class="spacer"></span><span class="chat-meta">Effort</span></div>${model.efforts.map(e=>`<button class="effort-row ${state.model===model.id&&state.effort===e?'active':''}" data-action="set-effort" data-model="${esc(model.id)}" data-value="${esc(e)}"><i class="effort-dot"></i><span style="flex:1">${esc(e)}</span>${state.model===model.id&&state.effort===e?icon('check',11):''}</button>`).join('')}${model.fast?`<div class="menu-divider"></div><button class="effort-row ${state.model===model.id&&state.fast?'active':''}" data-action="toggle-fast" data-model="${esc(model.id)}"><i class="effort-dot"></i><span style="flex:1">Fast mode</span>${state.model===model.id&&state.fast?icon('check',11):''}</button>`:''}`;
    }
    /* SIX Plan choices, exactly: Plan Quick/Standard/Thorough and Deep Plan
       Thorough/Exhaustive/BrainStorm. Not four regular depths, and no legacy
       Light/Balanced/Comprehensive labels -- the packet retires both. Deep Plan
       carries a persistent Grill Me check in a footer row; it is an auxiliary
       toggle, not a seventh strategy, and it does not read as model effort. */
    if(id==='plan'||id==='deep-plan'){
      const deep=id==='deep-plan';
      const opts=deep
        ?[['Thorough','Scoped ledger, then a Plan document · Default'],['Exhaustive','Maximum evidence and adversarial review'],['BrainStorm','Exhaustive plus independent proposals, debate and voting']]
        :[['Quick','A concise route, written straight to the document'],['Standard','The usual balance of analysis and speed · Default'],['Thorough','Careful analysis with acceptance detail']];
      const cur=deep?state.deepPlanStrategy:state.planStrategy;
      const grill=`<div class="menu-divider"></div><button class="menu-item ${state.grillMe?'active':''}" data-action="toggle-grill-me"><span class="menu-copy"><strong>Grill Me</strong><span>Let the workflow ask more questions before planning</span></span>${state.grillMe?icon('check',11):''}</button>`;
      return `<div class="menu-head"><strong>${deep?'Deep Plan':'Plan'}</strong></div>${opts.map(o=>`<button class="menu-item ${cur===o[0]?'active':''}" data-action="set-plan-strategy" data-mode="${deep?'Deep Plan':'Plan'}" data-value="${o[0]}"><span class="menu-copy"><strong>${o[0]}</strong><span>${o[1]}</span></span>${cur===o[0]?icon('check',11):''}</button>`).join('')}${deep?grill:''}`;
    }
    if(id==='review'){
      const opts=[['Single Agent','One fresh-context reviewer with the selected model and Persona'],['Multi-Pass Review','Several blind reviewers, then finding exchange · Default']];
      return `<div class="menu-head"><strong>Review</strong><span class="spacer"></span><span class="chat-meta">Read-only</span></div>${opts.map(o=>`<button class="menu-item ${state.reviewStrategy===o[0]?'active':''}" data-action="set-review-strategy" data-value="${esc(o[0])}"><span class="menu-copy"><strong>${o[0]}</strong><span>${o[1]}</span></span>${state.reviewStrategy===o[0]?icon('check',11):''}</button>`).join('')}`;
    }
    if(id==='goal-menu')return renderCapabilitySub('Goal Mode',[['On','Enable natural-language, /goal, and button invocation'],['Off','Disable the visible Goal Mode capability']],state.capabilities.goal?'On':'Off','set-goal-cap');
    if(id==='crew-menu')return renderCapabilitySub('Crew',[['On','Allow role-based agent crews'],['Off','Keep crew coordination disabled']],state.capabilities.crew?'On':'Off','set-crew-cap');
    if(id==='bsd-menu')return renderCapabilitySub('Back Seat Driver',[['Off','Never run independent review'],['Auto','Intervene only when material'],['On','Review every substantial turn']],state.capabilities.bsd,'set-bsd-cap');
    if(id==='context-lens')return extReplace('contextLensMenu',{}, `<div class="menu-head"><strong>Context Lens</strong></div>${[['Auto','Use source-aware automatic selection'],['Focus','Prioritize selected current sources'],['Mute','Omit selected superseded sources'],['Subcompact','Preview a staged context reduction'],['Off','Disable Context Lens receipts']].map(o=>`<button class="menu-item ${state.capabilities.context===o[0]?'active':''}" data-action="set-context-cap" data-value="${o[0]}"><span class="menu-copy"><strong>${o[0]}</strong><span>${o[1]}</span></span>${state.capabilities.context===o[0]?icon('check',11):''}</button>`).join('')}${state.capabilities.context==='Subcompact'?`<div class="menu-divider"></div><div style="padding:7px"><p style="font-size:10px;color:var(--muted);margin:0 0 7px">Preview: remove 18.4K tokens while retaining provenance.</p><div class="plan-actions"><button class="soft-button" data-action="cancel-subcompact">Cancel</button><button class="primary-button" data-action="apply-subcompact">Apply</button></div></div>`:''}`);
    if(id==='eli5-menu')return renderCapabilitySub('ELI5',[['On','Show a simpler explanation after selected responses'],['Off','Keep standard response depth']],state.capabilities.eli5?'On':'Off','set-eli5-cap');
    if(id==='thought-menu')return renderCapabilitySub('Thought Stream',[['Auto','Expand only when permitted and useful'],['Expanded','Keep the permitted live thought stream open']],state.capabilities.thought,'set-thought-cap');
    /* Assistant-redesign wave: a module that contributes a `wandRows` entry with
       its own `data-submenu` had no way to render that sidecar -- bsd.js's
       BSD row opened a real, empty sidecar with zero items. This is the missing
       extension point. It is the LAST branch, so a module can only ever render
       an id app.js does not already own. */
    return extRender('submenu',{id});
  }
  function renderCapabilitySub(title,items,current,action){ return `<div class="menu-head"><strong>${esc(title)}</strong></div>${items.map(o=>`<button class="menu-item ${current===o[0]?'active':''}" data-action="${action}" data-value="${esc(o[0])}"><span class="menu-copy"><strong>${esc(o[0])}</strong><span>${esc(o[1])}</span></span>${current===o[0]?icon('check',11):''}</button>`).join('')}`; }
  function renderCompactSubmenu(id){ return `<div class="menu-head"><button class="icon-button" data-action="submenu-back">${icon('left',12)}</button><strong>Back</strong></div>${renderSubmenu(id)}`; }

  function renderContextDrawer(){
    return extReplace('contextDrawer',{}, `<aside class="drawer"><div class="drawer-head"><span class="event-icon">${icon('info',13)}</span><strong>Context More Details</strong><span class="meta-pill">Curated</span><span class="spacer"></span><button class="icon-button" data-action="close-context-details">${icon('close',13)}</button></div><div class="drawer-scroll"><div class="context-hero"><div class="context-big"><strong>64%</strong><span>current window used · 83,900 / 131,000 tokens</span></div><div class="context-bar"><i></i></div></div><div class="metric-grid"><div class="metric-card"><label>Tokens loaded</label><strong>83.9K</strong></div><div class="metric-card"><label>Cache hit</label><strong>78%</strong></div><div class="metric-card"><label>Cached tokens</label><strong>65.4K</strong></div><div class="metric-card"><label>Available</label><strong>47.1K</strong></div><div class="metric-card"><label>Input this turn</label><strong>12.8K</strong></div><div class="metric-card"><label>Output this turn</label><strong>1.5K</strong></div></div><section class="context-section"><h3>Source composition</h3><div class="context-section-body"><div class="composition-bar"><i></i><i></i><i></i><i></i><i></i></div><div class="composition-key">${[['Conversation','34%','var(--accent)'],['Plans and specifications','22%','var(--accent-2)'],['Files and code','18%','var(--positive)'],['Tool and browser evidence','14%','var(--warning)'],['System and provider','12%','var(--subtle)']].map(x=>`<div><i style="background:${x[2]}"></i><span>${x[0]}</span><b style="margin-left:auto">${x[1]}</b></div>`).join('')}</div></div></section><section class="context-section"><h3>Context growth</h3><div class="context-section-body"><div class="growth-chart"><svg viewBox="0 0 420 90" preserveAspectRatio="none"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs><path d="M0 82 C50 78 52 70 95 68 S150 58 185 60 238 42 275 46 325 26 360 31 400 17 420 12V90H0Z" fill="url(#cg)"/><path d="M0 82 C50 78 52 70 95 68 S150 58 185 60 238 42 275 46 325 26 360 31 400 17 420 12" fill="none" stroke="var(--accent)" stroke-width="2"/></svg></div></div></section><section class="context-section"><h3>Effective route</h3><div class="context-section-body"><div class="activity-line"><div class="copy"><strong>${esc(selectedModel().provider)} · ${esc(selectedModel().account)}</strong><span>${esc(selectedModel().name)} · ${esc(state.effort)} effort · ${state.fast?'Fast eligible route':'Standard route'}</span></div></div><div class="activity-line"><div class="copy"><strong>${esc(state.mode)} · ${esc(state.persona)}</strong><span>Worker route: ${esc(state.worktree)} · local execution server</span></div></div></div></section><section class="context-section"><h3>Cost and cache</h3><div class="context-section-body"><div class="metric-grid"><div class="metric-card"><label>API billed</label><strong>$0.084</strong></div><div class="metric-card"><label>Plan estimated</label><strong>$0.031</strong></div><div class="metric-card"><label>Combined est.</label><strong>$0.115</strong></div></div><p style="font-size:10px;color:var(--muted)">65.4K cached tokens avoided repeat input billing. Local browser context contributes 4.8K tokens.</p></div></section><section class="context-section"><h3>Compaction preview</h3><div class="context-section-body"><p style="font-size:11px;color:var(--muted)">A source-aware compaction would remove 18.4K tokens, retain all active requirements, preserve provenance, and leave 65.5K tokens loaded.</p><div class="context-actions"><button class="soft-button" data-action="compact-now">${icon('collapse',12)} Preview Compact</button><button class="soft-button" data-action="export-context">${icon('download',12)} Redacted JSON</button><button class="soft-button" data-action="raw-context">${icon('code',12)} Raw projection</button></div></div></section></div></aside>`);
  }

  function renderHoverCard(){
    const h=state.hover;
    if(h.type==='text'){
      const parts=String(h.tip||'').split('\n').filter(Boolean);
      if(!parts.length) return '';
      const one=parts.length===1;
      return `<div class="hover-card hover-tip ${one?'hover-label':''}" data-overlay="hover"><strong>${esc(parts[0])}</strong>${one?'':`<p>${esc(parts.slice(1).join(' '))}</p>`}</div>`;
    }
    if(h.type==='activity'){
      const d=activityDefs()[h.domain]; if(!d) return '';
      return extReplace('activityHoverCard',{domain:h.domain,def:d}, `<div class="hover-card" data-overlay="hover"><strong>${esc(d.label)} · ${esc(d.summary)}</strong><p>${esc(d.detail)}</p><div class="hover-stats"><span class="hover-stat">${esc(d.count)}</span></div></div>`);
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
    /* Modal slot. Built-in dialog types return above this line, so a module can only
       ever render a type app.js does not know. Needed for a real destructive confirm:
       without it a module cannot be modal at all, and loses aria-modal. */
    return extRender('dialog',{dialog:state.dialog});
  }

  /* The Demo Studio's trigger list is the ONLY trigger list. It used to live
     inside renderDemoDialog as a local, with PM56_DEMO.listTriggers() keeping a
     hand-maintained duplicate that had drifted 29 entries behind it. */
  function demoTriggerGroups(){
    return {
      'Work lifecycle':['Start complete work','Multi-orbit turn','Pause work','Step work','Complete work','Reset work','Show work history','Live subagents','Blocked subagent','Conflict mediation','Crew coordination'],
      'Every Working Animation state':D.workSteps.map(x=>`Work · ${x.label}`),
      'Questions and decisions':['Prepare questions','Open questionnaire','Queue questionnaire','Plan approval','Plan revision','Plan cancellation','Permission request','Permission denial','Conflict resolution','Cancel and return'],
      'Artifacts':['Mermaid artifact','Interactive dashboard','Data explorer','Architecture map','Interactive quiz','Periodic table','Flowchart','Interactive chart','Generated image','Test evidence','Document artifact','Deep Plan artifact','Artifact stale','Artifact failure'],
      'Capabilities':['BSD intervention','BSD silent check','BSD timeout','BSD unavailable','BSD quota limited','Context Focus','Context Mute','Subcompact preview','Subcompact applied','Subcompact cancelled','ELI5 receipt','Goal replanning','Goal paused','Goal blocked'],
      'Thread and message states':['Plain text conversation','Queued Message Demo','Archived threads','Cross-thread search','Long response','Message details','Edit and branch','Restore from point','Draft history','New message anchor'],
      'System states':['Browser debug','Web search','Web fetch','Bash','App control','Browser testing','Program testing','LSP analysis','MCP tool','Offline queue','Reconnect replay','Attachment upload','Unsupported attachment','Provider route change','Provider auth failure','Provider quota','No models']
    };
  }
  function allDemoTriggers(){ return Object.values(demoTriggerGroups()).flat(); }

  function renderDemoDialog(){
    const families=['Assistant body & composer','Thread history','Working Animation','Chat Activity Bar','Activity Detail','Transcript','Question & decision'];
    const optionNames=[
      ['PM7 Refined','Floating Focus','Split Command','Console Dense','Reading First','Operations Dock','Ribbon Composer','Layered Studio'],
      ['PM7 Pinned','Status Rail','Worktree Branches','Dense Operations','Grouped Recency','Preview Rows','Minimal Reading','Command History'],
      D.workingTakes.slice(),
      ['Extended PM7','Segmented Pill','Icon Dock','Domain Grid','Capsule Stack','Technical Strip','Pulse Rail','Minimal Command'],
      ['Accordion Inspector','Status Board','Goal Tree','Split Master/Detail','Agent Board','File Ledger','Live Work Feed','Overview Dashboard'],
      D.transcriptTakes.slice(),
      ['Stable Card','Morphing Composer','Anchored Sheet','Side Inspector','Step Sequence','Technical Decision','Queue Stack','Evidence Split','Ask Card']
    ];
    const triggerGroups=demoTriggerGroups();
    const g=clampDemoGeom(state.dialog.geom||lastDemoGeom||defaultDemoGeom());
    state.dialog.geom=g;
    return `<section class="dialog demo-dialog" style="left:${g.left}px;top:${g.top}px;width:${g.width}px;height:${g.height}px;transform:none"><div class="drawer-head" data-dialog-drag><span class="event-icon">${icon('sparkles',13)}</span><strong>Demo Studio</strong><span class="meta-pill">${D.workingTakes.length} working takes · 7 families</span><span class="spacer"></span><button class="soft-button" data-action="reset-all">${icon('reset',12)} Reset all</button><button class="icon-button" data-action="close-dialog">${icon('close',13)}</button></div><div class="dialog-body"><section class="demo-section" style="margin-bottom:8px"><h3>Curated complete recipes and themes</h3><div class="demo-section-body" style="display:grid;grid-template-columns:1fr 1fr;gap:7px"><div class="mixer-row"><label>Recipe</label><select data-input="recipe"><option value="-1" ${state.recipe<0?'selected':''}>Custom mix</option>${D.recipes.map((r,i)=>`<option value="${i}" ${state.recipe===i?'selected':''}>${esc(r.name)}</option>`).join('')}</select></div><div class="mixer-row"><label>Theme</label><select data-input="theme">${D.themes.map(t=>`<option value="${t.id}" ${state.theme===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></div><p style="grid-column:1/-1;color:var(--muted);font-size:11px;margin:0">${esc(D.recipes[state.recipe]?.desc||'Custom mix')}</p></div></section><section class="demo-section" style="margin-bottom:8px"><h3>Assistant chat</h3><div class="demo-section-body" style="display:block"><div class="mixer-row"><label>Working activity</label><select data-input="variant" data-family="2">${(()=>{const v=state.variants[2];const opts=[[1,'Orbit · Default'],[8,'Step Rail · Simple']];let h=opts.map(([val,name])=>`<option value="${val}" ${v===val?'selected':''}>${name}</option>`).join('');if(v!==1&&v!==8)h+=`<option value="${v}" selected>Lab take ${v+1}</option>`;return h;})()}</select></div><p style="color:var(--muted);font-size:12px;margin:6px 0 0">Orbit is the default working activity; Step Rail is the simplified option. Every lab take stays available below.</p></div></section><section class="demo-section" style="margin-bottom:8px"><h3>Independently swappable concept families</h3><div class="demo-section-body" style="display:block">${families.map((f,i)=>`<div class="mixer-row"><label>${esc(f)}</label><select data-input="variant" data-family="${i}">${optionNames[i].map((n,j)=>`<option value="${j}" ${state.variants[i]===j?'selected':''}>${j+1}. ${esc(n)}</option>`).join('')}</select></div>`).join('')}</div></section><div class="demo-grid">${Object.entries(triggerGroups).map(([name,items])=>`<section class="demo-section"><h3>${esc(name)}</h3><div class="demo-section-body">${items.map(x=>`<button class="demo-trigger" data-action="demo-trigger" data-trigger="${esc(x)}">${esc(x)}</button>`).join('')}</div></section>`).join('')}</div></div>${demoResizeHandles()}</section>`;
  }

  function positionOverlays(){
    if(state.menu){
      const anchor=document.querySelector(`[data-menu-anchor="${CSS.escape(state.menu.anchor)}"]`), root=document.querySelector('[data-overlay="root-menu"]');
      if(anchor&&root){
        if(state.menu.type==='lens'){
          const header=document.querySelector('.chat-header');
          const tr=document.querySelector('.transcript')||header;
          const hr=(header||anchor).getBoundingClientRect();
          const trr=tr.getBoundingClientRect();
          const w=Math.max(280, Math.min(trr.width-16, window.innerWidth-16));
          const left=clamp(trr.left+8, 8, window.innerWidth-w-8);
          const top=clamp(hr.bottom+4, 8, window.innerHeight-8);
          root.style.left=`${left}px`; root.style.top=`${top}px`; root.style.width=`${w}px`;
          root.style.maxWidth='none';
          root.style.setProperty('--origin-x', `${clamp(anchor.getBoundingClientRect().left+anchor.offsetWidth/2-left, 18, w-18)}px`);
          root.style.setProperty('--origin-y','0px');
        } else {
        const ar=anchor.getBoundingClientRect(), gap=3;
        const rootW=root.offsetWidth, rootH=root.offsetHeight;
        let left=state.menu.side==='right'?ar.right-rootW:ar.left;
        if(state.menu.type==='model'||state.menu.type==='context'||state.menu.type==='thread-search') left=ar.right-rootW;
        left=clamp(left,8,window.innerWidth-rootW-8);
        const below=window.innerHeight-ar.bottom-8, above=ar.top-8;
        let top=below>=rootH+gap?ar.bottom+gap:Math.max(8,ar.top-rootH-gap);
        top=clamp(top,8,window.innerHeight-rootH-8);
        root.style.left=`${left}px`;root.style.top=`${top}px`;root.style.setProperty('--origin-x',`${clamp(ar.left+ar.width/2-left,18,rootW-18)}px`);root.style.setProperty('--origin-y',top>ar.bottom?'0px':'100%');
        const side=document.querySelector('[data-overlay="sidecar"]');
        if(side){
          const sideW=side.offsetWidth, sideH=side.offsetHeight;
          const rootRight=left+rootW;
          let sl=state.menu.side==='right'?rootRight+gap:left-sideW-gap;
          sl=clamp(sl,8,window.innerWidth-sideW-8);
          const overlap=sl<rootRight && sl+sideW>left;
          if(overlap){
            sl=state.menu.side==='right'
              ? Math.min(window.innerWidth-sideW-8, rootRight+gap)
              : Math.max(8, left-sideW-gap);
          }
          const row=document.querySelector(`.overlay-menu[data-overlay="root-menu"] [data-submenu="${CSS.escape(state.menu.sub||'')}"]`);
          const rowR=row&&row.getBoundingClientRect();
          let st=rowR?rowR.bottom-sideH:top;
          st=clamp(st,8,window.innerHeight-sideH-8);
          side.style.left=`${sl}px`;side.style.top=`${st}px`;
          side.style.setProperty('--origin-x', state.menu.side==='right'?'0%':'100%');
          side.style.setProperty('--origin-y','28%');
        }
        }
      }
    }
    if(state.hover){
      positionHoverCard();
    }
    syncChatDock();
  }
  function openMenu(type,anchor,extra={}){
    const anchorEl=document.querySelector(`[data-menu-anchor="${CSS.escape(anchor)}"]`);
    const rect=anchorEl?.getBoundingClientRect();
    const side=rect&&rect.left<window.innerWidth*.53?'right':'left';
    state.menu={type,anchor,side,sub:null,compactSub:null,query:'',...extra};state.hover=null;renderOverlays();
    if(type==='lens'){
      requestAnimationFrame(()=>{ syncChatDock(); requestAnimationFrame(syncChatDock); });
    }
  }
  function toggleMenu(type,anchor,extra={}){
    if(state.menu&&state.menu.type===type&&state.menu.anchor===anchor){ closeMenu(); return; }
    openMenu(type,anchor,extra);
  }
  function closeMenu(){state.menu=null;renderOverlays();}
  function setSubmenu(id){
    if(!state.menu)return;
    clearTimeout(submenuTimer);
    if(!id){ state.menu.sub=null; state.menu.compactSub=null; renderOverlays(); return; }
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
    state.selectedThread=id;t.unread=0;state.composer=state.drafts[id]||'';state.menu=null;state.hover=null;state.decision=null;decisionExit=null;
    /* Leaving the thread abandons its work sequence; abandoning it without
       stopping the clock is the leak described above. state.work.running is
       cleared with it so the two never disagree -- a card that says "running"
       with no timer behind it is the next bug report. */
    stopWorkTimer(true); state.work.running=false;
    for(const k in state.works) state.works[k].running=false;
    renderApp(false);scrollTranscriptToEnd();
    /* The Multi Orbit demo thread plays its turn on entry: the first scripted
       run spawns just after the switch settles, and the chain does the rest. */
    if(id==='orbit-run'&&!state.works.orbitA){ setTimeout(()=>{ if(state.selectedThread==='orbit-run'&&!state.works.orbitA) startWorkingRec('orbitA'); },350); }
    if(id==='queue-demo'){
      setTimeout(()=>{
        if(state.selectedThread!=='queue-demo') return;
        if(!state.works.queueA || state.works.queueA.completed) startWorkingRec('queueA');
        state.sendQueue['queue-demo']=[
          {id:'q-demo-1', text:'After this run, add the concurrent-write-load check to the todo list.'},
          {id:'q-demo-2', text:'Then open the PR once the 42 tests are green.'}
        ];
        renderApp();
      },350);
    }
  }
  function mutateThread(id,fn){const t=state.threads.find(x=>x.id===id);if(t)fn(t);renderApp();}
  /* T1. The scroll-to-bottom appendMessage has always done, given a name so
     handleSend() can use the SAME mechanism rather than a second copy of it.
     handleSend pushed the user's turn onto the thread and rendered without it,
     so a sent message landed 2787px below the fold and stayed there --
     inView:false for 3s and elementFromPoint over its box returning null. */
  function scrollTranscriptToEnd(instant=false){ scrollToEnd('transcript',instant); }
  function appendMessage(msg,thread=activeThread()){thread.messages.push(msg);thread.updated='now';renderApp();scrollTranscriptToEnd();}

  function startWorking(reset=false,rec=state.work){
    if(reset||rec.completed){
      if(rec===state.work){ state.work={step:0,running:false,expanded:false,started:true,completed:false,elapsed:0,openPhase:null}; rec=state.work; }
      else { rec.step=0; rec.clock=0; rec.elapsed=0; rec.completed=false; rec.openPhase=null; delete rec.supersededBy; }
    }
    rec.started=true;rec.running=true;renderApp();
    armWorkTimer();
  }
  function runningRecs(){
    const out=[]; if(state.work.running) out.push(state.work);
    for(const k in state.works){ if(state.works[k].running) out.push(state.works[k]); }
    return out;
  }
  /* The ONE place that installs the work interval (same leak contract as
     before: every path that abandons a run either pauses its record or lets
     this tick observe "nothing running" and stop itself). One 500ms tick
     advances EVERY running record: the primary keeps its historic
     one-step-per-2s cadence through the clock->step derivation, scripted
     records follow their own instance timelines, and rows land one at a
     time because renderers gate them on the half-second clock. */
  function armWorkTimer(){
    clearInterval(workTimer);
    workTimer=setInterval(workTick,500);
  }
  function workTick(){
    const live=runningRecs();
    if(!live.length){ stopWorkTimer(); return; }
    for(const rec of live){
      const list=workInstancesFor(rec);
      rec.clock=workClock(rec)+0.5;
      rec.elapsed=Math.floor(rec.clock);
      rec.step=workLiveIndex(rec);
      if(rec.clock>=workRunEnd(list)-1e-6){
        rec.clock=workRunEnd(list); rec.step=list.length-1;
        rec.completed=true; rec.running=false;
        onRecComplete(rec);
      }
    }
    renderApp();
    if(!runningRecs().length){ stopWorkTimer(); maybeFlushQueue(); }
  }
  function stopWorkTimer(killSequence){ clearInterval(workTimer); workTimer=null; if(killSequence){ clearTimeout(seqTimer); seqTimer=null; } }
  /* Sequencer. A finished scripted run reveals its gated messages (the
     renderChat filter reads `completed`), then either spawns the next run in
     the chain -- compacting this card via supersededBy -- or, as the turn's
     last burst, compacts itself after a beat. The timeout survives the tick
     stopping (stopWorkTimer() without the kill flag keeps it); only
     switchThread/reset/globalReset kill the chain. */
  function onRecComplete(rec){
    const def=rec.runId&&D.workRuns&&D.workRuns[rec.runId];
    if(!def) return;                 // a PRIMARY record completing must not scroll the reader
    scrollTranscriptToEnd();
    clearTimeout(seqTimer);
    /* A finished card NEVER compacts itself: the LAST work activity in a
       turn stays expanded indefinitely, and an earlier one collapses only
       when its successor actually enters the thread — startWorkingRec sets
       supersededBy at spawn time, which drives the collapse choreography. */
    if(def.next&&D.workRuns[def.next.run]){
      const nid=def.next.run, pid=rec.runId;
      seqTimer=setTimeout(()=>{ startWorkingRec(nid,pid); },def.next.delayMs||1200);
    }
  }
  function startWorkingRec(runId,prevId){
    if(!(D.workRuns&&D.workRuns[runId])) return;
    state.works[runId]={step:0,running:true,expanded:false,started:true,completed:false,elapsed:0,openPhase:null,clock:0,runId};
    if(prevId&&state.works[prevId]){ state.works[prevId].supersededBy=runId; state.works[prevId].expanded=false; }
    armWorkTimer(); renderApp(); scrollTranscriptToEnd();
  }
  function chainRootOf(runId){
    let cur=runId, guard=0;
    while(guard++<12){
      const prev=Object.keys(D.workRuns||{}).find(k=>D.workRuns[k].next&&D.workRuns[k].next.run===cur);
      if(!prev) return cur;
      cur=prev;
    }
    return runId;
  }
  function resetChain(runId){
    clearTimeout(seqTimer); seqTimer=null;
    const root=chainRootOf(runId);
    let cur=root, guard=0;
    while(cur&&guard++<12){ delete state.works[cur]; const d=D.workRuns[cur]; cur=d&&d.next&&d.next.run; }
    state.workTerminal={};
    startWorkingRec(root);
  }
  /* Scrub a record to a subject index. A scripted record keeps its clock
     (parked on the subject's start second, or the run end when completed);
     the primary DROPS its clock so the historic step-writers -- demo
     triggers, PM56_DEMO.setWorkStep, whole-object assignments -- stay exact
     through the clock->step*2 fallback. Scrubbing a scripted run to its end
     fires the sequencer exactly like a natural completion. */
  function scrubTo(rec,idx){
    const was=rec.completed;
    const list=workInstancesFor(rec);
    idx=clamp(Number(idx)||0,0,list.length-1);
    rec.step=idx; rec.completed=idx===list.length-1;
    if(rec.runId){ rec.clock=rec.completed?workRunEnd(list):list[idx].startAt; rec.elapsed=Math.floor(rec.clock); }
    else delete rec.clock;
    if(rec.runId&&rec.completed&&!was) onRecComplete(rec);
  }
  function pauseWorking(rec=state.work){ rec.running=false; if(!runningRecs().length) stopWorkTimer(); renderApp(); }
  function stepWorking(rec=state.work){ rec.running=false; rec.started=true; scrubTo(rec,rec.step+1); if(!rec.runId) rec.elapsed+=3; if(!runningRecs().length) stopWorkTimer(); renderApp(); }
  function completeWorking(rec=state.work){ rec.running=false; rec.started=true; scrubTo(rec,1e9); if(!rec.runId) rec.elapsed=Math.max(rec.elapsed,134); rec.expanded=false; rec.openPhase=null; if(!runningRecs().length) stopWorkTimer(); renderApp(); if(!runningRecs().length) maybeFlushQueue(); }
  function resetWorking(rec=state.work){ if(rec.runId){ resetChain(rec.runId); return; } state.work=clone(DEFAULT.work); state.workTerminal={}; if(!runningRecs().length) stopWorkTimer(); renderApp(); }

  function globalReset(){
    stopWorkTimer(true);if(window.PM56_CTX&&window.PM56_CTX.reset)window.PM56_CTX.reset();safeStorage.del('pm56-prefs');D.models=clone(FIXTURE0.models);D.artifacts=clone(FIXTURE0.artifacts);state=clone(DEFAULT);state.threads=clone(D.threads);state.questions=clone(D.questions);renderApp(false);toast('Concept reset','All recipes, components, panels, threads, answers, artifacts, and working states returned to stock.');setTimeout(()=>{if(state.demoAutoStart)startWorking(true);},900);
  }

  function applyRecipe(i){i=Number(i);if(i<0){state.recipe=-1;renderApp();return;}const r=D.recipes[i];if(!r)return;state.recipe=i;state.variants=[...r.choices];renderApp();}
  function addReceipt(type,title,detail){appendMessage({id:uid(type),role:'system',type,title,detail,time:new Date().toISOString()});}

  /* Used by every path that empties the composer while it may still hold focus. */
  function clearComposerField(){
    const el=document.querySelector('textarea[data-input="composer"]');
    if(el && el.value!=='') el.value='';
  }
  function handleSend(){
    const raw=state.composer.trim();if(!raw)return;
    if(runningRecs().length){
      const q=queueOf();
      if(q.length>=2){ toast('Queue full','Send, edit, or cancel a queued message before adding another.'); return; }
      q.push({id:uid('q'), text:raw});
      state.composer='';
      clearComposerField();   /* enqueue empties the field too; same focus reason */
      renderApp();
      return;
    }
    deliverSend(raw);
  }
  function maybeFlushQueue(){
    if(runningRecs().length || seqTimer) return;
    const q=queueOf();
    if(!q.length) return;
    const next=q.shift();
    deliverSend(next.text);
  }
  function stopCurrentWork(){
    stopWorkTimer(true);
    if(state.work.running) state.work.running=false;
    for(const k in state.works) if(state.works[k].running) state.works[k].running=false;
    renderApp();
  }
  function deliverSend(raw){
    const t=activeThread();
    /* PRE-SEND CLAIM (MODAL-012). A feature module may HOLD a submission
       before it is admitted to the thread -- a BrainStorm asked for in prose
       must reach its configuration modal, not the provider. A hook returning
       true owns the text and is responsible for restoring it if the user
       cancels; every hook that returns anything else leaves the ordinary send
       path exactly as it was. Registered through the shared composer runtime
       so no module has to reopen this function. */
    const RTc = (window.PM56_RUNTIME||{}).composer;
    if(RTc && RTc.preSendHooks && RTc.preSendHooks.length){
      for(let i=0;i<RTc.preSendHooks.length;i++){
        let claimed=false;
        try{ claimed = RTc.preSendHooks[i](extCtx(), t, raw)===true; }
        catch(err){ console.error('PM56 preSendHook threw', err); }
        if(claimed){ state.composer=''; clearComposerField(); renderApp(); return; }
      }
    }
    state.draftHistory[t.id]??=[];state.draftHistory[t.id].push(raw);state.composer='';
    /* pmSyncAttrs deliberately will not write .value while the element is
       focused, so it cannot fight the caret mid-keystroke. Send is focused too,
       but it is a deliberate clear rather than a render racing the typist, so it
       clears the live field itself. Without this the message was sent and the
       text stayed visible in the box. */
    clearComposerField();
    t.messages.push({id:uid('user'),role:'user',type:'text',body:raw,time:new Date().toISOString()});
    const low=raw.toLowerCase();
    if(low.startsWith('/goal')||/create|start|set/.test(low)&&low.includes('goal')){state.capabilities.goal=true;stampActivityCap('goal',true);revealActivityDomain('goal');addReceipt('goal-receipt','Goal Mode started','A durable goal artifact was created. View, edit, pause, resume, stop, clear, and inspect evidence in Activity Detail.');openEditor('goal-artifact');}
    else if(low.startsWith('/deep-plan')||low.includes('deep plan')){state.mode='Deep Plan';state.decision={type:'plan',mode:'review'};t.messages.push({id:uid('plan'),role:'system',type:'plan-card',artifactId:'plan-query',deep:true});openEditor('plan-query');}
    else if(low.startsWith('/plan')||/make|create|write/.test(low)&&low.includes('plan')){state.mode='Plan';state.decision={type:'plan',mode:'review'};t.messages.push({id:uid('plan'),role:'system',type:'plan-card',artifactId:'plan-query'});openEditor('plan-query');}
    else if(low.startsWith('/ask')){state.mode='Ask';t.messages.push({id:uid('assistant'),role:'assistant',type:'text',body:'Ask mode is active. I will answer and explain without making changes.',time:new Date().toISOString()});}
    else if(low.startsWith('/debug')||low.includes('debug')){state.mode='Debug';const wid=uid('run');t.messages.push({id:uid('work'),role:'system',type:'working',title:'Debugging',workId:wid});state.works[wid]={step:0,running:true,expanded:false,started:true,completed:false,elapsed:0,openPhase:null,clock:0};armWorkTimer();}
    else if(low.startsWith('/compact')){state.dialog={type:'compact'};}
    else if(low.startsWith('/todo')){state.activity={...state.activity,open:true,domain:'todo'};}
    else if(low.startsWith('/web')){const wid=uid('run');t.messages.push({id:uid('work'),role:'system',type:'working',title:'Web research',workId:wid});state.works[wid]={step:3,running:false,expanded:false,started:true,completed:false,elapsed:6,openPhase:null};}
    else{t.messages.push({id:uid('assistant'),role:'assistant',type:'text',body:'I added this as a normal conversational turn so you can evaluate the reading rhythm, message actions, wide response layout, and persistent More Details surface.',time:new Date().toISOString()});}
    renderApp();
    scrollTranscriptToEnd();
  }

  /* 15e: nineteen Demo Studio triggers used to funnel through one
     thread-switch map with no further branch, so they collapsed to nine
     distinguishable demos -- "BSD intervention", "BSD silent check" and "BSD
     timeout" all just selected the BSD thread and stopped. Every entry here
     lands on a state you can tell apart on screen. */
  const DEMO_EFFECTS={
    'Live subagents':()=>{switchThread('subagents');state.work={step:7,running:true,expanded:false,started:true,completed:false,elapsed:47,openPhase:null};state.activity={...state.activity,open:true,domain:'subagents'};renderApp();armWorkTimer();},
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

  function runDemoTrigger(name){
    state.dialog=null;
    if(name.startsWith('Work · ')){
      const label=name.slice(7);const idx=D.workSteps.findIndex(x=>x.label===label);
      switchThread('query');state.work={step:Math.max(0,idx),running:false,expanded:true,started:true,completed:idx===D.workSteps.length-1,elapsed:Math.max(4,idx*11)};renderApp();return;
    }
    if(DEMO_EFFECTS[name]){DEMO_EFFECTS[name]();return;}
    /* What is left here is genuinely one-thread-per-trigger; everything that
       shared a destination moved into DEMO_EFFECTS above. */
    const threadMap={'Crew coordination':'crew','Browser debug':'debug','New message anchor':'new-message','Artifact failure':'artifact-error','Goal replanning':'goal-replan'};
    if(threadMap[name])switchThread(threadMap[name]);
    if(name==='Start complete work'){switchThread('query');startWorking(true);return;}
    if(name==='Multi-orbit turn'){stopWorkTimer(true);delete state.works.orbitA;delete state.works.orbitB;switchThread('orbit-run');return;}
    if(name==='Queued Message Demo'){stopWorkTimer(true);delete state.works.queueA;switchThread('queue-demo');return;}
    if(name==='Pause work'){pauseWorking();return;}
    if(name==='Step work'){stepWorking();return;}
    if(name==='Complete work'){completeWorking();return;}
    if(name==='Reset work'){resetWorking();return;}
    if(name==='Show work history'){state.work.expanded=true;renderApp();return;}
    if(name==='Prepare questions'){state.decision={type:'question-preparing'};renderApp();setTimeout(()=>{if(state.decision?.type==='question-preparing'){state.decision={type:'question'};renderApp();}},1200);return;}
    if(name==='Plan revision'){state.decision={type:'plan',mode:'revise',feedback:''};renderApp();return;}
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
    const stepMap={'Web search':3,'Web fetch':4,'Browser debug':5,'Bash':6,'App control':9,'LSP analysis':11,'MCP tool':7};
    if(stepMap[name]!=null){switchThread('debug');state.work={step:stepMap[name],running:false,expanded:true,started:true,completed:false,elapsed:52};renderApp();return;}
    renderApp();
  }

  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-action]');
    const sub=e.target.closest('[data-submenu]');
    if(sub&&state.menu&&!btn){ e.stopPropagation(); setSubmenu(sub.dataset.submenu); return; }
    if(!btn){if(state.menu&&!e.target.closest('.overlay-menu'))closeMenu();return;}
    const a=btn.dataset.action;
    /* Feature modules first, so a module can add an action or override one. */
    if(extRun(a,btn,e))return;
    if(a==='open-menu'){e.stopPropagation();const type=btn.dataset.menu,anchor=btn.dataset.menuAnchor;toggleMenu(type,anchor);return;}
    if(a==='context-menu'){e.stopPropagation();toggleMenu('context','context-ring');return;}
    if(a==='thread-menu'){e.stopPropagation();toggleMenu('thread',`thread-${btn.dataset.id}`,{threadId:btn.dataset.id});return;}
    if(a==='thread-search'){e.stopPropagation();toggleMenu('thread-search','thread-search');return;}
    if(a==='open-demo'){openDemoDialog();return;}
    if(a==='close-dialog'){if(state.dialog?.type==='demo'&&state.dialog.geom)lastDemoGeom={...state.dialog.geom};state.dialog=null;renderOverlays();return;}
    if(a==='reset-all'){globalReset();return;}
    if(a==='toggle-history'){const m=state.historyMode;state.historyMode = m==='floating' ? 'closed' : m==='pinned' ? (isNarrow()?'floating':'closed') : (isNarrow()?'floating':'pinned');renderApp();savePrefs();return;}
    if(a==='unpin-history'){state.historyMode='floating';renderApp();savePrefs();return;}
    if(a==='pin-history'){state.historyMode='pinned';renderApp();savePrefs();return;}
    if(a==='close-history'){state.historyMode='closed';renderApp();savePrefs();return;}
    if(a==='toggle-history-section'){
      const key=btn.dataset.section;
      if(!key) return;
      state.historySections=state.historySections||{pinned:true,recent:true,archived:false};
      state.historySections[key]=state.historySections[key]===false;
      renderApp();
      return;
    }
    if(a==='new-thread'){const id=uid('thread');state.threads.unshift({id,title:'New chat',status:'idle',pinned:false,archived:false,updated:'now',unread:0,model:selectedModel().name,summary:'New assistant conversation',messages:[]});if(window.PM56_CTX&&window.PM56_CTX.seedThread)window.PM56_CTX.seedThread(id);switchThread(id);return;}
    if(a==='select-thread'){if(e.target.closest('.thread-more'))return;switchThread(btn.dataset.id);return;}
    if(a==='toggle-thread-pin'){mutateThread(btn.dataset.id,t=>t.pinned=!t.pinned);state.menu=null;return;}
    if(a==='archive-thread'){mutateThread(btn.dataset.id,t=>{t.archived=true;t.pinned=false});state.menu=null;return;}
    if(a==='restore-thread'){mutateThread(btn.dataset.id,t=>{t.archived=false;t.updated='now'});state.menu=null;return;}
    if(a==='rename-thread'){const t=state.threads.find(x=>x.id===btn.dataset.id);state.dialog={type:'rename',threadId:t.id,value:t.title};state.menu=null;renderOverlays();return;}
    if(a==='save-thread-name'){const t=state.threads.find(x=>x.id===state.dialog.threadId);if(t)t.title=state.dialog.value.trim()||t.title;state.dialog=null;renderApp();return;}
    if(a==='fork-thread'){const src=state.threads.find(x=>x.id===btn.dataset.id);const id=uid('fork');state.threads.unshift({...clone(src),id,title:`${src.title} · Fork`,pinned:false,archived:false,updated:'now',summary:`Forked from ${src.title}`});if(window.PM56_CTX&&window.PM56_CTX.seedThread)window.PM56_CTX.seedThread(id,src.id,'fork');state.menu=null;switchThread(id);toast('Thread forked',`Created a child branch from ${src.title}.`);return;}
    if(a==='select-editor'){if(e.target.closest('[data-action="close-editor"]'))return;state.activeEditor=btn.dataset.id;renderApp();return;}
    if(a==='close-editor'){e.stopPropagation();closeEditor(btn.dataset.id);return;}
    if(a==='open-artifact'){decisionExit=null;state.decision=null;openEditor(btn.dataset.id);return;}
    if(a==='open-agent'){openEditor(`thread-${btn.dataset.id}`);return;}
    if(a==='open-change'){openEditor(`file:${btn.dataset.path}`);return;}
    if(a==='open-work-doc'){openEditor(btn.dataset.id);return;}
    if(a==='toggle-message'){state.messageExpanded[btn.dataset.id]=!state.messageExpanded[btn.dataset.id];renderApp();return;}
    if(a==='message-details'){state.messageDetails[btn.dataset.id]=!state.messageDetails[btn.dataset.id];btn.blur();renderApp();return;}
    if(a==='copy-message'){const msg=activeThread().messages.find(x=>x.id===btn.dataset.id);copyText(msg?(msg.body||msg.title||msg.detail||''):'','Message copied','The visible message text was copied without thread mutation.');state.copyFlashId=btn.dataset.id;btn.blur();renderApp();if(copyFlashTimer)clearTimeout(copyFlashTimer);copyFlashTimer=setTimeout(()=>{state.copyFlashId=null;copyFlashTimer=null;renderApp();},1200);return;}
    if(a==='edit-message'){toast('Edit and branch','A new child branch would open with the user message editable.');return;}
    if(a==='work-terminal-open'){
      const cardUi=btn.dataset.cardUi;
      const stepUid=btn.dataset.step;
      const rowIndex=Number(btn.dataset.row);
      const cur=state.workTerminal[cardUi];
      if(cur && cur.stepUid===stepUid && Number(cur.rowIndex)===rowIndex) delete state.workTerminal[cardUi];
      else state.workTerminal[cardUi]={stepUid, rowIndex};
      renderApp();
      return;
    }
    if(a==='work-terminal-close'){delete state.workTerminal[btn.dataset.cardUi];renderApp();return;}
    if(['start-working','pause-working','step-working','complete-working','reset-working','toggle-work-history','inspect-work-step','toggle-work-phase'].includes(a)){
      /* Card-scoped work controls: a button inside a working card resolves
         that card's record through data-card (a workId or 'primary'); the
         ambient Demo Studio buttons carry no card and fall through to the
         primary, exactly as before. */
      const cardEl=btn.closest('[data-card]');
      const wid=cardEl?cardEl.dataset.card:'primary';
      const rec=(wid&&wid!=='primary'&&state.works[wid])||state.work;
      if(a==='start-working'){startWorking(false,rec);return;}
      if(a==='pause-working'){pauseWorking(rec);return;}
      if(a==='step-working'){stepWorking(rec);return;}
      if(a==='complete-working'){completeWorking(rec);return;}
      if(a==='reset-working'){resetWorking(rec);return;}
      if(a==='toggle-work-history'){rec.expanded=!rec.expanded;renderApp();return;}
      if(a==='inspect-work-step'){rec.running=false;scrubTo(rec,Number(btn.dataset.value));if(!runningRecs().length)stopWorkTimer();renderApp();return;}
      if(a==='toggle-work-phase'){const k=btn.dataset.value;rec.openPhase=(rec.openPhase===k?null:k);renderApp();return;}
    }
    if(a==='open-activity'){if(!activityDefs()[btn.dataset.domain])return;const fromPreview=!!btn.closest('.ab-card');state.activity.open=true;state.activity.domain=btn.dataset.domain;state.activity.scope='focus';if(!isPhone())state.activity.pinned=true;if(!state.activity.expanded.includes(btn.dataset.domain))state.activity.expanded.push(btn.dataset.domain);state.hover=null;renderApp();if(fromPreview)focusActivityControl('.activity-panel [data-action="unpin-activity"], .activity-panel [data-action="pin-activity"]');return;}
    if(a==='focus-activity'){if(!activityDefs()[btn.dataset.domain])return;state.activity.domain=btn.dataset.domain;if(!state.activity.expanded.includes(btn.dataset.domain))state.activity.expanded.push(btn.dataset.domain);renderApp();return;}
    if(a==='toggle-activity-section'){const id=btn.dataset.domain;state.activity.expanded=state.activity.expanded.includes(id)?state.activity.expanded.filter(x=>x!==id):[...state.activity.expanded,id];renderApp();return;}
    if(a==='toggle-activity-filter'){state.activity.filterVisible=!state.activity.filterVisible;renderApp();return;}
    if(a==='pin-activity'){state.activity.pinned=true;state.activity.open=true;renderApp();focusActivityControl('.activity-panel [data-action="unpin-activity"]');return;}
    if(a==='unpin-activity'){state.activity.pinned=false;renderApp();focusActivityControl('.activity-panel [data-action="pin-activity"]');return;}
    if(a==='close-activity'){const domain=state.activity.domain;state.activity.open=false;state.activity.pinned=false;renderApp();focusActivityBarDomain(domain);return;}
    if(a==='context-details'){state.context.details=true;state.menu=null;renderApp();return;}
    if(a==='close-context-details'){state.context.details=false;renderOverlays();return;}
    if(a==='compact-now'){state.menu=null;state.dialog={type:'compact'};renderOverlays();return;}
    if(a==='apply-compaction'||a==='apply-subcompact'){state.context.compacted=true;state.capabilities.context='Auto';state.dialog=null;state.menu=null;addReceipt('context-subcompact','Context compacted','18.4K tokens removed · active requirements and provenance retained.');return;}
    if(a==='cancel-subcompact'){state.capabilities.context='Auto';state.menu.sub='context-lens';renderOverlays();return;}
    if(a==='export-context'){exportContextJson();return;}
    if(a==='raw-context'){toast('Raw projection opened','A redacted source-by-source projection would open in the editor.');return;}
    if(a==='set-persona'){state.persona=btn.dataset.value;closeMenu();renderApp();return;}
    if(a==='set-permissions'){state.permissions=btn.dataset.value;closeMenu();renderApp();return;}
    if(a==='set-worktree'){state.worktree=btn.dataset.value;closeMenu();renderApp();return;}
    if(a==='set-mode'){state.mode=btn.dataset.value;const sub={'Plan':'plan','Deep Plan':'deep-plan','Review':'review'}[state.mode];if(!sub){closeMenu();renderApp();}else{setSubmenu(sub);}return;}
    if(a==='set-thoroughness'){state.mode=btn.dataset.mode;state.thoroughness=btn.dataset.value;closeMenu();renderApp();return;}
    if(a==='set-plan-strategy'){state.mode=btn.dataset.mode;if(state.mode==='Deep Plan')state.deepPlanStrategy=btn.dataset.value;else state.planStrategy=btn.dataset.value;state.thoroughness=btn.dataset.value;closeMenu();renderApp();return;}
    /* Grill Me is a persistent check: it stays open so the user can see the tick land,
       exactly like the Fast-mode auxiliary row it visually matches. */
    if(a==='toggle-grill-me'){state.grillMe=!state.grillMe;renderOverlays();return;}
    if(a==='set-review-strategy'){state.mode='Review';state.reviewStrategy=btn.dataset.value;closeMenu();renderApp();return;}
    if(a==='model-provider'){state.modelProvider=btn.dataset.value;renderOverlays();return;}
    if(a==='set-model'){state.model=btn.dataset.value;const model=selectedModel();if(state.effort && !model.efforts.includes(state.effort))state.effort='';setSubmenu(`model:${model.id}`);renderApp();return;}
    if(a==='toggle-favorite'){e.stopPropagation();const id=btn.dataset.value;state.favorites=isFavorite(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];renderOverlays();return;}
    if(a==='set-effort'){state.model=btn.dataset.model;state.effort=btn.dataset.value;renderApp();renderOverlays();savePrefs();return;}
    if(a==='toggle-fast'){state.model=btn.dataset.model;state.fast=!state.fast;renderApp();renderOverlays();savePrefs();return;}
    if(a==='submenu-back'){state.menu.compactSub=null;state.menu.sub=null;renderOverlays();return;}
    if(a==='set-goal-cap'){state.capabilities.goal=btn.dataset.value==='On';stampActivityCap('goal',state.capabilities.goal);if(state.capabilities.goal)revealActivityDomain('goal');closeMenu();renderApp();savePrefs();return;}
    if(a==='set-crew-cap'){state.capabilities.crew=btn.dataset.value==='On';stampActivityCap('crew',state.capabilities.crew);if(state.capabilities.crew)revealActivityDomain('crew');closeMenu();renderApp();savePrefs();return;}
    if(a==='set-bsd-cap'){state.capabilities.bsd=btn.dataset.value;closeMenu();renderApp();savePrefs();return;}
    if(a==='set-context-cap'){state.capabilities.context=btn.dataset.value;if(btn.dataset.value==='Subcompact'){state.menu.sub='context-lens';renderOverlays();}else{closeMenu();addReceipt(btn.dataset.value==='Focus'?'context-focus':'context-mute',`Context Lens · ${btn.dataset.value}`,btn.dataset.value==='Focus'?'Current files and final references prioritized.':'Selected superseded sources omitted from the active projection.');}return;}
    if(a==='set-eli5-cap'){state.capabilities.eli5=btn.dataset.value==='On';closeMenu();renderApp();return;}
    if(a==='set-thought-cap'){state.capabilities.thought=btn.dataset.value;closeMenu();renderApp();return;}
    if(a==='open-questionnaire'){decisionExit=null;state.decision={type:'question'};renderApp();return;}
    if(a==='prev-question'){state.questionIndex=Math.max(0,state.questionIndex-1);renderApp();return;}
    if(a==='next-question'){const q=state.questions[state.questionIndex];if(q.required&&!questionFilled(q)){toast('Answer required','Complete this question or use Skip to return later.');return;}state.questionIndex=Math.min(state.questions.length-1,state.questionIndex+1);renderApp();return;}
    if(a==='answer-choice'){const q=state.questions[state.questionIndex];q.answer=btn.dataset.value;q.other='';renderApp();return;}
    if(a==='answer-multi'){const q=state.questions[state.questionIndex];q.answer=Array.isArray(q.answer)?q.answer:[];q.answer=q.answer.includes(btn.dataset.value)?q.answer.filter(x=>x!==btn.dataset.value):[...q.answer,btn.dataset.value];renderApp();return;}
    if(a==='skip-question'){state.questionIndex=Math.min(state.questions.length-1,state.questionIndex+1);toast('Question skipped','It remains queued and can be answered later.');renderApp();return;}
    if(a==='close-decision'){closeDecision();return;}
    if(a==='cancel-questionnaire'){closeDecision(false);addReceipt('question-receipt','Questionnaire cancelled','The explicit cancellation is recorded. Existing answers remain in thread history.');return;}
    if(a==='submit-questionnaire'){const missing=state.questions.find(q=>q.required&&!questionFilled(q));if(missing){toast('Required answers remain',missing.prompt);return;}decisionExit=null;state.decision={type:'question-submitting'};renderApp();setTimeout(()=>{closeDecision(false);state.questionQueue=Math.max(0,state.questionQueue-1);addReceipt('question-receipt','Questionnaire submitted','5 answers attached to the deployment planning context.');},950);return;}
    if(a==='revise-plan'){decisionExit=null;state.decision={type:'plan',mode:'revise',feedback:''};renderApp();return;}
    if(a==='build-plan'){decisionExit=null;state.decision={type:'plan',mode:'review'};renderApp();return;}
    if(a==='cancel-plan'){state.planStatus='cancelled';toast('Plan decision closed','The durable plan card remains in the transcript with View, Revise, and Build.');closeDecision();return;}
    if(a==='submit-plan-revision'){state.planRevision++;decisionExit=null;state.decision={type:'plan',mode:'review'};toast('Plan revision created',`Revision ${state.planRevision} is open in the editor and ready for review.`);openEditor('plan-query');return;}
    if(a==='approve-plan'){closeDecision(false);state.planStatus='building';state.mode='Agent';addReceipt('goal-receipt','Plan approved · Build started','The assistant switched from planning to execution and preserved the Plan artifact.');startWorking(true);return;}
    if(a==='open-permission'){decisionExit=null;state.decision={type:'permission'};renderApp();return;}
    if(a==='deny-permission'){closeDecision(false);addReceipt('permission','Permission denied','The checkpoint remains available; no action was replayed.');return;}
    if(a==='approve-permission'){closeDecision(false);scrubTo(state.work,5);startWorking();return;}
    if(a==='resolve-conflict'){closeDecision(false);addReceipt('route-change','Parent mediation resolved',btn.dataset.value==='indexes'?'Composite indexes approved as the reversible first step.':btn.dataset.value==='views'?'Materialized-view follow-up selected.':'Explicit schema-policy override recorded.');return;}
    if(a==='trigger-work-recovery'){decisionExit=null;state.decision={type:'permission'};renderApp();return;}
    if(a==='open-goal'){openEditor('goal-artifact');return;}
    if(a==='edit-goal'){toast('Goal edited','A material edit created Revision 5 and moved the Goal into Replanning.');addReceipt('goal-receipt','Goal replanning','Revision 5 · material scope change detected.');return;}
    /* The four goal-lifecycle verbs stay honest stubs until there is a goal
       model to act on. They are dispatched through PM56_EXT like everything
       else, so the Wave 2 Goals agent takes them over from goals.js with
       PM56_EXT.action('pause-goal', ...) -- no edit to this file. */
    if(a==='pause-goal'||a==='resume-goal'||a==='stop-goal'||a==='clear-goal'){toast(`Goal ${a.replace('-goal','')}`,'Not simulated yet: this concept has no goal model to act on.');return;}
    if(a==='open-bsd-details'){state.dialog={type:'bsd'};renderOverlays();return;}
    if(a==='dismiss-event'){const id=btn.dataset.id;const th=state.threads.find(x=>x.messages.some(m=>m.id===id));if(!th){toast('Nothing to dismiss','That receipt is no longer in any transcript.');return;}th.messages=th.messages.filter(m=>m.id!==id);renderApp();toast('Receipt dismissed','Removed from this transcript; the underlying event stays in thread history.');return;}
    if(a==='restore-draft'){const list=state.draftHistory[state.selectedThread]||[];if(!list.length){toast('No earlier draft','Nothing has been sent from this thread yet.');return;}state.composer=list[list.length-1];state.drafts[state.selectedThread]=state.composer;renderApp();toast('Draft restored',`Restored the most recent of ${list.length} saved drafts.`);return;}
    if(a==='attach'){addReceipt('attachment','Uploading design-reference.png','82% · image preview and artifact registration in progress.');return;}
    if(a==='send'){handleSend();return;}
    if(a==='scroll-to-bottom'){scrollTranscriptToEnd();return;}
    if(a==='stop-run'){stopCurrentWork();return;}
    if(a==='queue-edit'){
      const q=queueOf(); const i=q.findIndex(x=>x.id===btn.dataset.id); if(i<0)return;
      const [entry]=q.splice(i,1); state.composer=entry.text; renderApp(); return;
    }
    if(a==='queue-send-now'){
      const q=queueOf(); const i=q.findIndex(x=>x.id===btn.dataset.id); if(i<0)return;
      const [entry]=q.splice(i,1); deliverSend(entry.text); return;
    }
    if(a==='demo-trigger'){runDemoTrigger(btn.dataset.trigger);return;}
    if(a==='jump-search-result'){state.menu=null;switchThread(btn.dataset.thread);setTimeout(()=>{const el=document.querySelector(`[data-message-id="${CSS.escape(btn.dataset.message)}"]`);el?.scrollIntoView({block:'center',behavior:'smooth'});},50);return;}
    if(a==='show-archived'){state.historySearch='';state.historyMode=isNarrow()?'floating':'pinned';state.menu=null;renderApp();requestAnimationFrame(()=>{const hs=document.querySelector('[data-scroll-key="history"]');if(hs)hs.scrollTop=hs.scrollHeight;});return;}
    if(a==='search-current-demo'){state.menu.query='query';renderOverlays();return;}
    if(a==='toggle-mermaid-source'){state.artifactState.mermaidSource=!state.artifactState.mermaidSource;renderApp();return;}
    if(a==='copy-mermaid'){copyText(MERMAID_SOURCE,'Mermaid source copied','The source artifact remains independently editable.');return;}
    if(a==='chart-metric'){state.artifactState.chartMetric=btn.dataset.value;renderApp();return;}
    if(a==='data-filter'){state.artifactState.dataFilter=btn.dataset.value;renderApp();return;}
    if(a==='quiz-answer'){state.artifactState.quizAnswer=Number(btn.dataset.value);renderApp();return;}
    if(a==='periodic-cell'){toast(btn.dataset.value,'Capability details would open in a linked inspector.');return;}
    if(a==='retry-artifact'){state.artifactState.retrying=true;toast('Renderer retrying','Source fallback remains available during recovery.');setTimeout(()=>{const art=D.artifacts.find(x=>x.id===btn.dataset.id);if(art)art.status='ready';state.artifactState.retrying=false;renderApp();},900);return;}
    /* Nothing built in matched: give late-registered module handlers a turn. */
    if(extRunAfter(a,btn,e))return;
  });

  document.addEventListener('input',e=>{
    const k=e.target.dataset.input;if(!k)return;
    if(k==='composer'){state.composer=e.target.value;state.drafts[state.selectedThread]=state.composer;syncSendStop();return;}
        if(k==='history-search'){state.historySearch=e.target.value;renderApp();return;}
        if(k==='model-search'){state.modelSearch=e.target.value;renderOverlays();return;}
        if(k==='thread-global-search'){state.menu.query=e.target.value;renderOverlays();return;}
    if(k==='rename-thread'){state.dialog.value=e.target.value;return;}
    if(k==='question-text'){state.questions[state.questionIndex].answer=e.target.value;return;}
    if(k==='question-other'){const q=state.questions[state.questionIndex];if(!q)return;q.other=e.target.value;if(q.type==='choice')q.answer='';if(q.type==='text')q.answer=e.target.value;return;}
    if(k==='plan-feedback'){state.decision.feedback=e.target.value;return;}
  });

  document.addEventListener('change',e=>{
    const k=e.target.dataset.input;if(!k)return;
    if(k==='recipe'){applyRecipe(e.target.value);openDemoDialog();return;}
    if(k==='theme'){applyTheme(e.target.value);savePrefs();return;}
    if(k==='variant'){const f=Number(e.target.dataset.family);state.variants[f]=clamp(Number(e.target.value),0,familyMax(f));state.recipe=-1;renderApp();return;}
  });

  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&document.activeElement?.matches('[data-input="composer"]')){e.preventDefault();handleSend();}
    if(e.key==='Escape'){
      if(state.menu){closeMenu();return;}
      if(state.dialog){if(window.PM56_CTX&&window.PM56_CTX.cancelPreview&&window.PM56_CTX.cancelPreview(state.dialog,'escape'))return;if(state.dialog.type==='demo'&&state.dialog.geom)lastDemoGeom={...state.dialog.geom};state.dialog=null;renderOverlays();return;}
      if(state.context.details){state.context.details=false;renderOverlays();return;}
      if(state.activity.open&&!activityPinnedInLayout()){const domain=state.activity.domain;state.hover=null;state.activity.open=false;state.activity.pinned=false;renderApp();focusActivityBarDomain(domain);return;}
      if(state.hover){state.hover=null;syncHoverCard();return;}
      if(state.historyMode==='floating'&&document.body.dataset.phDrawer!=='pinned'){state.historyMode='closed';renderApp();return;}
      if(state.decision||decisionExit){closeDecision();}
    }
  });

  document.addEventListener('pointermove',e=>{ lastPointer={x:e.clientX,y:e.clientY}; },{passive:true});
  document.addEventListener('pointerover',e=>{
    /* Plain-text hover tips first so they still work inside open menus and
       drawers (those surfaces live under state.menu / overlay root). Instant
       tips feel twitchy while scanning dense chrome, so tip cards dwell. */
    const tip=e.target.closest('[data-hover-tip]');
    if(tip){
      const key=tip.dataset.hoverKey||'';
      if(state.hover && state.hover.type==='text' && state.hover.key===key) return;
      clearTimeout(hoverTimer);
      const tipText=tip.dataset.hoverTip||'';
      hoverTimer=setTimeout(()=>{
        if(!tip.isConnected) return;
        state.hover={type:'text',tip:tipText,key};
        /* Tip-only: do not re-patch menus/drawers in #pmOverlayRoot. */
        syncHoverCard();
        requestAnimationFrame(()=>positionHoverCard());
      },400);
      return;
    }
    if(state.menu){
      if(e.target.closest('[data-overlay="sidecar"]')) return;
      const sub=e.target.closest('[data-submenu]');
      if(sub){clearTimeout(submenuTimer);setSubmenu(sub.dataset.submenu);return;}
      const item=e.target.closest('[data-overlay="root-menu"] .menu-item, [data-overlay="root-menu"] .model-row');
      if(item && !item.hasAttribute('data-submenu') && (state.menu.sub||state.menu.compactSub)){
        setSubmenu(null);
      }
      return;
    }
    const act=e.target.closest('[data-hover-domain]');
    if(act){
      const domain=act.dataset.hoverDomain;
      if(state.hover && state.hover.type==='activity'){
        clearTimeout(hoverTimer);
        if(state.hover.domain!==domain){ state.hover={type:'activity',domain}; syncHoverCard(); requestAnimationFrame(()=>positionHoverCard()); }
        return;
      }
      clearTimeout(hoverTimer);
      hoverTimer=setTimeout(()=>{ state.hover={type:'activity',domain}; syncHoverCard(); requestAnimationFrame(()=>positionHoverCard()); },220);
      return;
    }
  });
  document.addEventListener('pointerout',e=>{
    /* pmPatch during work ticks disconnects the old node and fires pointerout.
       Ignore those — the replacement node is still under the cursor. */
    if(!e.target||!e.target.isConnected) return;
    const act=e.target.closest('[data-hover-domain],[data-hover-tip]');
    if(act&&!act.contains(e.relatedTarget)){
      clearTimeout(hoverTimer);
      hoverTimer=setTimeout(()=>{
        if(!document.querySelector('.hover-card:hover')){
          state.hover=null;
          syncHoverCard();
        }
      },160);
    }
  });

  document.addEventListener('pointerdown',e=>{
    const actBtn=e.target.closest('[data-action="open-activity"]');
    /* A preview footer must survive through click. Removing its overlay on
       pointerdown disconnects the button before click can dispatch. Bar
       triggers are in the patched app tree and can still dismiss eagerly. */
    if(actBtn&&!actBtn.closest('.ab-card')){
      clearTimeout(hoverTimer);
      if(window.PM56_AB&&window.PM56_AB.dismissActivityHover)window.PM56_AB.dismissActivityHover();
      state.hover=null;
      renderOverlays();
    }
    const resizeHandle=e.target.closest('[data-dialog-resize]');
    if(resizeHandle&&state.dialog?.type==='demo'){
      e.preventDefault();
      const g=state.dialog.geom||defaultDemoGeom();
      const el=document.querySelector('.demo-dialog');
      resizeHandle.setPointerCapture?.(e.pointerId);
      dragState={kind:'demo-resize',dir:resizeHandle.dataset.dialogResize,startX:e.clientX,startY:e.clientY,orig:{...g},el,handle:resizeHandle};
      el?.classList.add('resizing');resizeHandle.classList.add('dragging');
      return;
    }
    const dragBar=e.target.closest('[data-dialog-drag]');
    if(dragBar&&state.dialog?.type==='demo'&&!e.target.closest('button,select,input,a,[data-action]')){
      e.preventDefault();
      const g=state.dialog.geom||defaultDemoGeom();
      const el=document.querySelector('.demo-dialog');
      dragBar.setPointerCapture?.(e.pointerId);
      dragState={kind:'demo-move',startX:e.clientX,startY:e.clientY,orig:{...g},el};
      el?.classList.add('dragging');
      return;
    }
    const handle=e.target.closest('[data-resize]');if(!handle)return;
    e.preventDefault();handle.setPointerCapture?.(e.pointerId);dragState={kind:handle.dataset.resize,startX:e.clientX,editor:state.editorWidth,history:state.historyWidth,activity:state.activityWidth};handle.classList.add('dragging');
  });
  document.addEventListener('pointermove',e=>{
    if(!dragState)return;
    if(dragState.kind==='demo-move'){
      const g=clampDemoGeom({...dragState.orig,left:dragState.orig.left+(e.clientX-dragState.startX),top:dragState.orig.top+(e.clientY-dragState.startY)});
      state.dialog.geom=g;applyDemoGeomStyles(dragState.el,g);return;
    }
    if(dragState.kind==='demo-resize'){
      const dx=e.clientX-dragState.startX, dy=e.clientY-dragState.startY, o=dragState.orig, dir=dragState.dir;
      let left=o.left, top=o.top, width=o.width, height=o.height;
      if(dir.includes('e')) width=o.width+dx;
      if(dir.includes('s')) height=o.height+dy;
      if(dir.includes('w')){width=o.width-dx;left=o.left+dx;}
      if(dir.includes('n')){height=o.height-dy;top=o.top+dy;}
      const g=clampDemoGeom({left,top,width,height});
      // When clamping width/height from n/w edges, keep the opposite edge anchored.
      if(dir.includes('w')&&g.width!==width) g.left=o.left+o.width-g.width;
      if(dir.includes('n')&&g.height!==height) g.top=o.top+o.height-g.height;
      const final=clampDemoGeom(g);
      state.dialog.geom=final;applyDemoGeomStyles(dragState.el,final);return;
    }
    const dx=e.clientX-dragState.startX;
    if(dragState.kind==='editor')state.editorWidth=clamp(dragState.editor+(dx/window.innerWidth)*100,25,72);
    if(dragState.kind==='history')state.historyWidth=clamp(dragState.history+dx,170,360);
    if(dragState.kind==='activity')state.activityWidth=clamp(dragState.activity+dx,240,480);
    document.documentElement.style.setProperty('--editor-w',`${state.editorWidth}%`);document.documentElement.style.setProperty('--history-w',`${state.historyWidth}px`);document.documentElement.style.setProperty('--activity-w',`${state.activityWidth}px`);
  });
  document.addEventListener('pointerup',()=>{
    if(!dragState)return;
    if(dragState.kind==='demo-move'||dragState.kind==='demo-resize'){
      dragState.el?.classList.remove('dragging','resizing');
      dragState.handle?.classList.remove('dragging');
      if(state.dialog?.geom)lastDemoGeom={...state.dialog.geom};
      dragState=null;return;
    }
    const settledKind=dragState.kind;
    document.querySelectorAll('.dragging').forEach(x=>x.classList.remove('dragging'));dragState=null;savePrefs();
    if(settledKind==='editor'&&state.activity.open&&state.activity.pinned)renderApp();
  });

  window.addEventListener('resize',()=>{
    const nextPhone=isPhone();
    const phoneChanged=nextPhone!==phoneLayout;
    phoneLayout=nextPhone;
    const nextActivityPin=activityPinnedInLayout();
    const activityPinChanged=nextActivityPin!==activityPinLayout;
    activityPinLayout=nextActivityPin;
    if(state.dialog?.type==='demo'&&state.dialog.geom){
      state.dialog.geom=clampDemoGeom(state.dialog.geom);lastDemoGeom={...state.dialog.geom};
      applyDemoGeomStyles(document.querySelector('.demo-dialog'),state.dialog.geom);
    }
    if(state.menu||state.hover)renderOverlays();if(phoneChanged||activityPinChanged||(isNarrow()&&state.historyMode==='pinned'))renderApp();
    else syncJumpBottom();
  });

  // Public deterministic concept API used by the Demo Studio and automated inspection.
  window.PM56_DEMO={
    getState:()=>clone(state),
    reset:globalReset,
    setTheme:(id)=>applyTheme(id),
    setRecipe:(i)=>applyRecipe(i),
    setVariant:(family,option)=>{const f=Number(family);state.variants[f]=clamp(Number(option),0,familyMax(f));state.recipe=-1;renderApp();},
    selectThread:switchThread,
    openActivity:(domain)=>{if(activityDefs()[domain]){state.activity.open=true;state.activity.domain=domain;state.activity.scope='focus';renderApp();}},
    pinActivity:()=>{state.activity.open=true;state.activity.pinned=true;renderApp();},
    openContext:()=>{state.context.details=true;renderOverlays();},
    openQuestionnaire:()=>{decisionExit=null;state.decision={type:'question'};renderApp();},
    openPlan:()=>{decisionExit=null;state.decision={type:'plan',mode:'review'};renderApp();},
    openPermission:()=>{decisionExit=null;state.decision={type:'permission'};renderApp();},
    startWorking:()=>startWorking(true),pauseWorking,stepWorking,completeWorking,resetWorking,
    setWorkStep:(i)=>{state.work.started=true;state.work.running=false;scrubTo(state.work,Number(i));if(!runningRecs().length)stopWorkTimer();renderApp();},
    trigger:runDemoTrigger,
    listTriggers:allDemoTriggers,
    openArtifact:openEditor,
    snapshot:()=>({theme:state.theme,recipe:state.recipe,variants:[...state.variants],thread:state.selectedThread,work:{...state.work},works:clone(state.works),decision:state.decision?.type||null,activity:clone(state.activity)})
  };

  // Initial full render and a real, one-shot working sequence so the first open is not static.
  renderApp(false);
  scrollTranscriptToEnd(true);
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
        /* These three used to name .activity-domain / .activity-chip /
           .popup-menu / .menu-panel -- class names no renderer has ever
           emitted -- so all three were structurally incapable of being
           non-zero, and any harness reading them saw three permanent zeros as
           measurements. They now point at what renderActivityBar,
           renderMenu and the artifact renderers actually produce. */
        activityDomains: qa('.activity-item[data-hover-domain]').length,
        artifacts: qa('[data-artifact-id]').length,
        menus: qa('.overlay-menu').length,
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
