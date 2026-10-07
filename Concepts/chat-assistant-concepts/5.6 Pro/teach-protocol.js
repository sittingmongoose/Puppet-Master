/* B07 Teach: explicit user capture and immutable-content revision history.
 * Reuses PM56_FEATURES.state().teach.records, not a second memory store.
 * This is in-memory concept state, NOT redb persistence or live prompt dispatch.
 * Scope boundary follows assistant-chat-design §6: thread | project | user.
 * Legacy `global` is read as the old concept alias for `user`, never newly saved.
 *
 * Presentation (DESIGN-SPEC 8.11, 2026-09-27): the Teach sheet (pmxSheet standard: the rule, the safety line, the
 * three reach rings, the rule card exactly as it will be saved, the receipt it will leave in the chat, the similar-rule
 * choice), the receipt in the chat (pmxLedgerLine, family ledger: "Rule saved" / "Rule updated to v2" / "Rule turned
 * off", consecutive saves coalesce), the "Followed 1 of your rules" / "Missed 1 of your rules" reply tick (pmxTick; owner
 * answer E-36 replaces IMPACT A1-41's "Used": a rule is followed when it was sent AND the finished reply passed its check),
 * the Taught memory document (pmxView "Your rules") and the Memory sheet's "Your rules" tab (memoryRows).
 * Provenance (IMPACT A3-03): a record carries provenance 'wand' | 'recorded'; `demo:true` no longer marks anything.
 */
(function(){
 'use strict';
 const E=window.PM56_EXT,F=window.PM56_FEATURES,S=window.PM56_SHELL,clone=x=>JSON.parse(JSON.stringify(x));
 const scopes={thread:'This thread',project:'This project',user:'Every project'};
 const ORDER=['thread','project','user'];
 let epoch=1,serial=0;const views=new Map(),receipts=new Map();
 const store=()=>F.state().teach,all=()=>store().records,get=id=>all().find(r=>r.id===id);
 const uid=p=>'teach-'+p+'-'+epoch+'-'+(++serial),now=()=>new Date().toISOString(),fail=error=>({ok:false,error});
 const active=r=>!!r&&!r.revoked&&!r.supersededBy;
 const scope=r=>r.scope==='global'?'user':r.scope;
 const stamp=r=>JSON.stringify([r?.id,r?.text,r?.scope,r?.projectId,r?.userId,r?.sourceThreadId,r?.version||1,r?.revoked,r?.supersededBy,r?.locked,r?.updatedAt]);
 function context(tid){
  const c=E.ctx(),t=tid?c.state.threads.find(x=>x.id===tid):c.thread;
  if(!t)return null;
  return {threadId:t.id,projectId:t.projectId||t.project_id||'concept:pm',userId:'concept:user',consumer:'assistant'};
 }
 // Document actions carry their owner thread. Switching is explicit and uses
 // the ordinary switch path, which preserves the previous composer's draft.
 function documentTarget(c,b){
  const tid=b.dataset.thread;
  if(!tid)return true;
  if(!context(tid)){c.toast('Rules unavailable','The chat these rules belong to no longer exists.');return false;}
  if(c.thread.id!==tid)c.switchThread(tid);
  return true;
 }
 const messages=id=>E.ctx().state.threads.find(t=>t.id===id)?.messages||[];
 function safeMessage(m){return !!m&&['user','assistant'].includes(m.role)&&m.type==='text'&&typeof m.body==='string'&&!m.internalOnly&&m.visibility!=='internal';}
 function sourceValid(s){if(!s||s.kind==='manual')return true;const m=messages(s.threadId).find(m=>m.id===s.messageId);return safeMessage(m)&&m.body.slice(s.start,s.end)===s.excerpt;}
 function sourceFor(seed,ctx){
  const tid=seed.sourceThreadId||ctx.threadId,mid=seed.sourceMessageId;
  if(!mid)return {kind:'manual',threadId:tid,excerpt:null};
  const m=messages(tid).find(m=>m.id===mid);if(!safeMessage(m))return null;
  const start=Number.isInteger(seed.start)?seed.start:0,end=Number.isInteger(seed.end)?seed.end:m.body.length;
  if(start<0||end<=start||end>m.body.length)return null;
  return {kind:m.role==='assistant'?'assistant_output':'user_statement',threadId:tid,messageId:mid,start,end,excerpt:m.body.slice(start,end)};
 }
 /* presentation state kept beside the protocol: where focus returns after the sheet (IMPACT A1-36: the control that
    opened it) and the chat card width the receipt preview is drawn at (so its flight lands on identical geometry) */
 let opener=null,openerHint=null,savedId=null,destW=417;
 /* the opener, remembered by what it is (action + record), not only by node: a re-render can reuse or drop the node.
    The clicked control when the action came from a click (openerHint), else the focused element. A wand menu item
    means the wand trigger; a message's More item means that message's More button; a control inside another sheet
    has no place to return to, so the wand trigger takes it. */
 function openerOf(b){
  /* a menu row may already be detached (an earlier handler closed the menu), but it still knows where it was */
  const inMenu=n=>!!n&&!!n.closest&&!!n.closest('.overlay-menu'),inMore=n=>!!n&&!!n.closest&&!!n.closest('.pm-msg-overflow');
  if(inMenu(b))return null;if(inMore(b))return {sel:'.pm-msg-more[data-id="'+CSS.escape(b.dataset.id||'')+'"]'};
  const a=b&&b.isConnected?b:document.activeElement;if(!a||a===document.body)return null;
  if(inMenu(a))return null;
  if(inMore(a))return {sel:'.pm-msg-more[data-id="'+CSS.escape(a.dataset.id||'')+'"]'};
  if(a.closest('.pmx-sheet, .pmx-ghost'))return null;
  const ds=a.dataset||{},sel=ds.action?'[data-action="'+CSS.escape(ds.action)+'"]'+(ds.id?'[data-id="'+CSS.escape(ds.id)+'"]':'')+(ds.value?'[data-value="'+CSS.escape(ds.value)+'"]':''):'';
  return {el:a,sel,action:ds.action||''};
 }
 function measureCardWidth(){
  /* an assistant-side item's width (Chat WOW's spine gutter, 18 px or 24 px above 540, sits to its left, R-02) */
  const el=document.querySelector('#pmRoot .transcript-inner');let w=0;
  const item=el&&el.querySelector(':scope > [data-family]:not([data-family="user"])');
  if(item)w=item.getBoundingClientRect().width;
  else if(el){const cs=getComputedStyle(el),inner=el.clientWidth-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0);w=inner-(inner>=540?24:18);}
  if(!(w>200))w=417;return Math.max(280,Math.min(720,Math.round(w)));
 }
 function open(seed={}){const c=E.ctx(),ctx=context(),old=seed.narrowOf?get(seed.narrowOf):null;
  if(seed.narrowOf&&!active(old))return fail('teaching_not_active');
  const source=sourceFor(seed,ctx);if(!source)return fail('source_unavailable');
  const d={id:uid('draft'),epoch,context:ctx,text:String(seed.text??''),scope:old?scope(old):(scopes[seed.scope]?seed.scope:'thread'),source,narrowOf:old?.id||null,expectedOld:old?stamp(old):null,allowUserScope:false,
   locked:old?old.locked!==false:true,provenance:seed.recorded?'recorded':'wand',conflictChoice:null,error:null};
  opener=openerOf(openerHint);openerHint=null;destW=measureCardWidth();
  store().pending=d;window.PM56_MSG_OVERFLOW?.close();c.closeMenu();c.openDialog({type:'af-teach'});c.renderApp();return {ok:true,draftId:d.id};
 }
 function applies(r,ctx){if(!active(r)||ctx.consumer!=='assistant')return false;const s=scope(r);
  if(s==='user')return (r.userId||'concept:user')===ctx.userId;
  if((r.projectId||'concept:pm')!==ctx.projectId)return false;
  return s==='project'||(s==='thread'&&r.sourceThreadId===ctx.threadId);
 }
 function preview(ctx=context()){
  const items=[],excluded=[];for(const r of visibleRecords(ctx)){
   let reason=r.supersededBy?'superseded':r.revoked?'revoked':ctx.consumer!=='assistant'?'not_assistant':!applies(r,ctx)?'outside_scope':null;
   if(reason)excluded.push({id:r.id,version:r.version||1,reason});else items.push({id:r.id,version:r.version||1,scope:scope(r),text:r.text});
  }return {kind:'concept_teach_context_preview',context:clone(ctx),items,excluded,payload:items.map(r=>r.text).join('\n'),providerDispatched:false};
 }
 const words=s=>new Set((String(s).toLowerCase().match(/[a-z0-9]{4,}/g)||[]));
 function related(d){const w=words(d.text);return all().filter(r=>active(r)&&r.id!==d.narrowOf&&scope(r)===d.scope&&(d.scope==='user'?(r.userId||'concept:user')===d.context.userId:(r.projectId||'concept:pm')===d.context.projectId)&& (d.scope!=='thread'||r.sourceThreadId===d.context.threadId)&&[...words(r.text)].filter(v=>w.has(v)).length>=3);}
 const secret=s=>/(api[_-]?key|secret|token|password|bearer)\s*[:=]\s*\S{4,}|sk-[a-z0-9]{10,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i.test(String(s));
 function request(){const d=store().pending;return d?clone({...d,related:related(d).map(r=>({id:r.id,stamp:stamp(r)}))}):null;}
 /* the receipt a record change leaves in its source chat: the audit trail {type, memoryId, title, detail} is kept
    (appended, never rewritten); event, version and time are additive fields the receipt line reads */
 function appendReceipt(r,event,old){
  const c=E.ctx(),t=c.state.threads.find(t=>t.id===r.sourceThreadId),id=uid('receipt');
  /* a Save flight in the air: the new receipt renders hidden (data-pmx-arrive) until the clone lands on it */
  if(flight&&event!=='revoked'){flight.receiptId=id;arriving.add(id);}
  const title=event==='revoked'?'Rule turned off':event==='updated'?'Rule updated to v'+(r.version||1):'Rule saved';
  c.appendMessage({id,role:'system',type:'af-teach-receipt',title,detail:(scopes[scope(r)]||r.scope)+(r.locked&&event!=='revoked'?' · locked':''),memoryId:r.id,event,version:r.version||1,replaces:old?.id||null,time:now()},t);
  return id;
 }
 function commit(x){
  const d=store().pending;if(!x)return fail('draft_missing');
  const saved=receipts.get(x.id);if(saved)return saved.request===JSON.stringify(x)?{ok:true,id:saved.id,reused:true}:fail('conflicting_capture');
  if(x.epoch!==epoch||!d||x.id!==d.id||E.ctx().state.dialog?.type!=='af-teach')return fail('stale_draft');
  if(JSON.stringify(request())!==JSON.stringify(x))return fail('draft_changed');
  if(JSON.stringify(context())!==JSON.stringify(d.context))return fail('scope_context_changed');
  if(!scopes[d.scope])return fail('invalid_scope');
  const text=String(d.text).trim();if(!text||text.length>4000)return fail('text_required_and_bounded');
  if(secret(text)||secret(d.source.excerpt))return fail('credential_detected');
  if(!sourceValid(d.source))return fail('source_changed');
  if(d.scope==='user'&&!d.allowUserScope)return fail('confirm_nonconfidential_user_scope');
  let old=d.narrowOf?get(d.narrowOf):null;
  if(d.narrowOf&&(!active(old)||!applies(old,d.context)||stamp(old)!==d.expectedOld))return fail('stale_correction');
  const near=related(d);if(near.length&&!d.narrowOf){
   if(d.conflictChoice==='keep_both'){}else if(d.conflictChoice?.startsWith('replace:')){
    old=get(d.conflictChoice.slice(8));if(!near.includes(old)||!active(old))return fail('conflict_changed');
   }else return fail('resolve_related_teaching');
  }
  // A correction cannot silently broaden its predecessor's scope.
  if(old&&d.scope!==scope(old)&&!(scope(old)==='project'&&d.scope==='thread'))return fail('correction_cannot_widen_scope');
  const id=uid('record'),at=now(),r={id,memory_id:id,scope:d.scope,projectId:d.context.projectId,userId:d.context.userId,
   sourceThreadId:d.context.threadId,source_thread_id:d.context.threadId,sourceMessageId:d.source.messageId||null,author_message_id:d.source.messageId||null,
   text,normalized_fact:text,source:clone(d.source),version:old?(old.version||1)+1:1,rootId:old?(old.rootId||old.id):id,
   supersedes:old?.id||null,supersedes_memory_id:old?.id||null,supersededBy:null,revoked:false,revoked_at:null,locked:d.locked!==false,
   createdAt:at,captured_at:at,updatedAt:at,secretSafety:'local_pattern_screen_clear',provenance:d.provenance==='recorded'?'recorded':'wand',protocolVersion:1,check:checkOf(text)};
  if(old){old.supersededBy=id;old.revoked=true;old.updatedAt=at;}all().push(r);store().pending=null;receipts.set(x.id,{request:JSON.stringify(x),id});
  const receiptId=appendReceipt(r,old?'updated':'saved',old);
  document.dispatchEvent(new CustomEvent('pm56:teach-committed',{detail:{id,threadId:r.sourceThreadId}}));return {ok:true,id,reused:false,receiptId};
 }
 function correction(id){const r=get(id);if(!active(r))return fail('teaching_not_active');if(!applies(r,context()))return fail('outside_scope');return open({text:r.text,scope:scope(r),narrowOf:id});}
 function mutationRequest(id){const r=get(id);return r?{id,epoch,expected:stamp(r)}:null;}
 function revoke(x){const r=get(x?.id);if(!r)return fail('teaching_missing');if(x.epoch!==epoch||stamp(r)!==x.expected||!applies(r,context()))return fail('stale_teaching');if(!active(r))return fail('teaching_not_active');r.revoked=true;r.revoked_at=now();r.updatedAt=r.revoked_at;
  const receiptId=appendReceipt(r,'revoked',null);return {ok:true,id:r.id,receiptId};}
 function lock(x){const r=get(x?.id);if(!r||x.epoch!==epoch||stamp(r)!==x.expected||!active(r)||!applies(r,context()))return fail('stale_teaching');r.locked=!r.locked;r.updatedAt=now();return {ok:true,id:r.id};}
 /* provenance (IMPACT A3-03): 'recorded' only for records a recorded example made; everything else is 'wand' */
 function provenance(id){const r=get(id);return r?(r.provenance==='recorded'?'recorded':'wand'):null;}
 function markRecorded(id){const r=get(id);if(!r)return fail('teaching_missing');r.provenance='recorded';return {ok:true};}
 /* "Followed 1 of your rules" (owner answer E-36, 2026-09-27; it replaces IMPACT A1-41's "Used"). A rule counts as
    followed when it was given to the assistant AND the finished reply passed that rule's check: the rule's testable
    statement compared with the reply. A failed check reads "Missed 1 of your rules", with the rule named on hover and
    a way to ask for a fix; a rule with no check, or a reply its check can't judge, adds nothing, and a reply with
    nothing judged gets no tick.
    This concept asks no AI, so a check is a set of plain word cues: `about` (the reply must touch the rule's subject,
    or the check can't judge it), `need` (groups: one word of each must appear) and `avoid` (words that break the rule
    unless a "not / never / instead of" sits just before them). A word ending in * matches as a word start. A recorded
    example registers its rule's check (registerCheck); a typed rule gets one only in the clear shapes "use X, not Y"
    and "never use Y"; any other rule has no check, and says so in its Version details. */
 const checkBook=new Map(),normText=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').replace(/[.!\s]+$/,'').trim();
 function registerCheck(text,check){if(!text||!check||!check.statement)return fail('check_invalid');
  checkBook.set(normText(text),{statement:String(check.statement),about:(check.about||[]).map(String),need:(check.need||[]).map(g=>[].concat(g).map(String)),avoid:(check.avoid||[]).map(String)});return {ok:true};}
 const STOP=new Set(['a','an','the','it','this','that','them','to','for','in','on','of','and','or','any','all','my','your','our']);
 const WORD='([a-z0-9][a-z0-9.+#_-]*[a-z0-9+#]|[a-z0-9])';
 function checkOf(text){
  const known=checkBook.get(normText(text));if(known)return clone(known);
  const s=String(text||'').trim().replace(/[.!]+$/,''),tok=w=>w&&!STOP.has(w.toLowerCase())?w:null;let m;
  if((m=s.match(new RegExp('^(?:always\\s+)?(?:use|prefer)\\s+'+WORD+'\\b[^]*?\\b(?:not|never|instead of|rather than|over)\\s+'+WORD+'(?:\\s+or\\s+'+WORD+')?(?![\\w.+#-])','i')))){
   const x=tok(m[1]),y=tok(m[2]),z=tok(m[3]);
   if(x&&y&&x.toLowerCase()!==y.toLowerCase()){const off=[y].concat(z?[z]:[]);
    return {statement:'The reply uses '+x+', not '+off.join(' or ')+'.',about:[x].concat(off),need:[[x]],avoid:off};}
  }
  if((m=s.match(new RegExp('^(?:never|don[\'’]t|do not|avoid)\\s+(?:use|using)\\s+'+WORD+'(?![\\w.+#-])','i')))&&tok(m[1]))
   return {statement:'The reply doesn’t use '+m[1]+'.',about:[m[1]],need:[],avoid:[m[1]]};
  return null;
 }
 /* the check a record carries (saved with it; a record from before checks existed gets one from its wording) */
 const checkFor=r=>!r?null:('check' in r)?r.check:checkOf(r.text);
 const escRx=w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const cueRx=(w,flags)=>{const stem=w.endsWith('*'),b=escRx(stem?w.slice(0,-1):w);return new RegExp('(^|[^\\w.+#-])('+b+(stem?'[\\w-]*':'')+')(?![\\w+#-])',flags||'i');};
 const NEGATED=/(?:\bnot|\bnever|n['’]t|\bno|\binstead of|\brather than|\bavoid(?:ing)?|\bover)(?:\s+[^\s.;!?]+){0,2}\s*$/i;
 function judge(check,body){
  const txt=String(body||'');if(!check)return null;
  if(!check.about.some(w=>cueRx(w).test(txt)))return null;
  for(const w of check.avoid)for(const m of txt.matchAll(cueRx(w,'gi'))){const at=m.index+m[1].length;if(!NEGATED.test(txt.slice(Math.max(0,at-48),at)))return 'missed';}
  for(const g of check.need)if(!g.some(w=>cueRx(w).test(txt)))return 'missed';
  return 'followed';
 }
 const used=new Map();
 function noteReply(t,m){
  if(!t||!m||m.role!=='assistant'||m.type!=='text')return fail('not_assistant_final');
  const tally=u=>({followed:u.filter(x=>x.result==='followed').length,missed:u.filter(x=>x.result==='missed').length});
  if(used.has(m.id))return {ok:true,count:used.get(m.id).length,...tally(used.get(m.id)),reused:true};
  const ctx=context(t.id);if(!ctx)return fail('thread_missing');
  const items=preview(ctx).items,list=items.map(x=>{const ck=checkFor(get(x.id));return {id:x.id,version:x.version,text:x.text,check:ck?ck.statement:null,result:judge(ck,m.body)};});
  if(list.length)used.set(m.id,list);
  return {ok:true,count:list.length,...tally(list)};
 }
 const errorText={
  credential_detected:'That looks like a password or key. Remove it to save.',source_changed:'The message this came from changed. Pick it again.',
  resolve_related_teaching:'Pick Replace or Keep both first.',conflict_changed:'The similar rule changed. Pick Replace or Keep both again.',
  stale_correction:'This rule changed since you opened it. Open it again to edit the latest version.',scope_context_changed:'You switched chats. Open Teach again from this chat.',
  confirm_nonconfidential_user_scope:'Tick ‘safe for my other projects’ first.',correction_cannot_widen_scope:'An edit can’t widen where a rule applies. Save a new rule instead.',
  draft_changed:'This changed while it was open. Look it over, then save again.',stale_draft:'This changed while it was open. Look it over, then save again.',
  text_required_and_bounded:'Write a rule first (up to 4,000 characters).',invalid_scope:'Pick where it applies.',
  stale_teaching:'This rule changed somewhere else. Look at it again, then retry.',teaching_not_active:'This rule is already turned off or replaced.',outside_scope:'This rule doesn’t apply in this chat.'};
 const explain=x=>errorText[x]||'The rule changed. Reopen it, then retry.';

 /* ================================================================== presentation (DESIGN-SPEC 8.11) */
 const P=()=>window.PM56_PMX||null;
 const hm=iso=>iso?(S.pmxTime.at(iso,null,{day:false})||''):'';
 const when=iso=>iso?(S.pmxTime.at(iso,null)||''):'';
 const short=(s,n)=>{s=String(s||'').replace(/\s+/g,' ').trim();if(s.length<=n)return s;const cut=s.slice(0,n),sp=cut.lastIndexOf(' ');return (sp>n*0.5?cut.slice(0,sp):cut).replace(/[\s,.;:]+$/,'')+'…';};
 const W=()=>S.PMX_COPY.teach;
 /* a quoted rule inside a sentence: the quote marks carry it, and a sentence never gets a second full stop after it */
 const quoted=(t,n)=>{const q=short(t,n);return '“'+q+'”'+(/[.!?…]$/.test(q)?'':'.');};
 const HELP={thread:'Only this chat',project:'Every chat in this project',user:'All your projects: only if it holds nothing private'};
 const TRIES=['Always use pnpm, not npm','Keep answers under 200 words','Write tests before changing a public function'];
 const arriving=new Set(),disclosures=new Map();
 let shown={err:null,rel:null};
 /* the padlock: its shackle closes on Save, so an open shackle (raised by CSS on a draft card) drops into the body
    (transform only, --pmx-t-lock). Neon step 3E (2026-10-02): it is the shared registry's lock (neon-icons.js), whose
    one moving part IS the shackle and whose act is that drop; read at call time, the drawing below is only the
    fallback for a page without the neon family. The shackle is .nx-p in the registry's lock, .pmx-teach-shackle here. */
 const lockSvg=(size,cls)=>{const N=window.PM56_NEON;
  if(N&&typeof N.icon==='function')return N.icon('lock',size,'pmx-teach-lock'+(cls?' '+cls:''));
  return '<svg class="pmx-teach-lock'+(cls?' '+cls:'')+'" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+
  '<path class="pmx-teach-shackle" d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/><rect x="5" y="10.5" width="14" height="10" rx="2.2"/></svg>';};
 function ruleWord(r){return r.supersededBy?W().replaced.replace('{n}',String(get(r.supersededBy)?.version||(r.version||1)+1)):r.revoked?W().off:r.locked?W().inUseLocked:W().inUse;}
 function status(r){return ruleWord(r);}
 function msgTime(s){if(!s||!s.messageId)return '';const m=messages(s.threadId).find(m=>m.id===s.messageId);return m?hm(m.time||m.sentAt||m.at||''):'';}
 function fromLine(s){if(!s||s.kind==='manual')return 'From: you, written here';const t=msgTime(s);return (s.kind==='assistant_output'?'From: the assistant’s reply':'From: your message')+(t?' at '+t:'');}
 /* a word-level comparison (longest common subsequence over words): what the old wording loses, what the new adds */
 function wordDiff(a,b){
  const x=String(a||'').split(/\s+/).filter(Boolean).slice(0,160),y=String(b||'').split(/\s+/).filter(Boolean).slice(0,160),n=x.length,m=y.length;
  const key=w=>w.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,''),L=Array.from({length:n+1},()=>new Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=key(x[i])===key(y[j])?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  const keepA=new Array(n).fill(false),keepB=new Array(m).fill(false);let i=0,j=0;
  while(i<n&&j<m){if(key(x[i])===key(y[j])){keepA[i]=keepB[j]=true;i++;j++;}else if(L[i+1][j]>=L[i][j+1])i++;else j++;}
  return {old:x.map((w,k)=>({w,keep:keepA[k]})),neu:y.map((w,k)=>({w,keep:keepB[k]}))};
 }
 /* class names written out whole, so the orphan gate can find them */
 function diffHtml(e,list,mark){const cls=mark==='del'?'pmx-teach-del':'pmx-teach-add';return list.map(t=>t.keep?e(t.w):'<'+mark+' class="'+cls+'">'+e(t.w)+'</'+mark+'>').join(' ');}
 /* the one block the similar-rule check and a correction share (#teach-related, patched surgically as you type) */
 function conflictHtml(c,d){
  const e=c.esc;
  if(d.narrowOf){const old=get(d.narrowOf);if(!old)return '';const df=wordDiff(old.text,d.text),same=df.old.every(t=>t.keep)&&df.neu.every(t=>t.keep);
   return '<section class="pmx-teach-similar" data-k="teach-change:'+e(old.id)+'" data-state="change"><p class="pmx-teach-sim-say">'+S.pmxGlyph('file-edit',14)+'<span><b>What changes from version '+(old.version||1)+'.</b> The old wording stays in history.</span></p>'+
    '<div class="pmx-teach-diff"><div class="pmx-teach-diff-col"><p class="pmx-teach-diff-cap">Version '+(old.version||1)+' now</p><p class="pmx-teach-diff-t">'+diffHtml(e,df.old,'del')+'</p></div>'+
    '<div class="pmx-teach-diff-col"><p class="pmx-teach-diff-cap">Version '+((old.version||1)+1)+'</p><p class="pmx-teach-diff-t">'+(same?'<span class="pmx-teach-same">Nothing changed yet.</span>':diffHtml(e,df.neu,'mark'))+'</p></div></div></section>';}
  const rows=related(d);if(!rows.length)return '';
  const r=rows[0],df=wordDiff(r.text,d.text),ch=d.conflictChoice,unset=!ch||(ch!=='keep_both'&&!rows.some(x=>ch==='replace:'+x.id));
  const err=d.error==='resolve_related_teaching'||d.error==='conflict_changed';
  const sw=S.pmxSwitch({key:'teach-conflict',size:'small',label:'What happens to the old rule',action:'teach-conflict',current:unset?'':ch,
   options:[{value:'replace:'+r.id,label:'Replace the old rule',attrs:'data-choice="replace:'+e(r.id)+'"'},{value:'keep_both',label:'Keep both',attrs:'data-choice="keep_both"'}]});
  /* FOUNDATION REQUEST (MEMTEACH notes): pmxSwitch has no "nothing chosen" state; until it does, an unset choice
     clears the builder's default aria-checked and hides the rule (CSS on data-state="unset") */
  const swHtml=unset?sw.replace(/aria-checked="true"/g,'aria-checked="false"').replace('class="pmx-switch pmx-switch--small"','class="pmx-switch pmx-switch--small" data-state="unset"'):sw;
  const say=unset?(err?'<span class="pmx-teach-sim-warn">'+S.pmxGlyph('warn',13)+'Pick Replace or Keep both first.</span>':'Pick one before you save. Save waits for your choice.'):
   ch==='keep_both'?'Both rules are used from now on.':'The old rule stops being used. It stays in history.';
  const more=rows.length>1?'<p class="pmx-teach-sim-more">'+(rows.length-1)+' more similar '+(rows.length===2?'rule':'rules')+': “'+e(short(rows[1].text,48))+'” <button type="button" class="text-button" data-action="teach-conflict" data-choice="replace:'+e(rows[1].id)+'">Replace that one instead</button></p>':'';
  return '<section class="pmx-teach-similar" data-k="teach-similar:'+e(r.id)+'" data-state="'+(err?'error':unset?'unset':'chosen')+'"><p class="pmx-teach-sim-say">'+S.pmxGlyph('swap',14)+'<span><b>You already have a similar rule.</b> Choose what happens to it.</span></p>'+
   '<div class="pmx-teach-diff"><div class="pmx-teach-diff-col"><p class="pmx-teach-diff-cap">Your rule now · '+e(scopes[scope(r)]||r.scope)+'</p><p class="pmx-teach-diff-t">'+diffHtml(e,df.old,'del')+'</p></div>'+
   '<div class="pmx-teach-diff-col"><p class="pmx-teach-diff-cap">This one</p><p class="pmx-teach-diff-t">'+diffHtml(e,df.neu,'mark')+'</p></div></div>'+swHtml+
   '<p class="pmx-teach-sim-help">'+say+'</p>'+more+'</section>';
 }
 /* the safety line (#teach-error, patched surgically): the live password-and-key check */
 function safetyInner(c,d){
  const bad=secret(d.text)||secret(d.source?.excerpt);
  if(bad||d.error==='credential_detected')return '<span class="pmx-teach-safe" data-k="tsafe:warn" data-state="warn">'+S.pmxGlyph('warn',14)+'<span><b>That looks like a password or key.</b> Remove it to save.</span></span>';
  return '<span class="pmx-teach-safe" data-k="tsafe:ok" data-state="ok">'+S.pmxGlyph('check-circle',14)+'<span>No passwords or keys spotted</span></span>';
 }
 function patchInner(el,html,slot){
  if(shown[slot]===html)return;
  const tmp=document.createElement('div');tmp.innerHTML=html;const a=el.firstElementChild,b=tmp.firstElementChild;
  /* the same block (same key): sync its attributes and swap only the children that changed, so the similar-rule
     block never replays its entrance while you type */
  if(a&&b&&a.tagName===b.tagName&&a.getAttribute('data-k')&&a.getAttribute('data-k')===b.getAttribute('data-k')){
   for(const at of [...a.attributes])if(!b.hasAttribute(at.name))a.removeAttribute(at.name);
   for(const at of [...b.attributes])if(a.getAttribute(at.name)!==at.value)a.setAttribute(at.name,at.value);
   const ak=[...a.children],bk=[...b.children];
   if(ak.length===bk.length)ak.forEach((n,i)=>{if(!n.isEqualNode(bk[i]))n.replaceWith(bk[i]);});else a.replaceChildren(...bk);
  }else el.innerHTML=html;
  shown[slot]=html;
 }
 function update(){const c=E.ctx(),d=store().pending;if(!d)return;
  const err=document.getElementById('teach-error');if(err)patchInner(err,safetyInner(c,d),'err');
  const rel=document.getElementById('teach-related');if(rel)patchInner(rel,conflictHtml(c,d),'rel');
 }
 /* the three reach rings (8.11): This thread ⊂ This project ⊂ Every project, each a button; the chosen ring is lit,
    the rings inside it are included, the wider rings dim; an edit can only keep or narrow where a rule applies.
    Each button is the ring's label band (unboxed, so the three never overlap as controls); the ring itself is its
    child shape, drawn below the band, so a click anywhere on a ring still reaches its button (inner rings on top). */
 function ringsHtml(c,d){
  const e=c.esc,old=d.narrowOf?get(d.narrowOf):null,os=old?scope(old):null,rank=ORDER.indexOf(d.scope);
  const ring=k=>{
   const i=ORDER.indexOf(k),ok=!old||k===os||(os==='project'&&k==='thread');
   const st=!ok?'off':i===rank?'on':i<rank?'in':'out',warn=k==='user'&&i===rank&&!d.allowUserScope;
   const say=warn?'<span class="pmx-teach-ring-warn">'+S.pmxGlyph('warn',13)+'<span>Tick ‘safe for my other projects’ first.</span></span>':'<span class="pmx-teach-ring-help">'+e(HELP[k])+'</span>';
   return '<button type="button" class="pmx-teach-ring" data-kind="'+k+'" data-state="'+st+'" aria-pressed="'+(i===rank)+'" data-action="af-teach-set-scope" data-value="'+k+'"'+(ok?'':' disabled')+
    ' data-hover-key="teach-ring:'+k+'" data-hover-tip="'+e(scopes[k]+'\n'+HELP[k]+(ok?'':'. An edit can’t widen where a rule applies.'))+'"><span class="pmx-teach-ring-shape" aria-hidden="true"></span><span class="pmx-teach-ring-say"><b>'+scopes[k]+'</b>'+say+'</span></button>';};
  const narrowed=old&&ORDER.some(k=>!(k===os||(os==='project'&&k==='thread')));
  return S.pmxPlate({key:'teach-reach',kind:'teach',mode:'caption',cls:'pmx-teach-plate',caption:'<div class="pmx-teach-rings" role="group" aria-label="Where it applies">'+ring('thread')+ring('project')+ring('user')+'</div>'})+
   (narrowed?'<p class="pmx-reason pmx-teach-reason">An edit can’t widen where a rule applies. Save a new rule instead.</p>':'');
 }
 /* the receipt line: one builder for the chat and for the sheet's "In your chat" preview, so the Save flight lands on
    identical geometry. o: {key, id, memoryId, event, text, scope, locked, version, oldText, count, list, time, recorded,
    arriving, preview, mirror} */
 function receiptLine(c,o){
  const e=c.esc,text=String(o.text||''),sc=scopes[o.scope]||o.scope||'',rule=o.mirror?'<span data-pmx-mirror="teach-rule">'+e(text)+'</span>':e(text);
  let head,glyph,tip,meta=sc+(sc&&o.locked&&o.event!=='revoked'?' · locked':'');
  if(o.count>1){head='<b>'+o.count+' rules saved</b>';glyph='lock';meta=o.sameScope?sc:'';
   tip=o.count+' rules saved\n'+o.list.slice(0,3).map(t=>'“'+short(t,60)+'”').join(' · ')+(o.list.length>3?' and '+(o.list.length-3)+' more':'')+'. View shows every rule.';}
  else if(o.event==='revoked'){head='<b>Rule turned off:</b> “'+rule+'”';glyph='slash-circle';
   tip='Rule turned off\n'+quoted(text,200)+' It stays in history, and older versions don’t come back.';}
  else if(o.event==='updated'){head='<b>Rule updated to v'+(o.version||2)+':</b> “'+rule+'”';glyph=o.locked?'lock':'check-circle';
   tip='Rule updated to version '+(o.version||2)+'\n'+quoted(text,160)+(o.oldText?' Before: '+quoted(o.oldText,160)+' The old wording stays in history.':'');}
  else {head='<b>Rule saved:</b> “'+rule+'”';glyph=o.locked?'lock':'check-circle';
   tip='Rule saved\n'+quoted(text,200)+(meta?' '+meta+'.':'');}
  if(o.recorded)tip=S.PMX_COPY.cost.recorded+'\n'+tip.replace('\n',': ');
  return S.pmxLedgerLine({key:o.key,kind:'teach',kindWord:'Teach',cls:'pmx-teach-receipt teach-receipt',glyph,recorded:!!o.recorded,runId:o.arriving?o.id:null,
   headline:'<span class="pmx-teach-rh" data-hover-key="trcpt:'+e(o.key)+'" data-hover-tip="'+e(tip)+'">'+head+'</span>',time:meta?e(meta):'',cost:o.time?e(o.time):'',
   attrs:(o.preview?'':'data-message-id="'+e(o.id)+'"')+(o.arriving?' data-pmx-arrive="1"':''),
   actions:[{action:o.preview?'':'teach-open',attrs:o.preview||!o.memoryId?'':'data-id="'+e(o.memoryId)+'"',label:'View'}]});
 }
 /* consecutive "Rule saved" receipts in one chat read as one line ("3 rules saved"); the records stay appended */
 const eventOf=x=>x.event||(/updated/i.test(x.title||'')?'updated':'saved');
 function savedRun(t,m){
  const list=t?t.messages:[],i=list.findIndex(x=>x.id===m.id);if(i<0)return {first:m,last:m,run:[m]};
  const ok=x=>x&&x.type==='af-teach-receipt'&&x.memoryId&&eventOf(x)==='saved';
  let a=i,b=i;while(a>0&&ok(list[a-1]))a--;while(b<list.length-1&&ok(list[b+1]))b++;
  const run=list.slice(a,b+1);return {first:run[0],last:run[run.length-1],run};
 }
 function sheetPreview(c,d){
  /* what lands in the chat: the next "Rule saved" coalesces with the saves just above it */
  const old=d.narrowOf?get(d.narrowOf):null,t=c.thread,last=t.messages[t.messages.length-1],rep=(d.conflictChoice||'').startsWith('replace:')?get(d.conflictChoice.slice(8)):null;
  let o={key:'pv:teach-receipt',preview:true,event:old?'updated':'saved',text:d.text,mirror:true,scope:d.scope,locked:d.locked!==false,version:old?(old.version||1)+1:1,oldText:old?.text||'',time:hm(now()),recorded:d.provenance==='recorded'};
  if(!old&&rep)o={...o,event:'updated',version:(rep.version||1)+1,oldText:rep.text||''};
  else if(!old&&last&&last.type==='af-teach-receipt'&&last.memoryId&&eventOf(last)==='saved'){
   const run=savedRun(t,last).run,recs=run.map(x=>get(x.memoryId)).filter(Boolean);
   o={...o,count:run.length+1,list:recs.map(x=>x.text).concat(d.text),sameScope:recs.every(x=>scope(x)===d.scope)};}
  /* drawn 1:1 at the tray's width (its narrow tier: kind, headline, View); at Save it is laid out at the chat card's
     width (destW) in the same task, just before the flight is armed, so the clone lands on identical geometry */
  return '<figure class="pmx-teach-inchat" data-k="teach-inchat" data-pmx-preview="1" inert><figcaption class="pmx-fine">In your chat</figcaption>'+
   '<div class="pmx-teach-tray"><div class="pmx-teach-fly" data-pmx-flight-source>'+receiptLine(c,o)+'</div></div></figure>';
 }
 function ruleCard(c,d){
  const e=c.esc,old=d.narrowOf?get(d.narrowOf):null,locked=d.locked!==false,s=d.source,src=s&&s.kind!=='manual';
  const meta=(scopes[d.scope]||d.scope)+' · '+(locked?'locked':'not locked')+(old?' · version '+((old.version||1)+1):'');
  const open=disclosures.has('teach-safety')?disclosures.get('teach-safety'):false;
  const from=src?'<details class="pmx-teach-src" data-k="teach-safety" data-teach-disclosure="teach-safety"'+(open?' open':'')+'><summary class="pmx-teach-sum">'+S.pmxGlyph('chevron-right',13)+'<span>'+e(fromLine(s))+'</span></summary>'+
    '<blockquote class="pmx-teach-quote">“'+e(short(s.excerpt,420))+'”</blockquote></details>':'<p class="pmx-teach-from">'+e(fromLine(s))+'</p>';
  /* presentational state rides on data-state and data-kind, which the leaving sheet's ghost keeps (5.4) */
  return '<div class="pmx-teach-card" data-k="teach-card" data-state="draft">'+
   '<p class="pmx-teach-rule" data-pmx-mirror="teach-rule" data-empty="Your rule shows here as you type.">'+e(d.text)+'</p>'+
   '<p class="pmx-teach-meta" data-state="'+(locked?'locked':'open')+'">'+lockSvg(18)+'<span>'+e(meta)+'</span></p>'+from+'</div>';
 }
 function refusal(d){
  if(!d.error)return '';
  const map={credential_detected:'teach_credential',resolve_related_teaching:'resolve_related_teaching',confirm_nonconfidential_user_scope:'teach_safe_tick',correction_cannot_widen_scope:'teach_widens_scope'};
  const r=map[d.error]&&S.pmxRefusalText?S.pmxRefusalText(map[d.error]):null;
  return S.pmxRefusal({code:d.error,strong:'Can’t save yet.',text:r&&r.text?r.text:explain(d.error)});
 }
 function dialog(c){const d=store().pending;if(!d)return '';const e=c.esc,old=d.narrowOf?get(d.narrowOf):null,isCorrection=!!old,tid=d.context?.threadId;
  const td=tid?'data-thread="'+e(tid)+'"':'';
  /* the examples are inline links in the helper line (not boxed buttons), so the hero keeps its height */
  const tries='<span class="pmx-teach-try"><span>Try:</span><span class="pmx-teach-trylinks">'+TRIES.map(t=>'<button type="button" class="text-button pmx-teach-trylink" data-action="teach-try" data-value="'+e(t)+'">'+e(t)+'</button>').join('')+'</span></span>';
  const hero=S.pmxHero({key:'teach-hero',cls:'pmx-teach-hero',title:isCorrection?'New wording':'Your rule',
   field:{tag:'textarea',rows:3,value:d.text,placeholder:'e.g. Always use pnpm, not npm',attrs:' id="teach-body" data-teach-input="text" maxlength="4000" data-pmx-source="teach-rule" aria-label="Your rule"'},
   helper:isCorrection?'Change the words. The old version stays in history.':tries});
  shown.err=safetyInner(c,d);shown.rel=conflictHtml(c,d);
  const safety='<p id="teach-error" class="pmx-teach-safety" role="status">'+shown.err+'</p>';
  const where=S.pmxQuestion({key:'teach-where',cls:'pmx-teach-where',title:'Where it applies',attrs:d.error==='confirm_nonconfidential_user_scope'?' data-teach-refused="1"':'',body:ringsHtml(c,d)});
  const oldUser=old&&scope(old)==='user';
  const checks='<div class="pmx-teach-checks">'+(!old||oldUser?S.pmxCheck({key:'teach-public',cls:'pmx-teach-check',attrs:'data-teach-input="public"',checked:!!d.allowUserScope,
    label:'It’s safe to use in my other projects',helper:'No private names, links or code. Every project needs this.'}):'')+
   S.pmxCheck({key:'teach-locked',cls:'pmx-teach-check',attrs:'data-action="af-teach-lock"',checked:d.locked!==false,label:'Locked',helper:'Only you can change this rule.'})+'</div>';
  const card=S.pmxQuestion({key:'teach-saved',cls:'pmx-teach-saved',title:'What will be saved',helper:'Exactly this, word for word.',body:ruleCard(c,d)});
  const label=isCorrection?'Save as version '+((old.version||1)+1):(d.conflictChoice||'').startsWith('replace:')?'Save and replace':'Save rule';
  const tip='<p class="pmx-teach-tip">Tip: type <b>/teach</b> in chat · <span class="pmx-teach-persona" data-hover-key="teach-persona" data-hover-tip="Teach isn’t the Teacher Persona\nThe Teacher Persona is a way a helper works: it explains as it goes. Teach saves a rule you wrote, and every reply it applies to gets it.">Teach isn’t the Teacher Persona</span></p>';
  const foot=S.pmxFoot({cls:'pmx-teach-foot',readback:tip,refusal:refusal(d),cancel:{action:'af-teach-cancel',attrs:td},primary:{action:'af-teach-capture',label}});
  return S.pmxSheet({type:'af-teach',kind:'teach',size:'standard',cls:'pmx-teach-sheet',closeAction:'af-teach-cancel',closeAttrs:td,ariaLabel:isCorrection?'Edit your rule':'Teach Puppet Master a rule',
   title:isCorrection?'Edit your rule':'Teach Puppet Master a rule',
   lead:isCorrection?'The old wording stays in history.':'Write it the way you’d tell a teammate. You can change it or turn it off any time.',
   main:hero+safety+where+checks,side:card+sheetPreview(c,d)+'<div id="teach-related">'+shown.rel+'</div>',foot});
 }

 /* ---- after a successful Save only (DON'T 16): the rule card lifts and its shackle closes on the leaving sheet; a
    reader at the bottom of the chat sees the receipt preview fly onto the new receipt (PM56_PMX.handoff), anyone else
    sees the sheet leave with the `save` exit. Focus returns to the control that opened Teach (IMPACT A1-36). */
 function wandTrigger(){return document.querySelector('.composer [data-menu-anchor="wand"], [data-action="open-menu"][data-menu="wand"]');}
 const usable=el=>!!el&&el.isConnected&&!el.disabled&&el.getClientRects().length>0;
 function openerFocus(){const o=opener;return ()=>{
  if(!o)return wandTrigger();
  if(usable(o.el)&&(!o.sel||o.el.matches(o.sel)))return o.el;
  const again=o.sel?[...document.querySelectorAll(o.sel)].find(usable):null;if(again)return again;
  /* an edit replaced the rule it was opened from: the new version's Edit takes its place */
  const next=o.action==='teach-correct'&&savedId?[...document.querySelectorAll('[data-action="teach-correct"][data-id="'+CSS.escape(savedId)+'"]')].find(usable):null;
  return next||wandTrigger();};}
 function seal(locked){
  const X=P();if(!X||X.reduced())return;
  const g=document.querySelector('body > .pmx-ghost .pmx-teach-card');if(!g)return;
  X.animate(g,[{transform:'none'},{transform:'scale(1.02)'}],{duration:X.t('lift'),easing:X.ease('out'),fill:'forwards'});
  const sh=locked&&g.querySelector('.pmx-teach-lock .nx-p, .pmx-teach-shackle');
  if(sh)X.animate(sh,[{transform:'translateY(-3px)'},{transform:'none'}],{duration:X.t('lock'),easing:X.ease('pop'),fill:'forwards'});
 }
 /* the Save runs in one task: the flight is armed (or the save exit is named) before commit(), because commit() appends
    the receipt and that render already removes the sheet; a refused Save cancels both in the same task, so no frame of
    it is ever painted (DON'T 16) */
 let flight=null;
 function capture(c){
  const X=P(),d=store().pending,focus=openerFocus();let armed=false;
  if(X&&d&&!X.reduced()&&c.thread.id===d.context?.threadId){
   const tr=document.querySelector('.assistant-pane .transcript, .transcript'),atBottom=!!(tr&&tr.scrollHeight-tr.scrollTop-tr.clientHeight<24);
   const src=document.querySelector('#pmOverlayRoot .pmx-teach-fly');
   if(atBottom&&src&&src.getClientRects().length){src.style.width=destW+'px';const f=X.handoff.arm({sourceEl:src,atBottom:true});if(f&&!f.none){armed=true;flight={receiptId:null};X.exitHint('start',{focus});}else{X.handoff.cancel();src.style.width='';}}
  }
  if(X&&!armed)X.exitHint('save',{focus});
  const x=commit(request()),fl=flight;flight=null;if(x.ok)savedId=x.id;
  if(!x.ok){
   if(armed){X.handoff.cancel();const src=document.querySelector('#pmOverlayRoot .pmx-teach-fly');if(src)src.style.width='';}if(X)X.exitHint('cancel',{focus});
   if(store().pending)store().pending.error=x.error;c.renderOverlays();update();return x;
  }
  if(armed){if(fl&&fl.receiptId&&!x.reused)X.handoff.land(fl.receiptId,{done:id=>{arriving.delete(id);E.ctx().renderApp();}});else X.handoff.cancel();}
  const rec=get(x.id);c.closeDialog();c.renderApp();
  if(X&&!X.reduced())requestAnimationFrame(()=>seal(!!rec?.locked));
  return x;
 }

 /* ---- the Memory sheet's "Your rules" tab (DESIGN-SPEC 8.10): the taught rules in the receipt grammar, with Edit
    (Teach in correct mode) and Turn off, confirmed inline (G-33), never in a modal. */
 function memoryRows(c){const e=c.esc,tid=c.thread.id,v=views.get(tid)||{},td=' data-thread="'+e(tid)+'"';
  const rows=visibleRecords(context()).slice().reverse().map((r,i)=>{const on=active(r),id=e(r.id);
   return '<div class="pmx-mem-rule" data-k="mrule:'+id+'" data-state="'+(on?'on':'off')+'" style="--i:'+Math.min(i,5)+'"><span class="pmx-mem-rglyph">'+S.pmxGlyph(on?(r.locked?'lock':'check-circle'):'slash-circle',15)+'</span>'+
    '<div class="pmx-mem-rcopy"><p class="pmx-mem-rule-text">'+e(r.text)+'</p><small>'+e(scopes[scope(r)]||r.scope)+' · version '+(r.version||1)+' · <b>'+e(ruleWord(r))+'</b></small></div>'+
    '<div class="pmx-mem-rule-acts">'+(on?'<button type="button" class="text-button" data-action="teach-correct"'+td+' data-id="'+id+'">Edit</button><button type="button" class="text-button" data-action="af-teach-revoke"'+td+' data-value="'+id+'">Turn off</button>':'')+'</div>'+
    (on&&v.revoke?.id===r.id?S.pmxInlineConfirm({key:'mrevoke:'+r.id,cls:'pmx-mem-confirm',sentence:'Stop using this rule? It stays in history, and older versions don’t come back.',
     confirm:{action:'teach-revoke-confirm',attrs:td.trim(),label:'Turn off'},keep:{action:'teach-revoke-cancel',attrs:td.trim(),label:'Keep it'}}):'')+
    (v.notice?.id===r.id?'<p class="pmx-mem-warn pmx-mem-rnote" role="status">'+S.pmxGlyph('warn',13)+'<span>'+e(v.notice.text)+'</span></p>':'')+'</div>';}).join('');
  return '<div class="pmx-mem-rules" data-k="mem-rules">'+(rows||'<p class="pmx-mem-none">No rules yet. Teach one from the wand, or type /teach in the chat.</p>')+
   '<p class="pmx-mem-rules-foot"><button type="button" class="text-button" data-action="af-teach-open"'+td+'>Teach a rule</button><button type="button" class="text-button" data-action="teach-open"'+td+'>See every version</button></p></div>';}
 function visibleRecords(ctx){if(!ctx)return [];return all().filter(r=>{const s=scope(r);if(s==='user')return (r.userId||'concept:user')===ctx.userId;if((r.projectId||'concept:pm')!==ctx.projectId)return false;return s==='project'||(s==='thread'&&r.sourceThreadId===ctx.threadId);});}

 /* ---- the Taught memory document (teach:{tid}): "Your rules" as a pmxView (G-26), Teach's own classes */
 function tdisc(e,key,label,body){const open=disclosures.has(key)?disclosures.get(key):false;
  return '<details class="pmx-teach-disc" data-k="'+e(key)+'" data-teach-disclosure="'+e(key)+'"'+(open?' open':'')+'><summary class="pmx-teach-sum">'+S.pmxGlyph('chevron-right',13)+'<span>'+label+'</span></summary><div class="pmx-teach-disc-body">'+body+'</div></details>';}
 function whyOut(r,ctx){return r.supersededBy?ruleWord(r):r.revoked?'Turned off':!applies(r,ctx)?'It applies in another chat':'';}
 function nextHtml(c,up,ctx){const e=c.esc;
  const li=(glyph,attr,text,sub)=>'<li'+attr+'>'+S.pmxGlyph(glyph,13)+'<span>'+e(text)+'</span>'+(sub?'<small>'+e(sub)+'</small>':'')+'</li>';
  const left=up.excluded.map(x=>get(x.id)).filter(Boolean);
  return '<section class="pmx-teach-next" data-k="teach-preview"><h3 class="pmx-teach-h">What your next message will include</h3><p class="pmx-help">The rules that apply to this chat ride along with every message you send. Nothing is sent until you send one.</p>'+
   '<h4>Rules · '+up.items.length+'</h4>'+(up.items.length?'<ul>'+up.items.map(x=>li('lock',' data-included-teaching="'+e(x.id)+'" data-state="in"',x.text,(scopes[x.scope]||x.scope)+' · version '+x.version)).join('')+'</ul>':'<p class="pmx-teach-none">No rule applies here yet.</p>')+
   (left.length?'<h4>Left out · '+left.length+'</h4><ul>'+left.map(r=>li('slash-circle',' data-state="out"',r.text,whyOut(r,ctx))).join('')+'</ul>':'')+'</section>';}
 function rowHtml(c,r,tid,v,up,ctx,i){
  const e=c.esc,id=e(r.id),td=' data-thread="'+e(tid)+'"',on=active(r),inNext=up.items.some(x=>x.id===r.id),s=r.source||{},src=s.kind&&s.kind!=='manual';
  const acts=(on?'<button type="button" class="text-button" data-action="teach-correct"'+td+' data-id="'+id+'">Edit</button>'+
    '<button type="button" class="text-button" data-action="af-teach-lock"'+td+' data-value="'+id+'">'+(r.locked?'Unlock':'Lock')+'</button>'+
    '<button type="button" class="text-button" data-action="af-teach-revoke"'+td+' data-value="'+id+'">Turn off</button>':'')+
   '<button type="button" class="text-button" data-action="teach-source"'+td+' data-id="'+id+'" aria-expanded="'+(v.source===r.id)+'">'+(src?(s.kind==='assistant_output'?'From the assistant’s reply':'From your message'):'Where it came from')+'</button>';
  const help=on?'<p class="pmx-teach-acts-help">Edit: change the wording; the old one stays in history · '+(r.locked?'Unlock: let suggestions change it':'Lock: locked rules can only be changed by you')+' · Turn off: stop using it</p>':'';
  const source=v.source===r.id?'<div class="pmx-teach-source" data-k="tsrc:'+id+'"><p class="pmx-teach-from">'+e(fromLine(s))+'</p>'+(src?'<blockquote class="pmx-teach-quote">“'+e(short(s.excerpt||r.text,420))+'”</blockquote>':'')+
   (r.sourceMessageId&&messages(r.sourceThreadId).some(m=>m.id===r.sourceMessageId)?'<button type="button" class="text-button" data-action="teach-source-jump" data-id="'+id+'">Open the original message</button>':'<p class="pmx-teach-none">'+(src?'The original message is gone; its words are kept with this version.':'Typed straight into Teach, so there is no message to open.')+'</p>')+'</div>':'';
  const confirm=on&&v.revoke?.id===r.id?S.pmxInlineConfirm({key:'trevoke:'+r.id,cls:'pmx-teach-confirm',sentence:'Stop using this rule? It stays in history, and older versions don’t come back.',
   confirm:{action:'teach-revoke-confirm',attrs:td.trim(),label:'Turn off'},keep:{action:'teach-revoke-cancel',attrs:td.trim(),label:'Keep it'}}):'';
  const notice=v.notice?.id===r.id?'<p class="pmx-teach-warn" role="status">'+S.pmxGlyph('warn',13)+'<span>'+e(v.notice.text)+'</span></p>':'';
  const prev=r.supersedes?get(r.supersedes):null;
  const details=tdisc(e,'ver:'+r.id,'Version details','<dl class="pmx-teach-dl"><dt>Saved</dt><dd>'+e(when(r.createdAt)||'In this session')+'</dd>'+
   '<dt>Replaces</dt><dd>'+e(prev?'Version '+(prev.version||1)+': “'+short(prev.text,80)+'”':'Nothing: this is the first version')+'</dd>'+
   '<dt>Your next message</dt><dd>'+e(inNext?'Includes it':'Leaves it out: '+(whyOut(r,ctx)||'it doesn’t apply here').toLowerCase())+'</dd>'+
   '<dt>Its check</dt><dd>'+e(checkFor(r)?checkFor(r).statement+' Replies it applies to show whether they followed it.':'None: its wording has no clear test, so replies show no Followed or Missed for it.')+'</dd>'+
   (r.revoked_at?'<dt>Turned off</dt><dd>'+e(when(r.revoked_at))+'</dd>':'')+'</dl>');
  return '<section class="pmx-teach-row" data-k="teach:'+id+'" data-teaching="'+id+'" data-state="'+(on?'on':'off')+'" style="--i:'+Math.min(i,5)+'">'+
   '<span class="pmx-teach-rglyph">'+S.pmxGlyph(on?(r.locked?'lock':'check-circle'):'slash-circle',15)+'</span>'+
   '<div class="pmx-teach-rcopy"><p class="pmx-teach-rtext">'+e(r.text)+'</p><p class="pmx-teach-rmeta"><b>'+e(ruleWord(r))+'</b> · '+e(scopes[scope(r)]||r.scope)+' · version '+(r.version||1)+(r.createdAt?' · saved '+e(hm(r.createdAt)):'')+'</p>'+
    (r.provenance==='recorded'?'<p class="pmx-teach-prov">'+S.pmxGlyph('play-ring',13)+'<span>'+e(S.PMX_COPY.cost.recorded)+'</span></p>':'')+
    '<div class="pmx-teach-racts">'+acts+'</div>'+help+notice+confirm+source+details+'</div></section>';
 }
 function techHtml(c,records){const e=c.esc;
  return '<p class="pmx-teach-tech">Save rule, Save and replace and Save as version 2 run cmd.chat.teach.confirm. Here that action is af-teach-capture: canon calls opening Teach “capture” (Teach…, /teach, “remember that…”, Save as a rule…, Teach a rule, Edit: cmd.chat.teach.capture, mode correct for an edit).</p>'+
   '<p class="pmx-teach-tech">Cancel, ×, Escape and the scrim: cmd.chat.teach.cancel · View on a receipt: cmd.chat.teach.open_memory · See what your next message will include: cmd.chat.memory.preview_capsule · Lock / Unlock and Turn off: new command requests cmd.chat.teach.set_lock and cmd.chat.teach.revoke · Export: new command request cmd.chat.memory.export {scope} (N-7, owner answer E-32; a local file in this concept).</p>'+
   '<p class="pmx-teach-tech">/teach and “remember that…” open this sheet prefilled wherever you type them; there is no capture card in the chat (owner answer E-12). Followed / Missed on a reply: each rule’s check (its testable statement) is compared with the finished reply, here by plain word cues with no AI (owner answer E-36); a rule with no check gets no tick. Ask for a fix only fills the message box.</p>'+
   '<p class="pmx-teach-tech">Kept in this session only. The safety check is a local password-and-key pattern check; saving a rule asks no AI anything.</p>'+
   (records.length?'<p class="pmx-teach-tech">Rules: '+records.slice().reverse().map(r=>e(r.id)+' (version '+(r.version||1)+(r.provenance==='recorded'?', recorded':'')+')').join(' · ')+'</p>':'');
 }
 function history(c,tid){
  const e=c.esc,ctx=context(tid),td=' data-thread="'+e(tid)+'"';
  if(!ctx)return S.pmxView({key:'teach-doc:'+tid,cls:'teach-document pmx-teach-doc',kind:'teach',kindWord:'Teach',title:'Your rules',statusHtml:'The chat these rules belong to no longer exists.'});
  const v=views.get(tid)||{},records=visibleRecords(ctx),chosen=records.find(r=>r.id===v.id),chain=chosen?records.filter(r=>(r.rootId||r.id)===(chosen.rootId||chosen.id)):records,up=preview(ctx);
  const inUse=records.filter(active).length;
  const status='<b>'+inUse+' in use</b> · '+records.length+(records.length===1?' version':' versions');
  const acts='<button type="button" class="text-button" data-action="af-teach-open"'+td+'>Teach a rule</button>'+
   '<button type="button" class="text-button" data-action="teach-preview"'+td+' aria-pressed="'+!!v.preview+'">'+(v.preview?'Hide what your next message includes':'See what your next message will include')+'</button>'+
   '<button type="button" class="text-button pmx-teach-export" data-action="teach-export"'+td+'>'+S.pmxGlyph('download',14)+'<span>Export</span></button>';
  const bar=chosen?'<p class="pmx-teach-docbar"><span>Showing “'+e(short(chosen.text,60))+'” and its versions.</span><button type="button" class="text-button" data-action="teach-open"'+td+'>Show every rule</button></p>':'';
  const guide=window.PM56_TEACH_DEMOS?.editorGuide(tid)||'';
  const rows=chain.length?chain.slice().reverse().map((r,i)=>rowHtml(c,r,tid,v,up,ctx,i)).join(''):'<p class="pmx-teach-none">No rules yet. Teach a rule, or type /teach in the chat.</p>';
  const foot='<p class="pmx-teach-persona-line"><span data-hover-key="teach-persona-doc" data-hover-tip="Teach isn’t the Teacher Persona\nThe Teacher Persona is a way a helper works: it explains as it goes. Teach saves a rule you wrote.">Teach isn’t the Teacher Persona.</span> Saving a rule asks no AI anything.</p>'+
   tdisc(e,'tech:'+tid,'Technical details',techHtml(c,records));
  return S.pmxView({key:'teach-doc:'+tid,cls:'teach-document pmx-teach-doc',kind:'teach',kindWord:'Teach',title:'Your rules',statusHtml:status,actionsHtml:acts,tabsHtml:bar,
   mainHtml:guide+(v.preview?nextHtml(c,up,ctx):'')+'<div class="pmx-teach-rows" data-k="teach-rows">'+rows+'</div>'+foot});
 }
 function show(id){const c=E.ctx(),r=get(id),tid=c.thread.id;if(r&&!visibleRecords(context()).includes(r))return fail('outside_scope');views.set(tid,{...views.get(tid),id:r?.id||null,revoke:null,notice:null});c.closeDialog();c.closeMenu();c.state.editorRevealed=true;c.openEditor('teach:'+tid);return {ok:true};}
 function receiptActions(c,m){return '<button type="button" class="text-button" data-action="teach-open" data-id="'+c.esc(m.memoryId)+'">View</button>';}
 function notice(tid,id,error){views.set(tid,{...views.get(tid),notice:{id,text:explain(error)}});}

 /* ---- actions (MUST-KEEP names; teach-try is the one new action: draft state, registered once) */
 E.chainAction('af-teach-open',(c,b)=>{openerHint=b;if(documentTarget(c,b))open();openerHint=null;return true;});E.chainAction('af-teach-narrow',(c,b)=>{openerHint=b;correction(b.dataset.value);openerHint=null;return true;});
 E.chainAction('af-teach-set-scope',(c,b)=>{const d=store().pending;if(d&&scopes[b.dataset.value]){const old=d.narrowOf?get(d.narrowOf):null,k=b.dataset.value;
  if(old&&!(k===scope(old)||(scope(old)==='project'&&k==='thread')))return true;d.scope=k;d.conflictChoice=null;d.error=null;c.renderOverlays();update();}return true;});
 E.chainAction('af-teach-cancel',c=>{if(P())P().exitHint('cancel',{focus:openerFocus()});store().pending=null;c.closeDialog();return true;});
 E.chainAction('af-teach-capture',c=>{capture(c);return true;});
 E.action('teach-conflict',(c,b)=>{if(store().pending){store().pending.conflictChoice=b.dataset.choice;store().pending.error=null;c.renderOverlays();update();}return true;});
 E.action('teach-try',(c,b)=>{const f=document.getElementById('teach-body');if(!f||!store().pending)return true;f.value=b.dataset.value||'';f.dispatchEvent(new Event('input',{bubbles:true}));
  try{f.focus({preventScroll:true});f.setSelectionRange(f.value.length,f.value.length);}catch(err){}return true;});
 E.action('teach-open',(c,b)=>{if(documentTarget(c,b))show(b.dataset.id);return true;});E.action('teach-correct',(c,b)=>{openerHint=b;if(documentTarget(c,b))correction(b.dataset.id);openerHint=null;return true;});
 /* the sheet's Locked tick (no data-value) sets the draft; a rule's Lock / Unlock (data-value) changes the record,
    and a refusal is said in that rule's row (no toast-only result, DON'T 15) */
 E.chainAction('af-teach-lock',(c,b)=>{const d=store().pending;
  if(!b.dataset.value&&d&&c.state.dialog?.type==='af-teach'){d.locked=!(d.locked!==false);d.error=null;c.renderOverlays();return true;}
  if(!documentTarget(c,b))return true;const x=lock(mutationRequest(b.dataset.value)),tid=E.ctx().thread.id;
  if(!x.ok)notice(tid,b.dataset.value,x.error);else views.set(tid,{...views.get(tid),notice:null});c.renderApp();return true;});
 /* From the Memory sheet the confirmation stays in that sheet's rule row; elsewhere it opens the Taught memory document. */
 E.chainAction('af-teach-revoke',(c,b)=>{if(!documentTarget(c,b))return true;if(E.ctx().state.dialog?.type!=='af-memory')show(b.dataset.value);const tid=E.ctx().thread.id;views.set(tid,{...views.get(tid),revoke:mutationRequest(b.dataset.value),notice:null});c.renderApp();return true;});
 E.action('teach-revoke-cancel',(c,b)=>{views.set(b.dataset.thread,{...views.get(b.dataset.thread),revoke:null});c.renderApp();return true;});
 E.action('teach-revoke-confirm',(c,b)=>{if(!documentTarget(c,b))return true;const v=views.get(b.dataset.thread),x=revoke(v?.revoke);views.set(b.dataset.thread,{...v,revoke:null,notice:null});if(!x.ok&&v?.revoke)notice(b.dataset.thread,v.revoke.id,x.error);c.renderApp();return true;});
 E.action('teach-preview',(c,b)=>{views.set(b.dataset.thread,{...views.get(b.dataset.thread),preview:!views.get(b.dataset.thread)?.preview});c.renderApp();return true;});
 E.action('teach-source',(c,b)=>{const tid=b.dataset.thread||c.thread.id;if(!context(tid))return true;views.set(tid,{...views.get(tid),source:views.get(tid)?.source===b.dataset.id?null:b.dataset.id});c.renderApp();return true;});
 E.action('teach-source-jump',(c,b)=>{const r=get(b.dataset.id);if(r?.sourceMessageId){c.switchThread(r.sourceThreadId);c.state.editorRevealed=false;c.renderApp();requestAnimationFrame(()=>document.querySelector('[data-message-id="'+CSS.escape(r.sourceMessageId)+'"]')?.scrollIntoView({block:'center'}));}return true;});
 function exportHistory(tid){const ctx=context(tid);if(!ctx)return null;return JSON.stringify({kind:'concept_taught_memory',threadId:ctx.threadId,projectId:ctx.projectId,records:visibleRecords(ctx),preview:preview(ctx)},null,2);}
 E.action('teach-export',(c,b)=>{const data=exportHistory(b.dataset.thread||c.thread.id);if(data===null){c.toast('Rules unavailable','The chat these rules belong to no longer exists.');return true;}const url=URL.createObjectURL(new Blob([data],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='taught-memory.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);return true;});
 E.action('teach-from-message',(c,b)=>{openerHint=b;const tid=b.dataset.thread||c.thread.id,m=messages(tid).find(m=>m.id===b.dataset.value);if(safeMessage(m))open({text:m.body,sourceThreadId:tid,sourceMessageId:m.id});openerHint=null;return true;});
 document.addEventListener('input',e=>{const k=e.target.dataset?.teachInput,d=store().pending;if(!k||!d)return;
  const hadErr=!!d.error,hadChoice=!!d.conflictChoice;
  if(k==='text'){d.text=e.target.value;d.conflictChoice=null;}if(k==='public')d.allowUserScope=e.target.checked;d.error=null;
  /* a discrete flip (the safe tick, a cleared refusal or choice) re-renders once; typing only patches the two slots */
  if(k==='public'||hadErr||hadChoice)E.ctx().renderOverlays();update();});
 document.addEventListener('toggle',ev=>{const n=ev.target;if(n.isConnected&&n.matches?.('details[data-teach-disclosure]'))disclosures.set(n.dataset.teachDisclosure,n.open);},true);

 /* ---- in the chat */
 E.slot('transcriptFamily',c=>c.m?.type==='af-teach-receipt'?'ledger':'');
 E.slot('transcriptMessage',c=>{const m=c.m;if(m?.type!=='af-teach-receipt'||!m.memoryId)return '';
  const r=get(m.memoryId),event=eventOf(m);
  if(event==='saved'){
   const {first,last,run}=savedRun(c.t,m);
   /* one line for a run of saves: the earlier items render nothing (one space, which the transcript skips) */
   if(run.length>1){if(m.id!==last.id)return ' ';const recs=run.map(x=>get(x.memoryId)).filter(Boolean),sc=recs[0]?scope(recs[0]):'';
    const arr=run.find(x=>arriving.has(x.id));
    return receiptLine(c,{key:'teach-receipt:'+first.id,id:arr?arr.id:first.id,memoryId:'',event:'saved',count:run.length,list:recs.map(x=>x.text),scope:sc,sameScope:recs.every(x=>scope(x)===sc),
     time:hm(last.time),recorded:recs.length>0&&recs.every(x=>x.provenance==='recorded'),arriving:!!arr});}
  }
  const prev=r?.supersedes?get(r.supersedes):null;
  return receiptLine(c,{key:'teach-receipt:'+m.id,id:m.id,memoryId:m.memoryId,event,text:r?r.text:(m.detail||''),scope:r?scope(r):'',locked:!!r?.locked,version:m.version||r?.version||1,
   oldText:event==='updated'?(prev?.text||''):'',time:hm(m.time),recorded:r?.provenance==='recorded',arriving:arriving.has(m.id)});
 });
 /* the reply tick (owner answer E-36): "Followed N of your rules" when every judged rule passed its check; "Missed N of
    your rules" when any failed, with [Ask for a fix] beside it; nothing when no rule could be judged. The hover card
    explains the check in one sentence and names the rules. */
 const TICK={followed:n=>'Followed '+n+' of your rules',missed:n=>'Missed '+n+' of your rules'};
 const lowerFirst=t=>/^[A-Z][a-z]/.test(t)?t[0].toLowerCase()+t.slice(1):t;
 const unstop=t=>String(t||'').replace(/[.!]+$/,'');
 function tickTip(text,judged,missed){
  const one=judged.length===1,x=judged[0];
  const say=one?(missed.length?'The finished reply didn’t pass your rule’s check: ':'The finished reply passed your rule’s check: ')+lowerFirst(unstop(x.check))+'.':
   'Each rule’s check compares what the rule asks for with the finished reply; '+(missed.length?missed.length+' of '+judged.length+' didn’t pass.':'all '+judged.length+' passed.');
  const list=one?'Your rule: '+quoted(x.text,140):judged.slice(0,4).map(r=>(r.result==='missed'?'Missed: ':'Followed: ')+quoted(r.text,70)).join('\n')+(judged.length>4?'\nand '+(judged.length-4)+' more':'');
  return text+'\n'+say+'\n'+list+(missed.length?'\nAsk for a fix puts a request in your message box. Nothing is sent until you press Send.':'');
 }
 E.slot('messageMeta',c=>{const m=c.message;if(!m||m.role!=='assistant')return '';const u=used.get(m.id);if(!u||!u.length)return '';const e=c.esc;
  const judged=u.filter(x=>x.result),missed=judged.filter(x=>x.result==='missed');if(!judged.length)return '';
  const text=missed.length?TICK.missed(missed.length):TICK.followed(judged.length),tip=tickTip(text,judged,missed);
  const tick=S.pmxTick({key:'ttick:'+m.id,cls:'pmx-teach-tick',glyph:missed.length?'warn':'check-circle',text:e(text),
   attrs:'data-state="'+(missed.length?'missed':'followed')+'" data-hover-key="ttick:'+e(m.id)+'" data-hover-tip="'+e(tip)+'" aria-label="'+e(text)+'"'});
  return missed.length?'<span class="pmx-teach-verdict" data-k="tverdict:'+e(m.id)+'">'+tick+'<button type="button" class="text-button pmx-teach-fix" data-action="teach-ask-fix" data-id="'+e(m.id)+'" data-thread="'+e(c.thread?.id||'')+'">Ask for a fix</button></span>':tick;
 });
 /* [Ask for a fix]: a plain request naming the missed rules goes into the message box of the reply's chat (after any
    draft already there), focused, and nothing is sent until the person presses Send */
 function fixText(m,missed){const t=hm(m.time||m.at||'');
  return 'Your reply'+(t?' at '+t:'')+' missed '+(missed.length===1?'my rule '+quoted(missed[0].text,200):missed.length+' of my rules: '+missed.map(x=>'“'+short(x.text,120)+'”').join(' and ')+'.')+' Please fix it so it follows '+(missed.length===1?'the rule.':'them.');}
 E.action('teach-ask-fix',(c,b)=>{const id=b.dataset.id,t=c.state.threads.find(x=>x.messages?.some(m=>m.id===id)),u=used.get(id);if(!t||!u)return true;
  const m=t.messages.find(x=>x.id===id),missed=u.filter(x=>x.result==='missed');if(!missed.length)return true;
  if(c.thread.id!==t.id)c.switchThread(t.id);
  const x=E.ctx(),ask=fixText(m,missed),prev=String(x.state.composer||'').trim(),text=prev&&!prev.includes(ask)?prev+'\n\n'+ask:ask;
  x.state.composer=text;if(x.state.drafts)x.state.drafts[t.id]=text;
  const buf=window.PM56_RUNTIME.composer.bufferFor?.(t.id);if(buf){buf.text=text;buf.revision=(buf.revision||0)+1;}
  x.renderApp();
  const ta=document.querySelector('textarea[data-input="composer"]');if(ta){if(ta.value!==text)ta.value=text;ta.focus();try{ta.setSelectionRange(text.length,text.length);}catch(err){}}
  return true;});
 E.slot('editorTabLabel',c=>c.editorId?.startsWith('teach:')?'Your rules':'');E.slot('editorDocument',c=>c.editorId?.startsWith('teach:')?history(c,c.editorId.slice(6)):'');
 window.PM56_MSG_OVERFLOW?.register((c,m)=>safeMessage(m)?[{id:'teach-selected-message',label:'Save as a rule…',detail:'Opens Teach with this message. Nothing is saved until you press Save rule.',icon:'lock',action:'teach-from-message',value:m.id}]:null);
 E.chainAction('close-dialog',()=>{if(E.ctx().state.dialog?.type==='af-teach'){if(P())P().exitHint('cancel',{focus:openerFocus()});store().pending=null;}return false;});
 // Explicit Teach uses normal composer input, without fabricating an assistant answer.
 const composer=window.PM56_RUNTIME.composer;
 const TEACH_RX=/^\s*\/teach\b|^\s*(?:remember (?:this|that)|for (?:this repo|this project) always|please prefer)\b/i;
 /* the rule is the sentence without its trigger: "/teach", "remember this/that" go; "for this project always" keeps
    "Always", "please prefer" keeps "Prefer"; the first letter is capitalised. The message itself stays in the chat as sent. */
 function ruleFrom(raw){
  let t=String(raw||'').replace(/^\s*\/teach\b[\s:,-]*/i,'').replace(/^\s*remember (?:this|that)\b[\s:,-]*/i,'')
   .replace(/^\s*for (?:this repo|this project) always\b[\s:,-]*/i,'Always ').replace(/^\s*please (prefer)\b/i,'$1');
  t=t.trim();return t?t[0].toUpperCase()+t.slice(1):t;
 }
 function fromComposer(c,t,raw){
  const message={id:uid('instruction'),role:'user',type:'text',body:raw,time:now(),teachHandled:true};
  c.appendMessage(message,t);return open({text:ruleFrom(raw),scope:'thread',sourceThreadId:t.id,sourceMessageId:message.id});
 }
 composer.preSendHooks.unshift((c,t,raw)=>{
  const dest=composer.bufferFor(t.id).destination||composer.destination;
  if(dest&&dest.kind!=='assistant')return false;
  if(!TEACH_RX.test(raw))return false;
  fromComposer(c,t,raw);return {claimed:true};
 });
 E.chainAction('reset-all',()=>{epoch++;views.clear();receipts.clear();used.clear();arriving.clear();disclosures.clear();opener=null;openerHint=null;savedId=null;shown={err:null,rel:null};return false;});
 window.PM56_TEACH={open,request,commit,correction,mutationRequest,revoke,lock,context,applies,preview,related,get,all,active,dialog,memoryRows,show,receiptActions,exportHistory,status,sourceValid,visibleRecords,
  provenance,markRecorded,noteReply,fromComposer,usedFor:id=>used.has(id)?clone(used.get(id)):null,registerCheck,checkOf,checkFor:id=>clone(checkFor(get(id))),judge,
  revoking:tid=>views.get(tid)?.revoke?.id||null,showPreview:(tid,on)=>{views.set(tid,{...views.get(tid),preview:!!on});}};
})();
