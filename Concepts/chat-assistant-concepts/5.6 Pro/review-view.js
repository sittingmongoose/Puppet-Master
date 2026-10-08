/* review-view.js — REVIEW-B: PM56_REVIEW.viewParts + ReviewReportVM renderer + the Review run view (spec 8.5).
 *
 * One view model and one renderer for Review (IMPACT A1-50):
 *  - reportVM(run)             the protocol adapter: a protocol run (review.protocolVersion) -> ReviewReportVM.
 *                              COLLAB's legacy adapter builds the same shape from seed / wand runs.
 *  - renderReport(vm, ctx, o)  the one renderer: "What they found" (Why / Proof / Suggested fix / You'll know
 *                              it's fixed when), the choose block (G-13), "How they agreed", "Still disagrees",
 *                              "Set aside". asideHtml(vm): snapshot, cost, the read-only promise (no Technical
 *                              details, 2026-10-07: the snapshot's hash rides on the first row as data-target-hash).
 *                              Hook classes travel in the view model as `cls`.
 *  - viewParts(run, tab, ctx)  the KIND INTERFACE view part: {title, kindWord, status, actions, plate, tabs, main,
 *                              aside, vm}. Tabs: Report (overview) · Conversation · Team · Cost.
 *  - viewDocument / evidenceDocument: the `review:{runId}` and `review-evidence:{runId}:{eid}` editor documents.
 * Presentation only: no protocol state is written here except the view's own state (tab, helper, Formatted or
 * Plain text) and the one-time pre-tick of the "to fix" set into COLLAB's selection map (8.5 counting rule).
 * Review never changes files: no action here matches the auto-fix word. */
(function(){
 'use strict';
 const E=window.PM56_EXT,C=window.PM56_COLLAB,R=window.PM56_REVIEW,S=window.PM56_SHELL;
 if(!E||!C||!R||!S||!S.pmxView)return;
 const esc=S.esc,g=(n,s)=>S.pmxGlyph(n,s||14);
 const run=id=>C.run(id);
 const T=()=>S.pmxTime;
 /* ---- view state (the run view's own; reset on reset-all) ---- */
 const VIEW=new Map();          // runId -> {tab, participant, mode}
 const SEEDED=new Set();        // runs whose "to fix" set was pre-ticked once
 const vs=id=>{let v=VIEW.get(id);if(!v){v={tab:'overview',participant:null,mode:'rich'};VIEW.set(id,v);}return v;};
 const TABS=['overview','transcript','participants','usage'];

 /* ---- words ---- */
 const SEV={critical:'Critical',major:'Major',minor:'Minor',suggestion:'Suggestion'};
 const SEV_ORDER={critical:0,major:1,minor:2,suggestion:3};
 const DISP={confirmed:'Confirmed',uncertain:'Unsure',unsure:'Unsure',rejected:'Rejected',duplicate:'Duplicate'};
 const VOTE={confirmed:'agree',duplicate:'agree',rejected:'disagree',uncertain:'unsure',unsure:'unsure'};
 const NUM=['No','One','Two','Three','Four','Five','Six','Seven','Eight'];
 const plural=(n,one,many)=>n+' '+(n===1?one:(many||one+'s'));
 const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
 const sevKey=f=>SEV[String(f.severity||'').toLowerCase()]?String(f.severity).toLowerCase():'minor';
 const isToFix=f=>f.disposition==='confirmed'&&sevKey(f)!=='suggestion';
 const isUnsure=f=>(f.disposition==='uncertain'||f.disposition==='unsure')&&sevKey(f)!=='suggestion';
 const isIdea=f=>sevKey(f)==='suggestion'&&f.disposition!=='rejected'&&f.disposition!=='duplicate';
 /* 8.5 headline counting rule */
 function countsOf(fs){
  const fix=fs.filter(isToFix),uns=fs.filter(isUnsure),ideas=fs.filter(isIdea);
  const allMinor=fix.length>0&&fix.every(f=>sevKey(f)==='minor');
  const parts=[];
  if(fix.length)parts.push(allMinor?(fix.length===1?'1 small thing to fix':fix.length+' small things to fix'):fix.length+' to fix');
  if(uns.length)parts.push(uns.length+' unsure');
  if(ideas.length)parts.push(plural(ideas.length,'idea'));
  return {toFix:fix.length,unsure:uns.length,ideas:ideas.length,allMinor,parts,headline:parts.length?parts.join(' · '):'No problems found'};
 }
 function agreeWords(votes,n,origins){
  if(!votes.length)return origins?'spotted by '+origins+' of '+n:'';
  const a=votes.filter(v=>v.vote==='agree').length,d=votes.filter(v=>v.vote==='disagree').length,u=votes.filter(v=>v.vote==='unsure').length;
  if(a===n)return 'all '+n+' agree';
  if(a)return a+' of '+n+' agree'+(d?' · someone disagreed':u?' · someone isn’t sure':'');
  if(d===n)return 'all '+n+' disagree';
  if(d)return d+' of '+n+' disagree'+(u?' · the rest aren’t sure':'');
  return 'nobody is sure'+(origins?' · spotted by '+origins+' of '+n:'');
 }
 const EXCLUDED={
  different_target_hash:['this reviewer saw an older version of the file.','different frozen pack'],
  stale_epoch:['this arrived after the review was restarted.','stale epoch'],
  run_not_running:['this arrived after the review had stopped.','run not running'],
  review_unavailable:['this arrived for a review that no longer exists.','review unavailable']};
 function shortTarget(pack){
  const l=String(pack&&(pack.label||(pack.targetRefs||[])[0])||'the work');
  const tail=l.split(' · ').pop();
  return /\.[a-z0-9]{1,5}$/i.test(tail)?tail:l;
 }
 function isCode(e){return !!e&&(e.id==='source'||/\.(m?js|ts|tsx|jsx|py|rs|go|java|css|html|rb|c|cpp|h|swift|kt)\b/i.test(String(e.label||'')));}
 function lineSpan(label){const m=/L(\d+)(?:[–-](\d+))?/.exec(String(label||''));return m?[+m[1],m[2]?+m[2]:+m[1]]:null;}
 function clockAt(iso){return iso&&T()?T().at(iso,null,{day:false}):'';}

 /* =====================================================================
    PROTOCOL ADAPTER -> ReviewReportVM
    { runId, title, status, phase, single, report, recorded, provenance, cls:{root, markdown, dissent},
      target:{label, short, takenAt, hash, hashKind, evidence[], cls},
      reviewers:[{id, name, persona, model, requested, seat, state, notes, done, outcome}],
      findings:[{id, n, claim, severity, sevWord, disposition, dispWord, votes[], agree, toFix, idea,
                 why, proof:{code, first, refs[]}, fix, expected, dissent[], todoId, selected, canTick, reason, cls}],
      excluded:[{key, text, code, cls}], agreement:{reviewers[], rows[]}|null, counts, headline,
      readOnly:{text, cls}, followOns:{selected, created, createdNs[], canCreate, canSend},
      worked, cost, duplicates, notes, markdown() }
    ===================================================================== */
 function reportVM(r){
  const v=r.review||{},a=v.report||null,parts=r.participants||[];
  const single=(r.config&&r.config.strategy==='single_agent')||parts.length<=1;
  const seatOf=pid=>{const i=parts.findIndex(p=>p.id===pid);return i<0?1:i+1;};
  const pack=(a&&a.target)||v.targetPack||{};
  const evidence=(pack.evidence||[]).map(e=>({id:e.id,label:e.label||e.id,content:e.content||'',note:e.note||''}));
  const ev=id=>evidence.find(e=>e.id===id);
  const live=id=>(v.findings||[]).find(f=>f.id===id)||{};
  const sel=C.selectedFindings(r.id);
  const src=(a?a.findings:v.findings)||[];
  const done=r.status==='completed'&&!!a;
  /* the "to fix" set starts ticked (8.5), once per run, in COLLAB's one selection map */
  if(done&&!SEEDED.has(r.id)){SEEDED.add(r.id);src.forEach(f=>{if(isToFix(f)&&!live(f.id).todoId&&(f.evidenceRefs||[]).length&&sel[f.id]===undefined)sel[f.id]=true;});}
  const ordered=src.slice().sort((x,y)=>(isToFix(y)-isToFix(x))||(isUnsure(y)-isUnsure(x))||(SEV_ORDER[sevKey(x)]-SEV_ORDER[sevKey(y)]));
  const findings=ordered.map((f,i)=>{
   const votes=(f.reviewerVotes||[]).map(x=>({seat:seatOf(x.participantId),vote:VOTE[x.disposition]||'unsure',pid:x.participantId}));
   const refs=(f.evidenceRefs||[]).map(ev).filter(Boolean);
   const code=refs.find(isCode)||null;
   const todoId=live(f.id).todoId||null;
   const canTick=done&&f.disposition==='confirmed'&&!!(f.evidenceRefs||[]).length;
   const dissent=single?[]:(f.reviewerVotes||[]).filter(x=>x.disposition!==f.disposition&&x.reason).map(x=>{const p=parts.find(p=>p.id===x.participantId);return {who:p?p.role:'A reviewer',text:x.reason};});
   return {id:f.id,n:i+1,claim:f.claim,severity:sevKey(f),sevWord:SEV[sevKey(f)],disposition:f.disposition,dispWord:DISP[f.disposition]||cap(String(f.disposition||'')),
    votes:single?[]:votes,agree:single?'':agreeWords(votes,parts.length,(f.originatingReviewerIds||[]).length),toFix:isToFix(f),idea:isIdea(f),
    why:f.adjudication||f.reason||'',proof:{code,first:code?lineSpan(code.label):null,refs},fix:f.proposedRemediation||'',expected:f.expectedOutcome||'',dissent,
    todoId,selected:!!sel[f.id]&&!todoId,canTick,reason:canTick?'':'Only confirmed findings can become To-Dos.',cls:''};
  });
  const counts=countsOf(src);
  const created=findings.filter(f=>f.todoId);
  const selected=findings.filter(f=>f.selected&&f.canTick);
  /* a note set aside for a different frozen pack: the old hash sits on the record (x.targetHash; x.payload.targetHash in
     older records), and the reason is read from the hash itself, since a record may carry its reason as a sentence */
  const primary=(pack.targetHashes||{}).primary||'';
  const excluded=(v.excludedFindings||[]).map((x,i)=>{
   const old=x.targetHash||(x.payload&&x.payload.targetHash)||'';
   const code=old&&primary&&old!==primary?'different_target_hash':x.reason;
   const w=EXCLUDED[code]||['this note didn’t match the snapshot every reviewer read.',String(x.reason||'excluded')];
   return {key:'rx-'+i,text:w[0],code:String(code||'excluded'),cls:'collab-finding collab-excluded'};});
  const reviewers=parts.map((p,i)=>{const pass=(v.passes||[]).find(x=>x.participantId===p.id)||{};
   return {id:p.id,name:p.role,persona:p.effectivePersona,model:p.effectiveModelName,requested:p.requestedModelName,seat:i+1,state:p.status,
    notes:(pass.findings||[]).length,done:pass.status==='completed',outcome:p.outcome};});
  const start=Date.parse(r.createdAt||''),end=Date.parse(r.completedAt||'');
  const prov=C.provenance?C.provenance(r.id):'recorded';
  return {runId:r.id,title:r.title,status:r.status,phase:a?'completed':v.phase,single,report:!!a,recorded:prov==='recorded',provenance:prov,
   target:{label:pack.label||((pack.targetRefs||[])[0])||'the work',short:shortTarget(pack),takenAt:pack.frozenAt||null,hash:(pack.targetHashes||{}).primary||'',hashKind:pack.hashKind||'',evidence,cls:'collab-targetpack'},
   reviewers,findings,excluded,counts,headline:counts.headline,
   agreement:single||!a?null:{reviewers,rows:findings.filter(f=>f.votes.length)},
   readOnly:{text:'Review never changes your files and never auto-repairs.',cls:'collab-readonly-note'},
   followOns:{selected:selected.length,created:created.length,createdNs:created.map(f=>f.n),canCreate:done&&selected.length>0,canSend:done&&selected.length>0},
   worked:isFinite(start)&&isFinite(end)&&end>=start?end-start:null,
   cost:r.usage||null,duplicates:(v.duplicates||[]).length,notes:(v.passes||[]).reduce((n,x)=>n+(x.findings||[]).length,0),
   markdown:a?()=>R.markdown(a):null,cls:{root:'review-document',markdown:'review-markdown',dissent:'collab-dissent'}};
 }

 /* =====================================================================
    THE RENDERER (both populations)
    ===================================================================== */
 const mark=(p,size,state)=>S.pmxMark({role:p.persona||'Reviewer',seat:p.seat,size:size||18,state:state||'idle'});
 function costText(vm){
  if(vm.recorded)return S.pmxCost({recorded:true});
  const u=vm.cost||{};if(u.not_measured)return S.pmxCost({state:'unknown'});
  return S.pmxCost({spent:u.costUsd,limit:u.limitUsd});
 }
 /* code with line numbers: each line is one row (number, then the text), and long lines wrap inside the row, so the
    numbers stay with their lines and nothing hides past the box's edge (G-26; J-2 text-edge) */
 /* mark = [l0, l1]: the cited lines (real line numbers), held together in one quiet highlighter passage with room
    above and below (J-2: text 8 px from a fill edge) and their numbers in accent */
 function codeBlock(key,content,first,max,extraCls,mark){
  const lines=String(content).split('\n'),shown=max?lines.slice(0,max):lines,cited=n=>!!(mark&&n>=mark[0]&&n<=mark[1]);
  let rows='';
  shown.forEach((l,i)=>{const n=first+i,c=cited(n);
   if(c&&!cited(n-1))rows+='<span class="pmx-rview-cited">';
   rows+='<span class="pmx-rview-line'+(c?' is-cited':'')+'" data-line="'+n+'"><span class="pmx-rview-no" aria-hidden="true">'+n+'</span><span class="pmx-rview-lt">'+(esc(l)||' ')+'</span></span>';
   if(c&&(!cited(n+1)||i===shown.length-1))rows+='</span>';});
  return '<div class="pmx-rview-code'+(extraCls?' '+extraCls:'')+'" data-k="'+esc(key)+'"><pre class="pmx-rview-pre'+(max?'':' review-source')+'">'+rows+'</pre></div>'+
   (max&&lines.length>max?'<p class="pmx-fine">'+plural(lines.length-max,'more line')+' in the snapshot</p>':'');
 }
 function proofHtml(vm,f){
  const p=f.proof;let out='';
  if(p.code){const all=String(p.code.content).split('\n'),sp=p.first&&p.first[0]>=1&&p.first[0]<=all.length?p.first:null;
   out+=sp?codeBlock('rv-code:'+f.id,all.slice(sp[0]-1,sp[1]).join('\n'),sp[0],8):codeBlock('rv-code:'+f.id,p.code.content,1,8);}
  if(p.refs.length)out+='<p class="pmx-rview-refs">'+p.refs.map(e=>'<button type="button" class="text-button pmx-rview-ref" data-action="review-open-evidence" data-run="'+esc(vm.runId)+'" data-evidence="'+esc(e.id)+'">'+g('file',13)+'<span>'+esc(e.label)+'</span></button>').join('')+'</p>';
  return out;
 }
 function tickBox(vm,f,o){
  const on=o.choose&&f.canTick&&!f.todoId;
  return {attrs:on?'data-action="collab-review-toggle-finding" data-run="'+esc(vm.runId)+'" data-finding="'+esc(f.id)+'"':'tabindex="-1"',checked:f.todoId?true:(on&&f.selected),disabled:!on};
 }
 function findingHtml(vm,f,o){
  const head=S.pmxFinding({key:'rv-fh:'+f.id,cls:'pmx-rview-fhead'+(f.cls?' '+f.cls:''),n:f.n,sev:f.severity,severity:S.pmxSeverity(f.severity),disposition:esc(f.dispWord),
   agree:f.agree?S.pmxAgree({votes:f.votes,words:esc(f.agree)}):'',claim:'<span class="pmx-rview-n">'+f.n+'</span>'+esc(f.claim),box:tickBox(vm,f,o),
   attrs:!f.canTick&&o.choose&&vm.report?'data-hover-tip="'+esc(f.reason)+'"':'',
   /* "To-Do created" in place; its Open is the one Open To-Dos below (b10 and 7.12 keep review-open-todos single) */
   todo:f.todoId?g('check',13)+'<span>To-Do created</span>':''});
  const dl=[];
  if(f.why)dl.push('<dt>Why</dt><dd>'+esc(f.why)+'</dd>');
  const pr=proofHtml(vm,f);if(pr)dl.push('<dt>Proof</dt><dd>'+pr+'</dd>');
  if(f.fix)dl.push('<dt>Suggested fix</dt><dd>'+esc(f.fix)+'</dd>');
  if(f.expected)dl.push('<dt>You’ll know it’s fixed when</dt><dd>'+esc(f.expected)+'</dd>');
  return '<article class="pmx-rview-find" data-finding="'+esc(f.id)+'" data-k="rv-f:'+esc(f.id)+'">'+head+(dl.length?'<dl class="pmx-rview-dl">'+dl.join('')+'</dl>':'')+'</article>';
 }
 function chooseHtml(vm){
  const fo=vm.followOns,rid=esc(vm.runId);
  const list=fo.createdNs.length===1?'finding '+fo.createdNs[0]:'findings '+fo.createdNs.slice(0,-1).join(', ')+' and '+fo.createdNs.slice(-1);
  const said=fo.created?'<p class="pmx-rview-made" data-k="rv-made:'+fo.created+'">'+g('check',14)+'<span>'+plural(fo.created,'To-Do')+' created from '+list+'. Nothing was fixed.</span></p>':'';
  const tickable=vm.findings.some(f=>f.canTick&&!f.todoId);
  const acts=[];
  if(tickable)acts.push('<button type="button" class="primary-button pmx-act" data-action="collab-review-create-todos" data-run="'+rid+'"'+(fo.canCreate?'':' disabled')+'>Create To-Dos ('+fo.selected+')</button>',
   '<button type="button" class="text-button pmx-act" data-action="collab-review-send-findings" data-run="'+rid+'"'+(fo.canSend?'':' disabled')+'>Send Findings To Agent</button>');
  if(fo.created)acts.push('<button type="button" class="'+(tickable?'text-button':'primary-button')+' pmx-act" data-action="review-open-todos" data-run="'+rid+'">Open To-Dos</button>');
  acts.push('<button type="button" class="text-button pmx-act" data-action="collab-review-run-again" data-run="'+rid+'">Run Another Review</button>');
  return '<div class="pmx-rview-choose" data-k="rv-choose">'+said+
   (tickable?'<p class="pmx-help">Ticked: the ones reviewers confirmed. Only ticked findings become To-Dos. Nothing is fixed for you.</p>':'')+
   '<div class="pmx-rview-acts">'+acts.join('')+'</div>'+(tickable&&!fo.selected?'<p class="pmx-reason">Tick at least one confirmed finding first.</p>':'')+
   (tickable?'<p class="pmx-fine">Send Findings To Agent puts a fix request in your message box for you to send. It never sends by itself.</p>':'')+'</div>';
 }
 function agreementHtml(vm){
  const A=vm.agreement;if(!A||!A.rows.length)return '';
  const word={agree:'agrees',disagree:'disagrees',unsure:'not sure'};
  return '<div class="pmx-rview-gridwrap"><table class="pmx-rview-grid"><thead><tr><th scope="col">Possible problem</th>'+A.reviewers.map(p=>'<th scope="col"><span class="pmx-rview-th">'+mark(p,16)+'<span>'+esc(p.name)+'</span></span></th>').join('')+'</tr></thead><tbody>'+
   A.rows.map(f=>'<tr data-k="rv-ag:'+esc(f.id)+'"><td><span class="pmx-rview-gn">'+f.n+'</span><span>'+esc(f.claim)+'</span></td>'+A.reviewers.map(p=>{const v=f.votes.find(x=>x.pid===p.id);return '<td>'+(v?S.pmxAgree({votes:[v],words:'<span class="pmx-sr">'+esc(p.name)+' '+word[v.vote]+'</span>'}):'')+'</td>';}).join('')+'</tr>').join('')+
   '</tbody></table></div><p class="pmx-fine pmx-rview-legend">Filled: agrees it’s real · ring: not sure · slash: disagrees.</p>';
 }
 function dissentHtml(vm){
  const qs=[];vm.findings.forEach(f=>f.dissent.forEach((d,i)=>qs.push(S.pmxQuote({key:'rv-q:'+f.id+':'+i,cls:vm.cls.dissent,text:esc(d.text),who:esc(d.who),note:'on finding '+f.n+', kept word for word'}))));
  return qs.join('');
 }
 function asideHtml(vm){
  const t=vm.target,at=clockAt(t.takenAt),items=[];
  items.push('<li><b>Snapshot</b> of '+esc(t.label)+(at?', taken '+esc(at):'')+'. Every reviewer read that exact version.</li>');
  items.push('<li>'+esc(costText(vm))+(vm.worked!=null&&T()?' · worked '+esc(T().worked(vm.worked)):'')+'</li>');
  items.push('<li class="'+esc(vm.readOnly.cls)+'">'+esc(vm.readOnly.text)+'</li>');
  if(vm.recorded)items.push('<li class="pmx-rview-prov">'+g('play-ring',13)+'<span>Example report: no AI was contacted.</span></li>');
  /* no Technical details (2026-10-07, Jared): the snapshot's hash rides on the first row, never in the reader's text */
  items[0]=items[0].replace('<li>','<li class="'+esc(t.cls)+'" data-target-hash="'+esc(t.hash)+'">');
  return '<ul class="pmx-rview-aside">'+items.join('')+'</ul>';
 }
 /* the report body (Report tab). o = {mode:'rich'|'markdown', choose:bool} */
 function renderReport(vm,ctx,o){
  o=Object.assign({mode:'rich',choose:true},o||{});
  if(o.mode==='markdown'&&vm.markdown)return '<pre class="'+esc(vm.cls.markdown)+' pmx-rview-plain" data-k="rv-md">'+esc(vm.markdown())+'</pre>';
  if(!vm.report)return progressHtml(vm)+setAsideHtml(vm);
  const c=vm.counts,out=[];
  const body=vm.findings.length?vm.findings.map(f=>findingHtml(vm,f,o)).join(''):'<p class="pmx-rview-none">'+g('check-circle',16)+'<span><b>No problems found.</b> Nothing was changed.</span></p>';
  out.push(S.pmxViewSection({key:'rv-found',title:'What they found',meta:esc(c.parts.join(' · ')),
   body:(vm.single?'<p class="pmx-rview-single">'+g('eye',14)+'<span><b>Single pass:</b> one reviewer, so nothing was double-checked.</span></p>':'')+body+(o.choose?chooseHtml(vm):'')}));
  const grid=agreementHtml(vm);if(grid)out.push(S.pmxViewSection({key:'rv-agree',title:'How they agreed',body:grid}));
  const q=dissentHtml(vm);if(q)out.push(S.pmxViewSection({key:'rv-dissent',title:'Still disagrees',body:q}));
  const sa=setAsideHtml(vm);if(sa)out.push(sa);
  return out.join('');
 }
 /* notes set aside (a different frozen pack, a restarted or stopped run): shown while the run is going as well as in
    the report, so a set-aside note is never invisible until the end */
 function setAsideHtml(vm){
  return vm.excluded.length?S.pmxViewSection({key:'rv-set',title:'Set aside',meta:'never mixed in',body:vm.excluded.map(x=>'<div class="'+esc(x.cls)+' pmx-rview-set" data-k="'+esc(x.key)+'" data-reason="'+esc(x.code)+'"><p><b>Set aside:</b> '+esc(x.text)+'</p></div>').join('')}):'';
 }
 /* before the report: who is reading, sealed notes, never dispositions (REV-05) */
 function progressHtml(vm){
  const ph=vm.phase,n=vm.reviewers.length,stopped=vm.status!=='running'&&vm.status!=='paused';
  const head=stopped?'This review stopped before the report. Nothing was changed.':
   ph==='corroboration'?plural(vm.notes,'note')+' became '+plural(vm.findings.length,'possible problem')+(vm.duplicates?' ('+vm.duplicates+' '+(vm.duplicates===1?'was':'were')+' the same)':'')+'. The reviewers are checking each one.':
   ph==='synthesis'?'Writing the report.':(n===1?'The reviewer is reading the snapshot.':(NUM[n]||n)+' reviewers are reading on their own; they can’t see each other’s notes yet.');
  const rows=vm.reviewers.map(p=>{
   const line=p.done?(p.notes?plural(p.notes,'note')+(ph==='independent'?' · sealed until everyone is done':''):'no notes'):vm.status==='running'?(vm.single?'reading the snapshot':'reading on their own'):'stopped';
   return '<li class="pmx-rview-who" data-k="rv-who:'+esc(p.id)+'">'+mark(p,22,p.done?'done':vm.status==='running'?'working':'idle')+'<span class="pmx-rview-whotext"><b>'+esc(p.name)+'</b><small>'+esc(line)+'</small></span>'+(p.done&&p.notes&&ph==='independent'?S.pmxSealed(p.notes):'')+'</li>';}).join('');
  return S.pmxViewSection({key:'rv-progress',title:'The report isn’t ready yet',body:'<p class="pmx-rview-lede">'+esc(head)+'</p><ul class="pmx-rview-whos">'+rows+'</ul>'});
 }

 /* =====================================================================
    COMMON TABS (Conversation · Team · Cost). COLLAB's shared renderer when it exists (8.0 G-14: viewCommon),
    else a plain fallback built from the same primitives.
    ===================================================================== */
 function common(r,tab,ctx){
  const V=window.PM56_COLLAB_VIEW,fn=C.viewCommon||(V&&V.common);
  if(typeof fn==='function'){try{const h=fn(r,tab,ctx);if(h)return typeof h==='string'?h:(h.main||'');}catch(e){}}
  return fallbackCommon(r,tab);
 }
 function whoOf(r,m){
  if(m.senderKind==='participant'){const i=r.participants.findIndex(p=>p.id===m.senderId),p=r.participants[i];return {name:p?p.role:m.senderName,mark:p?mark({persona:p.effectivePersona,seat:i+1},18):''};}
  if(m.senderKind==='user')return {name:'You',mark:S.pmxMark({role:'You',size:18})};
  return {name:'Coordinator',mark:S.pmxMark({role:'Coordinator',size:18})};
 }
 function entry(r,m){
  const w=whoOf(r,m);
  return {key:'collab-msg-'+m.id,mid:m.id,cls:'collab-msg',kind:m.senderKind==='system'?'system':'message',markHtml:w.mark,who:esc(w.name),when:esc(clockAt(m.createdAt)),bodyHtml:S.pmxMd(String(m.body||''),{mode:'full'})};
 }
 function standInOf(p){return S.pmxStandIn({requested:p.requestedModelName,effective:p.effectiveModelName,reason:'unavailable',noSubstitute:p.status==='disabled'});}
 function outcomeWord(p){return p.outcome==='completed'?'Done':p.outcome==='canceled'?'Cancelled':p.status==='working'?'Reading':p.outcome?cap(String(p.outcome).replace(/_/g,' ')):'Waiting';}
 function fallbackCommon(r,tab){
  const ms=r.messages||[];
  if(tab==='transcript')return S.pmxViewSection({key:'rv-conv',title:'Conversation',meta:plural(ms.length,'message'),body:ms.length?S.pmxTimeline({key:'rv-tl:'+r.id,entries:ms.map(m=>entry(r,m))}):'<p class="collab-empty">No messages yet.</p>'});
  if(tab==='participants'){
   const rows=r.participants.map((p,i)=>S.pmxTeamRow({key:'collab-p-'+p.id,cls:'collab-participant',kind:'review',attrs:'data-run="'+esc(r.id)+'" data-participant="'+esc(p.id)+'" data-doc="review"',
    markHtml:mark({persona:p.effectivePersona,seat:i+1},22,p.outcome==='completed'?'done':p.status==='working'?'working':'idle'),name:esc(p.role),
    standIn:standInOf(p),route:esc((p.effectiveModelName||'')+' · '+(p.effectivePersona||'')),outcome:esc(outcomeWord(p)),cost:''})).join('');
   return S.pmxViewSection({key:'rv-team',title:'Team',meta:plural(r.participants.length,'reviewer')+' · each in its own fresh session',body:'<div class="pmx-rview-team">'+rows+'</div>'});
  }
  const u=r.usage||{},prov=C.provenance?C.provenance(r.id):'recorded',lines=[];
  lines.push(prov==='recorded'?S.pmxCost({recorded:true})+'. Nothing was sent to an AI model.':u.not_measured?S.pmxCost({state:'unknown'})+'.':S.pmxCost({spent:u.costUsd})+'.');
  if(prov!=='recorded'&&!u.not_measured&&(u.inputTokens||u.outputTokens))lines.push(S.pmxTokens((u.inputTokens||0)+(u.outputTokens||0),{plain:true})+': '+S.pmxTokens(u.inputTokens||0,{plain:true})+' read, '+S.pmxTokens(u.outputTokens||0,{plain:true})+' written.');
  const s=Date.parse(r.createdAt||''),e=Date.parse(r.completedAt||'');if(isFinite(s)&&isFinite(e)&&e>=s&&T())lines.push('Worked '+T().worked(e-s)+'.');
  return S.pmxViewSection({key:'rv-cost',title:'Cost',body:'<ul class="pmx-rview-aside pmx-rview-costs">'+lines.map(l=>'<li>'+esc(l)+'</li>').join('')+'</ul>'+(prov==='recorded'?'':'<p class="pmx-fine">Tokens measure AI use, roughly ¾ of a word each.</p>')});
 }
 function participantHtml(r,pid){
  const i=r.participants.findIndex(p=>p.id===pid),p=r.participants[i];if(!p)return '';
  const own=(r.messages||[]).filter(m=>m.senderId===p.id||(m.senderKind==='user'&&(m.recipientIds||[]).includes(p.id)));
  return S.pmxParticipant({key:'rv-pv:'+p.id,kind:'review',role:esc(p.role),standIn:standInOf(p),
   headHtml:'<p class="pmx-fine pmx-rview-pvmeta">'+esc(p.effectiveModelName||'')+' · '+esc(p.effectivePersona||'')+' · its own fresh session</p>',
   messagesHtml:own.length?S.pmxTimeline({key:'rv-ptl:'+p.id,entries:own.map(m=>entry(r,m))}):'',emptyText:'Nothing from '+esc(p.role)+' yet.'});
 }

 /* =====================================================================
    viewParts (KIND INTERFACE) and the documents
    ===================================================================== */
 function statusHtml(vm,r){
  const n=vm.reviewers.length,t=vm.target,at=clockAt(t.takenAt);
  if(vm.report){
   const who=vm.single?'One reviewer read a snapshot of '+esc(t.label)+(at?' (taken at '+esc(at)+')':'')+' in a single pass.':
    (NUM[n]||n)+' reviewers read the same snapshot of '+esc(t.label)+(at?' (taken at '+esc(at)+')':'')+' on their own, then compared notes.';
   return '<b>'+esc(vm.headline)+'.</b> '+who+' <b>Nothing was changed.</b>';
  }
  const failed=(r.participants||[]).filter(p=>['failed','timed_out','unavailable'].includes(p.outcome));
  if(r.status==='running'&&failed.length)return '<b>Only '+(n-failed.length)+' of '+n+' reviewers finished.</b> This is a partial review. Retry, continue or cancel in the chat card.';
  if(r.status==='paused')return '<b>Paused</b> · Nothing was lost. Resume it from the chat card.';
  if(r.status==='canceled'||r.status==='cancelled')return '<b>Cancelled</b> · Everything so far is kept. Nothing was changed.';
  if(r.status==='failed')return '<b>Stopped</b> · '+esc(r.blockedReason||'The review couldn’t finish.')+' Nothing was changed.';
  return '<b>Running</b> · '+(vm.phase==='corroboration'?'The reviewers are comparing notes.':vm.phase==='synthesis'?'Writing the report.':vm.single?'Reading the snapshot.':'Reading on their own.')+' Your files are never changed.';
 }
 /* viewParts(run, tab, ctx, generic): with `generic` (COLLAB-VIEW's frame, collab-view.js) the kind supplies only what
    is Review's own (title, status, the format switch and Export ahead of the frame's actions, the Report tab's body,
    the aside); the common tabs, the tab strip and the participant view stay the frame's. Without it (this file's
    review: document) every part is filled in here. */
 function viewParts(r,tab,ctx,generic){
  if(!r||r.kind!=='review')return null;
  const vm=reportVM(r),st=vs(r.id),framed=!!generic;tab=TABS.includes(tab)?tab:st.tab;
  const rid=esc(r.id),msgs=(r.messages||[]).length,dattr='data-run="'+rid+'" data-doc="review"';
  const items=[{value:'overview',label:'Report'},{value:'transcript',label:'Conversation',count:msgs||''},{value:'participants',label:'Team',count:vm.reviewers.length},{value:'usage',label:'Cost'}];
  const tabs=framed?items:S.pmxTabs({key:'rv-tabs',cls:'pmx-rview-tabs',current:tab,action:'collab-panel-tab',attr:'data-tab',items:items.map(it=>Object.assign({attrs:dattr},it))});
  const md=st.mode==='markdown'&&vm.report;
  /* Formatted · Plain text: the chosen word is plain text under the indicator, the other one is the button, so one
     review-report-view control is on screen at a time (7.12; b10 clicks each by data-view) */
  const fmt=(v,label,on)=>on?'<span class="pmx-rview-fmt" aria-current="true" data-view="'+v+'">'+label+'</span>':'<button type="button" class="text-button pmx-rview-fmt" data-action="review-report-view" data-run="'+rid+'" data-view="'+v+'">'+label+'</button>';
  const own=vm.report?'<span class="pmx-rview-switch" role="group" aria-label="Report format">'+fmt('rich','Formatted',!md)+fmt('markdown','Plain text',!!md)+'</span><button type="button" class="text-button pmx-rview-export" data-action="review-export-report" data-run="'+rid+'">'+g('download',13)+'<span>Export</span></button>':'';
  let main;
  if(tab==='overview'){const D=window.PM56_REVIEW_DEMOS,guide=D&&D.editorGuide?D.editorGuide(r.id):'';main=guide+renderReport(vm,ctx,{mode:md?'markdown':'rich',choose:true});}
  else if(framed)main=undefined;
  else if(st.participant&&tab==='participants')main=participantHtml(r,st.participant)||common(r,tab,ctx);
  else main=common(r,tab,ctx);
  return {title:esc(r.title),kindWord:'Review · '+(vm.single?'Single Agent':'Multi-Pass Review'),status:statusHtml(vm,r),
   actions:framed?own+(generic.actions||''):own,plate:framed?undefined:castPlate(r),tabs,main,aside:asideHtml(vm),cls:framed?'review-document pmx-rview':undefined,vm};
 }
 /* the report's cast (2026-10-07): the same plate the Review sheet draws (PM56_COLLAB.sheet.castRun, one grammar), each
    reviewer in its run state (one that timed out is drawn failed); in the frame (collab-view) the frame draws it */
 function castPlate(r){
  const fn=C.sheet&&C.sheet.castRun;
  try{return typeof fn==='function'?fn(r,{key:'review-plate:'+r.id})||'':'';}catch(e){return '';}
 }
 function viewDocument(ctx,id){
  const r=run(id);
  if(!r||r.kind!=='review')return S.pmxView({key:'review:'+id,cls:'review-document pmx-rview',kind:'review',kindWord:'Review',title:'This review is no longer here',statusHtml:'Its chat was reset, so there is no report to show.'});
  const p=viewParts(r,null,ctx);
  return S.pmxView({key:'review:'+r.id,cls:'review-document collab-panel pmx-rview',kind:'review',kindWord:p.kindWord,title:p.title,statusHtml:p.status,actionsHtml:p.actions,plateHtml:p.plate||'',tabsHtml:p.tabs,mainHtml:p.main,asideHtml:p.aside,
   attrs:'data-review-run="'+esc(r.id)+'"'});
 }
 /* G-26: the evidence document, a pmxView without tabs; the line gutter stays put while the code scrolls */
 function evidenceDocument(ctx,id,eid){
  const r=run(id),vm=r&&r.kind==='review'?reportVM(r):null,e=vm&&vm.target.evidence.find(x=>x.id===eid);
  if(!e)return S.pmxView({key:'review-evidence:'+id+':'+eid,cls:'review-document pmx-rview',kind:'review',kindWord:'Review evidence',title:'This evidence is no longer here',statusHtml:'The snapshot it belonged to is gone.'});
  const at=clockAt(vm.target.takenAt),span=lineSpan(e.label);
  const back='<button type="button" class="text-button pmx-rview-back" data-action="review-open-report" data-run="'+esc(id)+'">'+g('chevron-left',13)+'<span>Back to the report</span></button>';
  /* the whole snapshot, numbered from its own first line; the lines the report cites (the label's L2–3) are marked */
  const total=String(e.content).split('\n').length,mark=span&&span[0]>=1&&span[0]<=total?[span[0],Math.min(span[1],total)]:null;
  const cites=mark?'<p class="pmx-help pmx-rview-note">'+(mark[0]===mark[1]?'The highlighted line '+mark[0]+' is the one':'The highlighted lines '+mark[0]+'–'+mark[1]+' are the ones')+' the report points to.</p>':'';
  const main=codeBlock('rv-src:'+eid,e.content,1,0,'pmx-rview-code--doc',mark)+(e.note?'<p class="pmx-help pmx-rview-note">'+esc(e.note)+'</p>':'')+cites;
  return S.pmxView({key:'review-evidence:'+id+':'+eid,cls:'review-document pmx-rview pmx-rview-ev',kind:'review',kindWord:'Review evidence · '+esc(r.title),title:esc(e.label),
   statusHtml:'The exact version every reviewer read'+(at?' · snapshot '+esc(at):'')+'.',actionsHtml:back,mainHtml:main,
   attrs:'data-review-run="'+esc(id)+'"'});
 }

 /* ---- hosting: the two editor documents ---- */
 const tabLabel=c=>c.editorId&&c.editorId.startsWith('review:')?'Review · '+((run(c.editorId.slice(7))||{}).title||'report'):c.editorId&&c.editorId.startsWith('review-evidence:')?'Review evidence':'';
 const docSlot=c=>{
  if(!c.editorId)return '';
  if(c.editorId.startsWith('review:'))return viewDocument(c,c.editorId.slice(7));
  if(c.editorId.startsWith('review-evidence:')){const [id,...eid]=c.editorId.slice(16).split(':');return evidenceDocument(c,id,eid.join(':'));}
  return '';
 };
 E.slot('editorTabLabel',tabLabel);
 E.slot('editorDocument',docSlot);
 /* TRANSITIONAL (REVIEW-B notes, request 1 to REVIEW-A): app.js joins every editorDocument / editorTabLabel answer,
    so the protocol's legacy document would render a second report under this one. Drop the protocol's two slot
    functions (those naming both 'review:' and 'review-evidence:' that are not ours). Inert once review-protocol.js
    no longer registers them. */
 ['editorTabLabel','editorDocument'].forEach(n=>{const a=E._slots&&E._slots[n];if(!a)return;
  for(let i=a.length-1;i>=0;i--){const f=a[i];if(f===tabLabel||f===docSlot)continue;const s=String(f);if(s.indexOf("'review-evidence:'")>=0&&s.indexOf("'review:'")>=0)a.splice(i,1);}});

 /* ---- routing and view state (chained: a later registrant runs first; returning false falls through) ---- */
 const inDoc=b=>!!(b&&b.dataset&&(b.dataset.doc==='review'||(b.closest&&b.closest('.review-document'))));
 function openDoc(c,id){if(c.closeMenu)c.closeMenu();if(c.state.dialog&&c.closeDialog)c.closeDialog();c.state.editorRevealed=true;c.openEditor('review:'+id);}
 E.chainAction('collab-open-panel',(c,b)=>{const r=run(b.dataset.run);if(!r||!R.owns(r.id))return false;openDoc(c,r.id);return true;});
 E.chainAction('collab-panel-tab',(c,b)=>{const r=run(b.dataset.run);if(!r||!R.owns(r.id)||!inDoc(b))return false;const s=vs(r.id);s.tab=TABS.includes(b.dataset.tab)?b.dataset.tab:'overview';s.participant=null;c.openEditor('review:'+r.id);return true;});
 E.chainAction('collab-open-participant',(c,b)=>{const r=run(b.dataset.run);if(!r||!R.owns(r.id))return false;const s=vs(r.id);s.tab='participants';s.participant=b.dataset.participant||null;openDoc(c,r.id);return true;});
 E.chainAction('collab-close-participant',(c,b)=>{const host=b&&b.closest&&b.closest('.review-document[data-review-run]'),id=host&&host.dataset.reviewRun;if(!id||!run(id))return false;vs(id).participant=null;c.renderApp();return true;});
 E.chainAction('review-report-view',(c,b)=>{if(b.dataset.run)vs(b.dataset.run).mode=b.dataset.view==='markdown'?'markdown':'rich';return false;});
 E.chainAction('review-open-report',(c,b)=>{if(b.dataset.run){const s=vs(b.dataset.run);s.participant=null;if(b.dataset.finding){s.tab='overview';s.mode='rich';}}return false;});
 E.chainAction('reset-all',()=>{VIEW.clear();SEEDED.clear();return false;});

 /* one adapter (A1-50): never overwrite a reportVM the protocol file already exports */
 if(typeof R.reportVM!=='function')R.reportVM=reportVM;
 Object.assign(R,{renderReport,asideHtml,viewParts,viewDocument,evidenceDocument,viewState:id=>Object.assign({},vs(id))});
})();
