/* Actual footage-source helpers only; no browser, pixel, native or runtime certification. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const OB='Concepts/onboarding/opus-5.5/src/',failures=[],counts={};
const need=(ok,s)=>{if(!ok)failures.push(s);};
function section(s,a,b){const i=s.indexOf(a),j=s.indexOf(b,i+a.length);if(i<0||j<0)throw Error('Missing source boundary '+a);return s.slice(i,j);}
const copy=JSON.parse(read(OB+'copy.json'));
const T=(k,v={})=>{let x=k.split('.').reduce((a,b)=>a&&a[b],copy);if(typeof x!=='string')throw Error('Missing copy '+k);return x.replace(/\{([^}]+)\}/g,(_m,n)=>v[n]??'');};
const safe=read(OB+'js/71-screens-safe.js'),review=read(OB+'js/72-screens-review.js');
const ttl=section(safe,'const CODE_TTL =','/* the page a sign-in');
let c=vm.createContext({});vm.runInContext(ttl+'globalThis.ttl = codeTtl;',c);
for(const [service,expected] of [['gitlab',300000],['github',900000],['azure_devops',900000]])need(c.ttl({service})===expected,'P74 issued service expiry '+service);counts.device_expiry=3;
const visibility=section(safe,'function visCopy(d, v, o)','/* why fewer visibilities');
c=vm.createContext({T,hostOf:()=> 'service.invalid',needsAddress:()=>false,O55:{tx:()=>null,t:T}});vm.runInContext(visibility,c);
for(const [forge,scope,phrase] of [['github','personal','Only you'],['github','organization','Members of Team'],['gitlab','group','Members of Team'],['bitbucket_data_center','personal','Only you']]){
 const result=c.visCopy({forge},'private',{id:'owner-ref',name:'Team',scope});need(result.title.includes(phrase),'RV-14 privacy '+forge+'/'+scope);
}counts.visibility=4;
const names=section(safe,'const placeOf =','const takenExample =');
c=vm.createContext({md:s=>s.draft,RULES:()=>({world:()=>({taken:[],repos:[]})}),instanceKey:d=>d.forge+'|'+d.forge_instance_url});vm.runInContext(names,c);
const S={sess:{},draft:{forge:'github',forge_instance_url:'https://service.invalid',repository_container:'team',repository_name:'chosen'}};
c.refuseName(S,S.draft);need(c.nameTaken(S,'chosen'),'RV-12 retained refused name');
need(!c.nameTaken(S,'chosen',{...S.draft,repository_container:'other'}),'RV-12 refusal escaped owner place');
need(!c.nameTaken(S,'chosen',{...S.draft,forge_instance_url:'https://other.invalid'}),'RV-12 refusal escaped instance');
need(!c.nameTaken(S,'another'),'RV-12 refusal escaped chosen name');counts.name_refusal=4;
const ref=section(safe,'const repoRef =',"def('ex-repos',");c=vm.createContext({});vm.runInContext(ref+'globalThis.repoRef = repoRef;',c);
const repo={container:'workspace',projectName:'Group',name:'Repository'};
need(c.repoRef('bitbucket_cloud',repo)==='bitbucket_cloud:workspace/Repository','P73 Bitbucket project leaked into reference');
need(c.repoRef('azure_devops',repo)==='azure_devops:workspace/Group/Repository','P73 removed actual Azure container');counts.repository_ref=2;
const freshFolder=section(review,'function newNasFolder(S)','function beginsAs(S)');c=vm.createContext({md:s=>s.draft});vm.runInContext(freshFolder,c);
for(const [folder,expected] of [['new',true],['existing',false]]){
 const s={draft:{project_mode:'existing_local',project_transport:'ssh'},sess:{nas:{at:'/root/'+folder,newFolders:[{parent:'/root',name:'new'}]}}};
 need(c.newNasFolder(s)===expected,'P21 selected new directory '+folder);
}counts.new_directory=2;
const away=read(OB+'js/71a-screens-away.js'),retry=section(away,'      retry(S) {','      useTailscale(S)');
for(const code of ['denied','expired','unreachable']){
 const a={id:'run-ref',step:1,state:'failed',fail:{code},done:['signin'],people:{tsSignIn:true}},steps=[{key:'signin',person:'tsSignIn'},{key:'check'}],resets=[];
 c=vm.createContext({A:()=>a,plan:()=>steps,F:{reset:(_s,k)=>resets.push(k)},stepKey:(_a,st)=>st.key,run(){},O55:{sound:{play(){}},ui:{refresh(){}}}});
 vm.runInContext('globalThis.actions = ({'+retry+'});',c);c.actions.retry({save(){}});
 const restart=code!=='unreachable';need(a.step===(restart?0:1)&&a.fail===null&&(restart?!a.people.tsSignIn:a.people.tsSignIn),'RV-9 retry owns correct step '+code);
 need(restart?a.done.length===0:a.done[0]==='signin','RV-9 settled authorization '+code);
}counts.retry=3;
const connect=read(OB+'js/67-screens-connect.js'),tailnet=section(connect,'const hsOk =','const TS_FAIL =');
c=vm.createContext({cd:s=>s.draft,O55:{endpoint:{check:url=>({ok:!!url,url})}}});vm.runInContext(tailnet+'globalThis.ready = tsReady;',c);
for(const [control,cache,expected] of [['hosted',{hosted:{state:'done'}},true],['headscale',{hosted:{state:'done'}},false],['headscale',{'headscale:https://control.invalid':{state:'done'}},true],['hosted',{hosted:{state:'running'}},false]]){
 const s={draft:{tailscale_control:control,headscale_url:'https://control.invalid'},sess:{connect:{tsAuth:cache}}};need(c.ready(s)===expected,'RV-3 selected network authorization '+control+'/'+expected);
}counts.native_network_auth=4;
const ai=read(OB+'js/73-screens-ai.js'),off=section(ai,'      routeOff(S, id) {','      fkeyFrom(S, id)');
const a={accounts:{paid:'preserved'},freeRoutes:{chosen:'ready',other:'ready'},freeAccounts:{chosen:'connection',other:'other-connection'},freeRows:{chosen:{state:'ready'}},free:'setup'},sent=[];
c=vm.createContext({A:()=>a,FR:()=>[{id:'chosen',provider:'provider-ref'}],freeReady:()=>1,O55:{owners:{dispatch:(...args)=>sent.push(args)},ui:{refresh(){}},sound:{play(){}}}});
vm.runInContext('globalThis.actions = ({'+off+'});',c);c.actions.routeOff({ctx:()=>({actor:'actor-ref'}),save(){}},'chosen');
need(sent.length===1&&sent[0][0]==='cmd.free_models.route.disable'&&sent[0][1].route==='chosen'&&sent[0][1].underlying_provider==='provider-ref','Free route disable dispatch identity');
need(!a.freeRoutes.chosen&&a.freeRoutes.other==='ready'&&a.freeAccounts.other==='other-connection'&&a.accounts.paid==='preserved','Free route disable escaped selected wrapper route');counts.route_disable=2;
const ui=read(OB+'js/60-ui-core.js'),faultGuard=section(ui,'    if (!oops && layer && !layer.classList.contains','    const spec ='),success=section(ui,'    const now = performance.now();','    /* the cheer is said through');
const scenarios=[['no_success',{},false],['fresh_owner_success',{success:true},true],['old_success',{success:true,old:true},false],['another_fault',{success:true,fault:true},false],['same_field_fixed',{field:true},true],['field_still_typing',{field:true,typing:true},false],['protected_field_not_validated',{field:true,protected:true},false],['refused_press_valid',{press:true},true],['moved_on',{moved:true,success:true},false]];
for(const [name,test,expected] of scenarios){
 const field={querySelector:q=>q==='input, textarea'?{type:test.protected?'password':'text',value:'valid'}:null};
 const control={getAttribute:k=>({'data-o55-do':'continue','data-arg':'','aria-disabled':'false'})[k]};
 const layer={classList:{contains:()=>false},querySelector:q=>q.startsWith('.o55-field')&&test.field?field:null,querySelectorAll:()=>test.press?[control]:[]};
 const previous=test.moved?null:{key:'fault',face:'oops',screen:'current',since:1000,field:test.field?'field':null,refused:test.press?{do:'continue',arg:''}:null};
 c=vm.createContext({oops:null,layer,lastOops:previous,lastSuccess:test.success?{at:9000,startedAt:test.old?100:8000,screen:'current'}:null,S:{open:true,sess:{screen:'current',ops:{}},typedAt:test.typing?9500:0},performance:{now:()=>10000},spec:{lineId:'ready',pip:{mood:'idle'}},CSS:{escape:x=>x},holdCheerT:null,O55:{pipOops:{faultShown:()=>!!test.fault},motion:{real:{clearTimeout(){},setTimeout(){return 1;}}}},renderScene(){}});
 vm.runInContext(faultGuard+success+'\nglobalThis.cheered = !!cheer;',c);need(c.cheered===expected,'RV-6/11 success meaning '+name);
}counts.Pip_success=scenarios.length;
/* FO-16: another choice is a move away from the refusal, not a repaired fault.
   Exercise the actual choice predicate and move-on state reset, including the
   cases that must keep the current fault. No simulated owner success is needed. */
const selection=section(ui,'  O55.ui.movedOn =','  const MOVED_ON =');
const choiceCases=[
 ['another_key',{refused:{do:'key',arg:'old'}},'key','usable',true],
 ['same_key',{refused:{do:'key',arg:'old'}},'key','old',false],
 ['another_action',{refused:{do:'key',arg:'old'}},'continue','usable',false],
 ['no_fault',null,'key','usable',false],
 ['field_fault',{field:'address'},'key','usable',false],
 ['empty_same',{refused:{do:'choice',arg:''}},'choice',null,false],
 ['numeric_same',{refused:{do:'choice',arg:'7'}},'choice',7,false]
];
for(const [name,fault,action,arg,moves] of choiceCases){
 c=vm.createContext({lastOops:fault,cheering:{text:'old cheer'},cheerLog:[],O55:{ui:{}}});
 vm.runInContext(selection+'globalThis.otherChoice = choseOther;',c);
 need(c.otherChoice(action,arg)===moves,'FO-16 refusal ownership '+name);
 if(moves){c.O55.ui.movedOn();need(c.lastOops===null&&c.cheering===null,'FO-16 replacement choice kept a refusal or cheer');}
 else need(c.lastOops===fault,'FO-16 unrelated choice cleared current fault '+name);
}counts.refusal_selection=choiceCases.length;
/* FO-18: the no-AI gate must precede every skin. Spies observe whether a
   family moment or fallback burst can start; they do not assert painted frames. */
const ready=read(OB+'js/74-screens-ready.js');
const readiness=section(ready,'  const noAi =',"  def('ready',");
const mounted=section(ready,'    mounted(S, layer, fresh) {','    eyebrow:');
const title=section(ready,'    title: (S) =>','    lead:');
function readyProbe(paid,free,skin=true){
 const calls={skin:0,burst:0,timers:[]},s={open:true,sess:{screen:'ready'},root:{querySelector:()=>({querySelector:()=>null})}};
 const state={paid,free};
 const o={ai:{readyIds:()=>state.paid?['account-ref']:[],freeReady:()=>state.free?1:0},shell:{flushLook(){}},ui:{skin:()=>{calls.skin++;return skin;}},motion:{after:(_ms,fn)=>calls.timers.push(fn)},art:{celebrate:()=>calls.burst++}};
 const ctx=vm.createContext({O55:o,T});
 vm.runInContext(readiness+'globalThis.actions = ({'+mounted+title+'});',ctx);
 return {calls,s,state,ctx};
}
for(const look of ['basic-light','basic-dark','friendly-light','friendly-dark','glass-light','glass-dark','retro-light','retro-dark','nier-light','nier-dark']){
 const p=readyProbe(false,false);p.s.look=look;p.ctx.actions.mounted(p.s,{},true);
 need(p.calls.skin===0&&p.calls.timers.length===0&&p.calls.burst===0,'FO-18 Almost ready started a celebration '+look);
 need(p.ctx.actions.title(p.s)===T('ready.titleNoAi'),'FO-18 Almost ready title '+look);
}
for(const [paid,free] of [[true,false],[false,true]]){
 const p=readyProbe(paid,free);p.ctx.actions.mounted(p.s,{},true);
 need(p.calls.skin===1&&p.ctx.actions.title(p.s)===T('ready.title'),'FO-18 usable paid/free AI lost its eligible Ready moment');
}
let p=readyProbe(true,false);p.ctx.actions.mounted(p.s,{},false);
need(p.calls.skin===0&&p.calls.timers.length===0,'FO-18 redraw repeated the Ready moment');
p=readyProbe(true,false,false);p.ctx.actions.mounted(p.s,{},true);p.state.paid=false;
for(const fn of p.calls.timers)fn();
need(p.calls.timers.length===1&&p.calls.burst===0,'FO-18 deferred burst ignored lost AI readiness');counts.no_ai_curtain=14;
/* FO-19: evaluate the shared renderer to preserve each complete value and
   put the one soft break after the algorithm, rather than inside the hash. */
const components=read(OB+'js/61-components.js'),kv=section(components,'    kv(rows) {','\n  };');
c=vm.createContext({esc:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')});
vm.runInContext('globalThis.details = ({'+kv+'});',c);
for(const [value,expected] of [
 ['SHA256:'+'a'.repeat(64),'SHA256:<wbr>'+'a'.repeat(64)],
 ['SHA512:'+'b'.repeat(128),'SHA512:<wbr>'+'b'.repeat(128)],
 ['https://server.invalid/a/long/path','https://server.invalid/a/long/path'],
 ['<span>value</span>','&lt;span&gt;value&lt;/span&gt;']
])need(c.details.kv([['Identity',value]]).includes('<dd>'+expected+'</dd>'),'FO-19 renderer altered or split the compared value');
counts.fingerprint_format=4;
process.stdout.write(JSON.stringify({status:failures.length?'fail':'pass',counts,failures,claim_boundary:'actual_isolated_source_functions_only_no_browser_native_or_pixel_proof'},null,2)+'\n');process.exitCode=failures.length?1:0;
