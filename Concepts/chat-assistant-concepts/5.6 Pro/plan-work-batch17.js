/* Batch 17 local examples: one execution adapter, shared Plan/To-Do/artifact owners.
 * No provider, native storage, repository or network operation is represented.
 * The missing-input scenario really attempts a lookup and records its failure.
 * Retry retires that attempt through ToDoController; it never resets completed work.
 */
(function(){
'use strict';
const E=PM56_EXT,P=PM56_PLANS,T=PM56_TODOS,A=PM56_ARTIFACTS,D=PM56_DATA,R=PM56_RUNTIME,G=PM56_GOAL,TX=PM56_TX;
const clone=x=>JSON.parse(JSON.stringify(x)),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),stamp=()=>new Date().toISOString();
const store=R.planDocumentWork={records:{},sessions:{},seq:0};
const flows={recovery:{title:'Recover without starting over',description:'A real failed lookup, an explicit input repair, and a new attempt in the same Plan run.'},documents:{title:'Read the exact evidence',description:'Explore shared artifact renderers, publish a newer source, and keep the approved version unchanged.'}};
const steps=[{id:'normalize',title:'Normalize the supplied order rows',outcome:'Every order has a unique identifier and an exact nonnegative integer-cent subtotal.',deps:[]},{id:'total',title:'Apply the retained rate table',outcome:'The grand total applies the exact V1 rate basis points to the normalized rows with integer arithmetic.',deps:['normalize']},{id:'validate',title:'Independently check the result',outcome:'Independent per-row arithmetic agrees with the output total and both input revisions remain unchanged.',deps:['total']}];
const scope=r=>({project_id:r.projectId,thread_id:r.threadId});
const ref=(r,id,v=1,kind)=>({...scope(r),artifact_id:r.id+':'+id,artifact_version:v,...(kind?{renderer_kind:kind}:{})});
function publish(r,id,kind,payload,extra={}){const q={...ref(r,id,extra.artifact_version||1),title:extra.title||id,renderer_kind:kind,payload,...extra};const out=A.publish(q);if(!out.ok)throw Error(out.error);return {...ref(r,id,q.artifact_version,kind)};}
function get(id){return store.records[id];}
function plan(r){return r&&P.get(r.planId);}
function input(r){const x=A.resolve(r.orders);if(!x.ok)throw Error('orders_'+x.error);if(!same(G.scope(r.threadId),r.scope))throw Error('work_scope_changed');return x.revision.record.payload;}
function rate(r){if(!r.rateConnected)throw Error('rate_input_disconnected');const x=A.resolve(r.rate);if(!x.ok)throw Error('rate_'+x.error);return x.revision.record.payload;}
function output(r,stage){const f=r.outputs[stage],x=f&&A.resolve(f);if(!x?.ok)throw Error('output_missing_'+stage);return x.revision.record.payload;}
function compute(r,stage){
 if(!steps.some(step=>step.id===stage))throw Error('unknown_work_stage');
 const rows=input(r).rows;
 if(stage==='normalize'){
  if(!Array.isArray(rows)||!rows.length||new Set(rows.map(x=>x.id)).size!==rows.length)throw Error('invalid_order_identifiers');
  return rows.map(x=>{if(!Number.isSafeInteger(x.quantity)||x.quantity<1||!/^\d+$/.test(x.unit_cents))throw Error('invalid_order_amount');return {id:x.id,quantity:x.quantity,unit_cents:x.unit_cents,subtotal_cents:(BigInt(x.quantity)*BigInt(x.unit_cents)).toString()};});
 }
 if(stage==='total'){
  const normalized=output(r,'normalize'),bp=rate(r).basis_points;if(!Number.isSafeInteger(bp)||bp<0)throw Error('invalid_rate');
  const lines=normalized.map(x=>({id:x.id,total_cents:((BigInt(x.subtotal_cents)*BigInt(10000+bp)+5000n)/10000n).toString()}));
  return {lines,total_cents:lines.reduce((n,x)=>n+BigInt(x.total_cents),0n).toString(),rate_basis_points:bp};
 }
 const total=output(r,'total'),bp=rate(r).basis_points;
 let expected=0n;for(const row of rows){const gross=BigInt(row.quantity)*BigInt(row.unit_cents)*(10000n+BigInt(bp));const line=(gross+5000n)/10000n;expected+=line;if(total.lines.find(x=>x.id===row.id)?.total_cents!==line.toString())throw Error('row_check_failed');}
 if(total.lines.length!==rows.length||expected.toString()!==total.total_cents)throw Error('total_check_failed');
 return {passed:true,rows:rows.length,total_cents:expected.toString(),method:'Independent source-row integer arithmetic, rounded per row; exact retained input lookup.',source_refs:[r.orders,r.rate]};
}
function mine(r){return (T.get(r.threadId)||[]).filter(t=>t.plan_id===r.planId&&t.run_id===plan(r)?.approved?.plan_run_id);}
function stageOf(t){return t.plan_step_ids?.[0];}
function live(r,t){return T.bindingsFor(r.threadId,t.todo_id).find(b=>b.state==='running'||b.state==='recovery_required');}
function inspect(id){const r=get(id);if(!r)return {eligible:false,complete:false,reason:'work_missing',fingerprint:'missing'};
 let error=null;try{input(r);}catch(e){error=e.message;}
 const todos=mine(r),s=T.outcomeSummary(r.threadId,plan(r)?.requiredTodoIds||[]),complete=!error&&!r.failure&&todos.length===steps.length&&s.ok&&steps.every(x=>!!r.outputs[x.id]);
 return {eligible:!error&&!r.failure&&!complete,complete,verified:complete,requiredResolved:complete,evidenceRefs:s.evidenceRefs||[],reason:error||r.failure?.reason||null,
 fingerprint:JSON.stringify({scope:G.scope(r.threadId),inputs:[A.resolve(r.orders),r.rateConnected,A.resolve(r.rate)],failure:r.failure,outputs:r.outputs,evidence:r.evidence,todos,bindings:T.bindings(r.threadId)})};
}
function admit(r,t){const stage=stageOf(t),workId=r.id+':work:'+stage,n=T.bindings(r.threadId).filter(b=>b.work_id===workId).length+1,attempt='attempt'+n,binding=workId+':'+attempt;
 const out=T.applyTransition(r.threadId,{...T.capture(r.threadId,t.todo_id),to_status:'in_progress',cause_kind:'work_admitted',cause_ref:binding+':admission',work_binding:binding,binding:{binding_id:binding,todo_id:t.todo_id,work_id:workId,attempt_id:attempt,work_kind:stage==='validate'?'validation':'artifact_generation',expected_outcome:t.expected_outcome}});
 if(out.ok){TX.set(r,'attempts',r.attempts.concat({stage,work_id:workId,attempt_id:attempt,binding_id:binding,todo_id:t.todo_id,state:'running',admitted_at:stamp()}));const p=plan(r);TX.set(p,'runHistory',p.runHistory.concat({run_id:p.approved.plan_run_id,attempt:attempt,outcome:'running',at:stamp(),reason:stage}));}
 return out;
}
function acceptResult(id,ticket,bindingId,payload){const r=get(id),p=plan(r);
 if(!r||!p||!ticket||typeof ticket.todo_id!=='string'||typeof bindingId!=='string')return {ok:false,error:'stale_work_callback'};
 const t=mine(r).find(t=>t.todo_id===ticket.todo_id),b=t&&live(r,t),stage=t&&stageOf(t);
 if(!r||!p||p.status!=='building'||p.attention||!t||!b||b.binding_id!==bindingId||!same(T.capture(r.threadId,t.todo_id),ticket))return {ok:false,error:'stale_work_callback'};
 return TX.run(()=>{
  const resultRef=publish(r,stage+':'+b.attempt_id,'json',payload,{title:stage==='normalize'?'Normalized orders':stage==='total'?'Computed grand total':'Independent output check',content:JSON.stringify(payload,null,2)});
  const evidenceRef=publish(r,stage+':'+b.attempt_id+':evidence','json',{binding_id:b.binding_id,work_id:b.work_id,attempt_id:b.attempt_id,expected_outcome:t.expected_outcome,output_ref:resultRef,plan_run_id:p.approved.plan_run_id,plan_version:p.version,plan_hash:P.hash(p.plan_id),source_refs:[r.orders,r.rate]},{title:'Outcome evidence · '+stage});
  TX.set(r,'outputs',{...r.outputs,[stage]:resultRef});TX.set(r,'evidence',{...r.evidence,[stage]:evidenceRef});
  const out=T.applyTransition(r.threadId,{...ticket,work_binding:b.binding_id,to_status:'completed',cause_kind:'outcome_satisfied',cause_ref:evidenceRef.artifact_id});if(!out.ok)return out;
  TX.set(r,'attempts',r.attempts.map(x=>x.binding_id===b.binding_id?{...x,state:'succeeded',result_ref:resultRef}:x));return {ok:true,result_ref:resultRef};
 });
}
function advance(id){const r=get(id),p=plan(r);if(!p||p.status!=='building'||p.attention)return {ok:false,error:'plan_not_running'};
 const check=inspect(id);if(check.complete)return {ok:true};if(!check.eligible)return {ok:false,error:check.reason||'not_eligible'};
 const todos=mine(r),ready=todos.find(t=>t.status==='pending'&&T.runnable(r.threadId,t.todo_id));if(ready)return TX.run(()=>admit(r,ready));
 const t=todos.find(t=>t.status==='in_progress'),b=t&&live(r,t);if(!b)return {ok:false,error:'work_not_admitted'};
 let data;try{data=compute(r,stageOf(t));}catch(e){
  const f=publish(r,stageOf(t)+':'+b.attempt_id+':failure','json',{binding_id:b.binding_id,reason:e.message,plan_run_id:p.approved.plan_run_id,at:stamp()},{title:'Failed input lookup'});
  const failure={stage:stageOf(t),binding_id:b.binding_id,reason:e.message,receipt_ref:f.artifact_id};TX.set(r,'failure',failure);TX.set(r,'attempts',r.attempts.map(x=>x.binding_id===b.binding_id?{...x,state:'failed',failure_ref:f}:x));
  TX.set(p,'runHistory',p.runHistory.concat({run_id:p.approved.plan_run_id,attempt:b.attempt_id,outcome:'failed',at:stamp(),reason:e.message}));return {ok:false,error:e.message};
 }
 return acceptResult(id,T.capture(r.threadId,t.todo_id),b.binding_id,data);
}
function recover(id,p,action){const r=get(id);if(!r)return {ok:false,error:'owner_missing'};try{input(r);if(r.failure)rate(r);}catch(e){return {ok:false,error:e.message};}
 if(!r.failure)return action==='resume'?{ok:true,same_work_bindings:true}:{ok:false,error:'no_failed_attempt'};
 if(action!=='retry')return {ok:false,error:'retry_required'};
 const t=mine(r).find(t=>stageOf(t)===r.failure.stage),b=t&&live(r,t);if(!b||b.binding_id!==r.failure.binding_id)return {ok:false,error:'failed_attempt_not_current'};
 const result=T.applyTransition(r.threadId,{...T.capture(r.threadId,t.todo_id),work_binding:b.binding_id,to_status:'pending',cause_kind:'retry',cause_ref:r.failure.receipt_ref});if(!result.ok)return result;
 TX.set(r,'failure',null);const admission=admit(r,t);if(!admission.ok)return admission;
 return {ok:true,failed_binding_id:b.binding_id,new_binding_id:live(r,t).binding_id,preserved_outputs:clone(r.outputs),plan_run_id:p.approved.plan_run_id};
}
const workOwner={inspect,advance,recover,attention:id=>{const r=get(id);return r?.failure?{kind:'failed',reason:'The retained rate-table input is disconnected. Reconnect it in the local workspace, then Retry. Completed normalization is preserved.',actions:['retry','details','cancel']}:null;},
 plan:id=>{const r=get(id);if(!r)return {ok:false,error:'missing_work'};return {ok:true,title:r.flow==='documents'?'An evidence-rich, version-bound Plan':'Recover a source-bound calculation',objective:r.objective,steps:clone(steps),sourceRefs:[{kind:'artifact',ref:r.orders.artifact_id},{kind:'message',ref:r.id+':request'}],blocks:r.embeds||[]};}};
P.registerWorkOwner('b17_local',workOwner);
T.registerOutcomeOwner('b17_local',(id,t,evidenceId,b)=>{const r=get(id),stage=stageOf(t),f=r?.evidence[stage],e=f&&A.resolve(f),o=r?.outputs[stage]&&A.resolve(r.outputs[stage]);if(!f||f.artifact_id!==evidenceId||!e?.ok||!o?.ok)return {ok:false,error:'outcome_missing'};const q=e.revision.record.payload;
 try{return {ok:q.binding_id===b.binding_id&&q.work_id===b.work_id&&q.attempt_id===b.attempt_id&&q.expected_outcome===t.expected_outcome&&q.plan_run_id===t.run_id&&q.plan_version===t.plan_version&&q.plan_hash===t.plan_hash&&same(o.revision.record.payload,compute(r,stage))};}catch(e){return {ok:false,error:e.message};}
},{
 admit:(id,t,b,cause)=>{const r=get(id),p=plan(r),stage=stageOf(t),work=r.id+':work:'+stage,n=T.bindings(r.threadId).filter(b=>b.work_id===work).length+1;return {ok:!!p?.approved&&p.status==='building'&&p.approved.plan_run_id===t.run_id&&p.version===t.plan_version&&P.hash(p.plan_id)===t.plan_hash&&steps.some(s=>s.id===stage&&s.outcome===t.expected_outcome)&&b.work_id===work&&b.attempt_id==='attempt'+n&&b.binding_id===work+':attempt'+n&&cause===b.binding_id+':admission'};},
 fence:(id,t)=>{const r=get(id),p=plan(r);return {run_id:p?.approved?.plan_run_id,run_epoch:p?.runEpoch,...(!p||!['building','completed'].includes(p.status)?{error:'plan_not_current'}:{})};},
 availability:id=>{const r=get(id),p=plan(r);return {ok:!!p&&p.status==='building'&&!p.attention&&!r.failure,reason:p?.attention?.reason||r?.failure?.reason||'Plan not running'};},
 retry:(id,b,cause)=>{const r=get(id);return {ok:r?.failure?.binding_id===b.binding_id&&r.failure.receipt_ref===cause&&r.rateConnected};},
 stop:(id,bindings,context)=>{const r=get(id),p=plan(r),old=context?.replacement,run=old&&P.runs()[old.plan_run_id];
  if(!r||context?.kind!=='plan_revision'||p?.version!==context.new_plan_version||!run||run.state!=='cancelled'||
    bindings.some(b=>b.run_id!==run.plan_run_id||b.plan_version!==old.version||b.plan_hash!==old.hash))return {ok:false,error:'revision_stop_binding_mismatch'};
  const receipt='revision-stop:'+r.id+':V'+p.version+':'+bindings.map(b=>b.binding_id).join('|');
  TX.set(r,'cancellations',{...r.cancellations,...Object.fromEntries(bindings.map(b=>[b.binding_id,receipt]))});
  TX.set(r,'failure',null);TX.set(r,'attempts',r.attempts.map(a=>bindings.some(b=>b.binding_id===a.binding_id)?{...a,state:'cancelled',cancellation_ref:receipt}:a));
  return {ok:true,receipt_ref:receipt};
 },
 cancel:(id,b,receipt)=>({ok:get(id)?.cancellations?.[b.binding_id]===receipt}),
 execute:id=>advance(id),open:(id,b)=>{const r=get(id);return {ok:!!r,title:'Source-bound calculation',binding:clone(b),source_ref:r?.orders,outputs:Object.values(r?.outputs||{}),evidence:Object.values(r?.evidence||{})};}
});
function embed(r,id,kind,caption,summary,extra={}){return {t:'plan_embed',block_id:r.id+':embed:'+id,...ref(r,id,1),renderer_kind:kind,caption,text_summary:summary,display:'inline',state:'ok',source_ref:r.orders.artifact_id,...extra};}
function documentInputs(r){
 const rows=input(r).rows,table={columns:['Order','Quantity','Unit cents'],rows:rows.map(x=>[x.id,x.quantity,x.unit_cents])};
 publish(r,'rows','table',table,{title:'Supplied input rows'});
 const chart={values:rows.map(x=>({label:x.id,value:Number(x.unit_cents)*x.quantity})),unit:'¢'};publish(r,'chart','chart',chart,{title:'Supplied subtotals · not execution progress'});
 const graph={nodes:[{id:'a',label:'Read rows',detail:'Exact input revision'},{id:'b',label:'Read rate',detail:'Exact V1 rate table'},{id:'c',label:'Validate total',detail:'Independent calculation'}],edges:[['a','c'],['b','c']]};publish(r,'graph','graph',graph,{title:'Input dependency graph'});
 publish(r,'mermaid','mermaid',null,{title:'Retained Mermaid source',content:'graph TD\n  A[Read rows] --> C[Validate total]\n  B[Read rate] --> C',static_fallback_ref:ref(r,'graph',1,'graph')});
 publish(r,'code','code',null,{title:'Rounding contract',content:'// integer cents, rounded per row\n(gross * (10000n + basisPoints) + 5000n) / 10000n;'});
 publish(r,'checklist','checklist',{items:['Use exact retained rows','Do not rewrite V1 when source V2 appears','Keep validation as an ordinary To-Do']},{title:'Document constraints'});
 publish(r,'interactive','interactive',table,{title:'Filter the retained rows',origin:'pm-local-renderer',capabilities:['filter_table'],static_fallback_ref:ref(r,'rows',1,'table')});
 if(window.PM56_B17_MEDIA){publish(r,'image','image',{data_url:PM56_B17_MEDIA.image},{title:'Prior Batch 16 reference screenshot'});publish(r,'video','video',{data_url:PM56_B17_MEDIA.video},{title:'Static chart preview clip',static_fallback_ref:ref(r,'chart',1,'chart')});}
 const specs=[['rows','table','Source rows','A supplied immutable V1 table.'],['chart','chart','Order subtotals','Calculated from supplied inputs for this document, not live work progress.'],['graph','graph','Two inputs, one check','Arrows reflect the two explicit graph edges, not display order.'],['mermaid','mermaid','Retained diagram','Mermaid text with an explicit static rendering.'],['code','code','Arithmetic contract','Read-only code; no execution is requested by viewing.'],['checklist','checklist','Constraints','Document content, not live To-Do status.'],['interactive','interactive','Explore retained data','A local table filter in the shared sandbox; the Plan remains immutable.']];
 if(window.PM56_B17_MEDIA)specs.push(['image','image','Prior reference screenshot','Batch 16 reference only, not Batch 17 test evidence.'],['video','video','Chart preview video','A two-second static media fixture; print uses the exact chart fallback.']);
 specs.push(['missing','document','Unavailable research attachment','This example was not supplied. The Plan retains its reference instead of substituting a newer artifact.']);
 r.embeds=specs.map(([id,kind,caption,summary])=>embed(r,id,kind,caption,summary,{static_fallback_ref:['interactive','video','mermaid'].includes(kind)?ref(r,kind==='interactive'?'rows':kind==='video'?'chart':'graph',1,kind==='interactive'?'table':kind==='video'?'chart':'graph'):null}));
}
function start(ctx,flow){if(!flows[flow])return;
 const n=++store.seq,t=clone(ctx.state.threads.find(t=>t.id==='query')),id='batch17-'+flow+'-'+n;
 Object.assign(t,{id,title:flows[flow].title,projectId:'concept:b17:'+n,worktreeId:'concept:b17:'+n,pinned:false,archived:false,status:'ready',goalId:null,messages:[]});ctx.state.threads.push(t);
 const r={id,threadId:id,projectId:t.projectId,flow,planId:null,scope:G.scope(id),objective:flow==='documents'?'Compute and check the supplied totals while preserving the exact evidence used by this Plan.':'Normalize the supplied rows, apply the retained rate table, and verify the grand total. Preserve completed output if the input lookup fails.',outputs:{},evidence:{},attempts:[],failure:null,rateConnected:flow!=='recovery',createdAt:stamp()};
 r.orders=publish(r,'orders','json',{rows:[{id:'A-001',quantity:3,unit_cents:'1999'},{id:'A-002',quantity:2,unit_cents:'10'},{id:'A-003',quantity:7,unit_cents:'425'}]},{title:'Supplied order input'});r.rate=publish(r,'rate','json',{basis_points:600},{title:'Retained V1 rate table'});
 store.records[id]=r;store.sessions[t.id]={workId:id};if(flow==='documents')documentInputs(r);
 Object.assign(ctx.state,{historyMode:'closed',menu:null,dialog:null,hover:null,editorTabs:[],activeEditor:null,editorRevealed:false,demoOpen:false});ctx.state.activity.open=false;ctx.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};ctx.state.capabilities.goal=false;
 ctx.switchThread(t.id);ctx.state.mode='Plan';ctx.state.composer=r.objective;ctx.renderApp();
}
R.composer.preSendHooks.unshift((ctx,t,raw)=>{const session=store.sessions[t.id],r=session&&get(session.workId);if(!r||r.planId||R.composer.destination&&R.composer.destination.kind!=='assistant')return false;
 const out=TX.run(()=>{TX.set(r,'objective',raw);TX.set(t,'messages',t.messages.concat({id:r.id+':request',role:'user',type:'text',body:raw}));const made=P.createFromWorkRequest({threadId:t.id,explicitRequest:true,workRef:{kind:'b17_local',ref:r.id}});if(!made.ok)return made;TX.set(r,'planId',made.planId);TX.set(t,'messages',t.messages.concat({id:r.id+':workspace',role:'assistant',type:'b17-work',workId:r.id}));return {ok:true};});
 if(!out.ok){ctx.toast('Plan not created',out.error);return {claimed:true,preserveComposer:true};}return {claimed:true,preserveComposer:false};
});
function button(action,label,r,extra=''){return '<button class="soft-button" data-action="'+action+'" data-work="'+r.id+'" '+extra+'>'+label+'</button>';}
function artButton(label,f){return '<button class="soft-button" data-action="open-artifact" data-version="'+f.artifact_version+'" data-ref="'+encodeURIComponent(JSON.stringify(f))+'">'+label+'</button>';}
function workspace(ctx,r){const p=plan(r);return '<article class="b17-workspace"><header><small>LOCAL CALCULATION · SESSION MEMORY</small><h1>'+ctx.esc(flows[r.flow].title)+'</h1><p>'+ctx.esc(flows[r.flow].description)+'</p></header><div class="b17-actions">'+button('b17-open-plan','Open Plan',r)+artButton('Open exact inputs',r.orders)+'</div><section class="b17-resource"><h2>Rate-table connection</h2><p>'+(r.rateConnected?'The original V1 input is connected. Its bytes have not changed.':'The original V1 input is disconnected in this local example. A lookup will fail until it is reconnected.')+'</p>'+(!r.rateConnected?button('b17-reconnect','Reconnect original input',r):artButton('Inspect V1 rate table',r.rate))+'</section><div class="b17-outputs">'+steps.map(st=>'<section><h2>'+st.title+'</h2><p>'+st.outcome+'</p>'+(r.outputs[st.id]?artButton('Open '+(st.id==='validate'?'check':'output'),r.outputs[st.id]):'<small>No accepted output yet.</small>')+'</section>').join('')+'</div>'+(r.flow==='documents'?'<section><h2>Version-bound source</h2><p>Publish a second table revision. The Plan continues to reference V1 in every view and export.</p>'+button('b17-source-v2','Publish example table V2',r)+(r.sourceV2?'<p role="status">Source V2 exists. The Plan still opens V1.</p>':'')+'</section>':'')+'<details open data-k="b17-attempts:'+r.id+'"><summary>Attempts and retained results</summary><div class="b17-attempt-list">'+r.attempts.map(a=>'<p><strong>'+ctx.esc(a.stage)+' · '+ctx.esc(a.attempt_id)+'</strong><span>'+ctx.esc(a.state)+'</span><code>'+ctx.esc(a.binding_id)+'</code></p>').join('')+'</div><p class="b17-local-note">These are actual local calculations and owner transitions, not provider or native runtime evidence.</p></details></article>';}
function visual(r){const p=plan(r),ts=mine(r),done=ts.filter(t=>t.status==='completed').length,active=Math.max(0,ts.findIndex(t=>t.status==='in_progress'));return {ownerProjection:true,workId:r.id,runId:p?.approved?.plan_run_id||r.id,statusLabel:P.attention(r.planId)?.line||(p?.status==='completed'?'Completed':p?.status==='canceled'?'Canceled':'Working'),steps:steps.map((s,i)=>({id:'b17-'+s.id,uid:r.id+':'+s.id,kind:s.id==='validate'?'testing':'file',label:s.title,icon:'file',verb:s.title,detail:s.outcome,startAt:i*2,dur:2,rows:[{at:0,text:ts.find(t=>stageOf(t)===s.id)?.status||'pending'}],evidence:r.evidence[s.id]?[r.evidence[s.id].artifact_id]:[],stat:ts.find(t=>stageOf(t)===s.id)?.status||'pending'})),step:p?.status==='completed'?2:active,clock:done*2,running:p?.status==='building'&&!p.attention,completed:p?.status==='completed',expanded:false,elapsed:r.attempts.length?Math.max(0,Math.floor((Date.now()-Date.parse(r.attempts[0].admitted_at))/1000)):0,started:!!p?.approved};}
E.slot('transcriptMessage',ctx=>{const m=ctx.message||ctx.m,r=m?.type==='b17-work'&&get(m.workId);return r?'<div class="b17-work-link">'+ctx.icon('document',16)+'<div><strong>Calculation workspace</strong><span>Inputs, completed output, and recovery evidence.</span></div>'+button('b17-open','Open workspace',r)+'</div>'+(plan(r)?.approved?ctx.renderOwnedWorking({id:'b17-animation:'+r.id,workId:r.id},visual(r)):''):'';});
E.slot('editorTabLabel',ctx=>ctx.editorId?.startsWith('b17-work:')?'Recovery workspace':'');
E.slot('editorDocument',ctx=>ctx.editorId?.startsWith('b17-work:')?workspace(ctx,get(ctx.editorId.slice(9))):'');
E.slot('composerBelow',ctx=>{const r=get(store.sessions[ctx.thread.id]?.workId);return r?'<div class="b17-guide"><strong>Batch 17 · '+ctx.esc(flows[r.flow].title)+'</strong><span>'+(!r.planId?'Send the prepared request. Build remains a separate explicit action.':r.failure?'Open the workspace, reconnect the exact input, then use Retry on the Plan.':'Use the Plan title, More actions, document views, and workspace controls.')+'</span></div>':'';});
E.action('b17-start',(ctx,b)=>{start(ctx,b.dataset.flow);return true;});
E.action('b17-open',(ctx,b)=>{if(get(b.dataset.work))ctx.openEditor('b17-work:'+b.dataset.work);return true;});
E.action('b17-open-plan',(ctx,b)=>{const r=get(b.dataset.work);if(r?.planId)P.openDetails(ctx,r.planId);return true;});
E.action('b17-reconnect',(ctx,b)=>{const r=get(b.dataset.work);if(r&&A.resolve(r.rate).ok){TX.set(r,'rateConnected',true);ctx.renderApp();}return true;});
E.action('b17-source-v2',(ctx,b)=>{const r=get(b.dataset.work);if(!r)return true;const v=publish(r,'rows','table',{columns:['Order','Quantity','Unit cents'],rows:[['NEW-V2',99,'999']]},{title:'Supplied input rows · newer example',artifact_version:2});TX.set(r,'sourceV2',v);ctx.renderApp();return true;});
const gallery=PM56_REPAIR_DEMOS,old=gallery.gallery;gallery.gallery=ctx=>'<section class="demo-section"><h3>Plan recovery & document views · Batch 17</h3><div class="demo-section-body">'+Object.entries(flows).map(([flow,f])=>'<button class="demo-trigger" data-action="b17-start" data-flow="'+flow+'"><strong>'+ctx.esc(f.title)+'</strong><small>'+ctx.esc(f.description)+'</small></button>').join('')+'</div></section>'+old(ctx);
window.PM56_B17_WORK={snapshot:()=>{const s=store.sessions[E.ctx()?.thread.id];return s?clone(get(s.workId)):null;},inspect,advance,recover,acceptResult,compute,records:()=>store.records,start:(flow)=>start(E.ctx(),flow)};
})();
