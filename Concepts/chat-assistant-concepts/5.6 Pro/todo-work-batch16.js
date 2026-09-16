/* Batch 16 bounded local work adapters. No private To-Do or progress store.
 * The records below own only input/output artifacts and computation evidence.
 * Plan, Goal, scheduling, transitions and progress use their existing owners. */
(function(){
'use strict';
const E=PM56_EXT,D=PM56_DATA,R=PM56_RUNTIME,T=PM56_TODOS,P=PM56_PLANS,G=PM56_GOAL,TX=PM56_TX,W=PM56_ORDER_EXPORT;
const store=R.todoGraphWork={records:{},sessions:{},seq:0},clone=x=>JSON.parse(JSON.stringify(x)),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),now=()=>new Date().toISOString();
const art=id=>D.artifacts.find(a=>a.id===id),digest=W.digest;
const STEPS=[{id:'outputs',title:'Prepare both deliverables',outcome:'',deps:[]},{id:'csv',parent:'outputs',parallel_group_id:'outputs',title:'Write the customer CSV with exact integer-cent totals',outcome:'Every source order appears once in a correctly quoted CSV with exact line totals.',deps:[]},{id:'summary',parent:'outputs',parallel_group_id:'outputs',title:'Compute the independent customer summary',outcome:'The summary groups the unchanged source by customer with exact order counts and integer-cent totals.',deps:[]},{id:'validate',title:'Check both files against the unchanged source',outcome:'An independent CSV parse and customer-total comparison match all source orders and preserve the input bytes.',deps:['csv','summary']}];
const FLOWS={parallel:{title:'Parallel outputs, honest progress',description:'Independent CSV and summary work; separate validation; immutable Plan exports.'},restructure:{title:'Refine a list without losing work',description:'Pause the Plan-as-Goal, rebind one live item, then resume its exact attempt.'},large:{title:'Every item, even number 5,000',description:'A 5,050-row hierarchy fixture. Search, collapse and open one actual bounded lookup.'}};
function artifact(id,name,content,t){return {id,name,title:name,kind:'code',type:'text',extension:name.split('.').pop(),projectId:t.projectId||'pm',threadId:t.id,version:1,status:'ready',updated:now(),content,summary:'Computed local artifact; session memory.',provenance:'Batch 16 bounded local computation; no model or provider execution.'};}
function get(ref){return store.records[ref];}
function owner(r){return r?.planId?P.get(r.planId):null;}
function source(r){const a=art(r.source.id);if(!a||a.version!==r.source.version||digest(a.content)!==r.source.hash)throw Error('source_changed_or_unavailable');if(!same(G.scope(r.threadId),r.scope))throw Error('work_scope_changed');return JSON.parse(a.content);}
function itemStage(r,t,b){return r.steps.find(s=>(t.plan_step_ids||[]).includes(s.id)||t.todo_id===r.todoMap?.[s.id]||b&&r.originalTodoMap?.[s.id]&&b.todo_id===r.originalTodoMap[s.id]);}
function items(r){const list=T.get(r.threadId)||[];return (owner(r)?.requiredTodoIds||r.todoIds||[]).map(id=>list.find(t=>t.todo_id===id)).filter(Boolean);}
function leaves(r){return items(r).filter(t=>!items(r).some(child=>child.parent_todo_id===t.todo_id));}
function planIdentity(r,t){const p=owner(r);if(!p)return r.kind==='large';return !!p.approved&&p.approved.plan_run_id===t.run_id&&p.version===t.plan_version&&P.hash(p.plan_id)===t.plan_hash&&p.status==='building';}
function normalized(r){const rows=source(r).orders;if(!Array.isArray(rows)||!rows.length)throw Error('invalid_orders');const ids=new Set();return rows.map(o=>{if(typeof o.id!=='string'||ids.has(o.id)||typeof o.customer!=='string'||!Number.isSafeInteger(o.quantity)||o.quantity<1||!/^\d+$/.test(o.unit_cents))throw Error('invalid_order');ids.add(o.id);return {...o,total_cents:(BigInt(o.unit_cents)*BigInt(o.quantity)).toString()};});}
function computed(r,stage){
 if(r.kind==='brainstorm_worker')return computedSearch(r,stage);
 if(r.kind==='room_search')return computedRoom(r,stage);
 if(r.kind==='account'){
  const x=source(r),key=x=>JSON.stringify([x.provider,x.account]),original=x.models.find(m=>key(m)===key(x.selected));if(!original)throw Error('selected_account_missing');
  if(stage==='route')return JSON.stringify({selection_key:key(x.selected),rows:x.models.map(m=>({key:key(m),model_id:m.id})),selected_model_id:original.id},null,2);
  const route=art(r.outputs.route);if(!route||route.content!==computed(r,'route'))throw Error('account_selection_output_missing');
  const permutations=[x.models.slice().reverse(),x.models.slice(1).concat(x.models[0]),x.models.slice().sort((a,b)=>a.account.localeCompare(b.account))];
  const checks=permutations.map(rows=>{const selected=rows.filter(m=>m.provider===x.selected.provider&&m.account===x.selected.account);return selected.length===1&&selected[0].id===original.id;});if(checks.some(x=>!x))throw Error('account_selection_changed');
  return JSON.stringify({checks,method:'Compare provider/account tuples after refresh, rotation and favorites-order permutation; model id alone is not the key.',source_hash:r.source.hash,unchanged_source:true},null,2);
 }
 if(r.kind==='large'){
  source(r);const list=T.get(r.threadId)||[],id=r.todoIds[0],matches=list.filter(t=>t.todo_id===id);if(matches.length!==1||list.length!==5050)throw Error('catalog_identity_lost');return JSON.stringify({todo_id:id,total_items:list.length,matched:matches[0].title,index:list.findIndex(t=>t.todo_id===id),method:'Exact stable identity lookup in the complete current hierarchy; other rows did not execute.'},null,2);
 }
 const rows=normalized(r);
 if(stage==='csv')return W.formats.csv(rows);
 if(stage==='summary'){
  const groups=new Map();for(const o of rows){const g=groups.get(o.customer)||{customer:o.customer,orders:0,total_cents:0n};g.orders++;g.total_cents+=BigInt(o.total_cents);groups.set(o.customer,g);}
  return JSON.stringify(Array.from(groups.values()).map(g=>({...g,total_cents:g.total_cents.toString()})),null,2);
 }
 const csv=art(r.outputs.csv),sum=art(r.outputs.summary);if(!csv||!sum)throw Error('required_outputs_missing');
 const parsed=W.parseCSV(csv.content),expected=[['order_id','customer','quantity','unit_cents','total_cents'],...rows.map(o=>[o.id,o.customer,String(o.quantity),o.unit_cents,o.total_cents])];if(!same(parsed,expected))throw Error('csv_round_trip_failed');
 const summary=JSON.parse(sum.content),customers=[...new Set(rows.map(o=>o.customer))];if(summary.length!==customers.length)throw Error('summary_cardinality_failed');
 for(const customer of customers){const subset=rows.filter(o=>o.customer===customer),g=summary.find(g=>g.customer===customer);if(!g||g.orders!==subset.length||g.total_cents!==subset.reduce((n,o)=>n+BigInt(o.quantity)*BigInt(o.unit_cents),0n).toString())throw Error('independent_summary_check_failed');}
 return JSON.stringify({source_id:r.source.id,source_version:r.source.version,source_hash:r.source.hash,source_unchanged:true,csv_id:csv.id,summary_id:sum.id,csv_hash:digest(csv.content),summary_hash:digest(sum.content),rows:rows.length,customers:customers.length,total_cents:rows.reduce((n,o)=>n+BigInt(o.total_cents),0n).toString(),checks:['CSV state-machine parse equals source rows','Independent per-customer aggregation equals summary','Source bytes unchanged']},null,2);
}
function validate(ref,t,evidenceRef,b){
 const r=get(ref),a=art(evidenceRef);if(!r||!a||a.threadId!==r.threadId||a.projectId!==r.scope.projectId)return {ok:false,error:'evidence_scope_mismatch'};
 try{const e=JSON.parse(a.content),st=itemStage(r,t,b),output=art(e.output_id);source(r);if(!st||!output||r.evidence[st.id]!==a.id||r.outputs[st.id]!==output.id||e.binding_id!==b.binding_id||e.admitted_todo_id!==b.todo_id||e.work_id!==b.work_id||e.attempt_id!==b.attempt_id||e.expected_outcome!==t.expected_outcome||e.plan_version!==(t.plan_version??null)||e.plan_hash!==(t.plan_hash??null)||e.run_id!==t.run_id||e.source_hash!==r.source.hash||output.threadId!==r.threadId||output.projectId!==r.scope.projectId||digest(output.content)!==e.output_hash||output.content!==computed(r,st.id))return {ok:false,error:'outcome_not_proved'};return {ok:true};}catch(e){return {ok:false,error:e.message};}
}
function inspect(ref,p){
 const r=get(ref);if(!r)return {eligible:false,complete:false,fingerprint:'missing',reason:'Work owner unavailable'};
 let error=null;try{source(r);}catch(e){error=e.message;}
 const mine=leaves(r),expected=(p?.requiredTodoIds||r.todoIds||[]),summary=T.outcomeSummary(r.threadId,expected),ready=mine.filter(t=>t.status==='pending'&&T.runnable(r.threadId,t.todo_id)),live=mine.filter(t=>t.status==='in_progress'),requiredOutputs=r.steps.filter(s=>!r.steps.some(t=>t.parent===s.id)).length;
 const complete=!error&&summary.ok&&Object.keys(r.outputs).length===requiredOutputs;
 return {eligible:!error&&!r.wait&&(!!ready.length||!!live.length),complete,verified:complete,requiredResolved:summary.ok,evidenceRefs:summary.evidenceRefs||[],nextAttemptRef:ready[0]?.todo_id||live[0]?.todo_id||null,reason:error||r.wait?.reason||null,waitKind:r.wait?.kind||null,fingerprint:JSON.stringify({source:art(r.source.id),scope:G.scope(r.threadId),items:mine,bindings:T.bindings(r.threadId),outputs:Object.values(r.outputs).map(art),evidence:Object.values(r.evidence).map(art),wait:r.wait})};
}
function admission(r,t){const st=itemStage(r,t),id=r.id+':'+st.id+':attempt1';return {...T.capture(r.threadId,t.todo_id),to_status:'in_progress',cause_kind:'work_admitted',cause_ref:r.id+':admit:'+st.id,work_binding:id,binding:{binding_id:id,todo_id:t.todo_id,work_id:id,attempt_id:'attempt1',work_kind:['validate','verify','catalog'].includes(st.id)?'validation':'artifact_generation',expected_outcome:t.expected_outcome}};}
function advance(ref,p,targetId){
 const r=get(ref);if(!r)return {ok:false,error:'work_missing'};const plan=owner(r);if(plan&&(plan.status!=='building'||plan.attention))return {ok:false,error:'plan_paused_or_not_building'};const check=inspect(ref,p);if(!check.eligible)return {ok:false,error:check.reason||'work_not_eligible'};
 if(r.kind==='brainstorm_worker'&&r.workerError)return {ok:false,error:r.workerError};
 const mine=leaves(r),ready=mine.filter(t=>t.status==='pending'&&T.runnable(r.threadId,t.todo_id)&&(!targetId||t.todo_id===targetId));
 if(ready.length)return TX.run(()=>{const events=ready.map(t=>admission(r,t)),out=T.applyTransitions(r.threadId,events);if(!out.ok)return out;for(const e of events)TX.append(r,'attempts',{binding_id:e.work_binding,work_id:e.binding.work_id,attempt_id:e.binding.attempt_id,todo_id:e.todo_id,admitted_at:now()});return {ok:true,admitted:events.length};});
 const candidates=mine.filter(t=>t.status==='in_progress'&&(!targetId||t.todo_id===targetId)),t=candidates.find(t=>itemStage(r,t)?.id==='summary')||candidates[0];if(!t)return {ok:false,error:'work_not_admitted'};
 if(r.kind==='room_search'&&itemStage(r,t)?.id==='verify')return dispatchRoomCheck(r,t);
 if(r.kind==='brainstorm_worker'&&itemStage(r,t)?.id==='query')return dispatchSearch(r,t);
 return TX.run(()=>{const b=T.bindingsFor(r.threadId,t.todo_id).find(b=>b.state==='running'),st=itemStage(r,t,b);if(!b||!st)return {ok:false,error:'binding_not_running'};let content;try{if(r.kind==='brainstorm_worker'&&st.id==='measure')measureSearch(r);content=computed(r,st.id);}catch(e){return {ok:false,error:e.message};}
  return finishEffect(r,t,b,st,content,T.capture(r.threadId,t.todo_id));
 });
}

function finishEffect(r,t,b,st,content,ticket){
  const ctx=E.ctx(),thread=ctx.state.threads.find(x=>x.id===r.threadId),id=r.id+':output:'+st.id,proofId=r.id+':evidence:'+st.id,name=st.id==='csv'?'customer-orders.csv':st.id==='summary'?'customer-summary.json':st.id==='validate'?'output-checks.json':r.kind==='room_search'&&st.id==='implement'?'local-search.html':st.id+'.json';
  const output=artifact(id,name,content,thread),proof=artifact(proofId,st.id+'-evidence.json',JSON.stringify({workflow_id:r.id,binding_id:b.binding_id,admitted_todo_id:b.todo_id,work_id:b.work_id,attempt_id:b.attempt_id,expected_outcome:t.expected_outcome,run_id:t.run_id,plan_version:t.plan_version??null,plan_hash:t.plan_hash??null,source_hash:r.source.hash,output_id:id,output_hash:digest(content),computed_at:now()},null,2),thread);
  TX.append(D,'artifacts',output);TX.append(D,'artifacts',proof);TX.set(r,'outputs',{...r.outputs,[st.id]:id});TX.set(r,'evidence',{...r.evidence,[st.id]:proofId});
  const out=T.applyTransition(r.threadId,{...ticket,work_binding:b.binding_id,to_status:'completed',cause_kind:'outcome_satisfied',cause_ref:proofId});if(!out.ok)return out;TX.set(r,'lastEffectAt',now());return {ok:true,output_id:id,evidence_ref:proofId,todo_id:t.todo_id};
}
const workOwner={inspect,advance,plan:ref=>{const r=get(ref);try{source(r);}catch(e){return {ok:false,error:e.message};}return {ok:true,title:'Customer deliverables',objective:r.objective,steps:clone(r.steps),sourceRefs:[{kind:'artifact',ref:r.source.id}]};}};
T.registerOutcomeOwner('b16_local',validate,{
 admit:(ref,t,b,cause)=>{const r=get(ref),st=r&&itemStage(r,t);try{source(r);}catch(e){return {ok:false,error:e.message};}return {ok:!!st&&planIdentity(r,t)&&b.binding_id===r.id+':'+st.id+':attempt1'&&b.work_id===b.binding_id&&b.attempt_id==='attempt1'&&b.expected_outcome===st.outcome&&cause===r.id+':admit:'+st.id};},
 fence:(ref,t)=>{const r=get(ref),p=owner(r);return {run_id:t.run_id,run_epoch:p?.runEpoch??t.run_epoch,...(!r||p&&(!p.approved||p.version!==t.plan_version||P.hash(p.plan_id)!==t.plan_hash||p.approved.plan_run_id!==t.run_id||p.status!=='building'&&p.status!=='completed')?{error:'work_identity_not_current'}:{})};},
 availability:ref=>{const r=get(ref),p=owner(r);return {ok:!!r&&!r.wait&&(!p||p.status==='building'&&!p.attention),reason:r?.wait?.reason||p?.attention?.reason||(p?.attention?.kind==='paused'?'Paused; resume through the Plan or Goal owner.':'Plan not running.')};},
 execute:(ref,t)=>{const r=get(ref),p=owner(r);if(p&&(p.status!=='building'||p.attention))return {ok:false,error:'plan_paused_or_not_building'};return advance(ref,p,t.todo_id);},
 open:(ref,b)=>{const r=get(ref);return r?{ok:true,title:r.kind==='large'?'Exact hierarchy lookup':'Source-bound local file work',binding:clone(b),source_ref:r.source.id,outputs:Object.values(r.outputs),evidence:Object.values(r.evidence),owner_ref:ref}:{ok:false,error:'owner_unavailable'};},
 wait:(ref,t,condition)=>({ok:same(get(ref)?.wait||null,condition)}),waitState:ref=>get(ref)?.wait||null,
 condition:(ref,t,reason,state)=>({ok:state==='blocked'?get(ref)?.block===reason:!get(ref)?.block}),
 cancel:(ref,b,receipt)=>({ok:get(ref)?.cancellations?.[b.binding_id]===receipt})
});P.registerWorkOwner('b16_local',workOwner);
function record(t,sourceArtifact,kind,steps,objective){const id='b16-work-'+(++store.seq),r={id,threadId:t.id,scope:G.scope(t.id),kind,steps:clone(steps),objective,source:{id:sourceArtifact.id,version:sourceArtifact.version,hash:digest(sourceArtifact.content)},outputs:{},evidence:{},attempts:[],todoIds:[],todoMap:{},originalTodoMap:{},planId:null,createdAt:now(),wait:null};TX.set(store.records,id,r);return r;}
function seed(ctx,flow){if(!FLOWS[flow])return;const t=clone(ctx.state.threads.find(t=>t.id==='query')),id='batch16-'+flow+'-'+(++store.seq);Object.assign(t,{id,title:FLOWS[flow].title,projectId:'concept:b16:'+store.seq,worktreeId:'concept:b16:'+store.seq,pinned:false,archived:false,status:'ready',goalId:null,messages:[]});ctx.state.threads.push(t);
 const data=flow==='large'?{kind:'hierarchy_fixture',leaf_rows:5000,groups:50}:{orders:[{id:'A-001',customer:'River, Inc.',quantity:3,unit_cents:'1999'},{id:'A-002',customer:'Ada "A" Chen',quantity:2,unit_cents:'10'},{id:'A-003',customer:'North\nSouth',quantity:7,unit_cents:'425'},{id:'A-004',customer:'München Studio',quantity:1,unit_cents:'12000'},{id:'A-005',customer:'River, Inc.',quantity:4,unit_cents:'333'}]},a=artifact(id+':source','Supplied customer orders.json',JSON.stringify(data,null,2),t);a.provenance='Supplied local exercise input, not fetched or generated by a provider.';D.artifacts.push(a);store.sessions[t.id]={flow,guide:true,sourceId:a.id,workId:null};
 Object.assign(ctx.state,{historyMode:'closed',menu:null,dialog:null,hover:null,editorTabs:[],activeEditor:null,editorRevealed:false,demoOpen:false});ctx.state.activity.open=false;ctx.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};ctx.switchThread(t.id);ctx.state.mode=flow==='large'?'Chat':'Plan';ctx.state.composer=flow==='large'?'Open the 5,000-item hierarchy fixture, and look up the final item by exact identity.':'Create a Plan to produce a customer CSV and an independent summary in parallel, then check both against the unchanged source.';ctx.renderApp();
}
function large(r){const list=[];for(let group=0;group<50;group++){const pid=r.id+':group:'+group;list.push({todo_id:pid,thread_id:r.threadId,project_id:r.scope.projectId,title:'Customer records '+(group*100+1)+'–'+((group+1)*100),display_order:group,parent_todo_id:null,depends_on:[],status:'pending'});for(let n=0;n<100;n++){const i=group*100+n+1,id=r.id+':catalog-'+String(i).padStart(5,'0');list.push({todo_id:id,thread_id:r.threadId,project_id:r.scope.projectId,parent_todo_id:pid,display_order:n,depends_on:[],title:i===5000?'Final item 5000 · exact identity lookup':'Customer record '+String(i).padStart(5,'0'),status:'pending',...(i===5000?{expected_outcome:r.steps[0].outcome,outcome_owner:'b16_local',workflow_ref:r.id,run_id:r.id,run_epoch:1}:{})});if(i===5000){TX.set(r,'todoIds',[id]);TX.set(r,'todoMap',{catalog:id});TX.set(r,'originalTodoMap',{catalog:id});}}}return T.replaceThreadList(r.threadId,{items:list},{});}
R.composer.preSendHooks.unshift((ctx,t,raw)=>{const s=store.sessions[t.id];if(!s||s.workId||R.composer.destination&&R.composer.destination.kind!=='assistant')return false;
 const out=TX.run(()=>{const a=art(s.sourceId),steps=s.flow==='large'?[{id:'catalog',title:'Look up the last item',outcome:'The complete hierarchy resolves item 5000 exactly once by stable identity.',deps:[]}]:STEPS,r=record(t,a,s.flow==='large'?'large':'parallel',steps,raw);TX.set(t,'messages',t.messages.concat({id:r.id+':request',role:'user',type:'text',body:raw}));if(s.flow==='large'){const made=large(r);if(!made.ok)return made;}else{const made=P.createFromWorkRequest({threadId:t.id,explicitRequest:true,workRef:{kind:'b16_local',ref:r.id}});if(!made.ok)return made;TX.set(r,'planId',made.planId);}
 TX.set(s,'workId',r.id);TX.set(t,'messages',t.messages.concat({id:r.id+':workspace',role:'assistant',type:'b16-work',workId:r.id}));return {ok:true};});if(!out.ok){ctx.toast('Request not admitted',out.error);return {claimed:true,preserveComposer:true};}return {claimed:true,preserveComposer:false};});
function restructure(ref,expected){const r=get(ref),p=owner(r);if(!r||!p||!same(expected,{version:p.version,hash:P.hash(p.plan_id),plan_run_id:p.approved?.plan_run_id,list_revision:T.revisionOf(r.threadId)}))return {ok:false,error:'stale_restructure_preview'};
 const list=T.get(r.threadId)||[],target=list.find(t=>t.run_id===p.approved.plan_run_id&&t.plan_step_ids.includes('csv'));if(!target||target.status!=='in_progress'||r.restructure)return {ok:false,error:'one_active_csv_required'};
 return TX.run(()=>{const newId=target.todo_id+':refined',candidate=clone(list).filter(t=>t.todo_id!==target.todo_id);for(const t of candidate)t.depends_on=t.depends_on.map(id=>id===target.todo_id?newId:id);
 candidate.push({todo_id:newId,thread_id:r.threadId,project_id:r.scope.projectId,title:'Write the CSV · retain the admitted attempt',parent_todo_id:target.parent_todo_id,depends_on:target.depends_on,parallel_group_id:target.parallel_group_id,display_order:target.display_order,expected_outcome:target.expected_outcome});
 const before=clone(T.bindings(r.threadId)),out=T.replaceThreadList(r.threadId,{items:candidate},{mode:'restructure',expected_revision:expected.list_revision,rebind:{[target.todo_id]:newId}});if(!out.ok)return out;
 const mapped=P.rebindTodoMapping(p.plan_id,expected,out.disposition);if(!mapped.ok)return mapped;
 if(!same(before,T.bindings(r.threadId)))return {ok:false,error:'binding_identity_changed'};
 TX.set(r,'restructure',{disposition:out.disposition,original_binding:before.find(b=>b.todo_id===target.todo_id),at:now(),source_hash:r.source.hash,plan_hash:P.hash(p.plan_id)});return {ok:true,disposition:out.disposition};});}
function attachAccountPlan(p,t){const a=artifact(p.plan_id+':account-source','Account refresh input.json',JSON.stringify({selected:{provider:'Example provider',account:'Personal'},models:[{provider:'Example provider',account:'Team',id:'same-model'},{provider:'Example provider',account:'Personal',id:'same-model'},{provider:'Other provider',account:'Personal',id:'other-model'}]},null,2),t);a.provenance='Supplied local account-selection test input; no live provider query.';D.artifacts.push(a);const steps=p.revisions[p.version].filter(b=>b.t==='plan_step').map(b=>({id:b.plan_step_id,title:b.title,outcome:b.text,deps:b.depends_on||[]})),r=record(t,a,'account',steps,'Keep account selection stable across refresh and reorder.');r.planId=p.plan_id;p.project_id=t.projectId||'pm';p.workRef={kind:'b16_local',ref:r.id};P.publishDocument(p.plan_id);}

// The supplied BrainStorm example executes an actual Blob Worker after explicit
// Plan Build. These measurements describe this browser, never all target devices.
const SEARCH_WORKER='self.onmessage = ({data}) => { const start=performance.now(); const ids=data.rows.filter(r=>r.label.toLowerCase().includes(data.query.trim().toLowerCase())).map(r=>r.id); self.postMessage({request_id:data.request_id,ids,worker_ms:performance.now()-start}); };';
function searchInput(r){const x=source(r);if(!Array.isArray(x.rows)||x.rows.length!==2||!x.rows.every(o=>typeof o.id==='string'&&typeof o.label==='string')||!same(x.rows.map(o=>o.id),['z','a'])||x.query!==' alpha ')throw Error('unsupported_local_search_fixture');return x;}
function computedSearch(r,stage){
 const x=searchInput(r);
 if(stage==='snapshot')return JSON.stringify({rows:x.rows,query:x.query,source_hash:r.source.hash,transport:'local message clone; no network',rank:x.rows.map(o=>o.id)},null,2);
 const trace=r.workerTrace;
 if(!trace||trace.source_hash!==r.source.hash||trace.worker_source!==SEARCH_WORKER||!same(trace.responses.map(x=>x.request_id),[1,2])||!same(trace.responses[0].ids,['z','a'])||!same(trace.responses[1].ids,['z'])||!same(trace.discarded_request_ids,[1])||!same(trace.accepted_ids,['z'])||trace.responses.some(x=>!Number.isFinite(x.worker_ms)||x.worker_ms<0||!Number.isFinite(x.round_trip_ms)||x.round_trip_ms<0))throw Error('worker_result_not_proved');
 if(stage==='query')return JSON.stringify(trace,null,2);
 const q=art(r.outputs.query),m=r.measurement;
 if(!q||q.content!==JSON.stringify(trace,null,2)||!m||m.source_hash!==r.source.hash||!same(m.fallback_ids,['z','a'])||m.local_samples_ms.length!==5||m.local_samples_ms.some(x=>!Number.isFinite(x)||x<0)||m.worker_report_hash!==digest(q.content))throw Error('search_measurement_not_proved');
 return JSON.stringify(m,null,2);
}
function measureSearch(r){
 const x=searchInput(r),samples=[];let fallback;
 for(let n=0;n<5;n++){const start=performance.now();fallback=x.rows.filter(row=>row.label.toLowerCase().includes(x.query.trim().toLowerCase())).map(row=>row.id);samples.push(performance.now()-start);}
 TX.set(r,'measurement',{source_hash:r.source.hash,worker_report_hash:digest(art(r.outputs.query).content),local_samples_ms:samples,fallback_ids:fallback,rollback:'Disable the worker and use the local filter; ranking and padded query checked again.',device:navigator.userAgent,logical_processors:navigator.hardwareConcurrency,scope:'This browser session only. Two-row correctness fixture, not a representative performance benchmark or cross-device certification.',conclusion:'No speed improvement is claimed; wider target-device measurements remain outside this local concept proof.'});
}
function dispatchSearch(r,t){
 if(r.pendingWorker)return {ok:true,pending:true};
 const p=owner(r),b=T.bindingsFor(r.threadId,t.todo_id).find(b=>b.state==='running'),ticket=T.capture(r.threadId,t.todo_id);if(!b||p?.attention)return {ok:false,error:'worker_not_eligible'};
 let input;try{input=searchInput(r);}catch(e){return {ok:false,error:e.message};}
 const request={ticket,started:performance.now(),source_hash:r.source.hash},url=URL.createObjectURL(new Blob([SEARCH_WORKER],{type:'text/javascript'}));let worker;
 try{worker=new Worker(url);}catch(e){URL.revokeObjectURL(url);return {ok:false,error:'worker_unavailable:'+e.message};}URL.revokeObjectURL(url);r.pendingWorker=request;
 const trace={source_hash:r.source.hash,worker_source:SEARCH_WORKER,device:navigator.userAgent,requests:[{request_id:1,query:input.query},{request_id:2,query:'Zeta'}],responses:[],discarded_request_ids:[],accepted_ids:[],latest_request_id:2};
 const close=()=>{worker.terminate();if(r.pendingWorker===request)r.pendingWorker=null;};
 worker.onerror=e=>{close();r.workerError='worker_error:'+e.message;};
 worker.onmessage=({data})=>{
  if(r.pendingWorker!==request)return worker.terminate();
  if(!same(ticket,T.capture(r.threadId,t.todo_id))||p.status!=='building'||p.attention){close();r.rejectedCallbacks=(r.rejectedCallbacks||[]).concat({ticket,reason:'stale_worker_callback',at:now()});return;}
  trace.responses.push({...data,round_trip_ms:performance.now()-request.started});
  if(data.request_id!==trace.latest_request_id)trace.discarded_request_ids.push(data.request_id);else trace.accepted_ids=data.ids;
  if(trace.responses.length!==2)return;
  close();const out=TX.run(()=>{TX.set(r,'workerTrace',clone(trace));const content=computedSearch(r,'query');return finishEffect(r,t,b,itemStage(r,t,b),content,ticket);});
  if(!out.ok)r.workerError=out.error;E.ctx().renderApp();
 };
 for(const q of trace.requests)worker.postMessage({...q,rows:input.rows});return {ok:true,pending:true};
}
function attachBrainstormPlan(p,t,origin){
 const input=origin?.brainstorm?.input?.localQueryFixture;if(!input||!same(Object.keys(input).sort(),['query','rows']))return;
 const blocks=p.revisions[p.version].filter(b=>b.t==='plan_step');if(!same(blocks.map(b=>b.plan_step_id),['snapshot','query','measure']))return;
 const a=artifact(p.plan_id+':local-search-input','Supplied local search input.json',JSON.stringify(input,null,2),t);a.provenance='Exact typed local input frozen by the supplied BrainStorm example. No code is evaluated from prose.';D.artifacts.push(a);
 const steps=blocks.map(b=>({id:b.plan_step_id,title:b.title,outcome:b.text,deps:b.depends_on||[]})),r=record(t,a,'brainstorm_worker',steps,origin.brainstorm.input.objective);r.planId=p.plan_id;p.project_id=t.projectId||'pm';p.workRef={kind:'b16_local',ref:r.id};
}

// A second bounded adapter for the supplied Chat Room Search-button example.
// It creates an executable standalone HTML result, then drives its real DOM
// handlers in a local frame. Arbitrary promoted conclusions have no executor.
const ROOM_HTML='<!doctype html><html lang="en"><meta charset="utf-8"><title>Local search entry</title><body><label>Search <input id="query" type="search"></label><button id="search" type="button">Search</button><label><input id="shortcuts" type="checkbox">Enable / shortcut</label><output id="result"></output><script>const query=document.getElementById("query"),button=document.getElementById("search"),shortcut=document.getElementById("shortcuts");button.onclick=()=>{query.focus();document.getElementById("result").textContent="Search requested: "+query.value;};document.addEventListener("keydown",e=>{if(e.key==="/"&&shortcut.checked&&!e.target.closest("input,textarea,select,[contenteditable]")){e.preventDefault();query.focus();}});<\/script></body></html>';
function computedRoom(r,stage){
 const input=source(r);if(input.topic!=='Make search easier to reach'||!input.conclusion.includes('Search'))throw Error('unsupported_room_conclusion');
 if(stage==='implement')return ROOM_HTML;
 const a=art(r.outputs.implement),v=r.roomCheck;if(!a||a.content!==ROOM_HTML||!v||v.source_hash!==r.source.hash||v.output_hash!==digest(a.content)||v.checks.length!==6||v.checks.some(x=>x.pass!==true))throw Error('search_ui_not_proved');return JSON.stringify(v,null,2);
}
function dispatchRoomCheck(r,t){
 if(r.pendingFrame)return {ok:true,pending:true};
 const p=owner(r),b=T.bindingsFor(r.threadId,t.todo_id).find(b=>b.state==='running'),ticket=T.capture(r.threadId,t.todo_id);if(!b||p.attention)return {ok:false,error:'check_not_eligible'};
 const output=art(r.outputs.implement);if(!output||output.content!==ROOM_HTML)return {ok:false,error:'search_output_missing'};
 const frame=document.createElement('iframe'),pending={ticket};r.pendingFrame=pending;frame.setAttribute('sandbox','allow-scripts allow-same-origin');frame.title='Bounded local search output check';frame.style.cssText='position:fixed;left:-2000px;width:400px;height:240px;visibility:hidden';
 frame.onload=()=>{
  const close=()=>{frame.remove();if(r.pendingFrame===pending)r.pendingFrame=null;};
  if(r.pendingFrame!==pending||!same(ticket,T.capture(r.threadId,t.todo_id))||p.status!=='building'||p.attention){close();r.rejectedCallbacks=(r.rejectedCallbacks||[]).concat({ticket,reason:'stale_frame_callback',at:now()});return;}
  try{
   const d=frame.contentDocument,w=frame.contentWindow,button=d.getElementById('search'),query=d.getElementById('query'),toggle=d.getElementById('shortcuts'),checks=[],check=(name,pass)=>checks.push({name,pass:!!pass});
   check('Visible Search button remains in the output',button.textContent==='Search'&&button.getBoundingClientRect().width>0);query.value='alpha';button.click();check('Actual Search handler focuses input and returns query',d.activeElement===query&&d.getElementById('result').textContent==='Search requested: alpha');
   query.blur();toggle.checked=false;const off=new w.KeyboardEvent('keydown',{key:'/',bubbles:true,cancelable:true});d.body.dispatchEvent(off);check('Shortcut disabled by default does not focus input',d.activeElement!==query&&!off.defaultPrevented);
   toggle.checked=true;const on=new w.KeyboardEvent('keydown',{key:'/',bubbles:true,cancelable:true});d.body.dispatchEvent(on);check('Opted-in shortcut uses the actual handler',d.activeElement===query&&on.defaultPrevented);
   const editing=new w.KeyboardEvent('keydown',{key:'/',bubbles:true,cancelable:true});query.dispatchEvent(editing);check('Slash stays literal in editable input',!editing.defaultPrevented);
   toggle.checked=false;button.click();check('Disabling shortcut preserves the visible Search route',d.activeElement===query&&button.isConnected);
   const result={source_hash:r.source.hash,output_hash:digest(output.content),checks,scope:'Actual DOM handlers in a local frame; not a deployed project, provider run, native UI or persistent settings proof.'};close();
   const out=TX.run(()=>{TX.set(r,'roomCheck',result);const content=computedRoom(r,'verify');return finishEffect(r,t,b,itemStage(r,t,b),content,ticket);});if(!out.ok)r.workerError=out.error;E.ctx().renderApp();
  }catch(e){close();r.workerError='frame_check_failed:'+e.message;}
 };
 frame.srcdoc=ROOM_HTML;document.body.appendChild(frame);return {ok:true,pending:true};
}
function attachRoomPlan(p,t,origin,message){
 if(origin?.chatRoom?.input?.topic!=='Make search easier to reach'||!message?.body.includes('Search'))return;
 const blocks=p.revisions[p.version].filter(b=>b.t==='plan_step');if(!same(blocks.map(b=>b.plan_step_id),['implement','verify']))return;
 const a=artifact(p.plan_id+':source','Selected Search conclusion.json',JSON.stringify({topic:origin.chatRoom.input.topic,conclusion:message.body,message_id:message.id,run_id:origin.id,discussion:origin.messages.map(m=>({id:m.id,body:m.body}))},null,2),t);a.provenance='Exact selected conclusion and retained discussion from the supplied Chat Room example.';D.artifacts.push(a);
 const steps=blocks.map(b=>({id:b.plan_step_id,title:b.title,outcome:b.text,deps:b.depends_on||[]})),r=record(t,a,'room_search',steps,message.body);r.planId=p.plan_id;p.project_id=t.projectId||'pm';p.workRef={kind:'b16_local',ref:r.id};
}
const btn=(action,label,r,extra='')=>'<button class="soft-button" data-action="'+action+'"'+(r?' data-work="'+r.id+'"':'')+' '+extra+'>'+E.ctx().esc(label)+'</button>';
function visual(r){const p=owner(r),ts=leaves(r),i=ts.findIndex(t=>t.status==='in_progress'),done=ts.filter(t=>t.status==='completed').length,complete=inspect(r.id,p).complete;return {ownerProjection:true,statusLabel:complete?'Completed':p?.status==='canceled'?'Canceled':p?.attention?.kind==='paused'?'Paused':r.wait?'Waiting':'Working',workId:r.id,runId:r.id,steps:r.steps.filter(s=>!r.steps.some(x=>x.parent===s.id)).map((s,n)=>({id:'b16-'+s.id,uid:r.id+':'+s.id,kind:s.id==='validate'?'testing':'file',label:s.title,icon:'file',verb:s.title,detail:s.outcome,startAt:n*2,dur:2,rows:[{at:0,text:ts.find(t=>itemStage(r,t)?.id===s.id)?.status||'pending'}],evidence:r.evidence[s.id]?[r.evidence[s.id]]:[],stat:ts.find(t=>itemStage(r,t)?.id===s.id)?.status||'pending'})),step:Math.max(0,i>=0?i:Math.min(done,2)),clock:done*2,running:p?.status==='building'&&!p.attention,completed:complete,expanded:false,elapsed:r.attempts.length?Math.max(0,Math.floor((Date.now()-Date.parse(r.attempts[0].admitted_at))/1000)):0,started:!!p?.approved};}
function workspace(ctx,r){if(!r)return '<p>Work unavailable.</p>';const p=owner(r);return '<article class="b16-workspace"><header><small>LOCAL FILE WORK · SESSION MEMORY</small><h1>'+ (r.kind==='large'?'The complete hierarchy':'Two outputs. One source.')+'</h1><p>'+(r.kind==='large'?'5,050 preserved items; only the final identity lookup is executable. The other 4,999 leaves are rendering fixtures, not completed jobs.':'CSV and customer summary can be admitted together. The later-listed summary may finish first. An independent check is its own To-Do.')+'</p></header><div class="b16-actions">'+btn('b16-source','Open unchanged source',r)+btn('b16-todos','Open To-Dos',r)+(p?btn('b16-plan','Open Plan',r):'')+'</div><div class="b16-output-grid">'+r.steps.filter(s=>!r.steps.some(t=>t.parent===s.id)).map(s=>'<section><h2>'+ctx.esc(s.title)+'</h2><p>'+ctx.esc(s.outcome)+'</p>'+(r.outputs[s.id]?'<strong>'+ctx.esc(art(r.outputs[s.id]).name)+'</strong><div class="b16-actions">'+btn('b16-artifact','Open output',r,'data-artifact="'+r.outputs[s.id]+'"')+btn('b16-download','Download',r,'data-artifact="'+r.outputs[s.id]+'"')+'</div>':'<small>Not produced yet.</small>')+'</section>').join('')+'</div>'+(p?'<section class="b16-restructure"><h2>Refine current work</h2><p>Rebind the active CSV item to a clearer list entry. Preserve the admitted work, attempt, outcome, Plan bytes and dependency edges.</p>'+btn('b16-preview-restructure','Preview list refinement',r)+(r.preview?'<div class="b16-preview"><p>The CSV work will retain its exact binding. Other work stays in place. No Plan revision is created.</p>'+btn('b16-apply-restructure','Apply refinement',r)+btn('b16-cancel-preview','Cancel',r)+'</div>':'')+(r.restructure?'<p role="status">List refined. Exact work bindings and approved Plan bytes preserved.</p>':'')+(r.lastError?'<p role="status">'+ctx.esc(r.lastError)+'</p>':'')+'</section>':'')+'<details data-k="b16-evidence:'+r.id+'"><summary>Source, attempts and evidence</summary><pre>'+ctx.esc(JSON.stringify({source:r.source,outputs:r.outputs,evidence:r.evidence,attempts:r.attempts,restructure:r.restructure},null,2))+'</pre></details></article>';}
E.slot('transcriptMessage',ctx=>{if(ctx.m?.type!=='b16-work')return '';const r=get(ctx.m.workId);if(!r)return '<p>Local work is unavailable.</p>';return '<section class="b16-entry"><div><strong>'+(r.kind==='large'?'Hierarchy and exact identity':'Parallel customer deliverables')+'</strong><p>'+(r.kind==='large'?'5,050 preserved rows · one bounded lookup · no job-count claim.':'Real local files · shared To-Dos · immutable Plan.')+'</p></div><div class="b16-actions">'+btn('b16-open','Open workspace',r)+btn('b16-todos','To-Dos',r)+'</div>'+(owner(r)?.approved?ctx.renderOwnedWorking({id:'b16-animation:'+r.id,workId:r.id},visual(r)):'')+'</section>';});
E.slot('workingOwnerControls',ctx=>get(ctx.rec.workId)?btn('b16-open','Files',get(ctx.rec.workId)):'');
E.slot('editorTabLabel',ctx=>ctx.editorId?.startsWith('b16-work:')?'Customer deliverables':'');E.slot('editorDocument',ctx=>ctx.editorId?.startsWith('b16-work:')?workspace(ctx,get(ctx.editorId.slice(9))):'');
E.slot('composerBelow',ctx=>{const s=store.sessions[ctx.thread.id];return s?.guide?'<div class="b16-guide"><span>'+ctx.esc(FLOWS[s.flow].title)+' · '+(s.workId?'Use the ordinary Plan, workspace and Activity controls.':'Send to create the requested Plan or hierarchy. Nothing is executing yet.')+'</span>'+btn('b16-dismiss','Dismiss')+'</div>':'';});
E.action('b16-start',(ctx,b)=>{seed(ctx,b.dataset.flow);return true;});E.action('b16-dismiss',ctx=>{const s=store.sessions[ctx.thread.id];if(s)s.guide=false;ctx.renderApp();return true;});
const action=(name,fn)=>E.action(name,(ctx,b)=>{const r=get(b.dataset.work);if(r&&r.threadId===ctx.thread.id)fn(ctx,r,b);return true;});
action('b16-open',(ctx,r)=>ctx.openEditor('b16-work:'+r.id));action('b16-source',(ctx,r)=>ctx.openEditor(r.source.id));action('b16-plan',(ctx,r)=>r.planId&&P.openDetails(ctx,r.planId));action('b16-todos',(ctx,r)=>{Object.assign(ctx.state.activity,{open:true,domain:'todo',scope:'focus'});if(innerWidth<=1100)ctx.state.editorRevealed=false;ctx.renderApp();});action('b16-artifact',(ctx,r,b)=>{if(Object.values(r.outputs).includes(b.dataset.artifact))ctx.openEditor(b.dataset.artifact);});
action('b16-download',(ctx,r,b)=>{if(!Object.values(r.outputs).includes(b.dataset.artifact))return;const a=art(b.dataset.artifact),url=URL.createObjectURL(new Blob([a.content],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=a.name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);});
action('b16-preview-restructure',(ctx,r)=>{const p=owner(r),csv=leaves(r).find(t=>itemStage(r,t)?.id==='csv');r.lastError=null;if(!p?.approved||csv?.status!=='in_progress'||r.restructure)r.lastError='Refinement requires an admitted CSV attempt still in progress. Pause after admission to inspect it.';else r.preview={version:p.version,hash:P.hash(p.plan_id),plan_run_id:p.approved.plan_run_id,list_revision:T.revisionOf(r.threadId)};ctx.renderApp();});
action('b16-cancel-preview',(ctx,r)=>{r.preview=null;ctx.renderApp();});action('b16-apply-restructure',(ctx,r)=>{const out=restructure(r.id,r.preview);if(!out.ok)r.lastError=out.error;else{r.preview=null;r.lastError=null;}ctx.renderApp();});
const gallery=PM56_REPAIR_DEMOS,old=gallery.gallery;gallery.gallery=ctx=>'<section class="demo-section"><h3>To-Do graphs & progress · Batch 16</h3><div class="demo-section-body">'+Object.entries(FLOWS).map(([id,f])=>'<button class="demo-trigger" data-action="b16-start" data-flow="'+id+'"><strong>'+ctx.esc(f.title)+'</strong><small>'+ctx.esc(f.description)+'</small></button>').join('')+'</div></section>'+old(ctx);
window.PM56_B16_WORK={get,seed,inspect,advance,validate,restructure,attachAccountPlan,attachBrainstormPlan,attachRoomPlan,session:tid=>clone(store.sessions[tid||E.ctx().thread.id]||null),snapshot:tid=>clone(get(store.sessions[tid||E.ctx().thread.id]?.workId)||null)};
})();
