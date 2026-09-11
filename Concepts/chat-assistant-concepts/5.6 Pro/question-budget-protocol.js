/* One concept QuestionItem budget owner. In-memory records, not native durability.
 * Plan versions and participants never own counters. Rendering is a pure read.
 * Legacy gallery booleans remain labelled fixture inputs; Deep Plan passes
 * validated source-bearing resolutions through resolve(), never those shortcuts.
 */
(function(root){
 'use strict';
 const BASE=Object.freeze({quick:3,standard:6,thorough:8,deep_thorough:10,deep_exhaustive:15,brainstorm:20});
 const LABEL=Object.freeze({quick:'Plan · Quick',standard:'Plan · Standard',thorough:'Plan · Thorough',deep_thorough:'Deep Plan · Thorough',deep_exhaustive:'Deep Plan · Exhaustive',brainstorm:'Deep Plan · BrainStorm'});
 const copy=x=>JSON.parse(JSON.stringify(x));
 const error=e=>({ok:false,error:e,charged:false});
 const id=s=>typeof s==='string'&&s.length>0&&s.length<=240&&!['__proto__','constructor','prototype'].includes(s);
 function policy(x){
  if(!x)return {policy_version:2,plan_limits:{quick:3,standard:6,thorough:8},deep_plan_limits:{thorough:10,exhaustive:15,brainstorm:20},grill_me_extension:25};
  if(x.policy_version!==2||!x.plan_limits||!x.deep_plan_limits||Object.keys(x.plan_limits).sort().join()!=='quick,standard,thorough'||Object.keys(x.deep_plan_limits).sort().join()!=='brainstorm,exhaustive,thorough')return null;
  if([...Object.values(x.plan_limits),...Object.values(x.deep_plan_limits)].some(n=>!Number.isInteger(n)||n<0||n>100)||!Number.isInteger(x.grill_me_extension)||x.grill_me_extension<0||x.grill_me_extension>100)return null;
  return copy(x);
 }
 function factory(getStore){
  const store=()=>typeof getStore==='function'?getStore():getStore;
  const get=k=>Object.hasOwn(store().runs,k)?store().runs[k]:null;
  function ensure(k,strategy,grill,p){
   if(!id(k)||!Object.hasOwn(BASE,strategy)||(grill!==undefined&&typeof grill!=='boolean'))return error('invalid_question_budget_binding');
   if(get(k))return get(k).strategy===strategy?{ok:true,reused:true,run:get(k)}:error('strategy_frozen');
   const pol=policy(p);if(!pol)return error('invalid_question_budget_policy');
   store().runs[k]={workflow_id:k,strategy,grill_me_enabled:!!grill,policy:pol,asked:{},order:[],resolutions:{},reused:0,research:0};
   return {ok:true,run:get(k)};
  }
  function projection(k){
   const r=get(k);if(!r)return null;
   const p=r.policy||policy(),base=(r.strategy==='brainstorm'?p.deep_plan_limits.brainstorm:r.strategy.startsWith('deep_')?p.deep_plan_limits[r.strategy.slice(5)]:p.plan_limits[r.strategy]),eff=base+(r.grill_me_enabled?p.grill_me_extension:0),asked=Object.keys(r.asked).length,resolutions=Object.values(r.resolutions||{});
   return {schema:'pm.assistant_plan.question_budget_projection.v1',workflow_id:k,strategy:r.strategy,strategy_label:LABEL[r.strategy],planning_kind:r.strategy.startsWith('deep')||r.strategy==='brainstorm'?'deep_plan':'plan',policy_version:p.policy_version,base_limit:base,grill_me_enabled:r.grill_me_enabled,grill_me_extension:p.grill_me_extension,effective_limit:eff,questions_asked:asked,questions_remaining:Math.max(0,eff-asked),reused_answer_count:resolutions.filter(x=>x.kind==='reused_answer').length,research_resolved_count:resolutions.filter(x=>x.kind==='research_resolved').length,exhausted:asked>=eff};
  }
  function admitMany(k,items){
   const r=get(k);if(!r)return error('unknown_run');
   if(!Array.isArray(items)||!items.length||items.some(x=>!x||!id(x.question_item_id)))return error('invalid_question_item');
   const unique=new Map();
   for(const x of items){
    const old=unique.get(x.question_item_id)||(Object.hasOwn(r.asked,x.question_item_id)?r.asked[x.question_item_id]:null);
    if(old&&typeof old==='object'&&((old.semantic_key&&x.semantic_key&&old.semantic_key!==x.semantic_key)||(old.prompt&&x.prompt&&old.prompt!==x.prompt)))return error('question_identity_conflict');
    unique.set(x.question_item_id,x);
   }
   const fresh=[...unique.values()].filter(x=>!Object.hasOwn(r.asked,x.question_item_id)&&!Object.hasOwn(r.resolutions||{},x.question_item_id));
   if(fresh.length>projection(k).questions_remaining)return {...error('question_budget_exhausted'),run_failed:false,projection:projection(k)};
   for(const x of fresh){r.asked[x.question_item_id]=copy(x);r.order.push(x.question_item_id);}
   return {ok:true,charged:!!fresh.length,charged_count:fresh.length,reason:fresh.length?'presented':'already_charged',projection:projection(k)};
  }
  function resolve(k,x){
   const r=get(k);if(!r)return error('unknown_run');
   if(!x||!id(x.question_item_id)||!['reused_answer','research_resolved'].includes(x.kind)||!id(x.source_ref)||!(typeof x.source_binding==='string'&&x.source_binding.length>0&&x.source_binding.length<=100000)||typeof x.answer!=='string'||!x.answer.trim())return error('resolution_evidence_required');
   r.resolutions=r.resolutions||{};
   const old=Object.hasOwn(r.resolutions,x.question_item_id)?r.resolutions[x.question_item_id]:null;
   if(old)return JSON.stringify(old)===JSON.stringify(x)?{ok:true,reused:true,charged:false,projection:projection(k)}:error('resolution_identity_conflict');
   if((Object.hasOwn(r.asked,x.question_item_id)?r.asked[x.question_item_id]:null))return error('already_presented_not_free_resolution');
   r.resolutions[x.question_item_id]=copy(x);if(x.kind==='reused_answer')r.reused++;else r.research++;
   return {ok:true,charged:false,reason:x.kind,projection:projection(k)};
  }
  function admit(k,x){
   if(x?.resolved_from_prior_answer||x?.resolvable_by_research){
    return resolve(k,{question_item_id:x.question_item_id,kind:x.resolved_from_prior_answer?'reused_answer':'research_resolved',source_ref:'fixture:legacy-counter-control',source_binding:'fixture-unverified',answer:'Legacy labelled counter fixture; not research or reuse proof.'});
   }
   return admitMany(k,[x]);
  }
  function setGrill(k,on){const r=get(k);if(!r||typeof on!=='boolean')return null;r.grill_me_enabled=on;return projection(k);}
  return {ensure,projection,admitMany,admit,resolve,setGrill,get};
 }
 root.PM56_QUESTION_BUDGET={factory,defaults:()=>policy(),bases:()=>({...BASE}),labels:()=>({...LABEL}),validatePolicy:policy};
})(typeof window==='undefined'?globalThis:window);
