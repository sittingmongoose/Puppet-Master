/* Context Lens local protocol. The caller supplies canonical source records.
 * Exact byte comparisons are freshness guards, not cryptographic security.
 * Session-only concept state; no provider, memory, storage or native commands. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PM56_LENS_ENGINE=api;})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 const copy=x=>JSON.parse(JSON.stringify(x));
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 const fail=error=>({ok:false,error,reason:error});
 const MAX_PER_OP=25, MAX_SUMMARY_CHARS=6000;
 const token=m=>JSON.stringify([m.id,m.body,m.revision??null,m.version??null,m.attachments??null,m.sourceRefs??null,m.revoked??false,m.status??null]);
 const one=(f,id)=>{const found=f.messages.filter(m=>m.id===id);return found.length===1?found[0]:null;};
 const eligible=m=>m&&m.type==='text'&&typeof m.body==='string'&&!m.revoked&&!['revoked','deleted'].includes(m.status);
 class Engine {
  constructor(read){if(typeof read!=='function')throw Error('source reader required');this.read=read;this.states=new Map();this.seq=0;this.receipts=[];}
  frame(tid){const t=this.read(tid);return t?{threadId:t.id,projectId:t.projectId??t.project_id??null,epoch:t.epoch??0,messages:t.messages||[]}:null;}
  scope(f){return JSON.stringify([f.threadId,f.projectId,f.epoch]);}
  state(tid){if(!this.states.has(tid))this.states.set(tid,{mode:'off',picking:false,selection:[],ops:[],revision:0,preview:null,history:[],scope:null});return this.states.get(tid);}
  record(tid,kind,fields={}){const r=freeze({id:'lens-receipt-'+(++this.seq),threadId:tid,kind,...copy(fields)});this.receipts.push(r);return r;}
  binding(f,ids){return ids.map(id=>{const m=one(f,id);return eligible(m)?{id,token:token(m)}:null;});}
  match(f,refs){return refs.every(ref=>{const m=one(f,ref.id);return eligible(m)&&token(m)===ref.token;});}
  refresh(tid){const s=this.state(tid),f=this.frame(tid);if(!f){s.mode='off';s.picking=false;s.selection=[];for(const o of [...s.ops,...s.history,s.preview].filter(Boolean)){o.status='stale';o.reason='thread_missing';o.summary='Source unavailable or revoked. Preview withheld.';o.excerpts=[];o.redacted=true;}return s;}
   if(s.scope!==null&&s.scope!==this.scope(f)){s.ops.forEach(o=>{o.status='stale';o.reason='scope_changed';});s.selection=[];if(s.preview)s.preview.status='stale';s.revision++;s.mode='off';s.picking=false;}
   s.scope=this.scope(f);
   for(const o of s.ops){if(o.status==='active'&&!this.match(f,o.sources)){o.status='stale';o.reason='source_changed';s.revision++;this.record(tid,'operation_invalidated',{operationId:o.id,reason:o.reason});}}
   const before=s.selection.length;s.selection=s.selection.filter(id=>eligible(one(f,id)));if(before!==s.selection.length)s.revision++;
   if(s.preview&&s.preview.status==='ready'&&(s.preview.scope!==s.scope||s.preview.shapingRevision!==s.revision||!this.match(f,s.preview.sources))){s.preview.status='stale';s.preview.reason='source_or_shaping_changed';}
   // Revocation must not keep a source excerpt inspectable through Lens history.
   for(const o of [...s.ops,...s.history,s.preview].filter(Boolean))if(o.sources?.some(ref=>!eligible(one(f,ref.id)))){o.summary='Source unavailable or revoked. Preview withheld.';o.excerpts=[];o.redacted=true;}
   return s;
  }
  snapshot(tid){return copy(this.refresh(tid));}
  bump(s){s.revision++;if(s.preview&&s.preview.status==='ready'){s.preview.status='stale';s.preview.reason='shaping_changed';}}
  setMode(tid,mode){if(!['mute','focus','subcompact','off'].includes(mode))return fail('invalid_mode');if(!this.frame(tid))return fail('thread_missing');if(mode==='off')return this.releaseAll(tid);const s=this.refresh(tid);if(s.mode!==mode){s.selection=[];s.mode=mode;this.bump(s);}s.picking=true;return {ok:true};}
  operation(tid,id){return this.refresh(tid).ops.find(o=>o.id===id)||null;}
  covers(tid,id){return this.refresh(tid).ops.find(o=>o.status==='active'&&o.ids.includes(id))||null;}
  toggle(tid,id){const s=this.refresh(tid),f=this.frame(tid);if(!f||!eligible(one(f,id)))return fail('source_unavailable');if(s.mode==='off')return fail('off');if(this.covers(tid,id))return fail('sealed');const i=s.selection.indexOf(id);if(i<0&&s.selection.length>=MAX_PER_OP)return fail('cap');if(i<0)s.selection.push(id);else s.selection.splice(i,1);this.bump(s);return {ok:true,on:i<0};}
  clear(tid){const s=this.refresh(tid);s.selection=[];this.bump(s);return {ok:true};}
  seal(tid){const s=this.refresh(tid),f=this.frame(tid);if(!['mute','focus'].includes(s.mode))return fail('mode');if(!s.selection.length)return fail('empty');const ids=f.messages.filter(m=>s.selection.includes(m.id)).map(m=>m.id);const op={id:'lensop-'+(++this.seq),mode:s.mode,ids,sources:this.binding(f,ids),scope:s.scope,status:'active',rehydrated:false};s.ops.push(op);s.selection=[];s.picking=false;this.bump(s);this.record(tid,'sealed',{operationId:op.id,count:ids.length});return {ok:true,count:ids.length,operationId:op.id};}
  preview(tid){const s=this.refresh(tid),f=this.frame(tid);if(s.mode!=='subcompact')return fail('mode');if(!s.selection.length)return fail('empty');if(s.selection.length>MAX_PER_OP)return fail('cap');const ids=f.messages.filter(m=>s.selection.includes(m.id)&&eligible(m)).map(m=>m.id);if(ids.length!==s.selection.length)return fail('source_unavailable');
   const allowance=Math.max(32,Math.floor((MAX_SUMMARY_CHARS-ids.length*30)/ids.length));
   const excerpts=ids.map((id,i)=>{const m=one(f,id);const text=m.body.length<=allowance?m.body:m.body.slice(0,allowance-1)+'…';return {id,label:'Source '+(i+1),text,sourceCharacters:m.body.length,omittedCharacters:Math.max(0,m.body.length-allowance+1)};});
   const p={id:'lens-preview-'+(++this.seq),summaryId:'lens-summary-'+this.seq,status:'ready',scope:s.scope,shapingRevision:s.revision,ids,sources:this.binding(f,ids),summary:excerpts.map(e=>e.label+': '+e.text).join('\n\n'),excerpts,omittedCharacters:excerpts.reduce((a,e)=>a+e.omittedCharacters,0),sourceCharacters:excerpts.reduce((a,e)=>a+e.sourceCharacters,0),method:'bounded_source_excerpts_not_model_summary'};
   s.preview=p;this.record(tid,'previewed',{previewId:p.id,count:ids.length});return {ok:true,preview:copy(p)};
  }
  apply(tid,previewId){const s=this.refresh(tid),f=this.frame(tid);const existing=s.ops.find(o=>o.previewId===previewId);if(existing)return existing.status==='active'?{ok:true,reused:true,operationId:existing.id,count:existing.ids.length}:fail('applied_source_stale');const p=s.preview;if(!p||p.id!==previewId)return fail('preview_missing');if(p.status!=='ready'||p.scope!==this.scope(f)||p.shapingRevision!==s.revision||!this.match(f,p.sources))return fail('stale_preview');
   const op={...copy(p),id:'lensop-'+(++this.seq),previewId:p.id,mode:'subcompact',status:'active',rehydrated:false};s.ops.push(op);s.history.push({...copy(p),status:'applied',operationId:op.id});s.preview=null;s.selection=[];s.picking=false;this.bump(s);this.record(tid,'applied',{operationId:op.id,previewId,count:op.ids.length});return {ok:true,count:op.ids.length,operationId:op.id};
  }
  cancel(tid){const s=this.refresh(tid);if(s.preview){s.history.push({...copy(s.preview),status:'cancelled'});this.record(tid,'preview_cancelled',{previewId:s.preview.id});s.preview=null;}return {ok:true};}
  rehydrate(tid,id,on){const o=this.operation(tid,id);if(!o||o.status!=='active')return fail('operation_stale');o.rehydrated=!!on;this.bump(this.state(tid));this.record(tid,on?'rehydrated':'collapsed',{operationId:id});return {ok:true};}
  release(tid,id){const s=this.refresh(tid),i=s.ops.findIndex(o=>o.id===id);if(i<0)return fail('operation_missing');const [o]=s.ops.splice(i,1);s.history.push({...copy(o),status:'released'});this.bump(s);this.record(tid,'released',{operationId:id,count:o.ids.length});return {ok:true,count:o.ids.length};}
  releaseAll(tid){const s=this.refresh(tid),ids=new Set([...s.ops.filter(o=>o.status==='active').flatMap(o=>o.ids),...(['mute','focus'].includes(s.mode)?s.selection:[])]),count=s.ops.length;for(const o of s.ops)s.history.push({...copy(o),status:'released'});if(s.preview)s.history.push({...copy(s.preview),status:'cancelled'});s.ops=[];s.preview=null;s.selection=[];s.mode='off';s.picking=false;this.bump(s);this.record(tid,'turned_off',{operations:count,messages:ids.size});return {ok:true,ops:count,messages:ids.size};}
  stateOf(tid,id){const s=this.refresh(tid),o=this.covers(tid,id);if(o)return o.mode==='subcompact'?(o.rehydrated?'source':'subcompacted'):o.mode==='mute'?'muted':'focused';return s.selection.includes(id)?({mute:'muted',focus:'focused'}[s.mode]||null):null;}
  effective(tid){const f=this.frame(tid),s=this.refresh(tid);if(!f)return [];const out=[],seen=new Set(),byId=new Map(),duplicates=new Set();for(const m of f.messages){if(byId.has(m.id))duplicates.add(m.id);byId.set(m.id,m);}const ops=new Map();for(const o of s.ops.filter(o=>o.status==='active'))for(const id of o.ids)ops.set(id,o);const selected=new Set(s.selection);for(const m of f.messages){if(duplicates.has(m.id))continue;if(!eligible(m)){if(m.type!=='text')out.push({id:m.id,kind:'system'});continue;}const op=ops.get(m.id),mode=op?op.mode:(selected.has(m.id)?s.mode:null);if(mode==='mute')continue;if(mode==='subcompact'&&op&&!op.rehydrated){if(!seen.has(op.id)){seen.add(op.id);out.push({id:op.summaryId,kind:'summary',body:op.summary,summaryOf:op.ids.slice(),rehydrate:op.ids.slice(),sourceRefs:copy(op.sources),coverage:op.omittedCharacters?'excerpted':'full'});}continue;}out.push({id:m.id,kind:'message',body:m.body,priority:mode==='focus'?'high':'normal',protected:mode==='focus',rehydratedFrom:op?.rehydrated?op.id:null});}return out;}
  fork(sourceTid,targetTid){const from=this.refresh(sourceTid),f=this.frame(targetTid);if(!f)return fail('thread_missing');const s=this.state(targetTid);s.scope=this.scope(f);s.mode=from.mode;s.picking=false;s.selection=[];s.preview=null;s.ops=from.ops.filter(o=>o.status==='active'&&this.match(f,o.sources)).map(o=>({...copy(o),id:'lensop-'+(++this.seq),previewId:null,scope:s.scope,origin:{threadId:sourceTid,operationId:o.id}}));s.revision++;this.record(targetTid,'branch_shaping_copied',{sourceTid,count:s.ops.length,pendingPreviewInherited:false});return {ok:true};}
  reset(){this.states.clear();this.receipts=[];/* Do not reuse IDs after reset. */}
 }
 return {Engine,MAX_PER_OP,MAX_SUMMARY_CHARS,eligible};
});
