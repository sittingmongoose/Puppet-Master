/* Attachment owner: explicit selected-file/folder snapshot preparation.
 * Bytes live in the existing shared Artifact revision owner after commit. File
 * objects are transient input handles, not a second storage system. Session only.
 * Local concept bounds are disclosed; no recursive OS access or scan is implied. */
(function(){
'use strict';
const E=PM56_EXT,A=PM56_ARTIFACTS,AT=PM56_ATTACHMENTS,TX=PM56_TX;
const clone=x=>JSON.parse(JSON.stringify(x)),bad=(error,detail)=>({ok:false,error,detail:detail||error.replaceAll('_',' ')});
const MAX_FILE=16*1024*1024,MAX_TOTAL=32*1024*1024,MAX_FILES=256;
const enc=new TextEncoder(),esc=x=>E.ctx().esc(String(x??''));
// SHA-256 on exact bytes, with no text/line-ending normalization. Tests compare
// binary, Unicode, empty and multi-block inputs to independently computed hashes.
function sha256(input){
 const u=input instanceof Uint8Array?input:enc.encode(String(input));
 const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 const size=Math.ceil((u.length+9)/64)*64,bytes=new Uint8Array(size);bytes.set(u);bytes[u.length]=128;
 const view=new DataView(bytes.buffer),bits=BigInt(u.length)*8n;view.setUint32(size-8,Number(bits>>32n));view.setUint32(size-4,Number(bits&0xffffffffn));
 let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];const W=new Uint32Array(64),rot=(x,n)=>(x>>>n)|(x<<(32-n));
 for(let at=0;at<size;at+=64){for(let i=0;i<16;i++)W[i]=view.getUint32(at+4*i);for(let i=16;i<64;i++){const x=W[i-15],y=W[i-2];W[i]=(W[i-16]+(rot(x,7)^rot(x,18)^(x>>>3))+W[i-7]+(rot(y,17)^rot(y,19)^(y>>>10)))>>>0;}
  let [a,b,c,d,e,f,g,h]=H;for(let i=0;i<64;i++){const t1=(h+(rot(e,6)^rot(e,11)^rot(e,25))+((e&f)^(~e&g))+K[i]+W[i])>>>0,t2=((rot(a,2)^rot(a,13)^rot(a,22))+((a&b)^(a&c)^(b&c)))>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;}H=H.map((x,i)=>(x+[a,b,c,d,e,f,g,h][i])>>>0);
 }return H.map(x=>x.toString(16).padStart(8,'0')).join('');
}
function base64(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);}
function unbase64(s){
 if(typeof s!=='string'||s.length>Math.ceil(MAX_FILE/3)*4||s.length%4!==0)throw Error('invalid_snapshot_encoding');
 const at=s.indexOf('='),body=at<0?s:s.slice(0,at),padding=at<0?'':s.slice(at);
 if(/[^A-Za-z0-9+/]/.test(body)||padding&&!['=','=='].includes(padding))throw Error('invalid_snapshot_encoding');
 const text=atob(s),bytes=new Uint8Array(text.length);for(let i=0;i<text.length;i++)bytes[i]=text.charCodeAt(i);return bytes;
}
function pathOK(path){return typeof path==='string'&&path.length>0&&path.length<=1024&&!/^[\\/]|[\\:\x00-\x1f\x7f]/.test(path)&&!path.split('/').some(p=>!p||p==='.'||p==='..');}
function comparePath(a,b){const x=enc.encode(a),y=enc.encode(b);for(let i=0;i<Math.min(x.length,y.length);i++)if(x[i]!==y[i])return x[i]-y[i];return x.length-y.length;}
function fileBytes(q){const p=q.payload;if(!p||p.schema!=='pm.concept.file_snapshot.v1')throw Error('invalid_file_snapshot');const bytes=unbase64(p.base64);if(bytes.length!==p.byte_length||sha256(bytes)!==p.sha256)throw Error('snapshot_bytes_changed');return bytes;}
function folderBasis(p){return {root:p.root,files:p.files.map(f=>({path:f.path,byte_length:f.byte_length,sha256:f.sha256,ref:f.ref}))};}
function inspect(ref){
 const x=A.resolve(ref,{document:true});if(!x.ok)return x;const q=x.revision.record;
 if(!['file_snapshot','folder_snapshot'].includes(q.renderer_kind))return {ok:true,not_file_snapshot:true};
 try{
  if(q.renderer_kind==='file_snapshot'){fileBytes(q);return {ok:true,sha256:q.payload.sha256,bytes:q.payload.byte_length};}
  const p=q.payload;if(p?.schema!=='pm.concept.folder_snapshot.v1'||!Array.isArray(p.files)||!p.files.length||p.files.length>MAX_FILES||new Set(p.files.map(f=>f.path)).size!==p.files.length||p.files.some(f=>!pathOK(f.path)))throw Error('invalid_folder_manifest');
  if(p.files.some((f,i)=>i&&comparePath(p.files[i-1].path,f.path)>=0)||sha256(JSON.stringify(folderBasis(p)))!==p.manifest_sha256)throw Error('folder_manifest_changed');
  let total=0;for(const f of p.files){if(f.ref.project_id!==ref.project_id||f.ref.thread_id!==ref.thread_id)throw Error('snapshot_scope_mismatch');const r=A.resolve(f.ref,{document:true});if(!r.ok)throw Error('retained_file_'+r.error);const b=fileBytes(r.revision.record);if(b.length!==f.byte_length||r.revision.record.payload.sha256!==f.sha256)throw Error('retained_file_hash_changed');total+=b.length;}
  if(total!==p.total_bytes||total>MAX_TOTAL)throw Error('folder_size_mismatch');return {ok:true,manifest_sha256:p.manifest_sha256,bytes:total,count:p.files.length};
 }catch(e){return bad(e.message);}
}
async function prepare(draft){
 try{
  const c=E.ctx(),scope=PM56_GOAL.scope(draft.threadId);if(!scope||!draft.sourceBuffer||!PM56_COMPOSER_STATE.matchesScheduleCapture(c,draft.sourceBuffer))return bad('composer_changed');
  const records=[],attachments=[],basis=JSON.stringify(draft);let total=0,count=0;
  for(const a of draft.attachments||[]){
   if(a.snapshot_ref||a.artifact_ref||a.artifact_id){attachments.push(clone(a));continue;}
   const original=AT.findAttachment(c,draft.threadId,null,a.id);if(!original)return bad('attachment_source_missing');
   if(original.filesafe?.status==='blocked'||['blocked','error','failed'].includes(original.process_state))return bad('attachment_owner_blocked');
   const isFolder=original.kind==='folder',selected=isFolder?original._files:[original._file];
   if(!Array.isArray(selected)||!selected.length||selected.some(f=>!(f instanceof File)))return bad('attachment_bytes_unavailable','Select the file or folder from this device. A name, live path or partial demo manifest is not a retained copy.');
   if(count+selected.length>MAX_FILES)return bad('snapshot_file_limit','This local concept accepts at most 256 files; no partial folder was captured.');
   const entries=[],seen=new Set();
   for(const f of selected){
    const path=isFolder?f.webkitRelativePath:f.name;if(!pathOK(path)||seen.has(path))return bad('invalid_or_duplicate_snapshot_path');seen.add(path);
    if(f.size>MAX_FILE||total+f.size>MAX_TOTAL)return bad('snapshot_byte_limit','This local concept accepts 16 MiB per file and 32 MiB per selection; no partial snapshot was kept.');
    const bytes=new Uint8Array(await f.arrayBuffer());if(bytes.length!==f.size)return bad('file_read_incomplete');total+=bytes.length;count++;
    const digest=sha256(bytes),fileRef={artifact_id:'snapshot:'+draft.threadId+':'+a.id+':'+sha256(path+':'+digest),artifact_version:1,project_id:scope.projectId,thread_id:scope.threadId};
    records.push({...fileRef,title:f.name,renderer_kind:'file_snapshot',payload:{schema:'pm.concept.file_snapshot.v1',filename:f.name,mime:f.type||'application/octet-stream',byte_length:bytes.length,sha256:digest,base64:base64(bytes)},source_ref:{attachment_id:a.id,source:'explicit_selected_file_bytes'},scan_status:'not_scanned'});
    entries.push({path,byte_length:bytes.length,sha256:digest,ref:fileRef});
   }
   entries.sort((a,b)=>comparePath(a.path,b.path));let ref=entries[0].ref,manifest=null;
   if(isFolder){const roots=new Set(entries.map(f=>f.path.split('/')[0]));if(roots.size!==1||entries.some(f=>!f.path.includes('/')))return bad('folder_root_mismatch');
    const payload={schema:'pm.concept.folder_snapshot.v1',root:[...roots][0],files:entries,total_bytes:entries.reduce((n,f)=>n+f.byte_length,0)};manifest=sha256(JSON.stringify(folderBasis(payload)));payload.manifest_sha256=manifest;
    ref={artifact_id:'snapshot:'+draft.threadId+':'+a.id+':manifest:'+manifest,artifact_version:1,project_id:scope.projectId,thread_id:scope.threadId};
    records.push({...ref,title:payload.root,renderer_kind:'folder_snapshot',payload,dependency_refs:entries.map(f=>f.ref),source_ref:{attachment_id:a.id,source:'explicit_selected_folder_members'},scan_status:'not_scanned'});
   }
   attachments.push({...clone(a),snapshot_ref:ref,artifact_ref:ref,folder_manifest_hash:manifest,content_sha256:isFolder?null:entries[0].sha256,process_state:'ready'});
  }
  if(!PM56_COMPOSER_STATE.matchesScheduleCapture(E.ctx(),draft.sourceBuffer)||JSON.stringify(PM56_GOAL.scope(draft.threadId))!==JSON.stringify(scope))return bad('composer_or_scope_changed_during_snapshot');
  return {ok:true,records:A.freeze(records),attachments:A.freeze(attachments),scope,basis,files:count,bytes:total};
 }catch(e){return bad('snapshot_read_failed',String(e.message||e));}
}
function publish(prepared){if(!TX.isActive())return bad('snapshot_transaction_required');for(const q of prepared.records){const r=A.publish(q);if(!r.ok)TX.fail(r.error);}for(const a of prepared.attachments){const ref=a.snapshot_ref;if(ref){const v=inspect(ref);if(!v.ok)TX.fail(v.error);}}return {ok:true};}
A.registerRenderer('file_snapshot',q=>{const bytes=fileBytes(q),p=q.payload;let text=null;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(0,65536));}catch(e){}return '<p class="snapshot-note">Exact retained file · '+bytes.length+' bytes · no malware or secret scan claimed</p>'+(text!==null&&!text.includes('\u0000')?'<pre class="ar-source">'+esc(text)+(bytes.length>65536?'\n[Preview bounded at 64 KiB; download retains every byte.]':'')+'</pre>':'<p class="snapshot-note">Binary contents retained. Download returns the original bytes without executing them.</p>')+'<details class="ar-disclosure"><summary>Content identity</summary><code>'+esc(p.sha256)+'</code></details>';});
A.registerRenderer('folder_snapshot',q=>'<p class="snapshot-note">Complete selected-file manifest · '+q.payload.files.length+' files · '+q.payload.total_bytes+' bytes · session-local</p><div class="snapshot-manifest">'+q.payload.files.map(f=>'<div><span>'+esc(f.path)+'</span><small>'+f.byte_length+' bytes</small><button class="text-button" data-action="open-artifact" data-version="1" data-ref="'+esc(encodeURIComponent(JSON.stringify(f.ref)))+'">Open exact file</button></div>').join('')+'</div>');
A.registerExporter('file_snapshot',q=>({name:q.payload.filename,bytes:fileBytes(q),mime:'application/octet-stream'}));
A.registerExporter('folder_snapshot',q=>{const ref={artifact_id:q.artifact_id,artifact_version:q.artifact_version,project_id:q.project_id,thread_id:q.thread_id},v=inspect(ref);if(!v.ok)throw Error(v.error);return {name:q.payload.root+'-retained-bundle.json',bytes:enc.encode(JSON.stringify({schema:'pm.concept.folder_snapshot_bundle.v1',manifest:q,files:q.payload.files.map(f=>A.resolve(f.ref).revision.record)},null,2)),mime:'application/json'};});
AT.prepareScheduleSnapshots=prepare;AT.publishScheduleSnapshots=publish;AT.inspectScheduleSnapshot=inspect;
AT.snapshotBytes=ref=>{const x=A.resolve(ref);if(!x.ok)throw Error(x.error);return fileBytes(x.revision.record);};
AT.sha256=sha256;AT.snapshotLimits=Object.freeze({fileBytes:MAX_FILE,totalBytes:MAX_TOTAL,files:MAX_FILES});
})();
