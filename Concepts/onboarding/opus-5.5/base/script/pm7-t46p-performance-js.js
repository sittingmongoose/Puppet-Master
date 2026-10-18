
/* PM7 T46P: deterministic full-thread performance projection */
(function(){
  'use strict';
  if(window.PM7_PERFORMANCE_TEST_API)return;
  var WORK_ID='concept-work:full-thread-performance:001';
  var CURRENT_GENERATION=7;
  var IDENTITY={operation_id:WORK_ID,session_id:'concept-session:001',stream_id:'concept-stream:001',upload_id:'concept-upload:001'};
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function settingsInventorySnapshot(){
    var source=document.getElementById('pm7-settings-data'),model=null;
    try{model=source?JSON.parse(source.textContent):null;}catch(error){model=null;}
    var viewport=document.querySelector('[data-all-settings-viewport]');
    return {model_backed:!!(model&&Array.isArray(model.settings)),total:model&&Array.isArray(model.settings)?model.settings.length:0,
      mounted:document.querySelectorAll('[data-all-setting-id]').length,virtualized:!!viewport,owner:'T44 All Settings'};
  }
  function probeDedupStaleGeneration(){
    var active=Object.create(null),serial=0;
    function admit(request){
      if(request.generation!==CURRENT_GENERATION)return {status:'stale-generation-rejected',operation_id:null};
      if(active[request.key])return {status:'joined',operation_id:active[request.key]};
      var operationId=WORK_ID+':dedup-'+(++serial);active[request.key]=operationId;return {status:'created',operation_id:operationId};
    }
    var first=admit({key:'exact-host-environment:fixture',generation:CURRENT_GENERATION});
    var duplicate=admit({key:'exact-host-environment:fixture',generation:CURRENT_GENERATION});
    var stale=admit({key:'exact-host-environment:fixture',generation:CURRENT_GENERATION-1});
    return {simulation_only:true,coalesced:first.operation_id===duplicate.operation_id&&duplicate.status==='joined',
      stale_generation_rejected:stale.status==='stale-generation-rejected',operation_id_preserved:first.operation_id===duplicate.operation_id,
      first:first,duplicate:duplicate,stale:stale};
  }
  function probeIdentityContinuity(requestedTransitions){
    var transitions=Array.isArray(requestedTransitions)?requestedTransitions.slice():[];
    var rows=transitions.map(function(transition,index){return {transition:transition,generation:CURRENT_GENERATION+index+1,identity:copy(IDENTITY)};});
    var keys=Object.keys(IDENTITY),preserved=keys.filter(function(key){return rows.every(function(row){return row.identity[key]===IDENTITY[key];});});
    return {simulation_only:true,requested:transitions,rows:rows,preserved:preserved,
      stale_generation_rejected:rows.length>0&&CURRENT_GENERATION<rows[rows.length-1].generation};
  }
  function probeAdmissionBeforeHydration(){
    function attempt(authAllowed,rateAllowed){
      var trace=['auth-check'],hydrationCount=0;
      if(!authAllowed)return {status:'auth-rejected',trace:trace,hydration_count:hydrationCount};
      trace.push('rate-check');
      if(!rateAllowed)return {status:'rate-rejected',trace:trace,hydration_count:hydrationCount};
      trace.push('hydrate');hydrationCount+=1;return {status:'admitted',trace:trace,hydration_count:hydrationCount};
    }
    var authRejected=attempt(false,true),rateRejected=attempt(true,false),admitted=attempt(true,true);
    return {simulation_only:true,auth_checked_before_hydration:authRejected.trace[0]==='auth-check',
      rate_checked_before_hydration:rateRejected.trace.indexOf('rate-check')<rateRejected.trace.indexOf('hydrate')||rateRejected.trace.indexOf('hydrate')===-1,
      rejected_hydration_count:authRejected.hydration_count+rateRejected.hydration_count,admitted_hydration_count:admitted.hydration_count,
      auth_rejected:authRejected,rate_rejected:rateRejected,admitted:admitted};
  }
  window.PM7_PERFORMANCE_TEST_API={schema_id:'pm.pmconcept7.full_thread_performance_simulation.v1',concept_simulation_only:true,
    production_runtime_certification:false,native_slint_certification:false,work_id:WORK_ID,current_generation:CURRENT_GENERATION,
    settingsInventorySnapshot:settingsInventorySnapshot,probeDedupStaleGeneration:probeDedupStaleGeneration,
    probeIdentityContinuity:probeIdentityContinuity,probeAdmissionBeforeHydration:probeAdmissionBeforeHydration,
    snapshot:function(){return {simulation_only:true,identity:copy(IDENTITY),settings_inventory:settingsInventorySnapshot()};}};
})();
