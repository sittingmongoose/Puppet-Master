/* B09 — bounded, in-memory Assistant Debug. Not a DAP adapter or native runner.
 * Uses the existing PM56_FEATURES.debug investigation/active stores. Only
 * registered local targets execute; a whitelist fences the example evaluator.
 * Evidence is calculated, source-current, attempt-bound, and retained separately
 * from the temporary owned trace collector. No host/project files are modified.
 */
(function(){
 'use strict';
 const E=window.PM56_EXT,F=window.PM56_FEATURES,T=window.PM56_TEACH,copy=x=>JSON.parse(JSON.stringify(x));
 const phases=['target_binding','baseline_capture','instrumentation','reproduction','analysis','repair','verification','cleanup'];
 const labels=['Target','Baseline','Instrumentation','Reproduce','Analysis','Repair','Verify','Cleanup'];
 const buggy='function lineTotal(price, quantity) {\n  return price * (quantity || 1);\n}\n';
 const fixed='function lineTotal(price, quantity) {\n  return price * (quantity ?? 1);\n}\n';
 const sources=new Map(),targets=new Map(),probes=new Map(),view=new Map(),receipts=new Map();let seq=0,epoch=1;
 const uid=p=>'dbg-'+p+'-'+epoch+'-'+(++seq),now=()=>new Date().toISOString(),fail=error=>({ok:false,error});
 const fp=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return 'fnv1a:'+ (h>>>0).toString(16).padStart(8,'0');};
 const store=()=>F.state().debug,raw=id=>store().investigations[id],owns=id=>raw(id)?.protocol==='local-debug-v1';
 function permitted(inv){const c=T.context();return inv&&inv.protocol==='local-debug-v1'&&inv.epoch===epoch&&inv.context.projectId===c.projectId&&inv.context.userId===c.userId&&inv.threadId===c.threadId;}
 function get(id){const r=raw(id);return permitted(r)?copy(r):null;}
 function source(id){const s=sources.get(id),c=T.context();return s&&s.projectId===c.projectId&&s.userId===c.userId?copy(s):null;}
 function note(inv,phase,detail){inv.phase=phase;inv.phaseIndex=phases.indexOf(phase);inv.revision++;inv.updatedAt=now();inv.timeline.push({sequence:inv.timeline.length+1,phase,detail,at:inv.updatedAt});}
 function current(inv){const s=sources.get(inv.target.id);return s&&s.body===inv.expected.body&&s.revision===inv.expected.revision;}
 function drift(inv){const s=sources.get(inv.target.id);inv.revalidationCandidate=s?{body:s.body,revision:s.revision}:null;inv.status='attention_required';inv.reason='target_changed';inv.revision++;inv.updatedAt=now();inv.timeline.push({sequence:inv.timeline.length+1,phase:inv.phase,detail:'Target changed. No repair or verification was applied to the new source.',at:inv.updatedAt});return fail('target_changed');}
 function register(seed){const c=T.context();if(!seed||typeof seed.body!=='string'||!seed.path||c.consumer!=='assistant')return fail('invalid_target');
  const s={id:uid('target'),projectId:c.projectId,userId:c.userId,threadId:c.threadId,path:String(seed.path),body:seed.body,revision:1,kind:'local_example'};sources.set(s.id,s);targets.set(c.threadId,s.id);return {ok:true,id:s.id};}
 function begin(targetId,previous=null){const c=E.ctx(),s=sources.get(targetId);if(!s||s.projectId!==T.context().projectId||s.userId!==T.context().userId||s.threadId!==c.thread.id)return fail('target_scope');
  const live=raw(store().active[c.thread.id]);if(permitted(live)&&['running','attention_required','failed_cleanup'].includes(live.status)&&!previous)return fail('investigation_active');
  const inv={id:uid('investigation'),protocol:'local-debug-v1',epoch,threadId:c.thread.id,context:copy(T.context()),target:{id:s.id,path:s.path,kind:s.kind},boundRevision:s.revision,expected:{body:s.body,revision:s.revision},phase:'target_binding',phaseIndex:0,status:'running',reason:null,revision:1,baseline:null,reproduction:null,diagnosis:null,repair:null,verification:null,cleanup:null,instrumentation:null,timeline:[],priorInvestigationId:previous,createdAt:now(),updatedAt:now()};
  note(inv,'target_binding','Bound '+s.path+' at revision '+s.revision+'. Local example only.');store().investigations[inv.id]=inv;store().active[c.thread.id]=inv.id;
  c.appendMessage({id:uid('card'),role:'system',type:'debug-investigation',investigationId:inv.id,time:now()},c.thread);c.state.mode='Debug';return {ok:true,id:inv.id};}
 // This executes only either of two inspected function bodies, optionally carrying
 // the known display-only currency comment. Arbitrary text is never evaluated.
 function program(body){const prefix=body.match(/^\/\/ Display currency: ([A-Z]{3})\n/),text=prefix?body.slice(prefix[0].length):body;if(text!==buggy&&text!==fixed)return null;return {fn:Function('"use strict";return ('+text+');')(),text,prefix:prefix?.[0]||''};}
 function evaluate(body,trace=null){const p=program(body);if(!p)return fail('unsupported_local_source');
  const tests=[['Zero quantity',25,0,0],['Two items',25,2,50],['Missing quantity',25,undefined,25],['Null quantity',25,null,25],['Fractional quantity',25,1.5,37.5],['Zero price',0,2,0]];
  const cases=tests.map(([name,price,quantity,expected])=>{const actual=p.fn(price,quantity);if(trace){trace.samples.push({case:name,price,quantity:quantity===undefined?'undefined':quantity,actual});trace.revision++;}return {name,price,quantity:quantity===undefined?'undefined':quantity,expected,actual,pass:Object.is(actual,expected)};});
  return {ok:true,id:uid('evidence'),scope:'local-line-total-six-cases-v1',sourceBody:body,sourceFingerprint:fp(body),cases,passed:cases.filter(c=>c.pass).length,total:cases.length,at:now()};}
 function guard(id,op,revision){const inv=raw(id);if(!permitted(inv))return fail('investigation_scope');const key=id+':'+op,prior=receipts.get(key);
  if(prior&&(revision==null||revision===prior.requestRevision))return {ok:true,reused:true,...copy(prior.result)};
  if(revision!=null&&revision!==inv.revision)return fail('stale_action');if(inv.status!=='running')return fail('investigation_not_running');return {inv,key,requestRevision:inv.revision};}
 function commit(g,result){receipts.set(g.key,{requestRevision:g.requestRevision,result:copy(result)});return result;}
 function step(id,op,revision){const g=guard(id,op,revision);if(!g.inv)return g;const inv=g.inv;
  const permittedPhase={baseline:'target_binding',reproduce:'baseline_capture',analyze:'reproduction',apply:'analysis',verify:'repair',cleanup:'verification'};
  if(!permittedPhase[op]||inv.phase!==permittedPhase[op])return fail('phase_order');if(!current(inv))return drift(inv);
  const s=sources.get(inv.target.id);let result;
  if(op==='baseline'){if(!program(s.body))return fail('unsupported_local_source');inv.baseline={id:uid('baseline'),body:s.body,revision:s.revision,fingerprint:fp(s.body),acceptanceContract:'local-line-total-six-cases-v1',at:now()};note(inv,'baseline_capture','Frozen source and the six-case acceptance contract.');}
  if(op==='reproduce'){
   const p={id:uid('trace'),owner:inv.id,generation:epoch,revision:1,samples:[]};probes.set(p.id,p);inv.instrumentation={id:p.id,owner:inv.id,state:'attached'};note(inv,'instrumentation','Attached one run-owned local trace collector.');
   result=evaluate(inv.baseline.body,p);if(!result.ok)return result;inv.reproduction=result;inv.instrumentation.expected=copy(p);note(inv,'reproduction',result.passed+'/'+result.total+' baseline checks passed.');
   if(result.passed===result.total){inv.terminationIntent='blocked';const clean=release(inv);inv.status=clean.ok?'blocked':'failed_cleanup';inv.reason=clean.ok?'no_repro':'cleanup_failed';inv.cleanup=clean;}
  }
  if(op==='analyze'){
   const test=inv.reproduction?.cases.find(c=>c.name==='Zero quantity');if(!test||test.pass)return fail('reproduction_required');const p=program(inv.baseline.body);
   inv.diagnosis={text:'The || fallback treats an explicit zero as missing.',evidenceId:inv.reproduction.id,case:'Zero quantity',observed:test.actual,expected:test.expected};
   inv.repair={before:inv.baseline.body,after:p.prefix+fixed,fingerprintBefore:fp(inv.baseline.body),applied:false};note(inv,'analysis','Traced zero to the fallback; prepared one expression change.');
  }
  if(op==='apply'){
   if(!inv.repair||s.body!==inv.repair.before)return fail('patch_precondition');s.body=inv.repair.after;s.revision++;inv.expected={body:s.body,revision:s.revision};inv.repair.applied=true;inv.repair.appliedRevision=s.revision;note(inv,'repair','Changed || to ??; preserved the rest of the frozen source.');
  }
  if(op==='verify'){
   result=evaluate(s.body);if(!result.ok)return result;result.targetRevision=s.revision;result.investigationId=inv.id;inv.verification=result;note(inv,'verification',result.passed+'/'+result.total+' checks passed on the repaired target.');
   if(result.passed!==result.total){inv.reason='verification_failed';}
  }
  if(op==='cleanup'){
   if(!inv.verification||inv.verification.passed!==inv.verification.total||inv.verification.sourceBody!==s.body||inv.verification.targetRevision!==s.revision)return fail('verification_required');
   inv.terminationIntent='resolved';const cleaned=release(inv);inv.cleanup=cleaned;note(inv,'cleanup',cleaned.ok?'Removed the owned trace collector; retained its frozen evidence.':'Collector changed outside this investigation; left it untouched.');inv.status=cleaned.ok?'resolved':'failed_cleanup';inv.reason=cleaned.ok?'verification_passed':'cleanup_failed';
  }
  return commit(g,{ok:true,id:inv.id,phase:inv.phase,status:inv.status});
 }
 function release(inv){if(!inv.instrumentation||inv.instrumentation.state==='removed')return {ok:true,removed:[],at:now()};const p=probes.get(inv.instrumentation.id);
  if(!p)return fail('collector_missing');if(JSON.stringify(p)!==JSON.stringify(inv.instrumentation.expected))return fail('collector_changed');
  probes.delete(p.id);inv.instrumentation.state='removed';return {ok:true,removed:[p.id],retainedEvidence:inv.reproduction?.id||null,at:now()};}
 function cancel(id){const inv=raw(id);if(!permitted(inv))return fail('investigation_scope');if(inv.status==='cancelled')return {ok:true,reused:true,id};if(['resolved','superseded','blocked'].includes(inv.status))return fail('terminal_investigation');
  inv.terminationIntent='cancelled';const r=release(inv);inv.cleanup=r;note(inv,'cleanup',r.ok?'Cancelled; removed only the owned collector.':'Cancel retained a changed collector for inspection.');inv.status=r.ok?'cancelled':'failed_cleanup';inv.reason=r.ok?'cancelled_by_user':'cleanup_failed';return {ok:r.ok,id,status:inv.status};}
 function rebind(id,revision){const inv=raw(id);if(!permitted(inv))return fail('investigation_scope');if(revision!=null&&revision!==inv.revision)return fail('stale_action');if(inv.status!=='attention_required'||inv.reason!=='target_changed')return fail('revalidation_not_required');
  const s=sources.get(inv.target.id);if(!s||!program(s.body))return fail('unsupported_local_source');if(!inv.revalidationCandidate||s.body!==inv.revalidationCandidate.body||s.revision!==inv.revalidationCandidate.revision){drift(inv);return fail('target_changed_again');}const r=release(inv);if(!r.ok){inv.status='failed_cleanup';inv.reason='cleanup_failed';inv.cleanup=r;return r;}
  inv.cleanup=r;const fresh=begin(s.id,id);if(!fresh.ok)return fresh;inv.status='superseded';inv.reason='superseded_by_new_investigation';inv.nextInvestigationId=fresh.id;inv.revision++;inv.timeline.push({sequence:inv.timeline.length+1,phase:inv.phase,detail:'Explicitly rebound the changed target in '+fresh.id+'. Prior source and evidence retained.',at:now()});return fresh;}
 function retryCleanup(id){const inv=raw(id);if(!permitted(inv)||inv.status!=='failed_cleanup')return fail('cleanup_not_pending');const r=release(inv);if(!r.ok)return r;
  if(inv.terminationIntent==='resolved'&&!current(inv)){inv.cleanup=r;note(inv,'cleanup','Removed owned collector; repaired target needs revalidation.');return drift(inv);}
  inv.cleanup=r;inv.status=inv.terminationIntent==='resolved'&&inv.verification&&inv.verification.passed===inv.verification.total&&current(inv)?'resolved':inv.terminationIntent==='blocked'?'blocked':'cancelled';inv.reason=inv.status==='resolved'?'verification_passed':inv.status==='blocked'?'no_repro':'cancelled_by_user';note(inv,'cleanup','Owned collector removed after its identity was restored.');return {ok:true,id,status:inv.status};}
 function checkTarget(id){const inv=raw(id);if(!permitted(inv))return fail('investigation_scope');if(['superseded','cancelled','failed_cleanup','blocked'].includes(inv.status))return fail('terminal_investigation');return current(inv)?{ok:true,current:true}:drift(inv);}
 function externalEdit(id,body){const s=sources.get(id);if(!source(id)||typeof body!=='string')return fail('target_scope');s.body=body;s.revision++;return {ok:true,revision:s.revision};}
 function probeChange(id){const inv=raw(id);if(!permitted(inv)||!inv.instrumentation)return fail('collector_missing');const p=probes.get(inv.instrumentation.id);if(!p)return fail('collector_missing');p.foreignNote='Changed by another local owner';p.revision++;return {ok:true};}
 function restoreProbe(id){const inv=raw(id);if(!permitted(inv)||!probes.has(inv.instrumentation?.id))return fail('collector_missing');probes.set(inv.instrumentation.id,copy(inv.instrumentation.expected));return {ok:true};}
 function show(id){const inv=raw(id);if(!permitted(inv))return fail('investigation_scope');const c=E.ctx();c.closeMenu();c.closeDialog();c.state.editorRevealed=true;c.openEditor('debug:'+id);return {ok:true};}
 function exportData(id){const inv=raw(id);if(!permitted(inv))return fail('investigation_scope');return {kind:'local_debug_bundle',nativeRuntime:false,persistence:'session_only',exportedAt:now(),currentness:current(inv)?'current':'target_changed',investigation:copy(inv),targetCurrent:source(inv.target.id)};}
 const action=(c,inv,op,label,primary=false)=>'<button class="'+(primary?'primary-button':'soft-button')+'" data-action="debug-'+op+'" data-id="'+c.esc(inv.id)+'" data-revision="'+inv.revision+'">'+label+'</button>';
 function controls(c,inv){const next={target_binding:['baseline','Capture baseline'],baseline_capture:['reproduce','Reproduce'],reproduction:['analyze','Inspect diagnosis'],analysis:['apply','Apply repair'],repair:['verify','Verify repair'],verification:['cleanup','Finish cleanup']};
  let s='';if(inv.status==='running'&&next[inv.phase])s=action(c,inv,...next[inv.phase],true);
  if(inv.status==='attention_required')s=action(c,inv,'rebind','Rebind changed target',true);
  if(inv.status==='failed_cleanup')s=action(c,inv,'retry','Retry owned cleanup',true);
  if(['running','attention_required'].includes(inv.status))s+=action(c,inv,'cancel','Cancel');
  if(inv.status==='resolved')s+=action(c,inv,'revalidate','Revalidate target');s+=action(c,inv,'export','Export bundle');if(inv.nextInvestigationId)s+='<button class="soft-button" data-action="debug-open" data-id="'+c.esc(inv.nextInvestigationId)+'">Open current investigation</button>';
  return s;
 }
 function checksHtml(c,evidence){return '<div class="debug-checks">'+evidence.cases.map(x=>'<div data-debug-case="'+c.esc(x.name)+'"><span>'+c.esc(x.name)+'</span><span class="'+(x.pass?'debug-pass':'debug-fail')+'">'+(x.pass?'Pass':c.esc(x.actual+' → expected '+x.expected))+'</span></div>').join('')+'</div>';}
 function details(c,id,title,body){const key=id+':'+title;return '<details data-debug-disclosure="'+c.esc(key)+'"'+(view.get(key)?' open':'')+'><summary>'+c.esc(title)+'</summary>'+body+'</details>';}
 function render(c,inv){if(!permitted(inv))return '<div class="debug-document">Investigation unavailable in this scope.</div>';const e=c.esc,s=source(inv.target.id);
  const reason={target_changed:'Target changed. Review the new source before rebinding.',cleanup_failed:'A changed collector was left untouched.',no_repro:'The reported failure did not reproduce.'}[inv.reason]||'';
  return '<article class="debug-document" data-k="debug:'+e(inv.id)+'" data-investigation="'+e(inv.id)+'"><div class="debug-meta"><span>Debug · local example</span><span>'+e(inv.status.replaceAll('_',' '))+'</span></div><h2>Keep zero quantities</h2><p class="debug-target">'+e(inv.target.path)+' · revision '+inv.expected.revision+'</p><ol class="debug-phases">'+phases.map((p,i)=>'<li class="'+(p===inv.phase&&inv.status==='running'?'current':inv.timeline.some(e=>e.phase===p)?'done':'')+'"><span>'+ (inv.timeline.some(e=>e.phase===p)&&!(p===inv.phase&&inv.status==='running')?'✓':i+1)+'</span>'+labels[i]+'</li>').join('')+'</ol>'+
   '<div class="debug-controls">'+controls(c,inv)+'</div>'+(reason?'<p class="debug-notice">'+e(reason)+'</p>':'')+
   (inv.status==='resolved'?'<section class="debug-result"><strong>Repair verified · cleanup complete</strong><p>Zero stays zero. The other five cases still pass.</p><small>One expression changed; the temporary collector is removed.</small></section>':'')+
   (inv.verification?'<section class="debug-block"><h3>Verification · '+inv.verification.passed+'/'+inv.verification.total+'</h3>'+checksHtml(c,inv.verification)+'</section>':'')+
   (inv.diagnosis?'<section class="debug-block"><h3>Diagnosis</h3><p>'+e(inv.diagnosis.text)+'</p><div class="debug-diff"><code class="debug-fail">− quantity || 1</code><code class="debug-pass">+ quantity ?? 1</code></div><small>'+(inv.repair.applied?'Applied to revision '+inv.repair.appliedRevision:'Proposed · not yet applied')+'</small></section>':'')+
   (inv.reproduction?details(c,inv.id,'Reproduction · '+inv.reproduction.passed+'/'+inv.reproduction.total,checksHtml(c,inv.reproduction)):'')+
   details(c,inv.id,'Frozen baseline','<pre>'+e(inv.baseline?.body||inv.expected.body)+'</pre>')+
   details(c,inv.id,'Current source','<pre>'+e(s?.body||'Unavailable')+'</pre>')+
   (inv.instrumentation?details(c,inv.id,'Instrumentation and cleanup','<p>Local trace collector · '+e(inv.instrumentation.state)+'</p><p>'+e(inv.cleanup?.ok?'Owned resource removed. Frozen trace evidence retained.':inv.cleanup?.error||'Owned by this investigation.')+'</p><pre>'+e(JSON.stringify(inv.instrumentation.expected?.samples||[],null,2))+'</pre>'):'')+
   details(c,inv.id,'Investigation history','<ol>'+inv.timeline.map(x=>'<li><strong>'+e(labels[phases.indexOf(x.phase)]||x.phase)+'</strong> · '+e(x.detail)+'</li>').join('')+'</ol>')+
   (inv.priorInvestigationId?'<button class="soft-button" data-action="debug-open" data-id="'+e(inv.priorInvestigationId)+'">Open prior investigation</button>':'')+
   '<small class="debug-boundary">Local JavaScript checks, not a connected debugger or repository write.</small>'+(window.PM56_DEBUG_DEMOS?.guide(c,true)||'')+'</article>';
 }
 E.slot('editorTabLabel',c=>c.editorId?.startsWith('debug:')?'Debug · r'+(get(c.editorId.slice(6))?.boundRevision||'?'):'');
 E.slot('editorDocument',c=>c.editorId?.startsWith('debug:')?render(c,raw(c.editorId.slice(6))):'');
 E.slot('transcriptMessage',c=>{if(c.m?.type!=='debug-investigation')return '';const inv=raw(c.m.investigationId);if(!inv)return '';return '<article class="system-card debug-card" data-k="debug-card:'+c.esc(inv.id)+'"><div class="system-card-head">'+c.icon('flask',15)+'<strong>Debug · Keep zero quantities</strong><span class="meta-pill">'+c.esc(inv.status.replaceAll('_',' '))+'</span></div><div class="system-card-body"><p>'+c.esc(inv.status==='resolved'?'Six checks passed. Temporary collector removed.':inv.reason==='target_changed'?'Target changed; no patch applied.':labels[inv.phaseIndex]+' · '+inv.target.path)+'</p><button class="soft-button" data-action="debug-open" data-id="'+c.esc(inv.id)+'">Open investigation</button></div></article>';});
 E.action('debug-open',(c,b)=>{const out=show(b.dataset.id);if(!out.ok)c.toast('Cannot open investigation',out.error);return true;});
 ['baseline','reproduce','analyze','apply','verify','cleanup','cancel','rebind','retry'].forEach(op=>E.action('debug-'+op,(c,b)=>{const id=b.dataset.id,result=op==='cancel'?cancel(id):op==='rebind'?rebind(id,Number(b.dataset.revision)):op==='retry'?retryCleanup(id):step(id,op,Number(b.dataset.revision));if(result.ok&&op==='rebind')show(result.id);else c.renderApp();if(!result.ok&&!['target_changed'].includes(result.error))c.toast('No change applied',result.error);return true;}));
 E.action('debug-revalidate',(c,b)=>{checkTarget(b.dataset.id);c.renderApp();return true;});
 E.action('debug-export',(c,b)=>{const data=exportData(b.dataset.id);if(data.ok===false)return true;const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.href=url;a.download='debug-'+b.dataset.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);return true;});
 E.chainAction('af-debug-start',c=>{const id=targets.get(c.thread.id);if(!id){c.closeMenu();c.openDialog({type:'debug-target-required'});return true;}const inv=raw(store().active[c.thread.id]);if(permitted(inv)&&['running','attention_required','failed_cleanup'].includes(inv.status)){show(inv.id);return true;}const out=begin(id);if(out.ok)show(out.id);return true;});
 E.slot('dialog',c=>c.state.dialog?.type==='debug-target-required'?'<div class="dialog"><div class="dialog-head"><h2>Select a Debug target</h2><button class="icon-button" data-action="close-dialog" aria-label="Close">'+c.icon('close',14)+'</button></div><div class="dialog-body"><p>No executable target is attached to this thread.</p><p class="debug-boundary">The local examples are in Demo Studio. No host or provider is connected.</p></div></div>':'');
 // Historical imported/scripted cards stay inspectable, but cannot mint proof by
 // incrementing a phase counter. Their old stored narrative is source lineage.
 ['af-debug-advance','af-debug-recover'].forEach(a=>E.chainAction(a,c=>{c.toast('Historical demonstration','Use a guided Debug investigation for calculated evidence.');return true;}));
 document.addEventListener('toggle',e=>{const n=e.target;if(n.isConnected&&n.matches?.('details[data-debug-disclosure]'))view.set(n.dataset.debugDisclosure,n.open);},true);
 E.chainAction('reset-all',()=>{epoch++;sources.clear();targets.clear();probes.clear();view.clear();receipts.clear();return false;});
 window.PM56_DEBUG={register,begin:targetId=>begin(targetId),get,source,step,cancel,rebind,retryCleanup,checkTarget,show,exportData,owns,phases,buggy,fixed,active:()=>get(store().active[E.ctx().thread.id]),collectorCount:()=>probes.size,
  example:{edit:externalEdit,changeCollector:probeChange,restoreCollector:restoreProbe},evaluate};
})();
