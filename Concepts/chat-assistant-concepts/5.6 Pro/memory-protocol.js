/* B08 — in-memory Evidence-Backed Gists, not a production MemoryProvider.
 * Owner: assistant-memory-subsystem §§3,5,6,7 + AMS-044/045/046.
 * One state store: PM56_FEATURES.state().memory.auto. Evidence payloads stay in
 * the local example registry; gists retain only compact claims and references.
 * The evaluator recognizes one exact local check contract. It does NOT prove
 * arbitrary natural-language claims, implement ANN search, or dispatch prompts.
 *
 * Presentation (DESIGN-SPEC 8.10, 2026-09-27): the Memory sheet (pmxSheet: the next-message ribbon, Notes it took /
 * Your rules, the grouped list and the detail with its proof), the Gist Review document (pmxView), the reply meta
 * tick (pmxTick) and the one memory event that earns a line in the chat, a suggested change to a locked rule
 * (pmxLedgerLine, family ledger). "Out of date" is a display group only; verification_state stays
 * Unverified | Verified | Discarded (IMPACT A1-31).
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
  const out=persist(r,'AutoRunBoundary');seen.set(key,out.id||null);if(out.id)link(m.id,out.id);
  /* the same boundary records the rules that rode along with the message this reply answered, and checks the finished
     reply against each one (Teach's "Followed 1 of your rules" / "Missed 1 of your rules", owner answer E-36) */
  T.noteReply?.(t,m);return out;
 }
 function invalidate(id,body){const s=sources.get(id);if(!s||s.projectId!==context().projectId||typeof body!=='string')return fail('source_scope');s.body=body;s.revision++;for(const g of visible())assess(g);return {ok:true};}
 /* `dropped` and items[].tokens (additive): the verified notes the space for notes could not hold, so the ribbon can
    say how many didn't fit and the next-message list can name them. Rules never count against it (IMPACT A1-31). */
 function preview(c=context()){
  if(c.consumer!=='assistant')return {kind:'concept_capsule_preview',items:[],teaching:[],excluded:[],dropped:[],payload:'',providerDispatched:false};
  const items=[],excluded=[],dropped=[];let used=0,truncated=false;for(const g of all().filter(x=>allowed(x,c))){assess(g);if(g.verification_state!=='Verified'){excluded.push({id:g.id,reason:g.reason});continue;}const cost=Math.ceil(g.summary.length/4);if(items.length>=settings().maxItems||used+cost>settings().budget){truncated=true;dropped.push({id:g.id,reason:'budget'});continue;}used+=cost;items.push({id:g.id,summary:g.summary,tokens:cost});}
  const teaching=T.preview(c).items;return {kind:'concept_capsule_preview',items,teaching,excluded,dropped,payload:items.map(g=>g.summary).join('\n'),estimatedTokens:used,budget:settings().budget,truncated,providerDispatched:false};
 }
 function mutation(id,op){const g=get(id);if(!g||!allowed(g))return fail('outside_scope');if(op==='verify')assess(g);else if(op==='pin'){g.pinned=!g.pinned;log(g,'pin',g.pinned);}else if(op==='discard'){g.discarded=true;assess(g);log(g,'discard','Explicit user action');}else return fail('unknown_operation');return {ok:true,id:g.id,state:g.verification_state};}
 function correction(id){const g=get(id);if(!g||!allowed(g)||!g.teaching_proposal)return fail('proposal_missing');const t=T.get(g.teaching_proposal.id);if(!t||!T.active(t)||!T.applies(t,context())||(t.version||1)!==g.teaching_proposal.version)return fail('teaching_changed');return T.correction(t.id);}
 function exportData(){return JSON.stringify({kind:'concept_memory_history',persistence:'session_only',gists:visible().map(g=>copy(assess(g))),preview:preview()},null,2);}

 /* ================================================================== presentation (DESIGN-SPEC 8.10)
    View state is module-local: `filter`/`tab` for the sheet, `views` per thread ({id: the selected note, preview: the
    next-message list shown in the detail pane}), `disclosures` for the native details. The motion moments read
    module-local previous-value maps (5.3 item 4): `reveal` (a Verify that turned a note Verified: the check is
    revealed by a clip, IMPACT A1-05), `arriving` (a note that became eligible while the sheet is open: its card flies
    in from the note's row) and `leaving` (a card that left the ribbon slides out before the template drops it). */
 const P=()=>window.PM56_PMX||null;
 const clock=()=>{const x=P();return x&&x.timeline?x.timeline.now():performance.now();};
 const tok=(name,kind)=>{const x=P();return x?(kind==='wait'?x.wait(name):x.t(name)):0;};
 const later=(ms,fn)=>{const x=P();if(x&&x.timeline)x.timeline.after(ms,fn);else setTimeout(fn,ms);};
 const byMessage=new Map(),lastCheck=new Map(),notices=new Map(),leaving=new Map();
 const arriving=new Set(),landing=new Set();let reveal=null,ribbonPrev=null;
 const W=S.PMX_COPY.memory;
 const plural=(n,one,many)=>n===1?'1 '+one:(n?n+' '+many:'no '+many);
 const short=(s,n)=>{s=String(s||'').replace(/\s+/g,' ').trim();if(s.length<=n)return s;const cut=s.slice(0,n),sp=cut.lastIndexOf(' ');return (sp>n*0.5?cut.slice(0,sp):cut).replace(/[\s,.;:]+$/,'')+'…';};
 const hm=iso=>S.pmxTime.at(iso,null,{day:false})||'';
 const q=s=>String(s).replace(/["\\]/g,'\\$&');
 function proofOf(g){for(const c of g.claims||[]){const refs=c.evidence_support||[];if(refs.length===1&&proofs.has(refs[0]))return proofs.get(refs[0]);}return null;}
 function stale(g){return !g.discarded&&g.verification_state!=='Verified'&&(g.claims||[]).some(c=>c.currentness==='needs_revalidation');}
 function groupOf(g){return g.discarded?'discarded':g.teaching_proposal?'decide':g.verification_state==='Verified'?'verified':stale(g)?'stale':'unverified';}
 const GROUPS=[['decide','Needs your decision'],['unverified','Unverified'],['verified','Verified'],['stale','Out of date'],['discarded','Discarded']];
 const GLYPH={decide:'hand',unverified:'ring-dashed',verified:'check-circle',stale:'slash-circle',discarded:'trash'};
 /* neon step 3E (2026-10-02): a group's state is the shared status set, lit and still (PM56_SHELL.pmxStatus): Needs your
    decision is needs-you, Unverified pending, Verified complete, Out of date skipped; Discarded keeps the trash glyph
    (an action's concept, not a state). GLYPH stays as the drawing used when the neon family is absent. */
 const STATE_MARK={decide:'needs',unverified:'unverified',verified:'verified',stale:'stale'};
 const mark=(k,size)=>STATE_MARK[k]&&S.pmxStatus?S.pmxStatus(STATE_MARK[k],size):S.pmxGlyph(GLYPH[k],size);
 const FILTER_HELP={All:'Everything, including forgotten notes.',Verified:'A test still backs it up, so it’s used.',Unverified:'Not proven yet. Kept for you to review; not used.'};
 const TAB_HELP={auto:'Saved by itself after a reply',taught:'Things you told it to always do'};
 function inFilter(g,f=filter){return f==='All'||(f==='Verified'?g.verification_state==='Verified':g.verification_state==='Unverified');}
 const bucket=g=>g.verification_state==='Verified'?'Verified':g.verification_state==='Unverified'?'Unverified':'All';
 const word=g=>g.verification_state==='Verified'?W.verified:g.verification_state==='Discarded'?W.discarded:W.unverified;
 /* the note's title in plain words: a proven local check reads as what it proves (its claim text stays the record's) */
 const titleOf=g=>{const p=proofOf(g);if(p&&(g.claims||[]).length===1&&g.claims[0].kind==='local_check_result')return 'Labels sort correctly ('+p.passed+' of '+p.total+' checks pass)';return g.summary||'A note with no words';};
 function ruleOf(g){return g.teaching_proposal?T.get(g.teaching_proposal.id):null;}
 function coversOf(g){
  const k=groupOf(g),p=proofOf(g);
  if(k==='discarded')return 'Forgotten. It isn’t used.';
  if(k==='decide'){const r=ruleOf(g);return 'Suggests changing your rule “'+short(r?r.text:'',26)+'”';}
  if(k==='stale')return 'The file changed after the check';
  if(p)return 'Covers: '+p.total+' label-sorting '+(p.total===1?'test':'tests');
  return 'Nothing proves this yet';
 }
 function stateHelp(g){
  const k=groupOf(g);
  if(k==='discarded')return 'Forgotten. It isn’t used and won’t come back.';
  if(k==='decide')return 'It waits for you. Nothing changes until you choose.';
  if(k==='verified')return FILTER_HELP.Verified;
  if(k==='stale')return W.outOfDate;
  return FILTER_HELP.Unverified;
 }
 /* the note's journey in plain words ("Saved after a reply · 10:32 AM → Verified · 10:35 AM → Marked out of date") */
 function story(g){
  const rank={created:0,verification:1,pin:2,discard:3};
  const list=(g.history||[]).filter(h=>h.event in rank).map((h,i)=>({h,i})).sort((a,b)=>(Date.parse(a.h.at)-Date.parse(b.h.at))||(rank[a.h.event]-rank[b.h.event])||(a.i-b.i)).map(x=>x.h);
  const out=[];
  if(!list.some(h=>h.event==='created')&&(g.created_at||g.at))out.push({t:g.trigger==='milestone'?'Saved when the checks passed':'Saved after a reply',at:g.created_at||g.at});
  for(const h of list){
   let t;const d=String(h.detail);
   if(h.event==='created')t=d==='AutoMilestone'?'Saved when the checks passed':'Saved after a reply';
   else if(h.event==='verification'){t=/^Verified/.test(d)?'Verified':/revalidation/.test(d)?'Marked out of date · file changed':/teaching/.test(d)?'Held for your decision':'Not proven yet';if(!out.length||(t==='Not proven yet'&&out.length===1))continue;}
   else if(h.event==='pin')t=d==='true'?'Pinned by you':'Unpinned';
   else t='Discarded by you';
   if(out.length&&out[out.length-1].t===t)continue;
   out.push({t,at:h.at});
  }
  return out;
 }
 function pickSel(id,shown){return id&&shown.some(g=>g.id===id)?id:(shown[0]?shown[0].id:null);}
 function disc(e,key,label,body,dflt){const open=disclosures.has(key)?disclosures.get(key):dflt;
  return S.pmxDisclosure({key,cls:'pmx-mem-disc',attrs:'data-memory-disclosure="'+e(key)+'"',open,summary:label,body});}

 /* ---- the ribbon: "what your next message brings" (the sheet's plate, keyed memory-preview; G-21 hooks on its cards) */
 const CARD_MAX=3;
 function ribbon(c,p,v){
  const e=c.esc,notes=p.items.map(x=>({kind:'note',id:x.id,text:get(x.id)?titleOf(get(x.id)):x.summary,sub:'Note · verified'})),
   rules=p.teaching.map(x=>{const r=T.get(x.id);return {kind:'rule',id:x.id,text:x.text,sub:'Rule'+(r&&r.locked?' · locked':'')};});
  const current=notes.concat(rules),shown=current.slice(0,CARD_MAX),ids=new Set(shown.map(x=>x.id));
  /* a card that left since the last render slides out first (never under reduced motion: the end state is instant) */
  if(ribbonPrev&&!(P()&&P().reduced())){
   for(const [id,x] of ribbonPrev)if(!ids.has(id)&&!leaving.has(id)){leaving.set(id,x);later(tok('row'),()=>{if(leaving.delete(id))E.ctx().renderOverlays();});}
   for(const x of shown)if(!ribbonPrev.has(x.id)){arriving.add(x.id);landing.add(x.id);}
  }
  ribbonPrev=new Map(shown.map(x=>[x.id,x]));
  for(const id of [...leaving.keys()])if(ids.has(id))leaving.delete(id);
  const gone=[...leaving.values()],more=current.length-shown.length;
  const card=(x,i,out)=>'<span class="pmx-mem-card" data-k="'+(x.kind==='note'?'mc:':'mr:')+e(x.id)+'" data-kind="'+x.kind+'"'+(out?' data-state="leaving"':(landing.has(x.id)?' data-state="arriving"':'')+(x.kind==='note'?' data-capsule-gist="'+e(x.id)+'"':' data-capsule-teaching="'+e(x.id)+'"'))+
   ' data-pmx-part="'+(x.kind==='note'?'notes':'rules')+'" style="--i:'+i+'">'+S.pmxGlyph(x.kind==='note'?'check-circle':'lock',14)+
   '<span class="pmx-mem-card-t">'+e(x.text)+'</span><small>'+e(x.sub)+'</small></span>';
  const cards=shown.map((x,i)=>card(x,i,false)).join('')+gone.map((x,i)=>card(x,shown.length+i,true)).join('')+
   (more>0?'<span class="pmx-mem-more" data-k="mc-more">+'+more+' more</span>':'')+
   (!current.length&&!gone.length?'<p class="pmx-mem-nocards">Verified notes and the rules you taught ride along here.</p>':'');
  /* a note whose card is still flying in is not counted yet: the meter ticks (and its count rolls) when the card lands */
  const flying=p.items.filter(it=>landing.has(it.id)),budget=p.budget||350,drop=(p.dropped||[]).length;
  const used=Math.max(0,(p.estimatedTokens||0)-flying.reduce((a,it)=>a+(it.tokens||0),0));
  /* one segment per note that rides along; a note that just left keeps its segment at width 0 while its card slides
     out, so the meter drains instead of jumping */
  let x=0;const seg=(id,w,at)=>'<i class="pmx-mem-seg" data-k="seg:'+e(id)+'" style="--x:'+at.toFixed(4)+';--w:'+Math.max(0,w-0.004).toFixed(4)+'"></i>';
  const segs=p.items.map(it=>{const w=landing.has(it.id)?0:Math.min(1,(it.tokens||0)/budget),s=seg(it.id,w,x);x+=w;return s;}).join('')+gone.filter(g=>g.kind==='note').map(g=>seg(g.id,0,x)).join('');
  const say='<p class="pmx-mem-say">Your next message will bring <b data-pmx-part="notes">'+plural(p.items.length,'note','notes')+'</b> and <b data-pmx-part="rules">'+plural(p.teaching.length,'rule','rules')+'</b>.</p>';
  const link='<button type="button" class="text-button pmx-mem-link" data-action="memory-preview" aria-pressed="'+!!v.preview+'">'+(v.preview?'Back to the note':'See what your next message will include')+'</button>';
  const meter='<div class="pmx-mem-meter" data-pmx-part="meter notes"><span class="pmx-mem-track" aria-hidden="true">'+segs+'</span>'+
   '<span class="pmx-mem-cap" data-hover-key="mem-space" data-hover-tip="'+e(S.PMX_COPY.tokensHover+' Rules don’t use this space.')+'">Space for notes: <b class="pmx-mem-cnt" data-k="mcnt:'+used+'">'+used+' of '+budget+'</b> tokens'+(drop?' · '+drop+' didn’t fit':'')+'</span></div>';
  return S.pmxPlate({key:'memory-preview',kind:'memory',mode:'caption',cls:'pmx-mem-plate',caption:'<div class="pmx-mem-ribbon">'+say+link+'<div class="pmx-mem-cards">'+cards+'</div>'+meter+'</div>'});
 }

 /* ---- the list (grouped) and the detail */
 function rowHtml(e,g,selId,i,af){
  const k=groupOf(g);
  return '<button type="button" class="pmx-mem-row" data-k="gist:'+e(g.id)+'" data-gist="'+e(g.id)+'" data-action="memory-select" data-id="'+e(g.id)+'" data-state="'+k+'" aria-pressed="'+(g.id===selId)+'"'+(k==='decide'?' data-tone="warm"':'')+(af&&g.id===selId?' data-pmx-autofocus':'')+' style="--i:'+Math.min(i,5)+'">'+
   '<span class="pmx-mem-rglyph" data-k="mrg:'+e(g.id)+'">'+mark(k,15)+'</span>'+
   '<span class="pmx-mem-rcopy"><b>'+e(titleOf(g))+'</b><small>'+e(word(g))+' · '+e(coversOf(g))+(g.pinned&&!g.discarded?' · '+e(W.pinned):'')+'</small></span>'+
   '<span class="pmx-mem-time">'+e(hm(g.created_at||g.at))+'</span></button>';
 }
 function listHtml(e,shown,selId,af){
  if(!shown.length)return '<div class="pmx-mem-nofit"><p class="pmx-mem-none">'+(filter==='Verified'?'No verified notes yet. A note is verified when a passing test backs it up.':filter==='Unverified'?'No unverified notes right now.':'No notes yet.')+'</p>'+(filter!=='All'?'<button type="button" class="text-button" data-action="memory-filter" data-value="All">Show every note</button>':'')+'</div>';
  let i=0;
  return GROUPS.map(([k,label])=>{const rows=shown.filter(g=>groupOf(g)===k);if(!rows.length)return '';
   return '<div class="pmx-mem-group" data-k="mg:'+k+'"><p class="pmx-mem-glabel">'+label+'</p>'+rows.map(g=>rowHtml(e,g,selId,i++,af)).join('')+'</div>';}).join('');
 }
 function proofHtml(e,g,p){
  if(!p)return '<p class="pmx-mem-none">'+(g.teaching_proposal?'This is a suggestion, not a tested fact.':'Nothing proves this yet. It was saved from a reply, not from a passing test.')+'</p>';
  return (stale(g)?'<p class="pmx-mem-warn">'+S.pmxGlyph('warn',13)+'<span>The file changed after this check, so these results may not hold any more.</span></p>':'')+
   '<p class="pmx-mem-file">'+S.pmxGlyph('file',13)+'<b>'+e(p.sourcePath)+'</b><span>'+p.passed+' of '+p.total+' '+(p.total===1?'case':'cases')+' passed</span></p>'+
   '<ul class="pmx-mem-cases">'+p.cases.map(t=>'<li data-state="'+(t.pass?'pass':'fail')+'">'+S.pmxGlyph(t.pass?'check':'close',13)+'<span>'+e(t.name)+'</span></li>').join('')+'</ul>'+
   '<p class="pmx-mem-cap2">What was tested</p><pre class="pmx-mem-code">'+e(p.sourceBody)+'</pre>';
 }
 function storyHtml(e,g){
  const steps=story(g);if(!steps.length)return '<p class="pmx-mem-none">Nothing has happened to it yet.</p>';
  return '<ol class="pmx-mem-journey">'+steps.map((s,i)=>'<li>'+(i?S.pmxGlyph('chevron-right',12):'')+'<span>'+e(s.t)+(hm(s.at)?' · '+e(hm(s.at)):'')+'</span></li>').join('')+'</ol>';
 }
 function checkedLine(e,g){
  const k=lastCheck.get(g.id);if(!k)return '';
  const when=S.pmxTime.ago(k.at)||'just now',v=k.state==='Verified';
  const say=v?(k.used?'verified. It joins your next message.':'verified, but it didn’t fit in the space for notes.'):k.stale?'still out of date. The checks have to run again on the changed file.':'still not proven. Nothing backs it up yet.';
  return '<p class="pmx-mem-checked" data-k="mchk:'+e(g.id)+':'+k.n+'" role="status">'+(S.pmxStatus?S.pmxStatus(v?'verified':'unverified',13):S.pmxGlyph(v?'check-circle':'ring-dashed',13))+'<span>Tested again '+e(when)+': '+say+'</span></p>';
 }
 function decideHtml(e,g){
  const r=ruleOf(g),n=notices.get(g.id),id=e(g.id);
  return '<div class="pmx-mem-decide">'+S.pmxDecision({key:'mdec:'+g.id,tone:'warm',glyph:'hand',sentence:'<b>It suggests changing your rule.</b> '+(r?'“'+e(short(r.text,64))+'” ':'Your rule ')+'won’t change unless you say so.',
    actions:[{action:'memory-discard',attrs:'data-id="'+id+'"',label:'Keep my rule',soft:true},{action:'memory-correct',attrs:'data-id="'+id+'"',label:'Edit my rule…'}]})+
   '<p class="pmx-mem-acts-help">Keep my rule forgets this suggestion; your rule stays as it is. Edit my rule opens it in Teach.</p>'+
   (n?'<p class="pmx-mem-warn" role="status">'+S.pmxGlyph('warn',13)+'<span>'+e(n)+'</span></p>':'')+'</div>';
 }
 function actsHtml(e,g){
  const id=e(g.id);
  return '<div class="pmx-mem-acts"><button type="button" class="primary-button pmx-mem-verify" data-action="memory-verify" data-id="'+id+'" data-pmx-affects="notes meter">Verify</button>'+
   '<button type="button" class="text-button" data-action="memory-pin" data-id="'+id+'">'+(g.pinned?'Unpin':'Pin')+'</button>'+
   '<button type="button" class="text-button" data-action="memory-discard" data-id="'+id+'" data-pmx-affects="notes meter">Discard</button></div>'+
   '<p class="pmx-mem-acts-help">Verify: re-test whether this is still true · '+(g.pinned?'Unpin: allow cleaning this up again':'Pin: never clean this up')+' · Discard: forget it</p>';
 }
 /* raw ids, scopes and the canonical commands live only here (DON'T 18; 8.15 rule 1) */
 function techHtml(e,g){
  const cl=(g.claims||[])[0]||{};
  return '<p class="pmx-mem-tech">Note '+e(g.id)+' · '+e(g.kind||'Note')+' · covers '+e(cl.support_scope||'unassessed')+' · proof '+e(cl.currentness||'source_unavailable')+'</p>'+
   '<p class="pmx-mem-tech">Verify runs cmd.chat.memory.verify · Pin cmd.chat.memory.pin · Discard and Keep my rule cmd.chat.memory.discard · Edit my rule cmd.chat.teach.capture (mode correct) · the next-message list cmd.chat.memory.preview_capsule · Also keep notes that aren’t verified yet cmd.chat.memory.toggle_auto_save_unverified · Export memory: new command request cmd.chat.memory.export {scope} (N-7, owner answer E-32; a local file in this concept) · Done: no command (view state)</p>';
 }
 function detailHtml(e,g,doc){
  const k=groupOf(g),p=proofOf(g);
  return '<div class="pmx-mem-detail" data-k="md:'+e(g.id)+'">'+
   '<p class="pmx-mem-state"><span class="pmx-mem-sglyph" data-k="mst:'+e(g.id)+'" data-state="'+k+'">'+mark(k,15)+'</span><span><b>'+e(word(g))+'</b> · '+e(stateHelp(g))+(g.pinned&&!g.discarded?' · '+e(W.pinned):'')+'</span></p>'+
   '<h3 class="pmx-mem-claim">'+e(titleOf(g))+'</h3>'+
   (g.provenance==='recorded'?'<p class="pmx-mem-prov">'+S.pmxGlyph('play-ring',13)+'<span>'+e(S.PMX_COPY.cost.recorded)+'</span></p>':'')+
   (k==='decide'?decideHtml(e,g):'')+
   disc(e,'evidence:'+g.id,'Why it believes this',proofHtml(e,g,p),true)+
   disc(e,'history:'+g.id,'Its story',storyHtml(e,g),true)+
   checkedLine(e,g)+
   (k==='decide'||k==='discarded'?'':actsHtml(e,g))+
   (doc?disc(e,'tech:'+g.id,'Technical details',techHtml(e,g),false)+disc(e,'raw:'+g.id,'Show raw data','<pre class="pmx-mem-code">'+e(JSON.stringify(g,null,2))+'</pre>',false):'')+
   '</div>';
 }
 /* the next-message list (the ribbon's link, and the document's action): what rides along and what is left out */
 function nextHtml(e,p,key){
  const left=p.excluded.map(x=>{const g=get(x.id);if(!g||g.discarded)return null;const k=groupOf(g);return {g,why:k==='decide'?'Waiting for your decision':k==='stale'?'Out of date: the file changed after the check':'Not proven yet'};}).filter(Boolean)
   .concat((p.dropped||[]).map(x=>({g:get(x.id),why:'Didn’t fit in the space for notes'})).filter(x=>x.g));
  const li=(glyph,attr,text,why)=>'<li'+attr+'>'+S.pmxGlyph(glyph,13)+'<span>'+e(text)+'</span>'+(why?'<small>'+e(why)+'</small>':'')+'</li>';
  return '<section class="pmx-mem-next" data-k="'+key+'"><h3 class="pmx-mem-h">What your next message will include</h3><p class="pmx-help">Nothing is sent until you send a message.</p>'+
   '<h4>Notes · '+p.items.length+'</h4>'+(p.items.length?'<ul>'+p.items.map(x=>li('check-circle',' data-capsule-gist="'+e(x.id)+'" data-state="in"',get(x.id)?titleOf(get(x.id)):x.summary,'')).join('')+'</ul>':'<p class="pmx-mem-none">No verified notes yet.</p>')+
   '<h4>Your rules · '+p.teaching.length+'</h4>'+(p.teaching.length?'<ul>'+p.teaching.map(x=>li('lock',' data-capsule-teaching="'+e(x.id)+'" data-state="rule"',x.text,'')).join('')+'</ul>':'<p class="pmx-mem-none">No rules apply here.</p>')+
   (left.length?'<h4>Left out · '+left.length+'</h4><ul>'+left.map(x=>li('ring-dashed',' data-state="out"',titleOf(x.g),x.why)).join('')+'</ul>':'')+'</section>';
 }
 /* first open or empty: the 3-step caption replaces the list (8.10) */
 function stepsHtml(any){
  const st=[['quote','A reply ends'],['notebook','a note is jotted down'],['check-circle','a passing test verifies it'],['bookmark','it joins your next message']];
  return '<div class="pmx-mem-empty" data-k="mem-steps"><ol class="pmx-mem-steps">'+st.map((s,i)=>'<li>'+(i?S.pmxGlyph('chevron-right',12,'pmx-mem-step-sep'):'')+S.pmxGlyph(s[0],15)+'<span>'+s[1]+'</span></li>').join('')+'</ol>'+
   '<p class="pmx-help">'+(any?'This is how a note becomes part of your next message.':'No notes yet. Puppet Master saves one by itself after each reply; only notes a test backs up are used.')+'</p></div>';
 }
 function paneState(c){
  const tid=c.thread.id,v=views.get(tid)||{},notes=visible().map(assess),shown=notes.filter(g=>inFilter(g)),selId=pickSel(v.id,shown);
  return {v,notes,shown,selId,sel:selId?get(selId):null};
 }
 function notesPanes(c,p,st,doc){
  const e=c.esc,cls=doc?'pmx-mem-panes':'pmx-mem-panes mdl-section';
  if(!st.notes.length)return '<div class="'+cls+'" data-k="mem-panes" data-state="empty">'+stepsHtml()+'</div>';
  const side=st.v.preview?nextHtml(e,p,doc?'memory-preview':'mem-next'):st.sel?detailHtml(e,st.sel,doc):stepsHtml(true);
  return '<div class="'+cls+'" data-k="mem-panes"><div class="pmx-mem-list" data-k="mem-list">'+listHtml(e,st.shown,st.selId,!doc)+'</div><div class="pmx-mem-side" data-k="mem-side">'+side+'</div></div>';
 }
 function filterSwitch(){
  return S.pmxSwitch({key:'mem-filter',size:'small',label:'Show',action:'memory-filter',current:filter,options:['All','Verified','Unverified'].map(x=>({value:x,label:x}))});
 }

 /* ---- the Memory sheet (wide). Focus after it closes: Done leaves as `save` (to the wand trigger); ×, Escape and the
    scrim leave as `cancel` (to the control that opened it, else the wand trigger; IMPACT A1-36). */
 function dialog(c){
  const p=preview(),st=paneState(c),rules=T.visibleRecords(context()).filter(T.active).length;
  /* focus on open (6.7): the selected note's row, else the active tab */
  const af=tab!=='auto'||!st.selId||st.v.preview?' data-pmx-autofocus':'';
  const tabs=S.pmxTabs({key:'mem-tabs',current:tab,action:'af-memory-section',items:[
   {value:'auto',label:'Notes it took',count:st.notes.filter(g=>!g.discarded).length,attrs:'data-pmx-affects="notes"'+(tab==='auto'?af:'')},
   {value:'taught',label:'Your rules',count:rules,attrs:'data-pmx-affects="rules"'+(tab==='taught'?af:'')}]});
  const bar='<div class="pmx-mem-bar">'+tabs+(tab==='auto'?'<div class="pmx-mem-filter">'+filterSwitch()+'</div>':'')+'</div>'+
   '<div class="pmx-mem-helps"><p class="pmx-help">'+TAB_HELP[tab]+'</p>'+(tab==='auto'?'<p class="pmx-help pmx-mem-fhelp">'+FILTER_HELP[filter]+'</p>':'')+'</div>';
  const panes=tab==='auto'?notesPanes(c,p,st,false):'<div class="pmx-mem-panes mdl-section" data-k="mem-panes" data-state="rules">'+T.memoryRows(c)+'</div>';
  const check=S.pmxCheck({key:'mem-autosave',attrs:'data-memory-input="autoSaveUnverified"',checked:settings().autoSaveUnverified!==false,affects:'notes',
   label:'Also keep notes that aren’t verified yet',helper:'They’re kept for you to review; only verified notes are used.'});
  /* FOUNDATION REQUEST (MEMTEACH notes): pmxFoot({cancel:false}). Memory applies every change at once, so a
     Cancel beside Done would promise an undo that does not exist; the builder always draws one, so it is taken out. */
  const foot=S.pmxFoot({cls:'pmx-mem-foot',readback:check,extra:'<button type="button" class="text-button pmx-mem-export" data-action="memory-export">'+S.pmxGlyph('download',14)+'<span>Export memory</span></button>',
   primary:{action:'memory-done',label:'Done'}}).replace(/<button type="button" class="soft-button pmx-cancel"[^>]*>[\s\S]*?<\/button>/,'');
  return S.pmxSheet({type:'af-memory',kind:'memory',size:'wide',cls:'pmx-mem-sheet',closeAction:'close-dialog',ariaLabel:'Memory',title:'Memory',
   lead:'What Puppet Master remembers between messages: notes it takes by itself, and rules you taught it.',
   body:'<div class="pmx-mem-body">'+ribbon(c,p,st.v)+bar+panes+'</div>',foot});
 }

 /* ---- the Gist Review document (memory:{tid}): the notes tab as a pmxView, two columns at >= 700 px (G-26) */
 function render(c){
  const p=preview(),st=paneState(c),n=st.notes.filter(g=>!g.discarded),ver=n.filter(g=>g.verification_state==='Verified').length;
  const status='<b>'+plural(n.length,'note','notes')+'</b> · '+ver+' verified · your next message brings '+plural(p.items.length,'note','notes')+' and '+plural(p.teaching.length,'rule','rules');
  const acts='<button type="button" class="text-button" data-action="memory-preview" aria-pressed="'+!!st.v.preview+'">'+(st.v.preview?'Back to the note':'See what your next message will include')+'</button>'+
   '<button type="button" class="text-button" data-action="teach-open">Your rules</button>'+
   '<button type="button" class="text-button pmx-mem-export" data-action="memory-export">'+S.pmxGlyph('download',14)+'<span>Export memory</span></button>';
  const bar='<div class="pmx-mem-docbar">'+filterSwitch()+'<p class="pmx-help">'+FILTER_HELP[filter]+'</p></div>';
  const guide=window.PM56_MEMORY_DEMOS?.guide(c,true)||'';
  return S.pmxView({key:'auto-memory-doc',cls:'memory-document pmx-mem-doc',kind:'memory',kindWord:'Memory',title:'Notes it took',statusHtml:status,actionsHtml:acts,tabsHtml:bar,
   mainHtml:guide+notesPanes(c,p,st,true)});
 }
 function show(id){const c=E.ctx();if(id&&(!get(id)||!allowed(get(id))))return fail('outside_scope');views.set(c.thread.id,{id:id||null,preview:false});filter=id?bucket(assess(get(id))):'Unverified';c.closeMenu();c.closeDialog();c.state.editorRevealed=true;c.openEditor('memory:'+c.thread.id);return {ok:true};}

 /* ---- in the chat: the reply meta tick (never a card; a note going out of date makes no noise) and the proposal line */
 function link(messageId,gistId){if(!messageId||!gistId||!get(gistId))return fail('link_missing');byMessage.set(messageId,{gistId,at:clock()});later(tok('noted','wait')+30,()=>E.ctx().renderApp());return {ok:true};}
 function markRecorded(id){const g=get(id);if(!g)return fail('gist_missing');g.provenance='recorded';return {ok:true};}
 E.slot('messageMeta',c=>{
  const m=c.message;if(!m||m.role!=='assistant')return '';const n=byMessage.get(m.id);if(!n)return '';
  const g=get(n.gistId);if(!g||!allowed(g))return '';assess(g);const k=groupOf(g);if(k==='discarded'||k==='decide')return '';
  const e=c.esc,p=proofOf(g),v=k==='verified',fresh=clock()-n.at<tok('noted','wait');
  const text=v?(p?'Verified: label checks pass ('+p.passed+'/'+p.total+')':W.verified):S.PMX_COPY.ticks.noted;
  const tip=(v?'Verified':'Noted')+': '+short(titleOf(g),120)+' · '+(k==='stale'?W.outOfDate:v?FILTER_HELP.Verified:W.unverified+': '+FILTER_HELP.Unverified);
  return S.pmxTick({key:'mtick:'+m.id,cls:'pmx-mem-tick',glyph:v?'check-circle':'notebook',text:fresh?e(text):'',
   attrs:'data-state="'+k+'" data-hover-key="mtick:'+e(m.id)+'" data-hover-tip="'+e(tip)+'" aria-label="'+e(text)+'"'});
 });
 E.slot('transcriptMessage',c=>{
  const m=c.m;if(m?.type!=='af-memory-proposal')return '';const e=c.esc,g=get(m.gistId),r=g?ruleOf(g):null;
  /* the headline leads with what matters and ellipsizes at the end; its own hover card carries the whole sentence and
     the full rule (the receipt's meta slot is not used: it never yields width, and squeezed the headline at 417 px) */
  const rt=r?r.text:(m.ruleText||''),rec=g?.provenance==='recorded';
  /* once the person has decided (Keep my rule discards the suggestion; an edit or a turned-off rule makes it stale),
     the line settles: it says what happened and offers nothing more. The record stays appended; the key is identity only. */
  const settled=!g||g.discarded||!r||!T.active(r)||(r.version||1)!==(g.teaching_proposal?.version||1),kept=!!g?.discarded;
  const cost=rec?S.PMX_COPY.cost.recorded+' · ':'';
  const full=settled?cost+(kept?'You kept your rule “'+rt+'”. Puppet Master’s suggestion was set aside; nothing changed.':'Your rule “'+rt+'” changed after this suggestion, so the suggestion was set aside.')
   :cost+'Puppet Master suggests a change to your rule “'+rt+'”. It won’t change unless you say so.';
  /* two wordings: the long one, and at the card's narrow tier (under 520 px) a short one that still says it waits */
  const long=settled?(kept?'You kept your rule':'Your rule changed')+' · “'+e(short(rt,20))+'” · the suggestion was set aside':'Suggested change to your rule · “'+e(short(rt,20))+'” · it won’t change unless you say so';
  const brief=settled?(kept?'You kept your rule':'Your rule changed'):'A rule change waits for you';
  return S.pmxLedgerLine({key:'mem-proposal:'+m.id,kind:'memory',kindWord:'Memory',cls:'pmx-mem-proposal',glyph:settled?S.pmxGlyph('check-circle',14):S.pmxGlyph('hand',14,'pmx-mem-hand'),
   headline:'<span data-hover-key="mprop:'+e(m.id)+'" data-hover-tip="'+e(full)+'"><span class="pmx-mem-plong">'+long+'</span><span class="pmx-mem-pshort">'+brief+'</span></span>',recorded:rec,
   attrs:'data-message-id="'+e(m.id)+'"'+(settled?' data-state="settled"':''),actions:settled?[]:[{action:'af-memory-open',attrs:'data-id="'+e(m.gistId||'')+'"',label:'Review'}]});
 });

 /* ---- motion after render: the Verify check revealed by a clip (IMPACT A1-05) and the card's flight into the ribbon */
 function playMotion(){
  const X=P();if(!X)return;
  if(reveal){const id=q(reveal),els=document.querySelectorAll('#pmOverlayRoot [data-k="mst:'+id+'"], #pmOverlayRoot [data-k="mrg:'+id+'"], .pmx-mem-doc [data-k="mst:'+id+'"], .pmx-mem-doc [data-k="mrg:'+id+'"]');
   if(els.length){reveal=null;els.forEach(el=>X.animate(el,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:X.t('verify'),easing:X.ease('out')}));}}
  /* a card that just became eligible flies in from its note's row as ONE object: a stripped clone in the flight
     layer (.pmx-flight, above the sheet, so the plate's clip never cuts it) travels 420 emph while the real card waits
     hidden (data-state="arriving"); in one task at the end the clone goes and the card shows (the M3 landing rule).
     With no row on screen (the filter hides it) the card simply fades in with its own entrance. */
  for(const id of [...arriving]){
   arriving.delete(id);
   const card=document.querySelector('#pmOverlayRoot .pmx-mem-card[data-k="mc:'+q(id)+'"], #pmOverlayRoot .pmx-mem-card[data-k="mr:'+q(id)+'"]');
   const row=document.querySelector('#pmOverlayRoot .pmx-mem-row[data-k="gist:'+q(id)+'"]'),rr=row?row.getBoundingClientRect():null;
   const land=()=>{if(landing.delete(id))E.ctx().renderOverlays();};
   if(!card||!rr||!rr.height||X.reduced()){later(0,land);continue;}
   const r=card.getBoundingClientRect(),cl=card.cloneNode(true);X.strip(cl);cl.removeAttribute('data-state');cl.classList.add('pmx-flight');
   cl.style.width=r.width+'px';cl.style.height=r.height+'px';cl.style.transform='translate('+r.left+'px,'+r.top+'px)';document.body.appendChild(cl);
   X.animate(cl,[{transform:'translate('+(rr.left+12).toFixed(1)+'px,'+(rr.top+6).toFixed(1)+'px)'},{transform:'translate('+r.left.toFixed(1)+'px,'+r.top.toFixed(1)+'px)'}],{duration:X.t('room'),easing:X.ease('emph')});
   later(X.t('room'),()=>{cl.remove();land();});
  }
 }
 if(P())P().after((ctx,phase)=>{if(phase!=='scope')playMotion();});

 /* ---- actions (MUST-KEEP names; memory-select and memory-done are new view-state actions, each registered once) */
 E.chainAction('af-memory-open',(c,b)=>{filter='Unverified';tab='auto';views.delete(c.thread.id);ribbonPrev=null;leaving.clear();arriving.clear();landing.clear();
  const id=b&&b.dataset&&b.dataset.id,g=id&&get(id);if(g&&allowed(g)){filter=bucket(assess(g));views.set(c.thread.id,{id,preview:false});}
  c.closeMenu();c.openDialog({type:'af-memory'});return true;});
 E.chainAction('af-memory-verify',(c,b)=>{mutation(b.dataset.value,'verify');c.renderApp();return true;});
 // Compatibility gallery replay: produces an unverified candidate, never evidence.
 function simulate(){const locked=T.visibleRecords(context()).find(r=>T.active(r)&&r.locked);const r=begin(locked?{teachingId:locked.id,proposal:'Recorded proposal for explicit teaching review.'}:{});return r.ok?finish(r.id):r;}
 E.chainAction('af-memory-simulate',c=>{simulate();c.renderApp();return true;});
 E.action('memory-open',(c,b)=>{show(b.dataset.id);return true;});
 E.action('memory-select',(c,b)=>{const tid=c.thread.id;views.set(tid,{...views.get(tid),id:b.dataset.id||null,preview:false});c.renderApp();return true;});
 E.action('memory-filter',(c,b)=>{if(['All','Verified','Unverified'].includes(b.dataset.value)){filter=b.dataset.value;views.set(c.thread.id,{...views.get(c.thread.id),id:null});}c.renderApp();return true;});
 E.action('memory-preview',c=>{views.set(c.thread.id,{...views.get(c.thread.id),preview:!views.get(c.thread.id)?.preview});c.renderApp();return true;});
 E.chainAction('af-memory-section',(c,b)=>{tab=b.dataset.value==='taught'?'taught':'auto';c.renderOverlays();return true;});
 E.action('memory-verify',(c,b)=>{
  const id=b.dataset.id,g=get(id);if(!g){c.renderApp();return true;}
  const before=g.verification_state;
  mutation(id,'verify');const after=get(id).verification_state,nowIn=preview().items.some(x=>x.id===id);
  lastCheck.set(id,{n:(lastCheck.get(id)?.n||0)+1,at:now(),state:after,stale:stale(g),used:nowIn});
  if(before!=='Verified'&&after==='Verified')reveal=id;
  c.renderApp();return true;});
 ['pin','discard'].forEach(op=>E.action('memory-'+op,(c,b)=>{mutation(b.dataset.id,op);c.renderApp();return true;}));
 /* no toast-only result (DON'T 15): a rule that changed since the suggestion says so in place */
 E.action('memory-correct',(c,b)=>{const r=correction(b.dataset.id);if(!r.ok){notices.set(b.dataset.id,r.error==='teaching_changed'?'Your rule changed since this suggestion, so it can’t be edited from here. Keep my rule forgets the suggestion.':'This suggestion can’t be opened any more.');c.renderApp();}return true;});
 E.action('memory-export',()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([exportData()],{type:'application/json'}));a.href=url;a.download='automatic-memory-history.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);return true;});
 E.action('memory-done',c=>{if(P())P().exitHint('save');c.closeDialog();return true;});
 document.addEventListener('change',ev=>{const n=ev.target;if(!n||!n.matches||!n.matches('input[data-memory-input="autoSaveUnverified"]'))return;settings().autoSaveUnverified=!!n.checked;E.ctx().renderOverlays();});
 E.slot('editorTabLabel',c=>c.editorId?.startsWith('memory:')?'Gist Review':'');E.slot('editorDocument',c=>c.editorId?.startsWith('memory:')?render(c):'');
 document.addEventListener('toggle',e=>{const n=e.target;if(n.isConnected&&n.matches?.('details[data-memory-disclosure]'))disclosures.set(n.dataset.memoryDisclosure,n.open);},true);
 E.chainAction('reset-all',()=>{dedupIndex.clear();disclosures.clear();epoch++;runs.clear();sources.clear();proofs.clear();seen.clear();views.clear();filter='Unverified';tab='auto';
  byMessage.clear();lastCheck.clear();notices.clear();leaving.clear();arriving.clear();landing.clear();reveal=null;ribbonPrev=null;return false;});
 window.PM56_AUTO_MEMORY={simulate,source,begin,execute,milestone,finish,boundary,invalidate,preview,assess,mutation,correction,exportData,show,dialog,render,link,markRecorded,groupOf,all,get,visible,settings,context,
  run:id=>runs.has(id)?copy(runs.get(id)):null,evidence:id=>proofs.has(id)?copy(proofs.get(id)):null};
})();
