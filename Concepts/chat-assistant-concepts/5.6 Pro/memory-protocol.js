/* B08 — in-memory Evidence-Backed Gists, not a production MemoryProvider.
 * Owner: assistant-memory-subsystem §§3,5,6,7 + AMS-044/045/046.
 * One state store: PM56_FEATURES.state().memory.auto. Evidence payloads stay in
 * the local example registry; gists retain only compact claims and references.
 * The evaluator recognizes one exact local check contract. It does NOT prove
 * arbitrary natural-language claims, implement ANN search, or dispatch prompts.
 */
(function(){
 'use strict';
const E=window.PM56_EXT,F=window.PM56_FEATURES,T=window.PM56_TEACH,S=window.PM56_SHELL,copy=x=>JSON.parse(JSON.stringify(x));
 let epoch=1,seq=0,filter='Unverified',tab='auto';
 const runs=new Map(),sources=new Map(),proofs=new Map(),seen=new Map(),views=new Map(),disclosures=new Map(),dedupIndex=new Map();
 const uid=p=>'am-'+p+'-'+epoch+'-'+(++seq),now=()=>new Date().toISOString(),fail=error=>({ok:false,error});
 const context=()=>T.context(),all=()=>F.state().memory.auto,get=id=>all().find(x=>x.id===id);
 const fp=x=>{let h=2166136261;for(const c of String(x)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return 'fnv1a:'+ (h>>>0).toString(16).padStart(8,'0');};
 const contentKey=x=>JSON.stringify(x);
 const settings=()=>{const s=F.state().memory;s.options??={autoSaveUnverified:true,maxItems:5,budget:350};return s.options;};
 function allowed(g,c=context()){return c.consumer==='assistant'&&(g.project_id||'concept:pm')===c.projectId&&(!g.teaching_proposal||T.visibleRecords(c).some(r=>r.id===g.teaching_proposal.id));}
 function visible(){return all().filter(g=>allowed(g));}
 function log(g,event,detail){g.history??=[];g.history.push({event,detail,at:now()});}
 function summary(g){return (g.claims||[]).map(c=>c.text).join(' ');}
 function assess(g){
  if(!g)return fail('gist_missing');
  const previous=g.verification_state||g.verification||'Unverified',oldReason=g.reason;
  if(g.discarded){g.verification_state='Discarded';g.verification='discarded';g.reason='Discarded by you';return g;}
  let ok=Array.isArray(g.claims)&&g.claims.length>0,why=ok?'Evidence supports the stated check only.':'Legacy entry has no claim-level support.';
  for(const claim of g.claims||[]){
   const refs=(claim.evidence_support||[]),p=refs.length===1?proofs.get(refs[0]):null,s=p?sources.get(p.sourceId):null;
   claim.currentness=!s?'source_unavailable':s.body===p.sourceBody?'current':'needs_revalidation';
   const expected=p?'Local label-order checks passed ('+p.passed+'/'+p.total+' cases).':null;
   const ref=p&&(g.evidence_refs||[]).find(ref=>ref.ref===p.id&&ref.type==='TestRun'&&ref.run_id===p.runId&&ref.exit_code===p.exit_code&&ref.summary_hash===fp(JSON.stringify(p.cases)));
   const supported=!!ref&&p.projectId===g.project_id&&p.exit_code===0&&p.passed===p.total&&claim.kind==='local_check_result'&&claim.text===expected&&claim.support_scope===p.scope&&claim.currentness==='current';
   claim.support_state=supported?'supported':'unverified';
   if(!supported){ok=false;why=claim.currentness==='needs_revalidation'?'Source changed; this result needs revalidation.':p?'The evidence does not support this claim.':'No resolvable, claim-specific evidence.';}
  }
  if(g.teaching_proposal){ok=false;why='Proposed teaching change requires your explicit review.';}
  g.verification_state=ok?'Verified':'Unverified';g.verification=g.verification_state.toLowerCase();g.reason=why;
  g.summary=summary(g)||g.summary||'';g.text_hash=fp(g.summary);
  if(previous!==g.verification_state||oldReason!==why)log(g,'verification',g.verification_state+': '+why);
  return g;
 }
 function source(seed){if(!seed||typeof seed.body!=='string'||!seed.path)return fail('invalid_source');const c=context(),id=uid('source');sources.set(id,{id,projectId:c.projectId,path:seed.path,body:seed.body,revision:1});return {ok:true,id};}
 function begin(seed={}){
  const c=context();if(c.consumer!=='assistant')return fail('assistant_only');
  const s=seed.sourceId?sources.get(seed.sourceId):null;if(seed.sourceId&&(!s||s.projectId!==c.projectId))return fail('source_scope');
  const replacement=seed.teachingId?T.get(seed.teachingId):null;
  if(seed.teachingId&&(!replacement||!T.applies(replacement,c)))return fail('teaching_scope');
  const r={id:uid('run'),epoch,context:copy(c),state:'running',sourceId:s?.id||null,sourceBody:s?.body||null,claims:[],proofIds:[],milestone:false,boundary:false,gistId:null,proposal:replacement?{id:replacement.id,version:replacement.version||1,text:String(seed.proposal||'')}:null};
  runs.set(r.id,r);return {ok:true,id:r.id};
 }
 function validRun(id){const r=runs.get(id),c=context();return r&&r.epoch===epoch&&r.context.projectId===c.projectId&&r.context.userId===c.userId&&r.context.threadId===c.threadId?r:null;}
 function execute(id){
  const r=validRun(id);if(!r||r.state!=='running')return fail('run_not_active');const s=sources.get(r.sourceId);
  if(!s||s.body!==r.sourceBody)return fail('source_changed');
  if(r.proofIds.length)return {ok:true,evidence:copy(proofs.get(r.proofIds[0])),reused:true};
  // Fixed, inspectable local contract: sort trimmed labels, preserve input array.
  let config;try{config=JSON.parse(s.body);}catch{return fail('invalid_example_config');}
  if(Object.keys(config).sort().join(',')!=='caseSensitive,trim'||typeof config.trim!=='boolean'||typeof config.caseSensitive!=='boolean')return fail('unsupported_example_config');
  const solve=input=>input.slice().sort((a,b)=>{let x=config.trim?a.trim():a,y=config.trim?b.trim():b;if(!config.caseSensitive){x=x.toLowerCase();y=y.toLowerCase();}return x<y?-1:x>y?1:0;});
  const cases=[{name:'Leading whitespace',input:[' zebra','apple'],expected:['apple',' zebra']},{name:'Case-independent order',input:['Zebra','apple'],expected:['apple','Zebra']},{name:'Input unchanged',input:['b','a'],expected:['a','b']}];
  const result=cases.map(t=>{const original=JSON.stringify(t.input),actual=solve(t.input);return {...t,actual,pass:JSON.stringify(actual)===JSON.stringify(t.expected)&&JSON.stringify(t.input)===original};});
  const p={id:uid('evidence'),sourceId:s.id,sourceBody:s.body,sourcePath:s.path,projectId:r.context.projectId,runId:r.id,scope:'local-label-order-three-cases-v1',cases:result,passed:result.filter(t=>t.pass).length,total:result.length,at:now()};p.exit_code=p.passed===p.total?0:1;proofs.set(p.id,p);r.proofIds=[p.id];
  r.claims=[{claim_id:uid('claim'),kind:'local_check_result',text:'Local label-order checks passed ('+p.passed+'/'+p.total+' cases).',evidence_support:[p.id],support_scope:p.scope,currentness:'current'}];return {ok:true,evidence:copy(p)};
 }
 function persist(r,trigger){
  const claims=copy(r.claims.length?r.claims:[{claim_id:uid('claim'),kind:'unreviewed_summary',text:r.proposal?.text||'Assistant run completed; no supported outcome supplied.',evidence_support:[],support_scope:'unassessed',currentness:'source_unavailable'}]);
  const refs=r.proofIds.map(id=>{const p=proofs.get(id);return {type:'TestRun',ref:id,run_id:p.runId,exit_code:p.exit_code,summary_hash:fp(JSON.stringify(p.cases))};});
  const normalizedEvidence=r.proofIds.map(id=>{const p=proofs.get(id);return [p.sourcePath,p.sourceBody,p.scope,p.exit_code,p.cases];});
  const key=contentKey([r.context.projectId,claims.map(c=>[c.kind,c.text,c.support_scope]),normalizedEvidence,r.proposal]);
  let g=r.gistId?get(r.gistId):get(dedupIndex.get(key));if(g?.discarded)g=null;
  if(g){r.gistId=g.id;g.run_ids=[...new Set([...(g.run_ids||[]),r.id])];if(!g.triggers.includes(trigger)){g.triggers.push(trigger);log(g,'boundary',trigger);}return {ok:true,id:g.id,reused:true};}
  g={id:uid('gist'),project_id:r.context.projectId,thread_id:r.context.threadId,threadId:r.context.threadId,run_id:r.id,run_ids:[r.id],kind:r.proofIds.length?'Outcome':'Note',status:'Active',source:trigger,trigger:trigger==='AutoMilestone'?'milestone':'run_boundary',triggers:[trigger],pinned:false,claims,evidence_refs:refs,summary:claims.map(c=>c.text).join(' '),details:'',verification_state:'Unverified',created_at:now(),updated_at:now(),at:now(),dedup_fingerprint:fp(key),teaching_proposal:r.proposal?copy(r.proposal):null,blocked:!!r.proposal,blockedByRecordId:r.proposal?.id||null,history:[]};
  assess(g);if(g.verification_state==='Unverified'&&!settings().autoSaveUnverified)return {ok:true,dropped:true,reason:'unverified_saving_disabled'};
  log(g,'created',trigger);all().push(g);dedupIndex.set(key,g.id);r.gistId=g.id;return {ok:true,id:g.id,reused:false};
 }
 function milestone(id){const r=validRun(id);if(!r||r.state!=='running'||r.boundary)return fail('run_not_active');if(!r.proofIds.length)return fail('evidence_missing');if(r.milestone)return {ok:true,id:r.gistId,reused:true};r.milestone=true;return persist(r,'AutoMilestone');}
 function finish(id){const r=validRun(id);if(!r)return fail('stale_run');if(r.boundary)return {ok:true,id:r.gistId,reused:true};if(r.state!=='running')return fail('run_not_active');
  if(r.proofIds.length&&!r.milestone)milestone(id);r.state='completed';r.boundary=true;return persist(r,'AutoRunBoundary');}
 function boundary(t,m){if(!m||m.role!=='assistant'||m.type!=='text'||m.internalOnly)return fail('not_assistant_final');const key=(t.projectId||'concept:pm')+':'+t.id+':'+m.id;if(seen.has(key))return {ok:true,id:seen.get(key),reused:true};
  const r={id:'assistant-final:'+key,epoch,context:{...context(),threadId:t.id,projectId:t.projectId||'concept:pm'},state:'completed',sourceId:null,claims:[{claim_id:uid('claim'),kind:'unreviewed_summary',text:String(m.body||'').slice(0,180),evidence_support:[],support_scope:'unassessed',currentness:'source_unavailable'}],proofIds:[],proposal:null,boundary:true};
  const out=persist(r,'AutoRunBoundary');seen.set(key,out.id||null);return out;
 }
 function invalidate(id,body){const s=sources.get(id);if(!s||s.projectId!==context().projectId||typeof body!=='string')return fail('source_scope');s.body=body;s.revision++;for(const g of visible())assess(g);return {ok:true};}
 function preview(c=context()){
  if(c.consumer!=='assistant')return {kind:'concept_capsule_preview',items:[],teaching:[],excluded:[],payload:'',providerDispatched:false};
  const items=[],excluded=[];let used=0,truncated=false;for(const g of all().filter(x=>allowed(x,c))){assess(g);if(g.verification_state!=='Verified'){excluded.push({id:g.id,reason:g.reason});continue;}const cost=Math.ceil(g.summary.length/4);if(items.length>=settings().maxItems||used+cost>settings().budget){truncated=true;continue;}used+=cost;items.push({id:g.id,summary:g.summary});}
  const teaching=T.preview(c).items;return {kind:'concept_capsule_preview',items,teaching,excluded,payload:items.map(g=>g.summary).join('\n'),estimatedTokens:used,budget:settings().budget,truncated,providerDispatched:false};
 }
 function mutation(id,op){const g=get(id);if(!g||!allowed(g))return fail('outside_scope');if(op==='verify')assess(g);else if(op==='pin'){g.pinned=!g.pinned;log(g,'pin',g.pinned);}else if(op==='discard'){g.discarded=true;assess(g);log(g,'discard','Explicit user action');}else return fail('unknown_operation');return {ok:true,id:g.id,state:g.verification_state};}
 function correction(id){const g=get(id);if(!g||!allowed(g)||!g.teaching_proposal)return fail('proposal_missing');const t=T.get(g.teaching_proposal.id);if(!t||!T.active(t)||!T.applies(t,context())||(t.version||1)!==g.teaching_proposal.version)return fail('teaching_changed');return T.correction(t.id);}
 function exportData(){return JSON.stringify({kind:'concept_memory_history',persistence:'session_only',gists:visible().map(g=>copy(assess(g))),preview:preview()},null,2);}
 const button=(c,a,label,id='')=>'<button class="soft-button" data-action="'+a+'" data-id="'+c.esc(id)+'">'+label+'</button>';
 const gistTone=s=>s==='Verified'?'positive':s==='Discarded'?'idle':'warning';
 /* SHELL.disclosure has no attribute slot; the toggle listener below keys on
    data-memory-disclosure, so inject it beside the builder's own data-k. */
 const memDisclosure=(key,summaryHtml,bodyHtml,open)=>S.disclosure(key,summaryHtml,bodyHtml,open)
  .replace('<details','<details data-memory-disclosure="'+S.esc(key)+'"');
 function render(c,editor=false){const e=c.esc,v=views.get(c.thread.id)||{},list=visible().map(assess),selection=v.id?list.filter(g=>g.id===v.id):list.filter(g=>filter==='All'||g.verification_state===filter);const p=preview();
  const about=S.section({iconHtml:c.icon('info',12),label:'What this is',body:
   S.note(e('A gist is one sentence plus the claims it rests on and the evidence refs behind them. Automatic memory writes a gist at run boundaries and milestones — never mid-turn.'))+
   S.note(e('Verification is computed, not asserted: a claim is Verified only while its referenced local check still passes against an unchanged source. Everything else stays Unverified and is excluded from the next context.'))+
   S.note(e('Eligible means "would enter the next Assistant context right now". Local concept checks only — no persistent database, no model dispatch.'))});
  const controls=S.section({iconHtml:c.icon('settings',12),label:'Gist controls',meta:S.seg(['Unverified','Verified','All'].map(x=>[x,x]),v.id?null:filter,'memory-filter'),body:
   '<div class="mdl-card-actions">'+button(c,'memory-preview','Preview next context')+button(c,'memory-export','Export history')+button(c,'teach-open','Taught memory')+'</div>'});
  const previewPanel=v.preview?'<div data-k="memory-preview">'+S.section({iconHtml:c.icon('eye',12),label:'Next Assistant context',meta:e('Preview only · not dispatched'),body:
   (p.items.length?S.rows(p.items.map(x=>['<span data-capsule-gist="'+e(x.id)+'">'+e(x.summary)+'</span>',S.chip('positive','Included')])):S.note(e('No automatic summaries eligible.')))+
   (p.teaching.length?S.rows(p.teaching.map(x=>['<span data-capsule-teaching="'+e(x.id)+'">'+e(x.text)+'</span>',S.chip('accent','Taught')])):S.note(e('No teaching in this scope.')))+
   (p.excluded.length?S.rows(p.excluded.map(x=>{const g=get(x.id);return [e(g?g.summary:x.id),e(x.reason)+' '+S.chip('idle','Excluded')];})):'')+
   S.note(e(p.estimatedTokens+' / '+p.budget+' estimated automatic-summary tokens'+(p.truncated?' · limit applied':'')))})+'</div>':'';
  const gists=selection.map(g=>{
   const cl=(g.claims||[])[0]||{};
   return S.card({attrs:' data-k="gist:'+e(g.id)+'" data-gist="'+e(g.id)+'"',
    head:S.cardHead({copy:S.copy(e(g.summary),e((cl.support_scope||'unassessed')+' · '+(g.kind||'Note')+' · '+(cl.currentness||'source_unavailable')+(g.pinned?' · Pinned':''))),extra:S.chip(gistTone(g.verification_state),e(g.verification_state))}),
    body:S.note(e(g.reason))+((g.claims||[]).length?S.rows(g.claims.map(x=>[e(x.text),S.chip(x.support_state==='supported'?'positive':'idle',e(x.support_state||'unverified'))])):''),
    actions:button(c,'memory-verify','Recheck evidence',g.id)+button(c,'memory-pin',g.pinned?'Unpin':'Pin',g.id)+(!g.discarded?button(c,'memory-discard','Discard',g.id):'')+(g.teaching_proposal?button(c,'memory-correct','Review teaching correction',g.id):'')})+
   memDisclosure('evidence:'+g.id,e('Claims and evidence'),
    (g.evidence_refs||[]).map(ref=>{const q=proofs.get(ref.ref);return q?'<div class="memory-evidence"><strong>'+e(q.sourcePath)+'</strong><pre>'+e(q.sourceBody)+'</pre>'+q.cases.map(t=>'<p>'+e(t.name)+' · '+(t.pass?'Pass':'Not passing')+'</p>').join('')+'</div>':S.note(e('Evidence not available in this session.'));}).join(''),
    disclosures.get('evidence:'+g.id))+
   memDisclosure('history:'+g.id,e('History'),'<ol>'+(g.history||[]).map(h=>'<li>'+e(h.event)+' · '+e(h.detail)+'</li>').join('')+'</ol>',disclosures.get('history:'+g.id));
  }).join('')||S.note(e('No '+(filter==='All'?'':filter.toLowerCase()+' ')+'gists in this project.'));
  return '<article class="memory-document" data-k="auto-memory-doc">'+about+controls+previewPanel+gists+(editor?(window.PM56_MEMORY_DEMOS?.guide(c,true)||''):'')+'</article>';
 }
 function show(id){const c=E.ctx();if(id&&(!get(id)||!allowed(get(id))))return fail('outside_scope');views.set(c.thread.id,{id:id||null,preview:false});filter='Unverified';c.closeMenu();c.closeDialog();c.state.editorRevealed=true;c.openEditor('memory:'+c.thread.id);return {ok:true};}
 function dialog(c){const e=c.esc,p=preview();
  return S.dialog({iconHtml:c.icon('brain',15),title:e('Memory'),
   sub:e('What the assistant keeps between turns: gists captured automatically from finished work, plus teaching you wrote on purpose. Both are session-local concept records.'),
   pill:e(p.items.length+' eligible'),width:780,
   body:S.tabs([['auto','Automatic · '+visible().length],['taught','Taught by you · '+T.visibleRecords(context()).filter(T.active).length]],tab,{action:'af-memory-section'})+(tab==='auto'?render(c):T.memoryRows(c))});}
 E.chainAction('af-memory-open',c=>{filter='Unverified';tab='auto';views.delete(c.thread.id);c.closeMenu();c.openDialog({type:'af-memory'});return true;});
 E.chainAction('af-memory-verify',(c,b)=>{mutation(b.dataset.value,'verify');c.renderApp();return true;});
 // Compatibility gallery replay: produces an unverified candidate, never evidence.
 function simulate(){const locked=T.visibleRecords(context()).find(r=>T.active(r)&&r.locked);const r=begin(locked?{teachingId:locked.id,proposal:'Recorded proposal for explicit teaching review.'}:{});return r.ok?finish(r.id):r;}
 E.chainAction('af-memory-simulate',c=>{simulate();c.renderApp();return true;});
 E.action('memory-open',(c,b)=>{show(b.dataset.id);return true;});
 E.action('memory-filter',(c,b)=>{if(['All','Verified','Unverified'].includes(b.dataset.value)){filter=b.dataset.value;views.set(c.thread.id,{...views.get(c.thread.id),id:null});}c.renderApp();return true;});
 E.action('memory-preview',c=>{views.set(c.thread.id,{...views.get(c.thread.id),preview:!views.get(c.thread.id)?.preview});c.renderApp();return true;});
 E.chainAction('af-memory-section',(c,b)=>{tab=b.dataset.value==='taught'?'taught':'auto';c.renderOverlays();return true;});
 ['verify','pin','discard'].forEach(op=>E.action('memory-'+op,(c,b)=>{mutation(b.dataset.id,op);c.renderApp();return true;}));
 E.action('memory-correct',(c,b)=>{const r=correction(b.dataset.id);if(!r.ok)c.toast('Teaching unchanged',r.error);return true;});
 E.action('memory-export',()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([exportData()],{type:'application/json'}));a.href=url;a.download='automatic-memory-history.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);return true;});
 E.slot('editorTabLabel',c=>c.editorId?.startsWith('memory:')?'Gist Review':'');E.slot('editorDocument',c=>c.editorId?.startsWith('memory:')?render(c,true):'');
 document.addEventListener('toggle',e=>{const n=e.target;if(n.isConnected&&n.matches?.('details[data-memory-disclosure]'))disclosures.set(n.dataset.memoryDisclosure,n.open);},true);
 E.chainAction('reset-all',()=>{dedupIndex.clear();disclosures.clear();epoch++;runs.clear();sources.clear();proofs.clear();seen.clear();views.clear();filter='Unverified';return false;});
 window.PM56_AUTO_MEMORY={simulate,source,begin,execute,milestone,finish,boundary,invalidate,preview,assess,mutation,correction,exportData,show,dialog,all,get,visible,settings,context,run:id=>runs.has(id)?copy(runs.get(id)):null,evidence:id=>proofs.has(id)?copy(proofs.get(id)):null};
})();
