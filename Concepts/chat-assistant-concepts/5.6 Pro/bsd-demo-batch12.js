/* B12 local laboratory. The primary fixture owns versioned work and measurements;
 * the BSD protocol only inspects redacted snapshots. No model calls, native
 * command success, real workspace writes, or Wizard/WorkNode execution claimed.
 */
(function(){
 'use strict';const E=window.PM56_EXT,B=window.PM56_BSD,K=window.PM56_BSD_ENGINE;if(!B||!K)return;const {clone,digest}=K;
 const projects=new Map(),timers=new Map(),disclosures=new Map();const opened=k=>disclosures.get(k)?' open':'';document.addEventListener('toggle',e=>{const d=e.target;if(d.isConnected&&d.matches?.('.bsd12-work details[data-k]'))disclosures.set(d.dataset.k,d.open);},true);document.addEventListener('click',e=>{const sm=e.target.closest?.('.bsd12-work details[data-k]>summary'),d=sm?.parentElement;if(d)disclosures.set(d.dataset.k,!d.open);},true);let serial=0;
 const flows={survives:{title:'Catch a missing measurement',detail:'The advisor spots a missing measurement, double-checks it on newer work, then tells you.'},resolves:{title:'Resolve it before it reaches you',detail:'The advisor spots a problem, a measurement settles it first, and nothing appears in your chat.'}};
 function get(id){return projects.get(id||E.ctx().thread.id);}
 function primary(g){if(!g)return null;const t=E.ctx().state.threads.find(t=>t.id===g.threadId);if(!t)return null;const cp=E.ctx().state.context.projections?.[g.threadId];return {...clone(g.primary),contextRevision:cp?String(cp.contextEpoch)+':'+(cp.compaction?.revision||0):'',historyRevision:JSON.stringify(t.messages.filter(m=>m.type==='threadops-rewind').map(m=>[m.id,m.title])),threadId:g.threadId,projectId:t?.projectId||g.projectId,worktree:t?.worktree||g.primary.worktree,primaryEpoch:g.primary.primaryEpoch};}
 function content(p){return '/* Local fixture: '+p.note+' */\nCREATE INDEX events_account_time ON events(account_id, created_at);\n\n'+(p.measurements?'-- baseline writes: '+JSON.stringify(p.measurements.before)+'\n-- candidate writes: '+JSON.stringify(p.measurements.after):'-- write amplification: not measured');}
 function updateArtifact(g){const c=E.ctx(),a=c.D.artifacts.find(a=>a.id===g.artifactId);a.version=g.primary.generation;a.content=content(g.primary);a.body=a.content;a.code=a.content;a.history=a.history||[];a.history.push({version:a.version,content:a.content});}
 function start(flow){if(!flows[flow])return;const c=E.ctx(),n=++serial,tid='bsd12-'+n,pid='concept:bsd12:'+n,artifactId='bsd12-source-'+n,base=clone(c.state.threads.find(t=>t.id==='plain')||c.state.threads[0]);
  const g={flow,threadId:tid,projectId:pid,artifactId,guide:true,sampleBefore:'[200,300,500]',sampleAfter:'[212,318,530]',delay:260,fault:'none',lastResult:null,primary:{projectId:pid,threadId:tid,runId:'local-index-'+n,workflow:'assistant',stage:'worknode_execution',status:'ready',generation:0,primaryEpoch:1,worktree:'demo/index-'+n,primaryRoute:{provider:'local',model:'deterministic-primary-fixture',account:'none'},permission:'read-only-local-demonstration',frozen:false,note:'initial proposal',measurements:null,constraints:['Measured write amplification must not exceed 8%.'],refs:{artifact:{id:artifactId,version:0},goal:null,plan:null,planUnits:[],todos:[]},redaction:{checked:true,scope:'local-fixture',receipt:'fixture-public-data-'+n},watch:[{path:'demo:/project/BSD_WATCH.md',scope:'project',text:'Check the measured write-amplification bound before accepting the covering index.'}],deltas:[]}};
  projects.set(tid,g);Object.assign(base,{id:tid,projectId:pid,title:flows[flow].title,summary:flows[flow].detail,updated:'now',unread:0,status:'idle',pinned:false,archived:false,goalId:null,worktree:g.primary.worktree,messages:[{id:tid+'-ask',role:'user',type:'text',body:'Review this covering-index proposal. Keep measured write amplification at or below 8%.'},{id:tid+'-source',role:'system',type:'bsd12-source',artifactId,threadId:tid}],bsdExample:flow});c.state.threads.push(base);c.D.artifacts.push({id:artifactId,threadId:tid,projectId:pid,title:'Covering index · evidence',name:'covering-index.sql',kind:'code',type:'code',language:'sql',version:0,status:'ready',summary:'Versioned local index and measurements.',content:content(g.primary),body:content(g.primary),readOnly:true,history:[]});
  B.engine.register(tid,()=>primary(g));Object.assign(c.state,{mode:'Ask',menu:null,dialog:null,hover:null,historyMode:'closed',decision:null});c.state.context.details=false;c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,started:false,completed:false,elapsed:0};c.switchThread(tid);openWork(c,tid);
 }
 function change(g,kind,summary,patch={}){Object.assign(g.primary,patch);g.primary.generation++;g.primary.refs.artifact.version=g.primary.generation;g.primary.deltas.push({generation:g.primary.generation,kind,summary,ref:'artifact:'+g.artifactId+'@'+g.primary.generation});updateArtifact(g);B.refresh();}
 function inspect(p){
  const m=p.measurements;let value=null;if(m){if(!Array.isArray(m.before)||!Array.isArray(m.after)||!m.before.length||m.before.length!==m.after.length||[...m.before,...m.after].some(x=>!Number.isFinite(x)||x<0)||m.before.reduce((a,b)=>a+b,0)<=0)return {failure:'failed',reason:'invalid_measurement_fixture'};const before=m.before.reduce((a,b)=>a+b,0),after=m.after.reduce((a,b)=>a+b,0);value=(after-before)/before*100;}
  if(value!=null&&value<=8)return {findings:[],tools:['file.read','test.inspect']};
  const missing=value==null;return {tools:['file.read','test.inspect'],findings:[{family:missing?'missing measured bound':'measured bound exceeded',objectRefs:[p.refs.artifact.id],ruleRef:'write-amplification-at-most-eight-percent',evidenceFingerprint:digest({index:'events_account_time',measurement:p.measurements,limit:8}),severity:missing?'concern':'critical',title:missing?'The 8% write-cost limit isn’t measured yet':'The new index adds more than 8% writes',detail:missing?'The covering index `events_account_time` has no measured write cost yet, so nothing shows it stays within your 8% limit.':'The measurements show `events_account_time` adds '+value.toFixed(1)+'% more writes, above your 8% limit.',evidence:[{artifactId:p.refs.artifact.id,version:p.generation,measurement:p.measurements,computedPercent:value,limitPercent:8}]}]};
 }
 function review(g,opts={}){
  if(!B.engine.current(g.threadId)){const r=B.engine.bind(g.threadId,B.identity(B.engine.policy(g.projectId)));if(!r.ok||!r.assignmentId){g.lastResult=r;B.refresh();return r;}}
  const before=primary(g),r=B.engine.begin(g.threadId,{trigger:opts.trigger||'constraint_divergence',material:true,expectedEpoch:B.engine.snapshot(g.threadId).epoch,...opts});g.lastResult=r;
  if(!r.ticket||r.duplicate){B.refresh();return r;}
  const ticket=r.ticket,fault=g.fault;const output=fault==='unsafe'?{findings:inspect(before).findings,tools:['file.write']}:fault==='none'?inspect(before):{failure:fault};
  const h=setTimeout(()=>{timers.delete(ticket.id);g.lastResult=B.engine.finish(ticket,output);B.refresh();},g.delay);timers.set(ticket.id,h);return r;
 }
 function act(c,b){const g=get(b.dataset.thread);if(!g||c.thread.id!==g.threadId||projectOf(c.thread)!==g.projectId)return true;const op=b.dataset.op;
  if(op==='start'&&g.primary.status==='ready'){change(g,'proposal','Covering index proposed without a write-cost measurement.',{status:'running'});review(g,{trigger:'pre_first_material_mutation'});}
  else if(op==='review'&&g.primary.status!=='ready'&&g.primary.status!=='cancelled')review(g);
  else if(op==='cancel-launch'&&g.primary.status==='ready')g.primary.status='cancelled';
  else if(op==='sample'&&g.primary.status==='running'&&!g.primary.frozen){try{const measurements={before:JSON.parse(g.sampleBefore),after:JSON.parse(g.sampleAfter)};const valid=inspect({...primary(g),measurements});if(valid.failure)throw Error('Enter matching non-negative sample arrays with a positive baseline.');change(g,'test_result','User supplied local measurement samples.',{measurements,note:'custom recorded sample inputs'});}catch(e){g.lastResult={ok:false,error:e.message};}}
  else if(op==='advance'&&g.primary.status==='running')change(g,'file_change','Documentation refined; no measurement added.',{note:'comment clarified, measurement still absent'});
  else if(op==='measure'&&g.primary.status==='running')change(g,'test_result','Measured 1060 writes against 1000 baseline writes.',{measurements:{before:[200,300,500],after:[212,318,530]},note:'measurement added'});
  else if(op==='exceed'&&g.primary.status==='running')change(g,'test_result','Measured a candidate above the permitted bound.',{measurements:{before:[200,300,500],after:[240,360,600]},note:'high-cost candidate'});
  else if(op==='finish'&&g.primary.status==='running'){const out=inspect(primary(g));if(out.failure||out.findings.length){g.lastResult={ok:false,error:'Primary check: measure within 8% before finishing.'};}else{change(g,'verification','Primary local checks passed; result completed.',{status:'completed'});g.lastResult={ok:true,primaryChecks:{measured:true,withinLimit:true},source:'primary-fixture-not-BSD'};}}
  else if(op==='compact')g.lastResult=B.engine.selfCompact(g.threadId);
  else if(op==='worktree'){c.thread.worktree='demo/changed-'+(++serial);g.primary.primaryEpoch++;B.engine.snapshot(g.threadId);}
  else if(op==='pause-primary'&&g.primary.status==='running'){g.primary.status='paused';}
  else if(op==='resume-primary'&&g.primary.status==='paused'){g.primary.status='running';}
  else if(op==='frozen'&&g.primary.status==='running'){g.primary.frozen=true;review(g,{frozen:true,trigger:'configured_stage_boundary'});}
  else if(op==='unfreeze')g.primary.frozen=false;
  else if(op==='catchup'){const a=B.engine.snapshot(g.threadId),r=B.engine.startCatchup(g.threadId,a?.epoch);g.lastResult=r;if(r.ok&&!r.duplicate){const key='catchup:'+a.id,h=setTimeout(()=>{timers.delete(key);const w=B.engine.snapshot(g.threadId);if(w&&w.catchUp&&w.catchUp.state==='waiting'&&w.epoch===a.epoch){g.lastResult=B.engine.endCatchup(g.threadId,a.epoch,false);B.refresh();}},Math.max(0,r.catchUp.deadline-Date.now()));timers.set(key,h);}}
  else if(op==='abort-catchup'){const a=B.engine.snapshot(g.threadId);g.lastResult=B.engine.endCatchup(g.threadId,a?.epoch,true);}
  c.thread.status=g.primary.status==='running'?'running':g.primary.status==='paused'?'paused':'idle';
  B.refresh();return true;
 }
 const projectOf=t=>t.projectId||'concept:pm';
 function btn(c,g,op,text,disabled=false){return '<button type="button" class="soft-button" data-action="bsd12-work" data-thread="'+c.esc(g.threadId)+'" data-op="'+op+'"'+(disabled?' disabled':'')+'>'+c.esc(text)+'</button>';}
 /* G-26: the demo workspace (editor id bsd12:<tid>) as a pmxView with three sections: The work, The advisor, Try a
    situation. It stays a demo lab, so its two native <select>s stay (the data-bsd12-field listener reads them); the
    keys bsd12-work / bsd12-launch / bsd12-lab and the class .bsd12-work are kept. Plain words; the engine's own
    record is the advisor's Details. */
 const STATUS_WORD={ready:'Ready to start',running:'Running',paused:'Paused',completed:'Finished',cancelled:'Launch cancelled'};
 const FAULTS=[['none','Check normally'],['failed','The check fails'],['timed_out','The check takes too long'],['quota_paused','The usage limit is reached'],['unavailable','Its model can’t be reached'],['unsafe','It asks for a tool it may not use']];
 const OWNERS=[['assistant','Ordinary chat work'],['prd_builder','PRD Builder (start only)'],['planning_wizard','Planning Wizard (start only)']];
 function view(c,key,title,main,status,acts){const S=window.PM56_SHELL;return S.pmxView({key,cls:'bsd12-work',kind:'bsd',kindWord:'Back Seat Driver · recorded example · no AI cost',title:c.esc(title),statusHtml:status||'',actionsHtml:acts||'',mainHtml:main});}
 function workspace(c,id){const S=window.PM56_SHELL,g=get(id);
  if(!g)return view(c,'bsd12-work:none','Example unavailable','<p class="bsd12-say">This recorded example has ended. Start it again from Demo Studio.</p>');
  if(c.thread.id!==id||projectOf(c.thread)!==g.projectId)return view(c,'bsd12-work:'+id,'Source conversation','<p class="bsd12-say">This document belongs to another conversation.</p>','','<button type="button" class="soft-button" data-action="bsd12-return" data-thread="'+c.esc(id)+'">Return to its source</button>');
  const p=primary(g),a=B.engine.snapshot(id),checking=!!a?.pending,sum=xs=>xs.reduce((x,y)=>x+y,0),measured=p.measurements?(sum(p.measurements.after)-sum(p.measurements.before))/sum(p.measurements.before)*100:null,active=p.status==='running',st=B.status('details',id);
  const work=S.pmxViewSection({key:'bsd12-sec-work',title:'The work',meta:'v'+p.generation,body:
   '<p class="bsd12-say">The assistant is proposing a covering index. Your rule: its measured write cost stays at or below 8%.</p>'+
   '<p class="bsd12-facts"><b>'+c.esc(STATUS_WORD[p.status]||p.status)+'</b> · version v'+p.generation+' · write cost '+(measured==null?'not measured':'<b>'+measured.toFixed(1)+'%</b>')+'</p>'+
   (p.status==='ready'?'<details class="bsd12-disclosure" data-k="bsd12-launch:'+c.esc(id)+'"'+opened('bsd12-launch:'+id)+'><summary>'+chev()+'<span>Which workflow it belongs to</span></summary><p class="bsd12-fine">A preview of starting and cancelling only, not the PRD Builder or Planning Wizard themselves.</p><label class="bsd12-field"><span>Owning workflow</span><select data-bsd12-field="workflow" data-thread="'+c.esc(id)+'">'+OWNERS.map(([v,l])=>'<option value="'+v+'"'+(p.workflow===v?' selected':'')+'>'+c.esc(l)+'</option>').join('')+'</select></label><div class="bsd12-acts">'+btn(c,g,'cancel-launch','Cancel launch')+'</div></details>':'')+
   '<div class="bsd12-acts">'+(p.status==='cancelled'?'<p class="bsd12-say">Launch cancelled. No advisor, check or usage was created.</p>':p.status==='ready'?btn(c,g,'start','Start the work'):
    btn(c,g,'review',checking?'Checking…':'Ask the advisor to check',checking||a?.paused||a?.state==='off')+btn(c,g,'advance','Continue without measuring',!active||p.frozen)+btn(c,g,'measure','Record a measurement',!active||p.frozen)+btn(c,g,'finish','Finish the work',!active||p.frozen))+'</div>'+
   (g.lastResult&&!g.lastResult.ok&&g.lastResult.error?'<p class="bsd12-note" role="status" data-failure="'+c.esc(g.lastResult.error)+'">'+c.esc(demoError(g.lastResult.error))+'</p>':'')+
   (p.status==='completed'?'<p class="bsd12-note">The main work’s own checks passed: measured '+measured.toFixed(1)+'%, within 8%. Back Seat Driver didn’t approve or finish anything.</p>':'')+
   '<p class="bsd12-sub">What it’s working on</p><pre class="bsd12-source-code">'+c.esc(content(p))+'</pre><div class="bsd12-acts"><button type="button" class="text-button" data-action="open-artifact" data-id="'+c.esc(g.artifactId)+'">Open the file</button></div>'});
  const held=a?a.findings.filter(f=>f.status==='held').length:0,shown=a?a.findings.filter(f=>f.status==='emitted').length:0,gone=a?a.findings.filter(f=>f.status==='cleared').length:0;
  const adv=S.pmxViewSection({key:'bsd12-sec-advisor',title:'The advisor',body:
   '<p class="bsd12-say">'+st.html+'</p>'+
   '<p class="bsd12-fine">'+(a?B.readLine(a.cursor,p.generation)+' · '+held+' double-checking · '+shown+' shown in the chat · '+gone+' resolved quietly':'Not started. Setting it up alone starts nothing.')+(a&&a.catchUp&&a.catchUp.state==='waiting'?' · the finish waits up to '+a.catchUp.budgetSeconds+' s':'')+'</p>'+
   '<div class="bsd12-acts"><button type="button" class="soft-button" data-action="bsd-configure-stages" data-thread="'+c.esc(id)+'">Configure</button><button type="button" class="soft-button" data-action="bsd-open-details" data-thread="'+c.esc(id)+'">Open its Details</button></div>'});
  const lab=S.pmxViewSection({key:'bsd12-sec-lab',title:'Try a situation',body:
   '<details class="bsd12-disclosure" data-k="bsd12-lab:'+c.esc(id)+'"'+opened('bsd12-lab:'+id)+'><summary>'+chev()+'<span>Show the situations</span></summary><p class="bsd12-fine">Made-up inputs for this example. Nothing contacts an AI.</p>'+
   '<div class="bsd12-grid"><label class="bsd12-field"><span>Writes before (a list)</span><input data-bsd12-field="sampleBefore" data-thread="'+c.esc(id)+'" value="'+c.esc(g.sampleBefore)+'"></label><label class="bsd12-field"><span>Writes after (a list)</span><input data-bsd12-field="sampleAfter" data-thread="'+c.esc(id)+'" value="'+c.esc(g.sampleAfter)+'"></label></div>'+
   '<div class="bsd12-acts">'+btn(c,g,'sample','Use these numbers',!active||p.frozen)+'</div>'+
   '<div class="bsd12-grid"><label class="bsd12-field"><span>How long a check takes (ms)</span><input type="number" min="0" max="10000" data-bsd12-field="delay" data-thread="'+c.esc(id)+'" value="'+g.delay+'"></label><label class="bsd12-field"><span>What the next check does</span><select data-bsd12-field="fault" data-thread="'+c.esc(id)+'">'+FAULTS.map(([v,l])=>'<option value="'+v+'"'+(g.fault===v?' selected':'')+'>'+c.esc(l)+'</option>').join('')+'</select></label></div>'+
   '<div class="bsd12-acts">'+btn(c,g,'compact','Tidy the advisor’s notes',!a)+btn(c,g,'worktree','Switch the work folder',p.status==='ready')+btn(c,g,'exceed','Measure a version over the limit',!active||p.frozen)+btn(c,g,'pause-primary','Pause the main work',!active)+btn(c,g,'resume-primary','Resume the main work',p.status!=='paused')+btn(c,g,'frozen','Check at a pause point',!active||checking)+btn(c,g,'unfreeze','Leave the pause point',!p.frozen)+btn(c,g,'catchup','Finish and wait for the advisor',p.status!=='completed'&&!p.frozen)+btn(c,g,'abort-catchup','Don’t wait',a?.catchUp?.state!=='waiting')+'</div></details>'});
  return view(c,'bsd12-work:'+id,flows[g.flow].title,work+adv+lab,c.esc(flows[g.flow].detail));
 }
 /* the demo's own refusals in plain words (the engine codes stay in its record) */
 const DEMO_ERR={invalid_request:'That can’t be done at this point of the example.',already_in_state:'That already happened.',catch_up_not_expired:'The wait hasn’t run out yet.',stale_epoch:'The advisor restarted; try again.',bsd_assignment_not_found:'The advisor hasn’t started yet.',advisor_model_unavailable:'The advisor’s model isn’t available.',mode_off_no_assignment:'Back Seat Driver is off for this work.',policy_denied:'That input isn’t allowed in this example.'};
 const demoError=e=>DEMO_ERR[e]||DEMO_ERR.invalid_request;  /* an unmapped code reads as the plain sentence; the code stays in data-failure */
 const chev=()=>window.PM56_SHELL.pmxGlyph('chevron-right',14,'bsd12-chev');
 /* G-25: the guide above the composer is the one recorded-example look (pmxGuide), key and class kept */
 /* closing review: the "resolves" guide follows the example step by step and ends on its result, because the result
    is that nothing shows in the chat, which alone reads as nothing happened */
 function guideStep(g){
  if(g.flow==='survives')return 'Start the work, carry on without measuring, then ask the advisor for another look.';
  const first='Start the work, record a measurement, then ask the advisor for another look.';
  const a=B.engine.snapshot(g.threadId),fs=a?a.findings:[],p=g.primary;
  if(p.status==='ready'||p.status==='cancelled')return first;
  if(fs.some(f=>f.status==='cleared'))return 'Resolved before it reached you: the measurement settled it, so nothing was shown in the chat. Open its Details to see why.';
  const held=fs.some(f=>f.status==='held');
  if(held&&!p.measurements)return 'The advisor found something and is double-checking it before telling you. Now record a measurement.';
  if(held)return 'Measurement recorded. Now ask the advisor for another look.';
  return first;
 }
 function guide(c){const g=get(c.thread.id);if(!g||!g.guide)return '';const t=c.esc(g.threadId);return window.PM56_SHELL.pmxGuide({key:'bsd12-guide:'+g.threadId,cls:'bsd12-guide',placement:'dock',
  step:guideStep(g),
  actions:[{action:'bsd12-open-work',attrs:'data-thread="'+t+'"',label:'Work and evidence'}],close:{action:'bsd12-close-guide',attrs:'data-thread="'+t+'"',label:'Close guide'}});}
 E.action('bsd12-start',(c,b)=>{start(b.dataset.flow);return true;});E.action('bsd12-work',act);
  /* one editor tab for the recorded example: opening a run's work reuses the tab an earlier run opened (in its place),
    so running the example again never piles up identical tabs (review cycle 1) */
 function openWork(c,id){const tabs=c.state.editorTabs,key='bsd12:'+id,i=tabs.findIndex(t=>String(t).startsWith('bsd12:')&&t!==key);if(i>=0&&!tabs.includes(key)){tabs[i]=key;c.state.editorTabs=tabs.filter((t,j)=>j<=i||!String(t).startsWith('bsd12:'));}c.openEditor(key);}
 E.action('bsd12-open-work',(c,b)=>{if(c.thread.id===b.dataset.thread)openWork(c,b.dataset.thread);return true;});
 E.action('bsd12-return',(c,b)=>{if(get(b.dataset.thread)){c.switchThread(b.dataset.thread);openWork(c,b.dataset.thread);}return true;});
 E.action('bsd12-close-guide',(c,b)=>{const g=get(b.dataset.thread);if(g&&g.threadId===c.thread.id)g.guide=false;c.renderApp();return true;});
 document.addEventListener('input',e=>{const el=e.target,g=get(el.dataset?.thread);if(!g||E.ctx().thread.id!==g.threadId)return;if(el.dataset.bsd12Field==='delay'){const n=Number(el.value);if(Number.isFinite(n)&&n>=0&&n<=10000)g.delay=n;}if(el.dataset.bsd12Field==='fault')g.fault=el.value;if(['sampleBefore','sampleAfter'].includes(el.dataset.bsd12Field))g[el.dataset.bsd12Field]=el.value;if(el.dataset.bsd12Field==='workflow'&&g.primary.status==='ready'&&['assistant','prd_builder','planning_wizard'].includes(el.value)){g.primary.workflow=el.value;g.primary.stage=el.value==='assistant'?'worknode_execution':el.value;B.refresh();}});
 E.slot('composerBelow',guide);E.slot('editorTabLabel',c=>{if(!c.editorId?.startsWith('bsd12:'))return '';const g=get(c.editorId.slice(6));return g&&flows[g.flow]?flows[g.flow].title:'Recorded example';});E.slot('editorDocument',c=>c.editorId?.startsWith('bsd12:')?workspace(c,c.editorId.slice(6)):'');
 /* the example's source in the chat: one ledger line (pmxLedgerLine, IMPACT A2-14), the file and a way to the work */
 E.slot('transcriptMessage',c=>{if(c.m?.type!=='bsd12-source')return '';const S=window.PM56_SHELL,t=c.esc(c.m.threadId);
  return S.pmxLedgerLine({key:c.m.id,cls:'bsd12-source',attrs:'data-message-id="'+c.esc(c.m.id)+'"',markHtml:S.pmxGlyph('file',16),kindWord:'Recorded example',title:'Covering index',
   headline:'Covering index<span class="bsd12-src-more"> · the work the advisor reads</span>',actions:[{action:'bsd12-open-work',attrs:'data-thread="'+t+'"',label:'Work and evidence'}]});});
 E.chainAction('reset-all',()=>{for(const h of timers.values())clearTimeout(h);timers.clear();projects.clear();disclosures.clear();return false;});
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Back Seat Driver · complete local workflows</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="bsd12-start" data-flow="'+id+'"><strong>'+c.esc(f.title)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+old(c);
 E.chainAction('repair-demo',(c,b)=>{if(b.dataset.scenario==='bsd-held'){start('resolves');return true;}return false;});
 E.chainAction('demo-trigger',(c,b)=>{if((b.dataset.trigger||'').startsWith('BSD ')){start(b.dataset.trigger==='BSD intervention'?'survives':'resolves');return true;}return false;});
 /* harness helpers (demo only): still() stops the example's own timers so a waiting state holds still while it is
    looked at; fault() sets what the next check does (the lab's select) */
 window.PM56_BSD_DEMOS={start,snapshot:id=>clone(get(id)),inspect,review:id=>review(get(id)),primary:id=>primary(get(id)),count:()=>projects.size,
  still:()=>{for(const h of timers.values())clearTimeout(h);timers.clear();},fault:(id,f)=>{const g=get(id);if(g&&FAULTS.some(([v])=>v===f))g.fault=f;return !!g;}};
})();
