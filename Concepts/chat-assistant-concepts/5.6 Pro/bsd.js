/* Back Seat Driver presentation, Batch 12. One thread/run/stage projection.
 * All configuration here is explicitly session-only concept state. Native BSD
 * command/event/storage registration is NOT claimed by these local controls.
 */
(function(){
 'use strict';const E=window.PM56_EXT,D=window.PM56_DATA,K=window.PM56_BSD_ENGINE;if(!E||!D||!K)return;
 const {clone}=K;const disclosures=new Map();const opened=k=>disclosures.get(k)?' open':'';document.addEventListener('toggle',e=>{const d=e.target;if(d.isConnected&&d.matches?.('.pmx-bsd-disc[data-k],.pmx-bsd-raw[data-k]'))disclosures.set(d.dataset.k,d.open);},true);document.addEventListener('click',e=>{const sm=e.target.closest?.('.pmx-bsd-disc[data-k]>summary,.pmx-bsd-raw[data-k]>summary'),d=sm?.parentElement;if(d)disclosures.set(d.dataset.k,!d.open);},true);let draft=null,renderQueued=false,openFinding=null;
 const engine=new K.Engine({onChange:refresh});
 function thread(id){return E.ctx().state.threads.find(t=>t.id===id);}
 function project(t){return t?.projectId||'concept:pm';}
 function identity(p){const m=D.models.find(m=>m.id===p.modelId),available=!!m&&['ready','update-available'].includes(m.status);return {requestedModel:p.modelId,requestedName:m?.name||p.modelId,effectiveModel:available?m.id:null,effectiveName:available?m.name:null,provider:m?.provider||null,requestedAccount:m?.accountId||null,effectiveAccount:available?m.accountId:null,persona:p.persona,available,reason:available?'Selected catalog fixture':m?.status||'no_model',effort:p.effort||'',fast:!!p.fast};}
 function refresh(){if(renderQueued||!E.ctx)return;renderQueued=true;queueMicrotask(()=>{renderQueued=false;publish();E.ctx().renderApp();});}
 function view(id){const t=thread(id||E.ctx().thread.id),a=t?engine.snapshot(t.id):null,p=engine.policy(project(t));return {thread:t,projectId:project(t),policy:p,assignment:a,identity:a?.identity||identity(p),mode:a?.mode||p.mode};}
 function attrs(id){return ' data-thread="'+E.ctx().esc(id||E.ctx().thread.id)+'"';}
 function action(c,name,label,id,extra='',cls='soft-button'){return '<button class="'+cls+'" data-action="'+name+'"'+attrs(id)+' '+extra+'>'+c.esc(label)+'</button>';}
 /* ================================================================ status words (A1-27 as answered by E-10 = B)
    The one table, in plain words only (owner answer E-10 B, 2026-09-27: the canon words are changed to match). The
    eye's hover card, the Context row (.bsd-ctx-row) and Context Details all read statusOf(); each key maps onto one
    of canon's nine Context states (the key stays in data-bsd-state for tests). "Up to date" and "checked" appear
    only when they are literally true: the cursor converged and a review completed. "Double-checking" is for the
    Context row and Details only; the eye by the composer is in the chat and never tells (BSD-04), so there it reads
    as the converged or catching-up state it also is. Each row is [lead, rest]: the lead is what the state is, the
    rest (after " · ") is the plain detail. */
 const things=n=>n+(n===1?' thing':' things');
 const STATUS={
  off:()=>['Off',''],
  caughtUp:x=>['Up to date','checked '+x.ago],
  idle:()=>['Watching','nothing to check yet'],
  reviewing:()=>['Checking the latest work…',''],
  behind:x=>[x.n+(x.n===1?' update behind':' updates behind'),''],
  priming:()=>['Getting up to speed',''],
  waiting:x=>['Holding a moment for your advisor','up to '+x.s+' s'],
  held:x=>['Double-checking '+things(x.n),''],
  delivered:x=>[x.n+(x.n===1?' note in this chat':' notes in this chat'),''],
  quota:()=>['Paused: usage limit reached','your main work continues'],
  failed:x=>['Couldn’t check this time','('+x.why+')'],
  safety:()=>['Paused for safety','its last two answers weren’t usable'],
  unreachable:()=>['Couldn’t reach its model this time',''],
  noModel:x=>[x.model+' isn’t available right now',''],
  paused:()=>['Paused by you',''],
  stopped:()=>['Stopped for this run','']
 };
 const FAIL_WHY={timed_out:'took too long',failed:'its answer couldn’t be used'};
 const ago=ms=>{const T=window.PM56_SHELL&&window.PM56_SHELL.pmxTime;return T?T.ago(ms):'';};
 function statusOf(v,where){
  const a=v.assignment,x={};let key;
  if(v.mode==='off'||a&&(a.mode==='off'||a.state==='off'))key='off';
  else if(!a)key='idle';
  else if(a.stopped)key='stopped';
  else if(a.paused&&a.quarantined)key='safety';
  else if(a.paused)key='paused';
  else if(a.identity&&a.identity.available===false){key='noModel';x.model=a.identity.requestedName||'Its model';}
  else if(a.state==='quota_paused')key='quota';
  else if(a.state==='unavailable')key='unreachable';
  else if(FAIL_WHY[a.state]){key='failed';x.why=FAIL_WHY[a.state];}
  else if(a.pending||a.state==='reviewing')key='reviewing';
  else if(a.catchUp&&a.catchUp.state==='waiting'){key='waiting';x.s=a.catchUp.budgetSeconds;}
  else if(where!=='eye'&&a.findings.some(f=>f.status==='held'&&!f.terminalStale)){key='held';x.n=a.findings.filter(f=>f.status==='held'&&!f.terminalStale).length;}
  else if(a.state==='delivered'){key='delivered';x.n=a.usage.emitted;}
  else if(a.lastChecked==null)key=a.reprimeRequired?'priming':'idle';
  else if(a.cursor<a.generation){key='behind';x.n=a.generation-a.cursor;}
  else {key='caughtUp';x.ago=ago(a.lastChecked);}
  const [lead,say]=STATUS[key](x),esc=E.ctx().esc,sep=key==='failed'?' ':' · ';
  return {key,word:lead,say,text:lead+(say?sep+say:''),html:'<span class="pmx-bsd-lead">'+esc(lead)+'</span>'+(say?esc(sep+say):'')};
 }
 const kindOf=m=>m==='off'?'bsd-off':m==='on'?'bsd-on':'bsd-auto';
 /* the advisor in words: "Claude Sonnet 4.6 as Critical Advisor"; a stand-in is named with the model it stands in
    for (G-30 BSD-09). The concept never substitutes, so an unavailable model is said as unavailable. */
 function advisorWords(idn){
  if(!idn)return 'the advisor';
  const as=' as '+(idn.persona||'Critical Advisor');
  if(idn.effectiveName&&idn.effectiveName!==idn.requestedName)return idn.effectiveName+' standing in for '+idn.requestedName+' ('+String(idn.reason||'unavailable').toLowerCase()+')'+as;
  return (idn.effectiveName||idn.requestedName||'The advisor')+as;
 }
 /* 8.6: the ambient eye by the composer. app.js renders it from PM56_BSD.dot() (F0b (c)); it reads the owner
    projection, never the legacy flag. Off: no eye. Otherwise the eye by mode (lowered lid Auto, open On); its hover
    card is the status line; a check plays one iris sweep (sweepIris below). */
 /* the eye by mode: the registry's kind mark (neon icons). Its iris (On: the pupil; Auto: the lowered half) is the
    glyph's one moving part, a g.nx-p holding its own halo and tube, which sweepIris turns (3E2) */
 function eyeGlyph(mode,size){
  const S=window.PM56_SHELL;
  return S&&S.pmxKindMark?S.pmxKindMark(kindOf(mode),size):E.ctx().icon('eye',size);
 }
 function dot(c){const v=view(c&&c.thread?c.thread.id:null),st=statusOf(v,'eye');if(st.key==='off')return '';return {glyph:eyeGlyph(v.mode,16),hover:'Back Seat Driver · '+st.text,state:st.key};}
 const swept=new Map();
 /* a new check sweeps the iris once: the eye glyph's moving part (g.nx-p), transform only, the same 2.5-unit
    look left then right as before the neon family. PM56_PMX.animate skips it under the media query and
    body.pm56-reduced; html[data-motion="reduced"] (the PMConcept7 route) is checked here. The part's own hover act
    is a CSS animation; this WAAPI sweep has no fill, so it never pins a transform over it. */
 function sweepIris(){
  const X=window.PM56_PMX,c=E.ctx&&E.ctx();if(!X||!c||!c.thread)return;
  const a=engine.current(c.thread.id),id=a&&a.pending?a.pending.id:null;
  if(!id||swept.get(c.thread.id)===id)return;swept.set(c.thread.id,id);
  if(document.documentElement.getAttribute('data-motion')==='reduced')return;
  const iris=document.querySelector('.capability-dot.bsd > svg.nx > .nx-p');
  if(iris)X.animate(iris,[{transform:'translateX(0)'},{transform:'translateX(-2.5px)',offset:.3},{transform:'translateX(2.5px)',offset:.7},{transform:'translateX(0)'}],{duration:X.t('pulse'),easing:X.ease('move')});
 }
 /* the Context popover row (slot contextBsdRow): the eye by mode, the canon name, the mode and Persona, then the
    status line in plain words */
 function compact(c){
  const v=view(c.thread.id),st=statusOf(v,'row');
  return '<div class="menu-divider"></div><button class="menu-item bsd-ctx-row" data-action="bsd-open-details"'+attrs(c.thread.id)+'><span class="menu-icon">'+eyeGlyph(v.mode,14)+'</span><span class="menu-copy"><strong>Back Seat Driver</strong><span>'+c.esc(word(v.mode)+' · '+(v.identity.persona||'Critical Advisor'))+'</span></span><span class="bsd-live" data-bsd-state="'+st.key+'">'+st.html+'</span></button>';
 }
 /* ================================================================ Context More Details (#ctx-bsd, G-26)
    Head + Configure, three plain facts, the status line (plain words), then three native disclosures with
    their keys unchanged (bsd12-findings / -session / -usage, remembered in `disclosures`): Advisor notes (N),
    Session and Usage. Sentences, hairline rows; no metric-card grid and no pills. Evidence is written out as
    sentences with the raw JSON behind "Show raw data". Raw ids and cmd.* live in one Technical details line. */
 const sevWord=s=>{const S=window.PM56_SHELL,t=S&&S.PMX_COPY&&S.PMX_COPY.bsdSeverity;return t&&t[s]?t[s][0]:String(s||'');};
 const sevHtml=s=>window.PM56_SHELL.pmxSeverity(s,sevWord(s));
 const CHOICE_WORD=(key,val)=>{const o=(CHOICES[key]||{options:[]}).options.find(x=>String(x.value)===String(val));return o?o.label:String(val);};
 /* inline markdown for a note's 1-4 sentences (bold and inline code): pmxMd's full paragraphs without their <p>
    wrappers, because the note's body is itself a <p> (FOUNDATION REQUEST: export pmxMd's inline renderer) */
 function inlineMd(text){
  const S=window.PM56_SHELL,h=S&&S.pmxMd?S.pmxMd(String(text||''),{mode:'full'}):'',ps=h.match(/<p>[\s\S]*?<\/p>/g);
  return ps&&ps.length?ps.map(p=>p.slice(3,-4)).join(' '):E.ctx().esc(text||'');
 }
 /* what a finding's history says, in plain words (the engine's own sentences stay in the raw data) */
 const HISTORY=[
  [/^Held for a separate reconfirmation/,'Found. Double-checking it on newer work before telling you.'],
  [/^Earlier-generation result held/,'Found on an older version. Waiting to re-check it on the newest.'],
  [/^Reconfirmed against current evidence/,'Re-checked on the latest work, then shown in the chat.'],
  [/^Reviewed at a recorded frozen boundary/,'Checked at a pause point, then shown in the chat.'],
  [/^Reconfirmation found no surviving issue/,'Re-checked on the latest work: the problem was gone, so nothing was shown.'],
  [/^Dismissed by the user/,'You dismissed it. It won’t come back unless things change.'],
  [/^Bounded terminal catch-up expired/,'The assistant finished before it could be re-checked.'],
  [/^Preserved across/,'Kept through a restart of the advisor. It will be re-checked.']];
 const historySay=w=>{const h=HISTORY.find(([re])=>re.test(String(w||'')));return h?h[1]:'Updated.';};
 /* evidence items as one sentence each: the file and version, the measured figure and the limit */
 function evidenceSay(c,e){
  if(!e||typeof e!=='object')return c.esc(String(e==null?'':e));
  const art=e.artifactId?(c.D.artifacts||[]).find(x=>x.id===e.artifactId):null,parts=[];
  if(art||e.artifactId)parts.push('<b>'+c.esc(art?(art.name||art.title):e.artifactId)+'</b>'+(e.version!=null?' at v'+c.esc(e.version):''));
  const sum=xs=>Array.isArray(xs)?xs.reduce((p,q)=>p+Number(q||0),0):null;
  if(e.measurement&&sum(e.measurement.before)!=null)parts.push(sum(e.measurement.before)+' writes before, '+sum(e.measurement.after)+' after');
  else if(e.measurement===null)parts.push('no measurement yet');
  if(Number.isFinite(e.computedPercent))parts.push('measured '+e.computedPercent.toFixed(1)+'%');
  if(Number.isFinite(e.limitPercent))parts.push('the limit is '+e.limitPercent+'%');
  return parts.length?parts.join(' · '):'The details are in the raw data.';
 }
 function findingState(f,a,gen){
  if(f.epoch!=null&&f.epoch!==a.epoch&&(f.status==='emitted'||f.terminalStale&&f.status!=='closed'))return {key:'earlier',html:'<b>From an earlier advisor session</b> · checked v'+f.latestChecked+' · shown in the chat'};
  if(f.terminalStale&&f.status!=='closed')return {key:'stale',html:'<b>About an earlier version (v'+f.latestChecked+')</b> · not re-checked · shown in the chat'};
  if(f.status==='emitted')return {key:'shown',html:'Shown in the chat · checked against '+(f.latestChecked===gen?'the latest work':'an earlier version')+' (v'+f.latestChecked+')'};
  if(f.status==='held')return {key:'checking',html:'Double-checking it before telling you · not in the chat'};
  if(f.status==='cleared')return {key:'resolved',html:'Resolved: gone when re-checked, so it never reached the chat'};
  if(f.status==='closed')return {key:'dismissed',html:f.closeReason==='epoch_replaced'?'Set aside: the work was replaced before it could be re-checked':f.closeReason==='assignment_stopped'?'Dropped when you stopped the advisor':'Dismissed'};
  return {key:'other',html:''};
 }
 function findingRow(c,f,a,gen){
  const open=openFinding===f.id,st=findingState(f,a,gen),id=a.threadId,fid=c.esc(f.id);
  const why='<button type="button" class="text-button" data-action="bsd-open-finding"'+attrs(id)+' data-id="'+fid+'" aria-expanded="'+open+'">'+(open?'Hide why':'Why?')+'</button>';
  const dismiss=st.key!=='earlier'&&(f.status==='emitted'||f.terminalStale&&f.status!=='closed')?'<button type="button" class="text-button" data-action="bsd-dismiss"'+attrs(id)+' data-id="'+fid+'" data-epoch="'+a.epoch+'" data-hover-key="bsd-dismiss" data-hover-tip="Won’t come back unless things change">Dismiss</button>':'';
  let body='';
  if(open){
   const ev=(f.evidence||[]).map(e=>'<li>'+evidenceSay(c,e)+'</li>').join('');
   const hist=(f.history||[]).map(h=>'<li><span class="pmx-bsd-v">v'+c.esc(h.generation)+'</span>'+c.esc(historySay(h.what))+'</li>').join('');
   body='<div class="pmx-bsd-why"><div class="pmx-bsd-why-say">'+(window.PM56_SHELL.pmxMd?window.PM56_SHELL.pmxMd(String(f.detail||''),{mode:'full'}):'<p>'+c.esc(f.detail)+'</p>')+'</div>'+(ev?'<p class="pmx-bsd-sub">What it looked at</p><ul class="pmx-bsd-list">'+ev+'</ul>':'')+(hist?'<p class="pmx-bsd-sub">What happened</p><ol class="pmx-bsd-list pmx-bsd-hist">'+hist+'</ol>':'')+
    rawDisc('bsd12-raw:'+f.id,'Show raw data','<pre>'+c.esc(JSON.stringify({evidence:f.evidence,history:f.history,raisedAgainst:f.raisedAgainst,latestChecked:f.latestChecked,status:f.status,channel:f.channel||null},null,2))+'</pre>')+'</div>';
  }
  return '<div class="pmx-bsd-frow" data-k="bsd12-f:'+fid+'" data-finding="'+fid+'" data-state="'+st.key+'"><p class="pmx-bsd-frow-head">'+sevHtml(f.severity)+'<span class="pmx-bsd-frow-title">'+c.esc(f.title)+'</span></p><p class="pmx-bsd-frow-state">'+st.html+'</p><div class="pmx-bsd-acts">'+why+dismiss+'</div>'+body+'</div>';
 }
 const chev=()=>window.PM56_SHELL.pmxGlyph('chevron-right',14,'pmx-bsd-chev');
 /* raw data behind a pmxDisclosure (closing review: the hand-built summary cut its last glyph and had no side
    padding, J-2 item 2); the key stays in data-k so `disclosures` remembers it and foldRaw folds it */
 const rawDisc=(key,summary,body,cls)=>window.PM56_SHELL.pmxDisclosure({key,cls:'pmx-bsd-raw'+(cls?' '+cls:''),open:!!disclosures.get(key),summary,body});
 function disc(c,key,label,body){return '<details class="pmx-bsd-disc" data-k="'+c.esc(key)+'"'+opened(key)+'><summary>'+chev()+'<span>'+label+'</span></summary><div class="pmx-bsd-disc-body">'+body+'</div></details>';}
 function sessionBody(c,a,cur){
  const idn=a.identity||{},row=K.stageRow?K.stageRow(a.stage):a.stage,stage=row?STAGE_PLAIN[row]||row:'Ordinary work in this chat',id=a.threadId;
  const S=window.PM56_SHELL,si=S.pmxStandIn?S.pmxStandIn({requested:idn.requestedName,effective:idn.effectiveName,reason:idn.reason,noSubstitute:!idn.effectiveName}):null;
  const who=idn.effectiveName&&idn.effectiveName===idn.requestedName?'<p class="pmx-bsd-say">Advisor: <b>'+c.esc(idn.effectiveName)+'</b> as <b>'+c.esc(idn.persona||'Critical Advisor')+'</b>, the model you picked.</p>'
   :'<p class="pmx-bsd-say">'+(idn.effectiveName?c.esc(advisorWords(idn))+'.':'<b>'+c.esc(idn.requestedName||'Its model')+'</b> isn’t available right now, and nothing stands in, so it isn’t checking.')+'</p>'+(si&&si.fine?'<p class="pmx-bsd-fine">'+si.fine+'</p>':'');
  const read=cur?'Read up to <b>v'+a.cursor+'</b> of v'+cur.generation+'.':'',fresh=a.epoch-1-(saveExtra.get(a.id)||0);
  const paused=a.paused,stopped=a.stopped,quar=a.quarantined;
  const b=(ctl,label,off)=>'<button type="button" class="soft-button" data-action="bsd-control"'+attrs(id)+' data-control="'+ctl+'" data-epoch="'+a.epoch+'"'+(off?' disabled':'')+'>'+label+'</button>';
  const canResume=!stopped&&(paused||a.state==='quota_paused');
  const reason=stopped?'Stopped for this run. Save its settings again to start fresh.':quar?'Paused for safety. Resume starts it again with fresh notes.':paused?'Already paused.':'Resume works after a pause.';
  return '<p class="pmx-bsd-say">Watching <b>'+c.esc(lowerFirst(stage))+'</b> in this chat. '+read+'</p>'+who+
   (fresh>0?'<p class="pmx-bsd-fine">Started fresh notes '+(fresh===1?'once':fresh+' times')+' (a settings save, a restart or tidying its notes).</p>':'')+
   '<div class="pmx-bsd-acts pmx-bsd-ctls">'+b('pause','Pause advisor',stopped||paused)+b('resume','Resume advisor',!canResume)+b('stop','Stop advisor',stopped)+'</div>'+
   (refusals.get(id)&&refusals.get(id).where==='control'?refusalLine(c,id):'<p class="pmx-reason">'+reason+'</p>')+'<p class="pmx-bsd-fine">Stop ends watching for this run. Anything it was double-checking is dropped. Your main work never stops.</p>'+
   '<p class="pmx-bsd-fine pmx-bsd-tech"><b>Technical details</b> · run <code>'+c.esc(a.id)+'</code> · restart '+a.epoch+' · settings '+(a.policy.revision?'v'+c.esc(a.policy.revision):'default')+', run binding v'+c.esc(a.bindingRevision)+' · Pause, Resume and Stop send <code>cmd.bsd.assignment.pause</code>, <code>.resume</code> (<code>.retry</code> after a safety pause) and <code>.stop</code>; Dismiss asks for <code>cmd.bsd.finding.dismiss</code>; Don’t wait asks for <code>cmd.bsd.catch_up.release</code>.</p>';
 }
 function usageBody(c,a){
  const u=a.usage,id=a.threadId,n=u.localEvaluations;
  return '<p class="pmx-bsd-say"><b>'+n+(n===1?' check':' checks')+'</b> · cost not reported · kept separate from your chat’s usage.</p>'+
   '<p class="pmx-bsd-fine">No real AI calls in this preview. '+u.emitted+' shown in the chat · '+u.cleared+' resolved quietly · '+u.noCalls+' skipped with nothing new to check.</p>'+
   '<div class="pmx-bsd-acts"><button type="button" class="soft-button" data-action="bsd-open-usage"'+attrs(id)+'>Inspect local usage</button><button type="button" class="soft-button" data-action="bsd-open-transcript"'+attrs(id)+(a.policy.retainTranscript?'':' disabled')+'>Advisor transcript</button></div>'+
   (a.policy.retainTranscript?'':'<p class="pmx-reason">Keeping the advisor’s notes is off.</p>');
 }
 function details(c){
  const v=view(c.thread.id),a=v.assignment,id=c.thread.id,st=statusOf(v,'details'),p=a?a.policy:v.policy;
  const facts=word(v.mode)+' · '+advisorWords(v.identity)+(v.mode==='off'?'':' · How watchful: '+CHOICE_WORD('sensitivity',p.sensitivity));
  let body;
  if(!a)body='<p class="pmx-bsd-fine">Nothing to show yet. It starts watching when the assistant starts working. Recorded examples are in Demo Studio.</p>';
  else{
   const cur=engine.read(a.threadId),gen=cur?cur.generation:a.generation,rows=a.findings.map(f=>findingRow(c,f,a,gen)).join('');
   body=disc(c,'bsd12-findings:'+id,'Advisor notes ('+a.findings.length+')',rows||'<p class="pmx-bsd-fine">No notes yet. A check that finds nothing adds nothing to your chat.</p>')+
    disc(c,'bsd12-session:'+id,'Session',sessionBody(c,a,cur))+disc(c,'bsd12-usage:'+id,'Usage',usageBody(c,a));
  }
  return '<section class="bsd-section pmx-bsd-details" id="ctx-bsd" data-k="bsd12:'+c.esc(id)+'"><header class="pmx-bsd-dh"><span class="pmx-bsd-dh-mark">'+window.PM56_SHELL.pmxKindMark(kindOf(v.mode),18)+'</span><h3>Back Seat Driver</h3><span class="spacer"></span><button type="button" class="text-button" data-action="bsd-configure-stages"'+attrs(id)+'>Configure</button></header>'+
   '<p class="pmx-bsd-facts">'+c.esc(facts)+'</p><p class="pmx-bsd-status" data-bsd-state="'+st.key+'">'+st.html+'</p>'+(refusals.get(id)&&refusals.get(id).where!=='control'?refusalLine(c,id):'')+'<p class="pmx-bsd-fine">Preview only: no real AI calls. The advisor reads a copy of the work and changes nothing.</p>'+body+'</section>';
 }
 /* ================================================================ in the chat (8.6 "In chat", 7.11, C21)
    Never a card (BSD-01). Emitted advice is a margin note that hangs from the eye; everything else BSD says in the
    chat is one quiet line with the same eye: a dismissed note, an aside, a note from an earlier advisor session,
    the catch-up wait, a failed check, a safety pause. Held, cleared, silent and suppressed results add nothing
    (BSD-04). Every one of these is a transcript message the engine's projection writes (publish below); the family
    is `ledger` (7.14: a margin note is never "needs", the family that spends the accent). */
 const openAside=new Map();   /* asides the user opened in place with Why? (view state) */
 const btn=(act,label,id,extra)=>'<button type="button" class="text-button" data-action="'+act+'"'+attrs(id)+(extra?' '+extra:'')+'>'+label+'</button>';
 const sep='<span class="pmx-bsd-sep" aria-hidden="true">·</span>';
 /* The one-line forms. pmxNote draws only one line form (the dismissed note); these reuse that output with the
    glyph, the state and the words swapped, so the note's structure stays the builder's (FOUNDATION REQUEST: a
    pmxNote `line` form with its own glyph, state and weight). */
 function noteLine(o){
  const S=window.PM56_SHELL,h=S.pmxNote({key:o.key,cls:o.cls,severity:o.severity,dismissed:true,title:'\u0001',attrs:o.attrs});
  return h.replace(' data-state="dismissed"',' data-state="'+o.state+'"')
   .replace(/<span class="pmx-note-eye">[\s\S]*?<\/span>/,()=>'<span class="pmx-note-eye">'+o.glyph+'</span>')
   .replace('<p class="pmx-note-line">Dismissed · \u0001</p>',()=>'<div class="pmx-note-line pmx-bsd-lrow">'+o.html+'</div>');
 }
 function noteHtml(c,m){
  const S=window.PM56_SHELL,esc=c.esc,a=engine.assignments.get(m.assignmentId),f=a&&a.findings.find(x=>x.id===m.findingId);
  const hooks=' data-message-id="'+esc(m.id)+'"'+(f?' data-finding="'+esc(f.id)+'"':'');
  if(!a||!f)return noteLine({key:m.id,cls:'bsd-card pmx-bsd-line',state:'ended',attrs:hooks,glyph:S.pmxGlyph('eye-closed',15),html:'<span class="pmx-bsd-lt">An earlier advisor note. Its advisor run has ended.</span>'});
  const tid=a.threadId,cur=engine.read(tid),gen=cur?cur.generation:a.generation;
  const branch=c.thread.id!==tid||project(c.thread)!==a.projectId,earlier=branch||f.epoch!==a.epoch;
  const weight=m.presentation_weight==='aside'?'aside':'note',at=hooks+' data-weight="'+weight+'"',fid=esc(f.id);
  if(f.status==='closed')return S.pmxNote({key:m.id,cls:'bsd-card',severity:f.severity,dismissed:true,title:esc(f.title),attrs:at});
  /* G-30 the aside weight: a nit, or a note that arrived in the quiet period, is one line; Why? opens it in place.
     Its title wraps to a second line before it is ever cut (J-2), and Why? stays beside it. */
  if(weight==='aside'&&!openAside.get(f.id))return noteLine({key:m.id,cls:'bsd-card pmx-bsd-line',severity:f.severity,state:'aside',attrs:at,glyph:S.pmxGlyph('eye',15),
   html:'<span class="pmx-bsd-lt pmx-bsd-lt2"><span class="pmx-bsd-lk">'+sevHtml(f.severity)+'</span>'+sep+esc(f.title)+'</span>'+btn('bsd-open-finding','Why?',tid,'data-id="'+fid+'" data-in-place="1" aria-expanded="false"')});
  /* a note from a replaced advisor session (a settings save, a restart, the advisor tidying its own notes, a first
     unusable answer) or a branch copy keeps its full form: its title, words and Why?. Its fine line says "From earlier
     in this chat" in place of "Checked against…", and it has no Dismiss, because that session has ended. */
  if(earlier)return S.pmxNote({key:m.id,cls:'bsd-card',severity:f.severity,severityHtml:sevHtml(f.severity),title:esc(f.title),body:inlineMd(f.detail),
   checked:'<b>From earlier in this chat</b> · '+(branch?'checked in the chat this one came from':'checked before the advisor started fresh notes')+' (v'+esc(f.latestChecked)+')',
   actions:branch?btn('bsd-open-source','Open its chat',tid):btn('bsd-open-finding','Why?',tid,'data-id="'+fid+'"'),attrs:at}).replace(' data-state="emitted"',' data-state="earlier"');
  const stale=!!f.terminalStale,checked=stale
   ?'<b>About an earlier version (v'+esc(f.latestChecked)+'):</b> not re-checked before the assistant finished.'
   :(f.latestChecked===gen?'Checked against the latest work':'Checked against an earlier version')+' (v'+esc(f.latestChecked)+') · '+esc(advisorWords(f.advisor||a.identity))+(f.channel==='resume_only'?'. Will be shared with the assistant when you resume.':'');
  const acts=btn('bsd-open-finding','Why?',tid,'data-id="'+fid+'"')+btn('bsd-dismiss','Dismiss',tid,'data-id="'+fid+'" data-epoch="'+a.epoch+'" data-hover-key="bsd-dismiss" data-hover-tip="Won’t come back unless things change"')+'<span class="pmx-bsd-dhelp">Won’t come back unless things change</span>';
  return S.pmxNote({key:m.id,cls:'bsd-card'+(m.unfold?' pmx-bsd-unfold':''),severity:f.severity,severityHtml:sevHtml(f.severity),stale,title:esc(f.title),body:inlineMd(f.detail),checked,actions:acts,attrs:at});
 }
 /* the catch-up ring: a thin ring round the eye that runs down over the real budget (two half rings turned by
    WAAPI from the wait's own start, so a re-render or a thread switch never restarts it; finite; under reduced
    motion it stays whole and the words carry the time) */
 const HALF_R='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.25a10.75 10.75 0 0 1 0 21.5"/></svg>',HALF_L='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22.75a10.75 10.75 0 0 1 0-21.5"/></svg>';
 function lineHtml(c,m){
  const S=window.PM56_SHELL,esc=c.esc,a=engine.assignments.get(m.assignmentId),tid=m.threadId||(a&&a.threadId)||c.thread.id;
  const at=' data-message-id="'+esc(m.id)+'" data-line="'+esc(m.line)+'"'+(m.closing?' data-closing="1"':'')+fitAt(m.id);
  if(m.line==='catchup'){
   const ring='<span class="pmx-bsd-ring" data-k="bsd-ring:'+esc(m.id)+'" data-start="'+esc(m.startedAt)+'" data-ms="'+esc(m.budget*1000)+'" aria-hidden="true"><span class="pmx-bsd-half" data-side="r">'+HALF_R+'</span><span class="pmx-bsd-half" data-side="l">'+HALF_L+'</span></span>';
   return noteLine({key:m.id,cls:'bsd-card pmx-bsd-line',state:'catchup',attrs:at,glyph:ring+S.pmxGlyph('eye',15),
    html:'<span class="pmx-bsd-lt"><span class="pmx-bsd-long">Holding a moment for your advisor</span><span class="pmx-bsd-short">Holding for your advisor</span></span><span class="pmx-bsd-lwait">'+sep+'<span class="pmx-bsd-lm">up to '+esc(m.budget)+' s</span></span>'+(m.closing?'':btn('bsd-catchup-release','Don’t wait',tid,'data-epoch="'+esc(m.epoch)+'"'))});
  }
  if(m.line==='failure'){
   const why=m.status==='quota_paused'?'Advisor paused: usage limit reached.':'Advisor couldn’t check this step ('+({timed_out:'took too long',failed:'its answer couldn’t be used',unavailable:'couldn’t reach its model'}[m.status]||'it didn’t finish')+').';
   return noteLine({key:m.id,cls:'bsd-card pmx-bsd-line',state:'failed',attrs:at+' data-failure="'+esc(m.status)+'"',glyph:S.pmxGlyph('eye-off',15),
    html:'<span class="pmx-bsd-lt pmx-bsd-wrap">'+why+' Your main work continues.</span>'+'<span class="pmx-bsd-lacts">'+(m.count>1?'<span class="pmx-bsd-lm">×'+m.count+'</span>':'')+btn('bsd-open-details','Details',tid)+'</span>'});
  }
  if(m.line==='safety'){
   const live=!!(a&&a.quarantined&&a.paused&&a.epoch===m.epoch);
   return noteLine({key:m.id,cls:'bsd-card pmx-bsd-line',state:'safety',attrs:at+' data-failure="quarantined"',glyph:S.pmxGlyph('eye-closed',15),
    html:live?'<span class="pmx-bsd-lt pmx-bsd-wrap">Paused for safety: its last two answers weren’t usable.</span>'+'<span class="pmx-bsd-lacts">'+btn('bsd-control','Resume',tid,'data-control="resume" data-epoch="'+a.epoch+'"')+btn('bsd-configure-stages','Change model',tid)+'</span>'
     :'<span class="pmx-bsd-lt pmx-bsd-wrap">Was paused for safety: two answers weren’t usable. It started again with fresh notes.</span>'});
  }
  return '';
 }
 /* The projection the chat reads. On every engine change: one message per emitted (or terminally stale) finding,
    its weight stamped here, when it is emitted (IMPACT A1-45: a nit, or a note in the quiet period, is an aside);
    the catch-up line while a wait runs, replaced in place by the note it converges into (the unfold) or faded out
    when there is nothing to say; one failure line per run of failed checks (×N); one safety line per pause. */
 const FAILURES=new Set(['failed','timed_out','unavailable','quota_paused']);
 function closeLine(t,m){
  const X=window.PM56_PMX;if(m.closing)return;
  if(!X||X.reduced()){t.messages.splice(t.messages.indexOf(m),1);return;}
  m.closing=true;
  const C=window.PM56_CLOCK,ms=C&&C.ms?C.ms(X.t('fade')):X.t('fade');
  setTimeout(()=>{const i=t.messages.indexOf(m);if(i>=0){t.messages.splice(i,1);if(E.ctx)E.ctx().renderApp();}},ms);
 }
 function publish(){
  for(const a of engine.assignments.values()){
   const t=thread(a.threadId),s=engine.read(a.threadId);if(!t||!s||project(t)!==a.projectId||!engine.sameScope(a,s))continue;
   const has=id=>t.messages.some(m=>m.id===id);
   const openWait=()=>t.messages.find(m=>m.type==='bsd-status-v3'&&m.line==='catchup'&&m.assignmentId===a.id&&!m.closing&&!(a.catchUp&&a.catchUp.state==='waiting'&&a.catchUp.startedAt===m.startedAt));
   for(const f of a.findings){
    if(f.status!=='emitted'&&!f.terminalStale)continue;const id='bsd-note:'+f.id;if(has(id))continue;
    const msg={id,role:'system',type:'bsd-advice-v3',assignmentId:a.id,findingId:f.id,projectId:a.projectId,sourceGeneration:f.latestChecked,recordedExample:true,
     presentation_weight:!f.terminalStale&&(f.severity==='nit'||f.channel==='aside')?'aside':'note'};
    const w=openWait();
    if(w){msg.unfold=true;t.messages.splice(t.messages.indexOf(w),1,msg);}else t.messages.push(msg);
   }
   const w=a.catchUp;
   if(w&&w.state==='waiting'){const id='bsd-line:catchup:'+a.id+':'+w.startedAt;if(!has(id))t.messages.push({id,role:'system',type:'bsd-status-v3',line:'catchup',assignmentId:a.id,threadId:a.threadId,epoch:w.epoch,startedAt:w.startedAt,budget:w.budgetSeconds});}
   for(let x=openWait();x;x=openWait())closeLine(t,x);
   let streak=null;
   for(const cy of a.cycles){
    if(FAILURES.has(cy.status)){
     if(streak&&streak.status===cy.status){streak.count++;streak.msg.count=streak.count;continue;}
     streak={status:cy.status,count:1,id:'bsd-line:fail:'+a.id+':'+cy.id};
     const m=t.messages.find(x=>x.id===streak.id);if(m){streak.msg=m;m.count=1;}else{streak.msg={id:streak.id,role:'system',type:'bsd-status-v3',line:'failure',assignmentId:a.id,threadId:a.threadId,status:cy.status,count:1};t.messages.push(streak.msg);}
    }else if(cy.status&&!['reviewing','no_call','cancelled'].includes(cy.status))streak=null;
   }
   if(a.paused&&a.quarantined){const q=[...a.cycles].reverse().find(cy=>cy.status==='quarantined'),id='bsd-line:safety:'+a.id+':'+(q?q.id:a.epoch);if(!has(id))t.messages.push({id,role:'system',type:'bsd-status-v3',line:'safety',assignmentId:a.id,threadId:a.threadId,epoch:a.epoch});}
  }
 }
 /* after each app render: one iris sweep per new check, and any catch-up ring not yet running starts from its wait */
 function startRings(){
  const X=window.PM56_PMX;if(!X||X.reduced())return;
  for(const r of document.querySelectorAll('.transcript .pmx-bsd-ring')){
   if(r.__bsdRing)continue;r.__bsdRing=1;
   const T=Number(r.dataset.ms)||0,el=Math.max(0,Date.now()-Number(r.dataset.start||Date.now())),hs=r.querySelectorAll('.pmx-bsd-half > svg');if(!T||hs.length<2)continue;
   const kf=[{transform:'rotate(0deg)'},{transform:'rotate(180deg)'}],ease=X.ease('linear');
   const one=X.animate(hs[0],kf,{duration:T/2,easing:ease,fill:'forwards'}),two=X.animate(hs[1],kf,{duration:T/2,delay:T/2,easing:ease,fill:'forwards'});
   if(one)one.currentTime=Math.min(el,T/2);if(two)two.currentTime=Math.min(el,T);
  }
 }
 /* J-2: a line never cuts its words while something secondary still shows. The catch-up line first drops "up to N s"
    (the ring shows the budget), then says the short sentence; the failure and safety lines put their actions, together,
    on their own row under the sentence once the sentence needs the width (data-fit). Measured after each render and
    when a line changes width (a ResizeObserver; the refit waits a frame so it never loops). */
 function fitLine(n){
  const st=n.dataset.state,lt=n.querySelector('.pmx-bsd-lrow > .pmx-bsd-lt');if(!lt||!n.getClientRects().length)return;  /* not laid out (a hidden chat): the ResizeObserver refits it once it has a width */
  const id=n.dataset.messageId,set=v=>{if(v)n.setAttribute('data-fit',v);else n.removeAttribute('data-fit');if(id){if(v)fitted.set(id,v);else fitted.delete(id);}};
  set('');
  /* strict: an ellipsis shows as soon as the words are a pixel wider than their box (review cycle 1: 189 in 188 passed
     a one-pixel tolerance and stayed cut) */
  if(st==='catchup'){for(const step of ['nowait','short','short stack']){if(lt.scrollWidth<=lt.clientWidth)return;set(step);}return;}
  const acts=n.querySelector('.pmx-bsd-lrow > .pmx-bsd-lacts');
  if(acts&&acts.getBoundingClientRect().top>=lt.getBoundingClientRect().bottom-2)set('stack');
 }
 const fitted=new Map();  /* message id -> data-fit, emitted by lineHtml */
 const fitAt=id=>fitted.has(id)?' data-fit="'+fitted.get(id)+'"':'';
 const fitWidth=new WeakMap(),fitRO=typeof ResizeObserver==='function'?new ResizeObserver(es=>{const due=[];for(const e of es){const w=Math.round(e.contentRect.width);if(fitWidth.get(e.target)!==w){fitWidth.set(e.target,w);due.push(e.target);}}if(due.length)requestAnimationFrame(()=>{for(const n of due)if(n.isConnected)fitLine(n);});}):null;
 function fitLines(){
  for(const n of document.querySelectorAll('.transcript .pmx-bsd-line:is([data-state="catchup"], [data-state="failed"], [data-state="safety"])')){
   if(!n.__bsdFit){n.__bsdFit=1;if(fitRO)fitRO.observe(n);}fitLine(n);fitWidth.set(n,Math.round(n.getBoundingClientRect().width));
  }
 }
 /* focus that a pressed button would otherwise drop on <body>: Don't wait removes its own line (focus goes to the
    composer), Reset removes itself (focus goes to the first Where it watches trigger) */
 let pendingFocus=null;
 function placeFocus(phase){
  if(!pendingFocus||pendingFocus.phase!=='any'&&pendingFocus.phase!==phase)return;const sel=pendingFocus.sel;pendingFocus=null;
  const el=document.querySelector(sel);if(el&&(!document.activeElement||document.activeElement===document.body||!document.activeElement.isConnected))el.focus({preventScroll:true});
 }
 if(window.PM56_PMX&&window.PM56_PMX.after)window.PM56_PMX.after((c,phase)=>{if(phase==='app'){sweepIris();startRings();fitLines();}placeFocus(phase);});
 /* ================================================================ the raw-data sheets (8.6: bsd-usage, bsd-transcript)
    Compact pmx sheets (cls bsd-dialog, fixed 560 tall; the list scrolls inside its body): a readable summary first,
    the raw JSON behind "Show raw data". Opened from Details' Usage. */
 const CYCLE_SAY={emitted:'shown in the chat',held:'found something; double-checking it first',cleared:'re-checked: the problem was gone',silent:'nothing to say',
  duplicate_suppressed:'a repeat, not shown again',content_free_suppressed:'an empty answer, not shown',severity_downgrade_rejected:'kept at its first severity',
  failed:'couldn’t check',timed_out:'took too long',quota_paused:'usage limit reached',unavailable:'couldn’t reach its model',quarantined:'its answer wasn’t usable',
  cancelled:'stopped by a restart',reviewing:'checking now'};
 const NOCALL_SAY={no_call_off:'Back Seat Driver was off',no_call_paused:'it was paused',no_call_quota_unavailable:'the usage limit',no_call_no_trigger:'not a key moment',
  no_call_no_material_delta:'nothing new to check',no_call_resource_refused:'too much to read at once',no_call_cost_limit:'the cost limit',no_call_stage_limit:'the limit for this kind of work'};
 const cycleSay=cy=>{const t=cy.status==='no_call'?'skipped: '+(NOCALL_SAY[cy.reason]||'nothing to check'):(CYCLE_SAY[cy.status]||String(cy.status||''));return t.charAt(0).toUpperCase()+t.slice(1);};
 /* what one check took and read, in plain words (the usage sheet's second line per check) */
 function cycleFine(cy){
  if(cy.status==='no_call')return 'no AI call made';
  const parts=[],n=cy.manifest&&Array.isArray(cy.manifest.delta)?cy.manifest.delta.length:null;
  if(n!=null)parts.push('read '+n+(n===1?' update':' updates'));
  if(Number.isFinite(cy.latencyMs))parts.push('took '+(cy.latencyMs<1000?'under a second':(cy.latencyMs/1000).toFixed(1)+' s'));
  else if(cy.status==='reviewing')parts.push('still running');
  parts.push('no cost reported');
  return parts.join(' · ');
 }
 function rawSheet(c,d){
  const S=window.PM56_SHELL,a=engine.snapshot(d.threadId),usage=d.type==='bsd-usage',tid=d.threadId||c.thread.id;
  const title=usage?'Advisor usage':'Advisor transcript';
  let body,lead;
  if(!a){lead='This advisor run has ended.';body='<p class="pmx-bsd-say">There is nothing left to show: its record ended with the run.</p>';}
  else if(usage){
   const u=a.usage,n=u.localEvaluations,row=K.stageRow?K.stageRow(a.stage):a.stage;
   lead='What the advisor used in this chat, kept apart from your chat’s own usage.';
   body='<p class="pmx-bsd-say"><b>'+n+(n===1?' check':' checks')+'</b> · no real AI calls · cost not reported.</p><p class="pmx-bsd-fine">Watching '+c.esc(lowerFirst(row?STAGE_PLAIN[row]||row:'ordinary work'))+' with '+c.esc(advisorWords(a.identity))+'.</p>'+
    '<p class="pmx-bsd-fine">A check reads only what changed since the one before. When nothing changed it is skipped, and a skip makes no AI call.</p>'+
    (a.cycles.length?'<p class="pmx-bsd-sub">Each check</p><ol class="pmx-bsd-list pmx-bsd-cycles">'+a.cycles.map(cy=>'<li><span class="pmx-bsd-v">v'+c.esc(cy.generation)+'</span><span class="pmx-bsd-cy"><span>'+c.esc(cycleSay(cy))+'</span><span class="pmx-bsd-cyfine">'+c.esc(cycleFine(cy))+'</span></span></li>').join('')+'</ol>':'<p class="pmx-bsd-fine">No checks yet.</p>')+
    rawDisc('bsd12-raw-usage:'+tid,'Show raw data','<pre>'+c.esc(JSON.stringify({assignmentId:a.id,stage:a.stage,identity:a.identity,usage:a.usage,cycles:a.cycles.map(cy=>({id:cy.id,status:cy.status,generation:cy.generation,epoch:cy.epoch,reason:cy.reason,latencyMs:cy.latencyMs}))},null,2))+'</pre>');
  }else{
   lead=a.policy.retainTranscript?'What the advisor read at each check. Kept because Keep the advisor’s notes is on.':'Keeping the advisor’s notes is off.';
   body=!a.policy.retainTranscript?'<p class="pmx-bsd-say">Nothing was kept. Turn on Keep the advisor’s notes in Back Seat Driver to read what it looked at next time.</p>'
    :a.transcript.length?'<div class="pmx-bsd-txs">'+a.transcript.map(x=>rawDisc('bsd12-tx:'+x.cycleId,'<span class="pmx-bsd-v">v'+c.esc(x.generation)+'</span><span class="pmx-bsd-txsay">'+c.esc(cycleSay({status:x.outcome}))+' · read '+((n=>n+(n===1?' update':' updates'))(x.manifest&&x.manifest.delta?x.manifest.delta.length:0))+'</span>','<pre>'+c.esc(JSON.stringify(x,null,2))+'</pre>','pmx-bsd-tx')).join('')+'</div>'
    :'<p class="pmx-bsd-say">Nothing kept yet. It keeps what it read at each check.</p>';
  }
  const foot=S.pmxFoot({cls:'pmx-bsd-rawfoot',readback:S.pmxReadback({key:'bsd-raw-rb',parts:[{html:'Preview only: no real AI calls.'}]}),
   /* the empty extra keeps Done in the foot's last column when there is no Export */
   extra:usage&&a?'<button type="button" class="text-button" data-action="bsd-export-local"'+attrs(tid)+'>Export local record</button>':'<span aria-hidden="true"></span>',
   primary:{action:'bsd-close-dialog',label:'Done',attrs:attrs(tid).trim()}})
   /* a read-only sheet has one way out, Done (FOUNDATION REQUEST, as ELI5's: pmxFoot({cancel:false})) */
   .replace(/<button type="button" class="soft-button pmx-cancel"[^>]*>[\s\S]*?<\/button>/,'');
  return S.pmxSheet({type:d.type,kind:'bsd',size:'compact',height:560,cls:'bsd-dialog pmx-bsd-rawsheet',closeAction:'bsd-close-dialog',closeAttrs:attrs(tid).trim(),scrimClose:'bsd-close-dialog',
   markHtml:S.pmxKindMark('bsd',26),title,lead,ariaLabel:title,body:'<div class="pmx-bsd-rawbody">'+body+'</div>',foot});
 }
 /* ================================================================ the sheet (DESIGN-SPEC 8.6)
    A standard pmx sheet: the cue sheet (a typical task, where the advisor checks and where it speaks up), the
    Off · Auto · On switch, Who advises and Memory on the left, When it speaks up on the right, one Advanced page
    (Where it watches, a run in progress, tidying its notes) and the footer read-back. Every control writes the
    module-local draft; only Save commits, as up to three CAS dispatches in canon's order (IMPACT A1-37). */
 const MODE_WORD={off:'Off',auto:'Auto',on:'On'};
 const word=m=>MODE_WORD[m]||String(m==null?'':m);
 /* IMPACT A3-01: one option catalog per enum. The triggers, the menus (PM56_PMX.pick) and the read-back all read it;
    every menu has a human title and every option its own description line (C.5). `short` is the trigger's second line. */
 const CHOICES={
  sensitivity:{title:'How watchful',options:[
   {value:'conservative',label:'Conservative',description:'Only the big moments.',short:'Only the big moments'},
   {value:'balanced',label:'Balanced',description:'A sensible middle. Recommended.',short:'Recommended'},
   {value:'frequent',label:'Frequent',description:'Also checks when work drifts or errors repeat.',short:'Also when work drifts'}]},
  catchUpSeconds:{title:'Catch-up delay',options:[
   {value:0,label:'Off',description:'Don’t wait at all. The advisor still works; this is not Back Seat Driver off.',short:'No wait'},
   {value:15,label:'15 seconds',description:'A short wait before the assistant finishes.',short:'A short wait'},
   {value:30,label:'30 seconds',description:'Recommended. Enough for most checks to land.',short:'Recommended'},
   {value:60,label:'60 seconds',description:'For slow models or long checks.',short:'For slow models'}]},
  workflowMode:{title:'For a run in progress',options:[
   {value:'inherit',label:'Project’s mode',description:'Each run uses the project’s mode, chosen on the first page.'},
   {value:'off',label:'Off',description:'Runs start with no second opinion.'},
   {value:'auto',label:'Auto',description:'Runs are checked at key moments.'},
   {value:'on',label:'On',description:'Runs are checked after every step.'}]},
  stage:{title:'',options:[
   {value:'inherit',label:'Same as default',description:'Uses the run’s setting, or else this project’s mode.'},
   {value:'off',label:'Off',description:'No second opinion for this kind of work.'},
   {value:'auto',label:'Auto',description:'Checks this kind of work at key moments.'},
   {value:'on',label:'On',description:'Checks this kind of work after every step.'}]}
 };
 /* the mode a row marked "Same as default" resolves to: the run's mode, else the project's (bsd-protocol resolve()) */
 const defaultMode=v=>v.workflowMode&&v.workflowMode!=='inherit'?v.workflowMode:v.mode;
 function optionsFor(key,v){
  const tail=key==='workflowMode'?word(v.mode):word(defaultMode(v));
  return CHOICES[key].options.map(o=>o.value==='inherit'?Object.assign({},o,{label:o.label+' ('+tail+')'}):o);
 }
 const optionOf=(key,v,x)=>optionsFor(key,v).find(o=>String(o.value)===String(x));
 /* IMPACT A3-01: selfCompactThreshold is a fraction in the policy and a percentage on screen; this is the one place
    that converts between them (the stepper's template and the document input listener both go through it) */
 const THRESHOLD={toPercent:f=>Math.round(Number(f)*100),toFraction:p=>Math.round(Number(p))/100};
 /* 8.6 Where it watches: a plain name first, the canonical stage name (bsd-protocol STAGES) in fine print */
 const lowerFirst=t=>{t=String(t||'');return t.charAt(0).toLowerCase()+t.slice(1);};
 const STAGE_PLAIN={prd_builder:'Writing the requirements',planning_wizard:'Planning interview',deep_plan:'Researching and drafting the plan',planunit_compile:'Breaking the plan into pieces',worknode_generation:'Creating build tasks',worknode_execution:'Writing code',verification:'Running tests',gate_evaluation:'Ready-to-continue checks',worknode_audit:'Reviewing finished work',certification:'Final sign-off, it only advises'};
 const CUE_STEPS=['Plan the change','First real change','Run a risky command','Tests fail','Fix and retry','Before it says done'];
 /* IMPACT A1-37 / A1-53 (8.15): one Save, up to three canonical dispatches in this order; `fields` is what each carries */
 const SAVE_STEPS=[
  {cmd:'cmd.bsd.set',part:'Mode',fields:['mode'],when:(v,b)=>v.mode!==b.mode},
  {cmd:'cmd.bsd.configure',part:'the advisor’s settings',fields:['modelId','effort','fast','persona','sensitivity','catchUpSeconds','cooldownTurns','retainTranscript','selfCompactThreshold','workflowMode'],when:()=>true},
  {cmd:'cmd.bsd.workflow.configure',part:'Where it watches',fields:['stages'],when:(v,b)=>JSON.stringify(v.stages)!==JSON.stringify(b.stages)}];
 let lastSave=null;
 const saveExtra=new Map();  /* per advisor run: restarts that came from the second and third command of one Save */
 const projectWords=pid=>String(pid||'').indexOf('concept:bsd12')===0?'this example project':'this project';
 function beginConfig(c){
  disclosures.delete('bsd12-stage-draft');disclosures.delete('bsd12-advanced-draft');
  const v=view(c.thread.id),values=clone(v.assignment?.policy||v.policy);
  draft={threadId:c.thread.id,projectId:v.projectId,revision:v.policy.revision,assignmentId:v.assignment?.id||null,epoch:v.assignment?.epoch,base:clone(values),values,refusal:null,errorBlock:null};
  c.closeMenu();c.openDialog({type:'bsd-stages'});
 }
 function currentDraft(){return draft&&thread(draft.threadId)&&E.ctx().thread.id===draft.threadId&&project(thread(draft.threadId))===draft.projectId;}
 /* pmxStepper steps by one; a stepper with a coarser step (Tidy its notes at: 5 %) gets its deltas rewritten here
    (FOUNDATION REQUEST in BSD-NOTES: a `step` option on pmxStepper) */
 /* J-2 fitted copy for the sheet: the full sentence, a shorter one for the wide faces (retro's Plex Mono, friendly's
    Poppins, where R-16 keeps these lines to one or two), and a shortest one for windows under 800 px tall, where the
    helpers keep one line. bsd.css shows exactly one of them; the full sentence is also the label's hover card. A
    promise ("your chat stays as is", "you can skip") is never the part that is cut. */
 const fit=(full,mid,tiny)=>'<span class="pmx-bsd-full">'+full+'</span>'+(mid?'<span class="pmx-bsd-mid">'+mid+'</span>':'')+(tiny?'<span class="pmx-bsd-tiny">'+tiny+'</span>':'');
 function stepperBy(S,o,step){const h=S.pmxStepper(o);return step>1?h.replace('data-delta="-1"','data-delta="-'+step+'"').replace('data-delta="1"','data-delta="'+step+'"'):h;}
 const hoverWord=(c,key,text,tip)=>'<span data-hover-key="'+c.esc(key)+'" data-hover-tip="'+c.esc(tip)+'">'+text+'</span>';
 function choiceTrigger(c,S,key,v,th){
  const o=optionOf(key,v,v[key])||{label:String(v[key]),short:''};
  return S.pickerButton({action:'bsd-choice',anchor:'bsd-'+key,strong:c.esc(o.label),small:o.short?c.esc(o.short):'',extra:'data-field="'+key+'"'+th,iconHtml:c.icon('down',11)});
 }
 /* The cue sheet (8.6, R-16; 904 x 137, six px under the J-2 reference's 143 so the two control columns fit the 760 px sheet). A typical task as six steps on one track; the
    advisor's eye watches from the side. Hollow cues check quietly, the filled cue speaks up and hangs the specimen of
    what you get (drawn as the real note: eye, severity glyph and word, one line). The hatched stretch is the catch-up
    wait; the small dots after the warning are the quiet period. Every label keeps 8 px from every line and 12 px
    from the plate's sides; nothing is decoration. */
 function cuePlate(c,S,v){
  const P=S.pmxPlateParts,off=v.mode==='off',on=v.mode==='on',X=i=>150+i*134,TY=84;
  let s='<g data-pmx-part="who">'+P.glyph(off?'eye-closed':'eye',18,TY-13,26)+P.label({x:18,y:TY+24,text:'Advisor',cls:'lab'})+P.label({x:18,y:TY+41.5,text:'watches from the side',cls:'sub'})+'</g>';
  s+=P.line({key:'bsd-track',d:'M'+(X(0)-40)+' '+TY+'H'+(X(5)+30),style:'fixed',draw:'right',part:'watch'});
  CUE_STEPS.forEach((t,i)=>{s+='<g data-pmx-part="watch"><circle class="pmx-bsd-tick" cx="'+X(i)+'" cy="'+TY+'" r="3"/>'+P.label({x:X(i),y:TY+24,text:t,anchor:'middle'})+'</g>';});
  if(off){
   s+=P.label({x:X(2)+67,y:42,text:'No second opinion. Costs nothing.',anchor:'middle',cls:'voice',part:'mode'});
  }else{
   const frequent=!on&&v.sensitivity==='frequent',quiet=v.cooldownTurns>0;
   const cues=on||frequent?[0,1,2,3,4,5].filter(i=>on||i!==0):[1,2,3,5];
   const after=quiet?cues.filter(i=>i>3):[];
   cues.forEach(i=>{
    const speaks=i===3,dot=after.indexOf(i)>=0;
    s+='<g data-pmx-part="'+(speaks?'mode':dot?'quiet watch':'mode watch')+'">'+P.line({key:'bsd-stem:'+i,d:'M'+X(i)+' '+(TY-6)+'V'+(TY-22),style:'fixed',draw:'up'});
    s+=dot?'<circle class="pmx-bsd-quiet" data-k="bsd-cue:'+i+'" cx="'+X(i)+'" cy="'+(TY-28)+'" r="2.5"/>':P.cue({key:'bsd-cue:'+i,x:X(i),y:TY-28,kind:speaks?'speaks':'quiet'});
    s+='</g>';
   });
   if(frequent){const dx=(X(1)+X(2))/2;s+='<g data-pmx-part="watch">'+P.line({key:'bsd-stem:drift',d:'M'+dx+' '+(TY-2)+'V'+(TY-22),style:'sees',draw:'up'})+P.cue({key:'bsd-cue:drift',x:dx,y:TY-28,kind:'quiet'})+P.label({x:dx,y:40,text:'when work drifts',anchor:'middle'})+'</g>';}
   /* the specimen: what a note looks like when it speaks up, hanging from the filled cue */
   const nx=X(3)-206;
   s+='<g data-pmx-part="mode">'+P.line({key:'bsd-leader',d:'M'+(X(3)-3)+' '+(TY-34)+'L'+(X(3)-14)+' 34',style:'sees',draw:'up'})+P.glyph('eye',nx,9,13)+'<path class="pmx-bsd-sev" d="M'+(nx+23)+' 12.4 '+(nx+27.7)+' 20.6H'+(nx+18.3)+'Z"/>'+P.label({x:nx+32,y:21,text:'Concern',cls:'lab'}).replace(/<\/text>$/,'<tspan class="pmx-p-voice"> · The new test fails on empty labels</tspan></text>')+'</g>';
   if(v.catchUpSeconds>0)s+='<g data-pmx-part="catchup">'+P.hatch(X(5)-46,TY-4,40,8)+P.label({x:X(5)-14,y:TY-16,text:'waits up to '+v.catchUpSeconds+' s',anchor:'end'})+'</g>';
   if(after.length){const qx=(X(after[0])+X(after[after.length-1]))/2;s+=P.label({x:qx,y:40,text:'quiet for '+v.cooldownTurns+(v.cooldownTurns===1?' reply':' replies'),anchor:'middle',part:'quiet'});}
  }
  const legend=off?[]:[{sample:'hollow',label:'checks quietly',part:'watch'},{sample:'filled',label:'speaks up',part:'mode'}];
  const caption=off?'No second opinion. Costs nothing.':on?'Checks quietly after every step, and speaks up only when something important looks wrong.':'Checks quietly at key moments, and speaks up only when something important looks wrong.';
  return S.pmxPlateFit({key:'pmx-bsd-cue',cls:'pmx-bsd-cue',kind:'bsd',plates:[S.pmxPlate({key:'pmx-bsd-cue:full',kind:'bsd',mode:'full',w:904,h:137,fitH:137,svg:s,legend:legend,cls:'pmx-bsd-plate'})],caption:caption});
 }
 function readbackParts(S,v,idn){
  const X=window.PM56_PMX,ink=(k,t)=>X&&X.ink?X.ink('rb:bsd:'+k,t):S.esc(t);
  if(v.mode==='off')return [{part:'mode',html:'Back Seat Driver is <b>'+ink('mode','off')+'</b> in this project. Nothing is watched, and it costs nothing.'}];
  const how=v.mode==='on'?'checks after every step':v.sensitivity==='conservative'?'checks only at the big moments':v.sensitivity==='frequent'?'checks at key moments and when work drifts':'checks at key moments';
  /* the tail " before the assistant finishes" drops in the Save and refresh advisor foot (bsd.css), whose wider
     button leaves the read-back less room: the promise is never the part that gets cut (review cycle 1) */
  const wait=v.catchUpSeconds>0?'waits up to <b>'+ink('catch',v.catchUpSeconds+' s')+'</b><span class="pmx-bsd-rbx"> before the assistant finishes</span>':'doesn’t wait before the assistant finishes';
  const quiet=v.cooldownTurns>0?'then stays quiet for <b>'+ink('quiet',v.cooldownTurns+(v.cooldownTurns===1?' reply':' replies'))+'</b> after a warning.':'and has no quiet period after a warning.';
  const head=[{part:'mode',html:'<b>'+ink('mode',word(v.mode))+'</b> with '},{part:'who',html:'<b>'+ink('model',idn.requestedName)+'</b> as <b>'+ink('persona',v.persona)+'</b>. '}];
  /* the chosen model is unavailable and nothing stands in (standIn below): the read-back says it won't run, never
     that it checks (the same ink key as "how", so the change inks) */
  if(!idn.available)return head.concat([{part:'who',html:'It '+ink('how','won’t run until '+idn.requestedName+' is available or you pick another model')+'.'}]);
  /* Where it watches rows that differ from the default are read back too (principle 1: the footer reads back the
     whole setup); two by name, more as a count */
  /* retro and friendly (wider faces) say it as "Writing code: On. Final sign-off: Off." (bsd.css fit copy) */
  const own=v.stages.filter(s=>s.mode!=='inherit'),name=s=>(STAGE_PLAIN[s.id]||s.label).split(',')[0];
  const rows=!own.length?'':own.length>2?' '+ink('stages',own.length+' kinds of work have their own setting.'):' '+fit(ink('stages',own.map(s=>name(s)+' is '+word(s.mode)).join(' and ')+'.'),ink('stages-short',own.map(s=>name(s)+': '+word(s.mode)+'.').join(' ')));
  return head.concat([{part:'watch',html:'It '+ink('how',how)+', '},{part:'catchup',html:wait+', '},{part:'quiet',html:quiet}],rows?[{part:'stages',html:rows}]:[]);
 }
 /* G-30 BSD-09: the chosen advisor model is unavailable. The concept never substitutes one silently, so this is the
    no-substitute sentence; "requested / no substitute" lives only in the fine print (DON'T 19). */
 function standIn(c,S,v,idn){
  if(idn.available)return '';
  const m=D.models.find(x=>x.id===v.modelId),why=m?String((D.labels&&D.labels.modelStatus&&D.labels.modelStatus[m.status])||m.status).toLowerCase():'not one of your models',acct=m&&D.accountNick?D.accountNick(m.accountId,m.account):'';
  const si=S.pmxStandIn({requested:idn.requestedName+(acct?' ('+acct+')':''),noSubstitute:true});
  return S.pmxRoute({cls:'pmx-bsd-route',tone:'failed',attrs:'data-failure="'+c.esc(m?m.status:'model_unresolved')+'"',strong:'Nothing can stand in',text:'for '+c.esc(idn.requestedName)+' ('+c.esc(why)+'), so pick another model or your advisor won’t run.',fine:si?si.fine:''});
 }
 function config(c){
  if(!draft)return '';
  const S=window.PM56_SHELL,pick=window.PM56_PICKERS,v=draft.values,stale=!currentDraft(),th=attrs(draft.threadId),off=v.mode==='off';
  const idn=identity(v),pct=THRESHOLD.toPercent(v.selfCompactThreshold),changed=v.stages.filter(s=>s.mode!=='inherit').length;
  const mode=S.pmxQuestion({key:'q-bsd-mode',title:'Mode',meta:'Applies to every chat in '+projectWords(draft.projectId)+'.',affects:'mode',cls:'pmx-bsd-q',body:S.pmxSwitch({key:'bsd-mode',action:'bsd-config-mode',current:v.mode,affects:'mode',label:'Back Seat Driver mode',options:[
   {value:'off',label:'Off',helper:'No second opinion. Costs nothing.',attrs:th+(v.mode==='off'?' data-pmx-autofocus':'')},
   {value:'auto',label:'Auto',helper:'Checks at key moments. Default.',attrs:th+(v.mode==='auto'?' data-pmx-autofocus':'')},
   {value:'on',label:'On',helper:'Checks after every step. Same bar for speaking up; uses more of your plan.',attrs:th+(v.mode==='on'?' data-pmx-autofocus':'')}]})});
  const fine=draft.assignmentId?fit('Saving re-reads the latest work with fresh notes. Your chat isn’t changed.','Saving re-reads the latest work; your chat stays as is.'):fit('Saving a change starts a fresh advisor session. Your chat isn’t affected.','Saving starts a fresh advisor session; your chat stays as is.');
  const who=S.pmxQuestion({key:'q-bsd-who',title:'Who advises',affects:'who',cls:'pmx-bsd-q',body:'<div class="pmx-bsd-pair">'+pick.modelButton('bsd-pick-model','bsd-model',v.modelId,th.trim())+pick.personaButton('bsd-pick-persona','bsd-persona',v.persona,th.trim())+'</div>'+standIn(c,S,v,idn)+
   '<p class="pmx-help">'+fit('A different model from your main assistant gives a truer second opinion.','A different model gives a truer second opinion.')+'</p><p class="pmx-fine">'+fine+'</p>'});
  const memory=S.pmxQuestion({key:'q-bsd-memory',title:'Memory',affects:'notes',cls:'pmx-bsd-q',body:S.pmxCheck({key:'bsd-keep',attrs:'data-bsd-field="retainTranscript"'+th,checked:v.retainTranscript,label:'Keep the advisor’s notes',helper:'Lets you read what it looked at. Gives it no extra access.',affects:'notes'})+
   '<p class="pmx-fine pmx-bsd-tidy">Tidies its own notes at '+pct+'% · Advanced</p>'});
  const when=S.pmxQuestion({key:'q-bsd-when',title:hoverWord(c,'bsd-when','When it speaks up','In Settings this is called “When to advise”.'),meta:off?'<span class="pmx-bsd-offnote">Applies when Back Seat Driver is on</span>':'',cls:'pmx-bsd-q',state:draft.errorBlock==='when'?'error':'',body:
   S.pmxCtl({key:'ctl-bsd-sens',label:hoverWord(c,'bsd-watchful','How watchful','How readily it checks. Safety checks always run. This never changes how serious a problem must be.'),helper:fit('How readily it checks. Safety checks always run.','','Safety checks always run.'),affects:'watch',control:choiceTrigger(c,S,'sensitivity',v,th)})+
   S.pmxCtl({key:'ctl-bsd-catch',label:hoverWord(c,'bsd-catchup','Catch-up delay','Before the assistant finishes, it waits up to this long for the advisor to catch up. You can always skip the wait. Off means no waiting, not Back Seat Driver off.'),helper:fit('Before the assistant finishes, it waits up to this long. You can skip the wait.','The assistant waits this long at most. You can skip it.','You can always skip the wait.'),affects:'catchup',control:choiceTrigger(c,S,'catchUpSeconds',v,th)})+
   S.pmxCtl({key:'ctl-bsd-quiet',label:hoverWord(c,'bsd-quiet','Quiet period after a warning','After it warns you, later notes arrive as quiet side notes for this many replies. Nothing is dropped.'),helper:fit('Later notes arrive as quiet side notes. Nothing is dropped.','','Later notes are quiet, not dropped.'),affects:'quiet',control:S.pmxStepper({key:'bsd-cool',input:{key:'cooldownTurns',attrs:'data-bsd-field="cooldownTurns"'+th},value:v.cooldownTurns,min:0,max:100,cells:false,unit:v.cooldownTurns===1?'reply':'replies',affects:'quiet'})})});
  const summary=(changed?changed+(changed===1?' kind of work changed':' kinds of work changed'):'All 10 kinds of work follow '+word(defaultMode(v)))+' · notes tidied at '+pct+'%';
  const main='<div class="pmx-bsd-body" data-off="'+(off?1:0)+'">'+cuePlate(c,S,v)+
   '<div class="pmx-col pmx-bsd-top" data-k="bsd-col-mode">'+mode+'</div>'+
   '<div class="pmx-bsd-cols" data-k="bsd-cols" data-off="'+(off?1:0)+'"><div class="pmx-col pmx-bsd-col" data-k="bsd-col-who">'+who+memory+'</div><div class="pmx-col pmx-bsd-col" data-k="bsd-col-when">'+when+'</div></div>'+
   '<div class="pmx-col pmx-bsd-end" data-k="bsd-col-end">'+S.pmxAdvancedEntry({key:'bsd-adv',summary:summary,attrs:th.trim()})+'</div></div>';
  /* the honesty line leads, so it is never the part that gives way; the Save and refresh advisor foot has less room
     beside its wider button, so it says the cost in fewer words and the estimate keeps one line (review cycle 1) */
  const refresh=!!draft.assignmentId,estimate=off?'Preview only: no real AI calls':v.mode==='on'?(refresh?'Preview only: no real AI calls · costs more than Auto (checks after every step)':'Preview only: no real AI calls · Extra cost: more than Auto, as it checks after every step')
   :refresh?'Preview only: no real AI calls · about $0.05–0.25 extra per long task (an estimate)':'Preview only: no real AI calls · Extra cost: about $0.05–0.25 per long task · an estimate, not a promise';
  const refusal=draft.refusal||(stale?{code:'stale_projection',strong:'Not saved.',text:'You switched chats. Reopen Back Seat Driver from the chat it belongs to.'}:null);
  const foot=S.pmxFoot({cls:'pmx-bsd-foot',attrs:(refresh?'data-refresh="1"':'')+(!off&&changed?' data-stages="1"':''),readback:S.pmxReadback({key:'bsd-readback',parts:readbackParts(S,v,idn)}),estimate:S.pmxEstimate({text:estimate}),refusal:refusal?S.pmxRefusal(refusal):'',
   cancel:{action:'bsd-close-dialog',attrs:th.trim()},primary:{action:'bsd-save-config',label:draft.assignmentId?'Save and refresh advisor':'Save',attrs:th.trim(),disabled:stale}});
  return S.pmxSheet({type:'bsd-stages',kind:'bsd',size:'standard',cls:'bsd-dialog pmx-bsd-sheet',state:refusal?'refused':'',scrimClose:'bsd-close-dialog',closeAction:'bsd-close-dialog',closeAttrs:th.trim(),
   markHtml:S.pmxKindMark(off?'bsd-off':v.mode==='on'?'bsd-on':'bsd-auto',26),title:'Back Seat Driver',ariaLabel:'Back Seat Driver',
   /* the promise (d4's lock-glyph line) is the lead's second sentence, on its own line: no height is spent on it */
   lead:'A second AI that watches the work and speaks up only when something important looks wrong. <span class="pmx-bsd-promise">'+S.pmxGlyph('lock',13)+'<span>It never changes, runs or approves anything.</span></span>',
   body:main,advancedOpen:!!(c.state.dialog&&c.state.dialog.pmxAdvanced),advancedHtml:advanced(c,S,v,th),foot:foot});
 }
 /* A14/A15 + 8.6: the one Advanced page, in finished sentences. Where it watches keeps its canon key
    (bsd12-stage-draft) and the page keeps bsd12-advanced-draft (bsd.js disclosures, B.10). */
 function advanced(c,S,v,th){
  const def=word(defaultMode(v)),changed=v.stages.filter(s=>s.mode!=='inherit').length,pct=THRESHOLD.toPercent(v.selfCompactThreshold);
  const rows=v.stages.map(s=>{
   const o=optionOf('stage',v,s.mode)||{label:word(s.mode)},label=s.mode==='inherit'?'Default ('+def+')':o.label,X=window.PM56_PMX;  /* the menu keeps "Same as default (Auto)" */
   return '<div class="pmx-bsd-stage" data-k="bsd-stage:'+c.esc(s.id)+'" data-changed="'+(s.mode!=='inherit'?1:0)+'" data-pmx-affects="stages"><span class="pmx-bsd-stage-copy"><span class="pmx-ctl-label">'+c.esc(STAGE_PLAIN[s.id]||s.label)+'</span><span class="pmx-fine">'+c.esc(s.label)+(s.mode!=='inherit'?'<span class="pmx-bsd-changed"> · '+fit('changed from '+c.esc(def),'changed')+'</span>':'')+'</span></span>'+
    S.pickerButton({action:'bsd-stage-choice',anchor:'bsd-stage-'+s.id,strong:X&&X.ink?X.ink('bsd-stage:'+s.id,label):c.esc(label),extra:'data-stage="'+c.esc(s.id)+'"'+th,iconHtml:c.icon('down',11)})+'</div>';
  }).join('');
  const sum=changed?'<span>'+changed+' changed</span><button type="button" class="text-button pmx-bsd-reset" data-action="bsd-stage-reset"'+th+'>Reset</button>':'<span>All 10 follow '+c.esc(def)+'</span>';
  const watch='<section class="pmx-bsd-watch" data-k="bsd12-stage-draft" data-pmx-affects="stages"><header class="pmx-bsd-watch-head"><h3 class="pmx-q-title">Where it watches</h3><p class="pmx-bsd-watch-sum">'+sum+'</p></header><div class="pmx-bsd-stages">'+rows+'</div></section>';
  const run=optionOf('workflowMode',v,v.workflowMode);
  const runSay=v.workflowMode==='inherit'?'Runs use the project’s mode, <b>'+c.esc(word(v.mode))+'</b>.':v.workflowMode==='off'?'Runs start with Back Seat Driver <b>off</b>.':'Runs are checked '+(v.workflowMode==='on'?'<b>after every step</b>.':'<b>at key moments</b>.');
  const settings=S.pmxSetting({key:'bsd-set-run',label:hoverWord(c,'bsd-run','For a run in progress','A run locks in its mode when it starts. Changing this affects the next run, not one already going.'),sentence:runSay,helper:'Locked in when a run starts.',affects:'stages',control:S.pickerButton({action:'bsd-choice',anchor:'bsd-workflowMode',strong:v.workflowMode==='inherit'?fit(c.esc(run.label),'Project ('+c.esc(word(v.mode))+')'):c.esc(run?run.label:word(v.workflowMode)),extra:'data-field="workflowMode"'+th,iconHtml:c.icon('down',11)})})+
   S.pmxSetting({key:'bsd-set-tidy',label:hoverWord(c,'bsd-tidy','Tidy its notes at','Keeps the advisor’s own notes short. It never touches your chat.'),sentence:'It tidies its own notes when they are <b>'+pct+'% full</b>.',helper:'It never touches your chat.',affects:'notes',
    control:stepperBy(S,{key:'bsd-tidy',input:{key:'selfCompactThreshold',attrs:'data-bsd-field="selfCompactThreshold" step="5"'+th},value:pct,min:10,max:95,cells:false,unit:'%',affects:'notes'},5)});
  const tech='<p class="pmx-fine pmx-bsd-tech" data-k="bsd-tech"><b>Technical details</b> · Save sends <code>cmd.bsd.set</code> when the mode changed, then <code>cmd.bsd.configure</code>, then <code>cmd.bsd.workflow.configure</code> when a row above changed, and stops at the first one refused.</p>';
  return S.pmxAdvancedPage({key:'bsd12-advanced-draft',cls:'pmx-bsd-adv',title:'Advanced',intro:'Where it watches, and how it keeps its own notes. Most people leave these as they are.',rows:watch+settings+tech});
 }
 /* inline validation (A18 in the foot; the code stays in data-failure) */
 function validationRefusal(v){
  if(!Number.isInteger(v.cooldownTurns)||v.cooldownTurns<0||v.cooldownTurns>100)return {block:'when',r:{code:'invalid_request',strong:'Not saved.',text:'Quiet period must be a whole number from 0 to 100.'}};
  if(!Number.isFinite(v.selfCompactThreshold)||v.selfCompactThreshold<.1||v.selfCompactThreshold>.95)return {block:'',r:{code:'invalid_request',strong:'Not saved.',text:'Tidy its notes at must be from 10% to 95%.'}};
  if(!v.modelId||!v.persona)return {block:'',r:{code:'invalid_request',strong:'Not saved.',text:'Pick a model and a Persona for your advisor.'}};
  return {block:'',r:{code:'invalid_request',strong:'Not saved.',text:'These settings can’t be saved as they are. Reopen Back Seat Driver to start again.'}};
 }
 /* IMPACT A1-37: cmd.bsd.set (only if the mode changed), then cmd.bsd.configure, then cmd.bsd.workflow.configure (only
    if a Where it watches row changed). Each is its own CAS commit on the engine; it stops at the first refusal and the
    foot names what saved and what did not. The sheet stays open with the unsaved values. */
 function saveConfig(c){
  const d=draft,S=window.PM56_SHELL;
  if(!currentDraft()){if(d){d.refusal={code:'stale_projection',strong:'Not saved.',text:'You switched chats. Reopen Back Seat Driver from the chat it belongs to.'};c.renderOverlays();}return;}
  const bad=engine.validate(d.values);
  if(bad){const x=validationRefusal(d.values);d.refusal=x.r;d.errorBlock=x.block;c.renderOverlays();return;}
  const steps=SAVE_STEPS.filter(s=>s.when(d.values,d.base)),log=[],startEpoch=d.epoch;
  let values=clone(d.base),rev=d.revision,epoch=d.epoch;
  const oneStart=()=>{if(d.assignmentId&&startEpoch!=null&&epoch-startEpoch>1)saveExtra.set(d.assignmentId,(saveExtra.get(d.assignmentId)||0)+epoch-startEpoch-1);};
  for(let i=0;i<steps.length;i++){
   const st=steps[i];for(const f of st.fields)values[f]=clone(d.values[f]);
   const r=engine.configure({threadId:d.threadId,projectId:d.projectId,expectedRevision:rev,assignmentId:d.assignmentId,expectedEpoch:epoch,values:clone(values),identity:identity(values)});
   log.push({cmd:st.cmd,ok:!!r.ok,error:r.ok?null:r.error});
   if(!r.ok){
    const saved=steps.slice(0,i).map(s=>s.part),t=S.pmxRefusalText(r.error,{domain:'bsd'});
    const lead=saved.length?(saved.join(' and ')+' saved; the rest didn’t.').replace(/^the /,'The '):'Nothing was saved.';
    d.refusal={code:r.error,strong:lead,text:t?t.text:'Settings changed somewhere else. Reopen to see the latest.',fix:{action:'bsd-configure-stages',label:'Reopen',attrs:attrs(d.threadId).trim()}};
    d.errorBlock='';oneStart();lastSave={at:Date.now(),threadId:d.threadId,ok:false,dispatched:log};c.renderOverlays();return;
   }
   rev=r.revision;if(r.epoch!=null)epoch=r.epoch;for(const f of st.fields)d.base[f]=clone(d.values[f]);d.revision=rev;d.epoch=epoch;
  }
  oneStart();lastSave={at:Date.now(),threadId:d.threadId,ok:true,dispatched:log};
  /* the settings sheet leaves with the save exit; focus goes to the wand trigger (6.7, IMPACT A1-36) */
  if(window.PM56_PMX&&window.PM56_PMX.exitHint)window.PM56_PMX.exitHint('save');
  draft=null;c.closeMenu();c.closeDialog();refresh();
 }
 /* a refused wand or Details command: plain words (9.3), the code is never printed. HON-01: the refusal is also printed
    where it happened (the wand sidecar keeps it under its head; Details prints it under its status line, or in the
    Session's reason line for Pause / Resume / Stop), not only in the toast. It lasts until the next command succeeds. */
 const refusals=new Map();
 function error(c,r,where){
  const id=c.thread.id;if(r.ok){refusals.delete(id);return;}
  const t=window.PM56_SHELL&&window.PM56_SHELL.pmxRefusalText?window.PM56_SHELL.pmxRefusalText(r.error,{domain:'bsd'}):null,text=t?(t.strong?t.strong+' ':'')+t.text:'That didn’t work. Reopen it to see the latest.';
  refusals.set(id,{where:where||'details',code:String(r.error||''),text});
  c.toast('Back Seat Driver unchanged',text);
 }
 const refusalLine=(c,id,where)=>{const x=refusals.get(id);return x&&(!where||x.where===where)?'<p class="pmx-reason pmx-bsd-refused" role="status" data-failure="'+c.esc(x.code)+'"><b>Not changed.</b> '+c.esc(x.text)+'</p>':'';};
 E.slot('contextBsdRow',compact);E.slot('contextBsdSection',details);
 /* G-21: the wand row shows the committed mode in title case and a chevron (it opens a sidecar); the eye's lid follows the mode */
 E.slot('wandRows',c=>{const m=view(c.thread.id).mode,S=window.PM56_SHELL,mark=S&&S.pmxKindMark?S.pmxKindMark(m==='off'?'bsd-off':m==='on'?'bsd-on':'bsd-auto',13):c.icon('eye',13);return '<button class="menu-item" data-submenu="bsd-v2"><span class="menu-icon">'+mark+'</span><span class="menu-copy"><strong>Back Seat Driver</strong><span>Watches the work and speaks up when something looks wrong</span></span><span class="shortcut">'+c.esc(word(m))+'</span><span class="chevron">'+c.icon('chevron',11)+'</span></button>';});
 /* B.10 sidecar copy: Off "No second opinion" · Auto · Default "Checks at key moments" · On "Checks after every step" · Configure…, with a check on the committed mode (owner projection) */
 E.slot('submenu',c=>{if(c.id!=='bsd-v2')return '';const m=view(c.thread.id).mode;return '<div class="menu-head"><strong>Back Seat Driver</strong></div>'+refusalLine(c,c.thread.id,'mode')+[['off','Off','No second opinion'],['auto','Auto · Default','Checks at key moments'],['on','On','Checks after every step']].map(([v,l,d])=>'<button class="menu-item'+(m===v?' active':'')+'" data-action="bsd-set-mode" data-value="'+v+'"'+attrs(c.thread.id)+'><span class="menu-copy"><strong>'+c.esc(l)+'</strong><span>'+c.esc(d)+'</span></span>'+(m===v?c.icon('check',11):'')+'</button>').join('')+'<div class="menu-divider"></div>'+action(c,'bsd-configure-stages','Configure…',c.thread.id,'','menu-item');});
 E.slot('dialog',c=>{const d=c.state.dialog;if(d?.type==='bsd-stages')return config(c);if(d?.type==='bsd-transcript'||d?.type==='bsd-usage')return rawSheet(c,d);return '';});
 E.slot('transcriptMessage',c=>{const m=c.m;if(m?.type==='bsd-advice-v3')return noteHtml(c,m);if(m?.type==='bsd-status-v3')return lineHtml(c,m);return '';});
 /* 7.14 / G-35: BSD answers its own family. A margin note, its lines and the legacy advice receipt are `ledger`, never
    `needs` (BSD-01, BSD-06: it never interrupts; `needs` is the family that spends the accent). */
 E.slot('transcriptFamily',c=>{const t=c&&c.m&&c.m.type;return t==='bsd-advice-v3'||t==='bsd-status-v3'||t==='bsd-advice'?'ledger':'';});
 E.action('bsd-configure-stages',beginConfig);
 E.action('bsd-config-mode',(c,b)=>{if(currentDraft()&&MODE_WORD[b.dataset.value]){draft.values.mode=b.dataset.value;draft.refusal=null;draft.errorBlock=null;c.renderOverlays();}return true;});
 for(const kind of ['model','persona'])E.action('bsd-pick-'+kind,(c,b)=>{const d=draft;if(!currentDraft())return true;window.PM56_PICKERS[kind==='model'?'openModel':'openPersona'](b,{model:d.values.modelId,persona:d.values.persona,effort:d.values.effort,fast:d.values.fast},x=>{if(draft!==d||!currentDraft()||c.state.dialog?.type!=='bsd-stages')return;if(kind==='model'){d.values.modelId=x.model;d.values.effort=x.effort||'';d.values.fast=!!x.fast;}else d.values.persona=x.persona;d.refusal=null;c.renderOverlays();});return true;});
 /* one picker call contract (IMPACT A2-30): title, current, the catalog's options, onChange */
 function openCatalog(b,o){const X=window.PM56_PMX;if(X&&X.pick)return X.pick(b,o);window.PM56_PICKERS.openChoice(b,o.title,o.current,o.options,o.onChange);return true;}
 E.action('bsd-choice',(c,b)=>{const d=draft,key=b.dataset.field;if(!currentDraft()||!CHOICES[key]||key==='stage')return true;openCatalog(b,{title:CHOICES[key].title,current:d.values[key],options:optionsFor(key,d.values),onChange:x=>{if(draft===d&&currentDraft()){d.values[key]=x;d.refusal=null;d.errorBlock=null;c.renderOverlays();}}});return true;});
 E.action('bsd-stage-choice',(c,b)=>{const d=draft,s=d?.values.stages.find(s=>s.id===b.dataset.stage);if(!currentDraft()||!s)return true;openCatalog(b,{title:STAGE_PLAIN[s.id]||s.label,current:s.mode,options:optionsFor('stage',d.values),onChange:x=>{if(draft===d&&currentDraft()){s.mode=x;d.refusal=null;c.renderOverlays();}}});return true;});
 /* new concept action (IMPACT A3-07 classification: draft state, no command): every Where it watches row back to "Same as default" */
 E.action('bsd-stage-reset',(c,b)=>{if(!currentDraft()||(b.dataset.thread&&b.dataset.thread!==draft.threadId))return true;draft.values.stages.forEach(s=>{s.mode='inherit';});draft.refusal=null;pendingFocus={phase:'overlay',sel:'#pmOverlayRoot [data-action="bsd-stage-choice"]'};c.renderOverlays();return true;});
 /* data-bsd-field inputs (B.10): the stepper's hidden inputs and the notes check. They are never typed into, so the
    sheet repaints at once (the read-back inks the changed words) with no caret to lose. */
 document.addEventListener('input',e=>{if(!currentDraft())return;const el=e.target,k=el&&el.dataset?el.dataset.bsdField:null;if(!k)return;
  if(k==='cooldownTurns')draft.values[k]=Number(el.value);
  else if(k==='selfCompactThreshold')draft.values[k]=THRESHOLD.toFraction(el.value);
  else if(k==='retainTranscript')draft.values[k]=!!el.checked;
  else return;
  draft.refusal=null;draft.errorBlock=null;E.ctx().renderOverlays();});
 E.action('bsd-save-config',c=>{saveConfig(c);return true;});
 E.action('bsd-set-mode',(c,b)=>{if(b.dataset.thread&&b.dataset.thread!==c.thread.id)return true;const v=view(c.thread.id),values=clone(v.policy);values.mode=b.dataset.value;const r=engine.configure({threadId:c.thread.id,projectId:v.projectId,expectedRevision:v.policy.revision,assignmentId:v.assignment?.id,expectedEpoch:v.assignment?.epoch,values,identity:identity(values)});error(c,r,'mode');if(r.ok){pendingFocus={phase:'any',sel:'.composer [data-menu-anchor="wand"], [data-action="open-menu"][data-menu="wand"]'};c.closeMenu();}else c.renderOverlays();refresh();return true;});
 E.action('bsd-close-dialog',c=>{if(window.PM56_PMX&&window.PM56_PMX.exitHint&&c.state.dialog?.type==='bsd-stages')window.PM56_PMX.exitHint('cancel');draft=null;c.closeMenu();c.closeDialog();return true;});E.chainAction('close-dialog',c=>{if(c.state.dialog?.type==='bsd-stages')draft=null;return false;});
 E.action('bsd-open-details',(c,b)=>{if(b.dataset.thread&&b.dataset.thread!==c.thread.id)return true;c.closeMenu();c.state.context.details=true;c.state.context.drawerView='curated';c.renderApp();requestAnimationFrame(()=>document.getElementById('ctx-bsd')?.scrollIntoView({block:'start'}));return true;});
 /* Why? (8.6): on an aside it opens the note in place (view state; the height folds through app.js flipHeights, the
    note carries data-flip); on a note or a Details row it opens Details at that note, its Advisor notes open. */
 E.action('bsd-open-finding',(c,b)=>{if(b.dataset.thread!==c.thread.id)return true;const fid=b.dataset.id;
  if(b.dataset.inPlace){openAside.set(fid,true);pendingFocus={phase:'app',sel:'.transcript .bsd-card[data-finding="'+CSS.escape(fid)+'"] [data-action="bsd-open-finding"]'};c.renderApp();return true;}
  openFinding=openFinding===fid&&b.closest('#ctx-bsd')?null:fid;disclosures.set('bsd12-findings:'+c.thread.id,true);c.state.context.details=true;c.state.context.drawerView='curated';c.renderApp();
  requestAnimationFrame(()=>{const d=document.querySelector('#ctx-bsd [data-k="bsd12-findings:'+CSS.escape(c.thread.id)+'"]');if(d)d.open=true;document.querySelector('#ctx-bsd [data-finding="'+CSS.escape(fid)+'"]')?.scrollIntoView({block:'center'});});return true;});
 E.action('bsd-open-source',(c,b)=>{if(thread(b.dataset.thread))c.switchThread(b.dataset.thread);return true;});
 E.action('bsd-export-local',(c,b)=>{if(b.dataset.thread!==c.thread.id)return true;const a=engine.snapshot(b.dataset.thread);if(!a)return true;const url=URL.createObjectURL(new Blob([JSON.stringify({kind:'local_bsd_audit',native:false,primary_run_mutated:false,assignment:a},null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='bsd-local-record.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);return true;});
 E.action('bsd-dismiss',(c,b)=>{if(b.dataset.thread!==c.thread.id)return true;pendingFocus={phase:'app',sel:b.closest('#ctx-bsd')?'#ctx-bsd [data-finding="'+CSS.escape(b.dataset.id)+'"] [data-action="bsd-open-finding"]':'.composer-input'};error(c,engine.closeFinding(b.dataset.thread,b.dataset.id,Number(b.dataset.epoch)));refresh();return true;});
 /* bsd-control: Pause / Resume / Stop advisor. Resume after a safety pause is canon's retry (8.15: .retry when
    quarantined; the engine's own answer is "save again to resume"), so the same settings are saved again: a CAS
    configure that starts it with fresh notes. */
 E.action('bsd-control',(c,b)=>{if(b.dataset.thread!==c.thread.id)return true;const a=engine.snapshot(c.thread.id);
  if(b.dataset.control==='resume'&&a&&a.quarantined){const v=view(c.thread.id),values=clone(v.policy);delete values.projectId;delete values.revision;error(c,engine.configure({threadId:c.thread.id,projectId:a.projectId,expectedRevision:v.policy.revision,assignmentId:a.id,expectedEpoch:Number(b.dataset.epoch),values,identity:identity(values)}),'control');refresh();return true;}
  error(c,engine.control(b.dataset.thread,b.dataset.control,Number(b.dataset.epoch)),'control');refresh();return true;});
 /* Don't wait (8.6 catch-up line). New action, registered once; IMPACT A3-07: a new-command request,
    cmd.bsd.catch_up.release. The main work stops waiting; the advisor keeps its notes (the engine's abort). */
 E.action('bsd-catchup-release',(c,b)=>{if(b.dataset.thread!==c.thread.id)return true;const a=engine.snapshot(c.thread.id);if(!a||!a.catchUp||a.catchUp.state!=='waiting')return true;pendingFocus={phase:'app',sel:'.composer-input'};error(c,engine.endCatchup(c.thread.id,Number(b.dataset.epoch),true));refresh();return true;});
 for(const [name,type] of [['bsd-open-transcript','bsd-transcript'],['bsd-open-usage','bsd-usage']])E.action(name,(c,b)=>{const id=b.dataset.thread||c.thread.id;if(id!==c.thread.id)return true;c.openDialog({type,threadId:id});return true;});
 E.chainAction('reset-all',()=>{draft=null;lastSave=null;saveExtra.clear();fitted.clear();openFinding=null;disclosures.clear();openAside.clear();swept.clear();engine.clear();return false;});
 /* the additive policy() projections provider-permission-verify reads (B.10): model {requested, effective} and
    usage {calls, costUsd, separate, account}. calls are real AI calls (none in this preview), so their cost is 0; a
    cost that was not reported stays null in the advisor's own usage record and in costReported (never shown as $0). */
 function policyView(id){
  const v=view(id),p=clone(v.policy),idn=v.identity||{},a=v.assignment,u=a?a.usage:null,calls=u?u.providerCalls:0;
  p.model={requested:{id:idn.requestedModel,name:idn.requestedName,account:idn.requestedAccount},effective:idn.effectiveModel?{id:idn.effectiveModel,name:idn.effectiveName,account:idn.effectiveAccount}:null,available:!!idn.available,reason:idn.available?null:idn.reason,substituted:!!(idn.effectiveModel&&idn.effectiveModel!==idn.requestedModel)};
  p.usage={calls,checks:u?u.localEvaluations:0,skipped:u?u.noCalls:0,costUsd:u&&u.costUsd!=null?u.costUsd:calls?null:0,costReported:!!(u&&u.costUsd!=null),separate:true,purpose:'bsd',account:idn.effectiveAccount||idn.requestedAccount||null};
  return p;
 }
 window.PM56_BSD={engine,identity,refresh,view,dot,policy:id=>policyView(id),state:()=>statusOf(view(),'details').word,status:(where,id)=>statusOf(view(id),where||'details'),snapshot:id=>engine.snapshot(id||E.ctx().thread.id),held:()=>view().assignment?.findings.filter(f=>f.status==='held')||[],emitted:()=>view().assignment?.findings.filter(f=>f.status==='emitted')||[],lastSave:()=>lastSave?clone(lastSave):null,choices:key=>CHOICES[key]?clone(CHOICES[key]):null,foldAsides:()=>{openAside.clear();},foldRaw:()=>{for(const k of [...disclosures.keys()])if(/^bsd12-(raw|raw-usage|tx):/.test(k))disclosures.delete(k);},restore:()=>{engine.clear();refresh();}};
})();
