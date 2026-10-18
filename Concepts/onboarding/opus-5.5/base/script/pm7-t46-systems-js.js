
/* PM7 T46: operational systems integration and K3 host adaptation */
(function(){
  'use strict';
  if(window.PM7_SYSTEMS_INTEGRATION)return;
  var shell=document.querySelector('.app-shell'),panel=document.getElementById('panel-settings'),chat=document.getElementById('chatPanel'),resizer=document.getElementById('chatResizer');
  var reservedChatWidth=0,shellWidth=0,panelWidth=0,chatWidth=0,resizerWidth=5,syncFrame=0,pagesWidth=0;
  function settingsActive(){return !!(panel&&panel.classList.contains('active'));}
  function chatReservation(){
    if(!chat||chat.classList.contains('hidden'))return 0;
    if(chatWidth>0)reservedChatWidth=chatWidth;
    if(!(reservedChatWidth>0)){
      reservedChatWidth=shellWidth<=980?Math.max(320,Math.min(430,shellWidth*.46)):Math.max(380,Math.min(550,Math.min(680,shellWidth*.46)));
    }
    return reservedChatWidth+(resizer&&!resizer.classList.contains('hidden')?(resizerWidth||5):0);
  }
  function hostProjection(){
    var focused=document.body.classList.contains('pm7-settings-focus-host'),reservation=chatReservation();
    var width=panelWidth>0?panelWidth:pagesWidth>0?pagesWidth:Math.max(0,shellWidth-reservation);
    return {settings_active:settingsActive(),shell_width:shellWidth,panel_width:width,focused:focused,chat_reservation:reservation,projected_with_chat:focused?Math.max(0,width-reservation):width,threshold:980};
  }
  function syncHost(){
    var projection=hostProjection();
    var shouldFocus=projection.settings_active&&projection.shell_width>0&&projection.projected_with_chat<projection.threshold;
    var focusChanged=projection.focused!==shouldFocus;
    document.body.classList.toggle('pm7-settings-focus-host',shouldFocus);
    /* Focus-host chrome can move the active page tab after the shared density
       pass. Re-snap its presentation-only ink on the next paint so the hidden
       indicator never widens the document's scrollable overflow area. */
    if(focusChanged&&window.PM7_PAGE_TAB_INK&&typeof window.PM7_PAGE_TAB_INK.resync==='function')requestAnimationFrame(function(){window.PM7_PAGE_TAB_INK.resync();});
    return Object.assign({},projection,{focused:shouldFocus});
  }
  function scheduleSyncHost(){if(syncFrame)return;syncFrame=requestAnimationFrame(function(){syncFrame=0;syncHost();});}
  function observeWidth(element,assign){
    if(!element||typeof ResizeObserver!=='function')return;
    new ResizeObserver(function(entries){var width=entries[entries.length-1]&&entries[entries.length-1].contentRect?entries[entries.length-1].contentRect.width:0;assign(width);scheduleSyncHost();}).observe(element);
  }
  function dispatchSettings(commandId,payload,continuation){
    var tome=window.PM7_SETTINGS_TOME;
    if(!tome||typeof tome.dispatch!=='function')return {mode:'blocked_owner_bridge',command_id:commandId};
    return tome.dispatch(commandId,payload||{},continuation||{return_surface:'settings'});
  }
  window.PM7_SETTINGS_COMMANDS={
    schema_id:'pm.settings.command_bridge.v1',
    open:function(route){var tab=document.getElementById('tab-settings');if(tab)tab.click();if(route&&window.PM12_KIMI)window.PM12_KIMI.navigate(route.domain,route.workspace,route.options||{});return {command_id:'cmd.settings.open',route:route||null};},
    preview:function(payload){return dispatchSettings('cmd.settings.transaction.preview',payload);},
    apply:function(payload){return dispatchSettings('cmd.settings.transaction.apply',payload);},
    rollback:function(payload){return dispatchSettings('cmd.settings.transaction.rollback',payload);},
    export:function(payload){return dispatchSettings('cmd.settings.export',payload);}
  };
  var browserProgramPrerequisites=Object.freeze(['policy','capability','explicit_user_action']);
  var browserProgramDescriptor=Object.freeze({
    projection_only:true,
    runtime_state:'runtime_unavailable',
    native_cef_executed:false,
    ordinary_browser_only:true,
    auth_browser_session:'excluded',
    prerequisites:browserProgramPrerequisites,
    execution_methods:0,
    raw_protocol_access:false,
    arbitrary_page_code:false
  });
  Object.defineProperty(window,'PM7_BROWSER_PROGRAM',{value:browserProgramDescriptor,writable:false,configurable:false,enumerable:true});
  window.PM7_SYSTEMS_INTEGRATION={schema_id:'pm.pmconcept7.systems_projection.v1',simulation_only:true,production_runtime_state:'unavailable',native_runtime_state:'unavailable',sync_host:syncHost,host_projection:hostProjection,settings_commands:window.PM7_SETTINGS_COMMANDS,server_gap_consumers:window.PM7_SERVER_GAP_CONSUMERS,doctor_fixture_model:function(){return JSON.parse(JSON.stringify(window.PM7_DOCTOR_CLOSURE_MODEL));},doctor_status_catalog:function(){return window.PM7_DOCTOR_STATUS_CATALOG.slice();},doctor_domain_catalog:function(){return window.PM7_DOCTOR_DOMAIN_IDS.slice();},doctor_work_projection:function(){return JSON.parse(JSON.stringify(window.PM7_DOCTOR_WORK_PROJECTION()));},return_to_doctor:function(result){if(!window.PM12_KIMI)return {mode:'blocked_owner_bridge'};var payload=result||{};window.PM12_KIMI.dispatchAction('doctor-return',{checkId:payload.checkId,findingId:payload.findingId,findingRevision:payload.findingRevision,targetId:payload.targetId,ownerActionId:payload.ownerActionId,typedOwnerRouteId:payload.typedOwnerRouteId,idempotencyKey:payload.idempotencyKey,ownerResultRef:payload.ownerResultRef,normalizedStatus:payload.normalizedStatus,outcome:payload.outcome,baseOwnerGeneration:payload.baseOwnerGeneration,baseCacheGeneration:payload.baseCacheGeneration,ownerGeneration:payload.ownerGeneration,cacheGeneration:payload.cacheGeneration,freshnessState:payload.freshnessState});return {mode:'browser_concept_return_requested',browser_projection_only:true,production_runtime_state:'unavailable'};}};
  /* The browser fixture keeps stable Named Plan and Project identities across scope changes. Its existing
     run panels belong to named-plan:alpha only; other selected plans cannot inherit that focused run. */
  var orch=document.getElementById('panel-orchestrator');
  var planFixtures=[{id:'named-plan:alpha',project:'project:atlas',name:'Atlas launch',phase:'Planning',run:'pcr-47'},
    {id:'named-plan:beta',project:'project:atlas',name:'Atlas launch',phase:'PRD draft',run:null},
    {id:'named-plan:gamma',project:'project:harbor',name:'Harbor migration',phase:'Planning',run:null}];
  var scopeState={scope:'plan',project:'project:atlas',plan:'named-plan:alpha'};
  function paintPlanScope(){
    if(!orch)return;var bar=orch.querySelector('#pm7-named-plan-scope'),cards=orch.querySelector('#pm7-named-plan-cards');if(!bar||!cards)return;
    var selected=planFixtures.find(function(p){return p.id===scopeState.plan;});
    var showRun=scopeState.scope==='plan'&&selected&&selected.run==='pcr-47';
    orch.dataset.namedPlanScope=scopeState.scope;
    ['scope','project','plan'].forEach(function(field){bar.querySelector('[data-plan-field="'+field+'"]').value=scopeState[field];});
    [...orch.children].forEach(function(child){if(child===bar||child===cards||child.classList.contains('orch-header'))return;child.hidden=!showRun;});
    [...orch.querySelectorAll('.orch-header > :not(.orch-title)')].forEach(function(child){child.hidden=!showRun;});
    var shown=scopeState.scope==='all'?planFixtures:scopeState.scope==='project'?planFixtures.filter(function(p){return p.project===scopeState.project;}):showRun?[]:selected?[selected]:[];
    cards.hidden=!!showRun;
    cards.innerHTML=shown.map(function(p){return '<button type="button" class="pm7-nplan-card" data-plan-select="'+p.id+'" data-project-id="'+p.project+'" data-named-plan-id="'+p.id+'"><strong>'+p.name+'</strong><span>'+p.project+' · '+p.phase+'</span><small>'+p.id+' · '+(p.run?'Focused run '+p.run:'No owner run projection attached')+'</small></button>';}).join('')+(shown.length?'':'<p class="pm7-nplan-empty">No current owner run projection for this Plan.</p>');
    bar.querySelector('[data-plan-selected-label]').textContent=selected?selected.name:'';
  }
  if(orch&&orch.querySelector('.orch-header')){
    var planStyle=document.createElement('style');planStyle.id='pm7-named-plan-scope-css';planStyle.textContent='#pm7-named-plan-scope{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--border,rgba(150,150,150,.3))}#pm7-named-plan-scope label{display:flex;align-items:center;gap:6px;font-size:12px}#pm7-named-plan-scope select,#pm7-named-plan-scope button{font:inherit;padding:5px 8px;border:1px solid var(--border,rgba(150,150,150,.4));border-radius:7px;background:var(--surface,#222);color:inherit}#pm7-named-plan-cards{padding:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;overflow:auto}#pm7-named-plan-cards[hidden]{display:none}.pm7-nplan-card{text-align:left;padding:14px;border:1px solid var(--border,rgba(150,150,150,.4));border-radius:10px;background:var(--surface,#222);color:inherit;cursor:pointer;display:flex;flex-direction:column;gap:5px}.pm7-nplan-card span,.pm7-nplan-card small,.pm7-nplan-empty{opacity:.75}';document.head.appendChild(planStyle);
    var scopeBar=document.createElement('div');scopeBar.id='pm7-named-plan-scope';scopeBar.setAttribute('data-concept-simulation-only','true');scopeBar.innerHTML='<label>Scope <select data-plan-field="scope" aria-label="Named Plan scope"><option value="all">All Active</option><option value="project">Current Project</option><option value="plan">Selected Plan</option></select></label><label>Project <select data-plan-field="project" aria-label="Current Project"><option value="project:atlas">Atlas</option><option value="project:harbor">Harbor</option></select></label><label>Plan <select data-plan-field="plan" aria-label="Selected Plan"><option value="named-plan:alpha">Atlas launch · pcr-47</option><option value="named-plan:beta">Atlas launch · PRD draft</option><option value="named-plan:gamma">Harbor migration</option></select></label><button type="button" data-plan-action="new" data-ui-action-id="ui.named_plan.create" data-command-id="cmd.named_plan.create" data-availability="handler_unavailable">New Plan · preview only</button><button type="button" data-plan-action="wizard" data-ui-action-id="ui.planning_wizard.open">PRD / Planning Wizard</button><span data-plan-selected-label></span>';
    var planCards=document.createElement('div');planCards.id='pm7-named-plan-cards';planCards.setAttribute('aria-label','Named Plans in selected scope');orch.querySelector('.orch-header').after(scopeBar,planCards);
    scopeBar.addEventListener('change',function(e){var field=e.target.dataset.planField;if(!field)return;scopeState[field]=e.target.value;if(field==='plan'){var p=planFixtures.find(function(row){return row.id===scopeState.plan;});if(p)scopeState.project=p.project;}paintPlanScope();});
    scopeBar.addEventListener('click',function(e){var action=e.target.dataset.planAction;if(action==='wizard'){var tab=document.getElementById('tab-wizard');if(tab)tab.click();}else if(action==='new'){scopeBar.querySelector('[data-plan-selected-label]').textContent='Fixture preview only · native Plan creation unavailable';}});
    planCards.addEventListener('click',function(e){var card=e.target.closest('[data-plan-select]');if(!card)return;scopeState.plan=card.dataset.planSelect;scopeState.project=card.dataset.projectId;scopeState.scope='plan';paintPlanScope();});
    paintPlanScope();window.PM7_NAMED_PLAN_SCOPE={state:function(){return Object.assign({},scopeState);},fixtures:function(){return planFixtures.map(function(p){return Object.assign({},p);});},select:function(scope,project,plan){scopeState={scope:scope,project:project,plan:plan};paintPlanScope();}};
  }
  shellWidth=shell?shell.clientWidth:0;panelWidth=panel?panel.clientWidth:0;chatWidth=chat?chat.clientWidth:0;resizerWidth=resizer?(resizer.clientWidth||5):5;
  observeWidth(shell,function(width){shellWidth=width;});
  observeWidth(panel,function(width){panelWidth=width;});
  observeWidth(panel&&panel.parentElement,function(width){pagesWidth=width;});
  observeWidth(chat,function(width){if(width>0)chatWidth=width;});
  observeWidth(resizer,function(width){if(width>0)resizerWidth=width;});
  if(panel&&typeof MutationObserver==='function')new MutationObserver(syncHost).observe(panel,{attributes:true,attributeFilter:['class']});
  if(chat&&typeof MutationObserver==='function')new MutationObserver(syncHost).observe(chat,{attributes:true,attributeFilter:['class','style']});
  syncHost();
})();
