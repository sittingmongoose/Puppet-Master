/* B11. One resolver over the existing Assistant ELI5 preference store.
 * Session-only concept preferences; no native Settings, persistence or provider claims.
 * Changes affect future request snapshots, not historical answers or work products.
 *
 * PREFS (DESIGN-SPEC 8.13, 7.11): the ELI5 sheet is a compact pmx sheet (720 x 560). Its plate
 * shows the two voices, Standard and Simple, answering the same question over one shared code line
 * that never moves; "Follow my usual setting" deletes this chat's override; "How it's decided"
 * (details[data-k="eli5-defaults"]) traces All chats -> Project default -> This chat with the
 * deciding node lit. In the chat, a reply written simply carries a "Simple explanation" tick in its
 * meta row, and a divider marks the turn where the style changes. ELI5 is not a Persona and not a
 * mode: nothing here touches code, Plans, artifacts or message bodies.
 * Commands (8.15): Standard / Simple / Follow send cmd.chat.eli5.set {on | off | inherit}; the All
 * chats node is a Settings transaction (general.interaction.eli5-default); the project node (Project default,
 * owner answer E-11) has no Settings wiring in this concept; the wand row only opens the sheet (no command). */
(function(){
 'use strict';
 const E=window.PM56_EXT,RT=window.PM56_RUNTIME,has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const copy=x=>JSON.parse(JSON.stringify(x));
 function state(){const f=RT.features.eli5;f.perThread=f.perThread||{};f.projectDefaults=f.projectDefaults||{};return f;}
 function thread(id){return E.ctx().state.threads.find(t=>t.id===id)||null;}
 function project(t){return String(t.projectId||t.project_id||'concept:default-project');}
 function valid(v){return v===true||v===false||v===null;}
 function resolve(id){
  const t=thread(id);if(!t)return {ok:false,error:'unknown_thread'};
  const s=state(),pid=project(t),override=has(s.perThread,id)?s.perThread[id]:null;
  const pd=has(s.projectDefaults,pid)?s.projectDefaults[pid]:null;
  const app=s.appDefault===true, inherited=pd===null?app:pd;
  return {ok:true,threadId:id,projectId:pid,override,projectDefault:pd,appDefault:app,
   inherited,effective:override===null?inherited:override,
   source:override!==null?'conversation':pd!==null?'project':'application',persistence:'session_only'};
 }
 function setThread(id,value){if(!valid(value))return {ok:false,error:'invalid_value'};if(!thread(id))return {ok:false,error:'unknown_thread'};const s=state();if(value===null)delete s.perThread[id];else s.perThread[id]=value;return resolve(id);}
 function setProject(pid,value){if(!pid||!valid(value))return {ok:false,error:'invalid_value'};if(!E.ctx().state.threads.some(t=>project(t)===pid))return {ok:false,error:'unknown_project'};const s=state();if(value===null)delete s.projectDefaults[pid];else s.projectDefaults[pid]=value;return {ok:true};}
 function setApplication(value){if(typeof value!=='boolean')return {ok:false,error:'invalid_value'};state().appDefault=value;return {ok:true};}
 function open(c){const r=resolve(c.thread.id);c.closeMenu();c.openDialog({type:'eli5-style',threadId:r.threadId,projectId:r.projectId});}

 /* ------------------------------------------------------------------ copy (9.2, E.13; {simple, expert} per 9.0.9:
    this wave ships the simple strings, expert falls back to them) */
 const SHEET={title:'Explain things simply in this chat?',lead:'Answers use everyday words and explain terms as they go. Your code, plans and files never change.'};
 const CODE='const q = query.trim().toLowerCase();';
 /* The two voices answer the same question. `code` spans stay one unit when the words re-set (never split a word). */
 const VOICES=[
  {value:'off',word:'Standard',say:'Trim the query before matching; the filter compares untrimmed input.'},
  {value:'on',word:'Simple',say:'The search box keeps the spaces you typed, so `\' alpha \'` never matches `\'alpha\'`. Trimming (cutting off spaces) fixes it.'}
 ];
 const valueWord=v=>v?'Simple':'Standard';
 const onOff=v=>v?'On':'Off';
 function usualNote(r){return '('+onOff(r.inherited)+', set for '+(r.projectDefault===null?'all chats':'this project')+')';}
 /* One option catalog per level (IMPACT A3-01): the trace triggers and PM56_PMX.pick read these, nothing else. */
 const CATALOG={
  application:[
   {value:'off',label:'Off',description:'Chats use the usual technical wording, unless a chat picks its own.'},
   {value:'on',label:'On',description:'Chats explain things simply, unless a chat picks its own.'}],
  project:[
   {value:'inherit',label:'Follow all chats',description:'Chats in this project use the All chats setting.'},
   {value:'on',label:'On',description:'Chats in this project explain things simply.'},
   {value:'off',label:'Off',description:'Chats in this project use the usual technical wording.'}]
 };
 const MENU_TITLE={application:'All chats',project:'Project default'};
 /* A1-53: the one Technical details line (fine print; the full sentence is its hover text) */
 const TECH='Technical details · cmd.chat.eli5.set (on, off, inherit) · All chats: general.interaction.eli5-default';
 const TECH_TIP='Standard, Simple and Follow my usual setting send cmd.chat.eli5.set with on, off or inherit (inherit removes this chat’s own choice). All chats is a Settings change to general.interaction.eli5-default. Project default has no Settings key yet in this concept. The wand row and Done send no command.';

 /* ------------------------------------------------------------------ wand row (the assist group) */
 function kindMark(c,size){const S=window.PM56_SHELL;return S&&S.pmxKindMark?S.pmxKindMark('eli5',size):c.icon('chat',size);}
 function wand(c){
  const r=resolve(c.thread.id),now=onOff(r.effective)+(r.source==='conversation'?' · this chat':'');
  /* the .menu-copy span becomes the row's hover text (delivery-polish); the state stays visible in .shortcut */
  return '<button class="menu-item af-wand-row" data-action="eli5-open"><span class="menu-icon">'+kindMark(c,13)+'</span><span class="menu-copy"><strong>ELI5 · Explain simply</strong><span>Answers use everyday words and explain terms. Your code and files never change.</span></span><span class="shortcut">'+c.esc(now)+'</span></button>';
 }

 /* ------------------------------------------------------------------ the sheet */
 function units(text){return String(text).split(/\s+(?=(?:[^`]*`[^`]*`)*[^`]*$)/).filter(Boolean);}
 function unitHtml(c,u){return u.split(/(`[^`]*`)/).map(p=>p.charAt(0)==='`'&&p.length>1?'<code>'+c.esc(p.slice(1,-1))+'</code>':c.esc(p)).join('');}
 /* One answer column. After a choice the chosen answer re-sets once: its words are new keyed nodes that fade in
    in reading order (the step is --pmx-t-eli5-char per character, the whole capped at --pmx-t-eli5-reset); words
    stay display:inline, so no word is ever split across elements. */
 /* the words of one answer as whole-word inline spans, with what the re-set needs: nw words, cw characters a word */
 function words(c,text){
  const list=units(text),chars=list.reduce((n,u)=>n+u.replace(/`/g,'').length+1,0);
  return {html:list.map((u,i)=>'<span class="pmx-eli5-w" style="--i:'+i+'">'+unitHtml(c,u)+'</span>').join(' '),
   reset:'--nw:'+list.length+';--cw:'+(Math.round(chars/Math.max(1,list.length)*10)/10)};
 }
 function say(c,v,eff,reset,attrs){
  const on=(v.value==='on')===eff,re=!!(reset&&reset.value===v.value),w=words(c,v.say);
  return '<div class="pmx-eli5-say" data-k="eli5-say:'+v.value+(re?':'+reset.n:'')+'" data-action="eli5-set" data-value="'+v.value+'" data-on="'+(on?1:0)+'"'+
   (re?' data-reset="1" style="'+w.reset+'"':'')+attrs+'>'+w.html+'</div>';
 }
 /* New chat defaults (assistant-features.js, 8.14) shows the same two voices as a two-line specimen: shorter answers
    to the same question, so both fit its narrow column */
 const SPECIMEN={off:{word:'Standard answer',say:'Trim the query first; the filter compares untrimmed input.'},
  on:{word:'Simple answer',say:'The search kept your extra spaces. Trimming them fixes it.'}};
 function specimen(c,on){const v=SPECIMEN[on?'on':'off'],w=words(c,v.say);return {word:v.word,html:w.html,reset:w.reset};}
 /* pulse: {from, n} while the sheet shows the Follow pulse; each link the pulse crosses carries one keyed flow
    child that lights left to right in turn (it runs on the link line, beside the labels, never across them) */
 function traceNode(c,S,r,scope,tid,pulse){
  const lit=r.source===scope,i=NODE_INDEX[scope];
  const flow=pulse&&i>=pulse.from&&i<2?'<i class="pmx-eli5-flow" data-k="eli5-flow:'+pulse.n+':'+i+'" style="--pmx-eli5-step:'+(i-pulse.from)+'"></i>':'';
  const head='<p class="pmx-eli5-node-head"><i class="pmx-eli5-dot" aria-hidden="true"></i><span>'+(scope==='application'?'All chats':scope==='project'?'Project default':'This chat')+'</span>'+(scope!=='conversation'?'<i class="pmx-eli5-link" aria-hidden="true">'+flow+'</i>':'')+'</p>';
  let body;
  if(scope==='application')body=S.pickerButton({action:'eli5-pick-scope',anchor:'eli5-scope-application',strong:onOff(r.appDefault),small:'Explain Terms Everywhere',extra:'data-scope="application" data-thread="'+tid+'"'});
  else if(scope==='project')body=S.pickerButton({action:'eli5-pick-scope',anchor:'eli5-scope-project',strong:r.projectDefault===null?'Follow all chats':onOff(r.projectDefault),small:'Chats in this project',extra:'data-scope="project" data-thread="'+tid+'"'});
  else body='<p class="pmx-eli5-node-val"><b>'+valueWord(r.effective)+'</b><span>'+(r.source==='conversation'?'chosen here':r.source==='project'?'follows the project default':'follows all chats')+'</span></p>';
  return '<div class="pmx-eli5-node" data-k="eli5-node:'+scope+'" data-on="'+(lit?1:0)+'">'+head+body+'</div>';
 }
 const NODE_INDEX={application:0,project:1,conversation:2};
 function sheetBody(c,d,r){
  const S=window.PM56_SHELL,tid=c.esc(r.threadId),eff=!!r.effective;
  const attrs=' data-scope="conversation" data-thread="'+tid+'"';
  const sw=S.pmxSwitch({key:'eli5-voice',cls:'pmx-eli5-switch',label:'How answers are explained in this chat',current:eff?'on':'off',action:'eli5-set',affects:'voice',
   /* the chosen voice takes focus as the sheet opens (quietly: the foundation lights nothing for it) */
   options:VOICES.map(v=>({value:v.value,label:v.word,attrs:attrs+(v.value===(eff?'on':'off')?' data-pmx-autofocus':'')}))});
  const plate='<figure class="pmx-plate pmx-eli5-plate" data-k="eli5-voices" style="--pmx-plate-h:auto">'+sw+
   '<div class="pmx-eli5-says">'+VOICES.map(v=>say(c,v,eff,d.eli5Reset,attrs)).join('')+'</div>'+
   '<div class="pmx-eli5-code"><code>'+c.esc(CODE)+'</code><span class="pmx-eli5-same">'+S.pmxGlyph('lock',13)+'<span>Same code either way</span></span></div></figure>';
  const follow=S.pmxWords({key:'eli5-follow',cls:'pmx-eli5-follow',action:'eli5-set',label:'This chat',
   items:[{value:'inherit',on:r.override===null,label:'<span class="pmx-eli5-follow-say">Follow my usual setting</span> <span class="pmx-eli5-usual">'+c.esc(usualNote(r))+'</span>',attrs:attrs}]});
  const p=d.eli5Pulse||null;
  /* open unless the reader folded it (state.dialog.defaultsOpen), so the trace uses the sheet's fixed height */
  const how='<details class="pmx-eli5-how eli5-defaults" data-k="eli5-defaults"'+(d.defaultsOpen!==false?' open':'')+'>'+
   '<summary class="pmx-eli5-how-sum"><span>How it’s decided</span>'+S.pmxGlyph('chevron-right',13)+'</summary>'+
   '<div class="pmx-eli5-trace" data-src="'+r.source+'">'+traceNode(c,S,r,'application',tid,p)+traceNode(c,S,r,'project',tid,p)+traceNode(c,S,r,'conversation',tid,p)+'</div>'+
   '<p class="pmx-fine pmx-eli5-fine">All chats is the Explain Terms Everywhere setting.</p>'+
   '<p class="pmx-fine pmx-eli5-fine pmx-eli5-tech" data-hover-key="eli5-tech" data-hover-tip="'+c.esc(TECH_TIP)+'">'+c.esc(TECH).replace(' · All chats:','<span class="pmx-eli5-tech-more"> · All chats:')+'</span></p></details>';
  return '<div class="pmx-eli5" data-k="eli5-body">'+plate+'<div class="pmx-eli5-under">'+follow+how+'</div></div>';
 }
 function streamingNow(c){return !!(c.thread&&c.thread.messages.some(m=>m.streaming));}
 function sheetFoot(c,stale){
  const S=window.PM56_SHELL;
  const rb=stale?'':S.pmxReadback({key:'pmx-readback',parts:[{html:'<b>Takes effect from your next message.</b> ',part:'voice'},{html:streamingNow(c)?'This answer keeps its current style.':'Answers already here keep their wording.'}]});
  const foot=S.pmxFoot({cls:'pmx-eli5-foot',readback:rb,estimate:S.pmxEstimate({text:'Demo: resets when you reload.'}),primary:{action:'close-dialog',label:'Done'}});
  /* ELI5 applies each choice at once, so a Cancel would undo nothing: the sheet has one primary, Done
     (FOUNDATION REQUEST: pmxFoot({cancel:false}); the reference build's pmxFoot omits Cancel when none is given) */
  return foot.replace(/<button type="button" class="soft-button pmx-cancel"[^>]*>[\s\S]*?<\/button>/,'');
 }
 function dialog(c){
  const d=c.state.dialog;if(d?.type!=='eli5-style')return '';
  const S=window.PM56_SHELL,r=resolve(d.threadId),stale=!r.ok||r.threadId!==c.thread.id||r.projectId!==d.projectId;
  const base={type:'eli5-style',kind:'eli5',size:'compact',height:560,cls:'pmx-eli5-sheet',title:SHEET.title,lead:SHEET.lead,closeAction:'close-dialog',ariaLabel:'ELI5: explain things simply in this chat'};
  if(stale)return S.pmxSheet(Object.assign(base,{state:'confirm',body:S.pmxConfirm({key:'eli5-stale',markHtml:S.pmxGlyph('warn',22),headline:'You switched chats',text:'Open this again from the chat you want to change.'}),foot:sheetFoot(c,true)}));
  return S.pmxSheet(Object.assign(base,{body:sheetBody(c,d,r),foot:sheetFoot(c,false)}));
 }

 /* ------------------------------------------------------------------ actions */
 let seq=0;
 function guard(c,d,tid){return d?.type==='eli5-style'&&d.threadId===c.thread.id&&tid===d.threadId&&project(c.thread)===d.projectId;}
 /* A choice re-sets the chosen voice's words once; "Follow my usual setting" also sends one light pulse along the
    trace, from the node that now decides to This chat. Both live in state.dialog, so a reopened sheet never
    replays them. */
 function afterChoice(d,before,after,scope,value){
  if(scope==='conversation'&&value!==null){d.eli5Reset={value:value?'on':'off',n:++seq};return;}
  if(after.effective!==before.effective)d.eli5Reset={value:after.effective?'on':'off',n:++seq};
  if(scope==='conversation'&&value===null)d.eli5Pulse={from:NODE_INDEX[after.source]||0,n:++seq};
 }
 function apply(c,d,scope,value){
  const before=resolve(d.threadId);
  if(scope==='conversation')setThread(d.threadId,value);
  else if(scope==='project')setProject(d.projectId,value);
  else if(scope==='application'){if(value===null)return;setApplication(value);}
  else return;
  afterChoice(d,before,resolve(d.threadId),scope,value);
  c.renderApp();
 }
 const parse=v=>v==='inherit'?null:v==='on';
 E.action('eli5-open',c=>{open(c);return true;});
 E.action('eli5-set',(c,b)=>{
  const d=c.state.dialog;if(!guard(c,d,b.dataset.thread))return true;
  if(!['inherit','on','off'].includes(b.dataset.value))return true;
  apply(c,d,b.dataset.scope,parse(b.dataset.value));
  return true;
 });
 /* G-21 / IMPACT A3-07: registered once here, classified as a Settings transaction (the All chats node is
    general.interaction.eli5-default; the project node, Project default, has no Settings key yet). Its choice runs
    the same guarded path as eli5-set. */
 E.action('eli5-pick-scope',(c,b)=>{
  const d=c.state.dialog,scope=b.dataset.scope;if(!guard(c,d,b.dataset.thread)||!CATALOG[scope])return true;
  const r=resolve(d.threadId);
  const current=scope==='application'?(r.appDefault?'on':'off'):(r.projectDefault===null?'inherit':r.projectDefault?'on':'off');
  const tid=d.threadId;
  const onChange=v=>{const c2=E.ctx(),d2=c2.state.dialog;if(!guard(c2,d2,tid))return;if(!['inherit','on','off'].includes(v))return;apply(c2,d2,scope,parse(v));};
  if(window.PM56_PMX&&window.PM56_PMX.pick)window.PM56_PMX.pick(b,{title:MENU_TITLE[scope],current,options:CATALOG[scope],onChange});
  else window.PM56_PICKERS?.openChoice(b,MENU_TITLE[scope],current,CATALOG[scope],onChange);
  return true;
 });
 /* 6.7 / IMPACT A1-36: after the ELI5 sheet closes, focus goes to the wand trigger (a settings-style sheet). Done
    leaves with the save exit, the x, Escape and the scrim with the cancel exit. */
 E.chainAction('close-dialog',(c,b)=>{
  if(c.state.dialog?.type==='eli5-style'&&window.PM56_PMX?.exitHint){
   const done=!!(b&&b.classList&&b.classList.contains('pmx-primary'));
   window.PM56_PMX.exitHint(done?'save':'cancel',{focus:'.composer [data-menu-anchor="wand"], [data-action="open-menu"][data-menu="wand"]'});
  }
  return false;
 });
 document.addEventListener('toggle',event=>{const c=E.ctx();if(event.target.isConnected&&event.target.matches?.('.eli5-defaults,[data-k="eli5-defaults"]')&&c.state.dialog?.type==='eli5-style')c.state.dialog.defaultsOpen=event.target.open;},true);
 E.slot('dialog',dialog);
 E.chainAction('demo-trigger',(c,b)=>{if(b.dataset.trigger==='ELI5 receipt'){window.PM56_ELI5_DEMOS?.start('override');return true;}return false;});

 /* ------------------------------------------------------------------ in the chat (7.11) */
 /* Replies written simply carry a quiet "Simple explanation" tick in their meta row (hover-gated like the rest
    of the row). The change point is visible at rest: a divider on the first turn whose captured preference
    differs from the one before it. It is derived from the message snapshots at render time, so there is no
    extra record, and 80 turns with two flips show exactly two dividers. Earlier turns without a snapshot were
    written the usual way; a chat whose first turn is already simple shows no divider. */
 const snapped=m=>!!(m&&m.explanationPreference&&typeof m.explanationPreference==='object'&&(m.type==='text'||m.type==='eli5-example-answer'));
 const talk=m=>!!(m&&(m.role==='user'||m.role==='assistant')&&(m.type==='text'||m.type==='eli5-example-answer'));
 /* one walk per thread per change of its message list (a snapshot is written once, when its message is made) */
 const cpMemo=new WeakMap();
 function changePoints(t){
  if(!t)return {};
  const msgs=t.messages||[],last=msgs[msgs.length-1],key=msgs.length+':'+(last?last.id:'');
  const hit=cpMemo.get(msgs);if(hit&&hit.key===key)return hit.map;
  const map={};let prev=null,seen=false;
  for(const m of msgs){
   if(m.internalOnly)continue;
   if(snapped(m)){const eff=!!m.explanationPreference.effective;if(prev===null&&seen)prev=false;if(prev!==null&&eff!==prev)map[m.id]=eff;prev=eff;}
   else if(talk(m))seen=true;
  }
  cpMemo.set(msgs,{key,map});return map;
 }
 E.slot('messageAffordance',c=>{
  const m=c.message,t=c.thread;if(!m||!t||!snapped(m))return '';
  const map=changePoints(t);if(!has(map,m.id))return '';
  const S=window.PM56_SHELL;
  return '<div class="eli5-change" data-k="eli5-change:'+c.esc(m.id)+'">'+S.pmxDivider({key:'eli5-div:'+m.id,text:map[m.id]?'Simple explanations from here':'Back to standard explanations'})+'</div>';
 });
 E.slot('messageMeta',c=>{
  const m=c.message;if(!m||m.role!=='assistant'||!snapped(m)||!m.explanationPreference.effective)return '';
  const S=window.PM56_SHELL,tip='Written in everyday words because ELI5 is on for this chat. Your code and files were not changed.';
  /* the app's hover card reads data-hover-key / data-hover-tip (FOUNDATION REQUEST: pmxTick({hover}) writes data-hover) */
  return S.pmxTick({key:'eli5-tick:'+m.id,cls:'pmx-eli5-tick',glyph:'kind-eli5',text:'Simple explanation',attrs:'data-hover-key="eli5-tick-'+c.esc(m.id)+'" data-hover-tip="'+c.esc(tip)+'"'});
 });

 /* catalog(scope) and specimen(c, on) are read by New chat defaults (assistant-features.js): its "Explain simply in
    new chats" row is the All chats level here, so both sheets list the same options (IMPACT A3-01) */
 window.PM56_ELI5={resolve,setThread,setProject,setApplication,wand,open,project,
  snapshot:()=>copy(state()),changePoints:t=>copy(changePoints(t||E.ctx().thread)),
  catalog:scope=>copy(CATALOG[scope]||[]),specimen};
})();
