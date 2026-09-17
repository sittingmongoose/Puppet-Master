/* Shared artifact revision custody and renderer registry for the HTML concept.
 * Extends PM56_DATA.artifacts; there is no Plan-local artifact store. Existing
 * single-version fixtures remain readable, but never invent an older revision.
 * This is session-local custody, not native persistence or Event Authority. */
(function(){
'use strict';
const D=PM56_DATA,E=PM56_EXT,TX=PM56_TX,renderers=new Map(),exporters=new Map();
const clone=x=>JSON.parse(JSON.stringify(x));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function key(value){let h=2166136261;for(const c of JSON.stringify(value)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return 'fnv1a-local:'+ (h>>>0).toString(16).padStart(8,'0');}
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
function item(id){return D.artifacts.find(a=>a.id===id);}
function scopeOf(a){return {project_id:a.project_id||a.projectId||'pm',thread_id:a.thread_id||a.threadId||null};}
function publish(input){
 let q;try{q=clone(input||{});}catch(e){return {ok:false,error:'invalid_artifact_revision'};}
 const id=q.artifact_id,n=q.artifact_version;
 if(!id||!Number.isSafeInteger(n)||n<1||!q.project_id||!q.thread_id||!q.renderer_kind||typeof q.title!=='string')return {ok:false,error:'invalid_artifact_revision'};
 if(typeof q.content!=='string'&&!Array.isArray(q.blocks)&&!q.payload)return {ok:false,error:'artifact_content_required'};
 const a=item(id);if(a&&(scopeOf(a).project_id!==q.project_id||scopeOf(a).thread_id!==q.thread_id))return {ok:false,error:'artifact_scope_mismatch'};
 const prior=a?.revisions?.[n];
 if(prior)return JSON.stringify(prior.record)===JSON.stringify(q)?{ok:true,replayed:true,revision:prior}:{ok:false,error:'immutable_revision_conflict'};
 const revision=freeze({record:q,content_key:key(q)});
 return TX.run(()=>{
  const target=a||{id,title:q.title,kind:q.renderer_kind,projectId:q.project_id,threadId:q.thread_id,version:n,status:'ready',revisions:{},retainedBy:[],summary:'Exact session-local artifact revision.'};
  if(!a)TX.append(D,'artifacts',target);
  TX.set(target,'revisions',{...(target.revisions||{}),[n]:revision});
  if(n>=Number(target.version||0)){TX.set(target,'version',n);TX.set(target,'title',q.title);TX.set(target,'kind',q.renderer_kind);if(q.content!=null)TX.set(target,'content',q.content);}
  return {ok:true,revision};
 });
}
function retain(ref,holder){
 if(!holder?.kind||!holder.id)return {ok:false,error:'holder_identity_required'};
 const queue=[{ref,holder}],seen=new Set();
 return TX.run(()=>{
  while(queue.length){const entry=queue.pop(),f=entry.ref,a=item(f?.artifact_id),key=JSON.stringify(normalized(f));
   if(seen.has(key))continue;seen.add(key);
   if(!a?.revisions?.[f.artifact_version]){if(f===ref||entry.required)TX.fail('artifact_revision_missing');continue;}
   if(scopeOf(a).project_id!==f.project_id||scopeOf(a).thread_id!==f.thread_id)TX.fail('denied');
   const row={artifact_version:f.artifact_version,kind:entry.holder.kind,id:entry.holder.id};
   if(!(a.retainedBy||[]).some(x=>JSON.stringify(x)===JSON.stringify(row)))TX.set(a,'retainedBy',(a.retainedBy||[]).concat(row));
   for(const child of a.revisions[f.artifact_version].record.dependency_refs||[]){if(child.project_id!==f.project_id||child.thread_id!==f.thread_id)TX.fail('denied');queue.push({ref:child,holder:{kind:'artifact_revision',id:f.artifact_id+'@'+f.artifact_version},required:true});}
   const next=a.revisions[f.artifact_version].record.static_fallback_ref;
   if(next){if(next.project_id&&next.project_id!==f.project_id||next.thread_id&&next.thread_id!==f.thread_id)TX.fail('denied');
    queue.push({ref:{project_id:f.project_id,thread_id:f.thread_id,...next},holder:{kind:'artifact_revision',id:f.artifact_id+'@'+f.artifact_version}});}
  }
  return {ok:true};
 });
}

function purge(ref){
 const a=item(ref?.artifact_id);if(!a)return {ok:false,error:'artifact_not_found'};
 if(scopeOf(a).project_id!==ref.project_id||scopeOf(a).thread_id!==ref.thread_id)return {ok:false,error:'denied'};
 if((a.retainedBy||[]).some(x=>x.artifact_version===ref.artifact_version))return {ok:false,error:'artifact_still_referenced'};
 if(a.revisions?.[ref.artifact_version]){const next={...a.revisions};delete next[ref.artifact_version];TX.set(a,'revisions',next);}return {ok:true};
}
function resolve(ref,opts={}){
 if(!ref||!ref.artifact_id||!Number.isSafeInteger(ref.artifact_version)||!ref.project_id||!ref.thread_id)return {ok:false,error:'invalid_artifact_reference'};
 const a=item(ref.artifact_id);if(!a)return {ok:false,error:'missing'};
 const scope=scopeOf(a);if(scope.project_id!==ref.project_id||scope.thread_id!==ref.thread_id)return {ok:false,error:'denied'};
 const availability=a.revisionAvailability?.[ref.artifact_version]||a.availability;
 if(availability&&availability!=='available')return {ok:false,error:['missing','stale','denied'].includes(availability)?availability:'unavailable'};
 let revision=a.revisions?.[ref.artifact_version];
 // A legacy current-version record can be inspected without copying it into a
 // new store. It cannot realize a different version or an interactive payload.
 if(!revision&&!a.revisions&&Number(a.version)===ref.artifact_version){
  const record={artifact_id:a.id,artifact_version:Number(a.version),...scope,title:a.title,renderer_kind:a.kind,content:String(a.content||a.body||a.summary||''),origin:'legacy_fixture',payload:a.payload||null};
  revision={record,content_key:key(record),legacy:true};
 }
 if(!revision)return {ok:false,error:'missing'};
 if(revision.content_key!==key(revision.record))return {ok:false,error:'stale'};
 if(ref.renderer_kind&&ref.renderer_kind!==revision.record.renderer_kind)return {ok:false,error:'renderer_kind_mismatch'};
 if(!opts.document&& !renderers.has(revision.record.renderer_kind))return {ok:false,error:'unsupported',revision};
 return {ok:true,revision,artifact:a};
}
function normalized(ref){return {artifact_id:ref.artifact_id,artifact_version:ref.artifact_version,project_id:ref.project_id,thread_id:ref.thread_id,...(ref.renderer_kind?{renderer_kind:ref.renderer_kind}:{})};}
function route(ref){return 'artifact-revision:'+encodeURIComponent(JSON.stringify(normalized(ref)));}
function fromRoute(s){try{return s?.startsWith('artifact-revision:')?JSON.parse(decodeURIComponent(s.slice(18))):null;}catch(e){return null;}}
const labels={missing:'The exact artifact revision is missing.',stale:'This revision is not current with its source.',denied:'This revision is not available in the current scope.',unsupported:'No registered renderer supports this kind.',renderer_kind_mismatch:'The retained revision has a different renderer kind.',invalid_artifact_reference:'The artifact reference is incomplete.'};
function unavailable(ref,error){return `<div class="ar-unavailable" data-artifact-state="${esc(error)}"><strong>Unavailable · ${esc(error.replaceAll('_',' '))}</strong><p>${esc(labels[error]||'The artifact could not be opened.')}</p><code>${esc(ref.artifact_id)} @ V${esc(ref.artifact_version)}</code><p>No newer version has been substituted.</p></div>`;}
function register(kind,render){if(renderers.has(kind))throw Error('duplicate_artifact_renderer:'+kind);renderers.set(kind,render);}
function render(ref,opts={}){
 const r=resolve(ref);if(!r.ok)return unavailable(ref||{},r.error);
 const identity=JSON.stringify(normalized(ref)),seen=new Set(opts._seen||[]);
 if(seen.has(identity))return unavailable(ref,'recursive_fallback');
 seen.add(identity);
 try{return renderers.get(r.revision.record.renderer_kind)(r.revision.record,{...opts,_seen:seen});}catch(e){return unavailable(ref,'renderer_failed');}
}
function parse(q){return q.payload||JSON.parse(q.content);}
// A retained artifact may own structured payload or blocks without a text body.
// View and download share the same serialization; never silently render blank.
function sourceText(q){
 if(typeof q.content==='string')return q.content;
 if(q.payload!=null)return JSON.stringify(q.payload,null,2);
 if(Array.isArray(q.blocks))return JSON.stringify(q.blocks,null,2);
 return '';
}
const pre=q=>`<pre class="ar-source">${esc(sourceText(q))}</pre>`;
register('code',pre);register('text',pre);register('document',pre);register('json',pre);
register('table',q=>{const p=parse(q);if(!Array.isArray(p.columns)||!Array.isArray(p.rows)||p.rows.some(r=>!Array.isArray(r)||r.length!==p.columns.length))throw Error('invalid_table');return `<div class="ar-table-wrap"><table class="ar-table"><thead><tr>${p.columns.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${p.rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;});
register('checklist',q=>{const p=parse(q);return `<ul class="ar-checklist">${p.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;});
register('chart',q=>{const p=parse(q);if(!Array.isArray(p.values)||!p.values.length||p.values.some(v=>!Number.isFinite(v.value)||v.value<0))throw Error('invalid_chart');const max=Math.max(...p.values.map(v=>v.value),1);return `<div class="ar-chart" role="img" aria-label="${esc(q.title)}">${p.values.map(v=>`<div class="ar-bar"><span>${esc(v.label)}</span><div><i style="width:${100*v.value/max}%"></i></div><strong>${esc(v.value)}${esc(p.unit||'')}</strong></div>`).join('')}</div>`;});
function graph(q){
 const p=parse(q);if(!Array.isArray(p.nodes)||!Array.isArray(p.edges)||new Set(p.nodes.map(x=>x.id)).size!==p.nodes.length)throw Error('invalid_graph');
 const index=new Map(p.nodes.map((n,i)=>[n.id,i]));if(p.edges.some(e=>!index.has(e[0])||!index.has(e[1])))throw Error('unknown_graph_node');
 // Layer acyclic dependencies without deriving any edge from display order.
 const incoming=new Map(p.nodes.map(n=>[n.id,0])),levels=new Map(p.nodes.map(n=>[n.id,0])),outgoing=new Map(p.nodes.map(n=>[n.id,[]]));
 for(const [a,b] of p.edges){incoming.set(b,incoming.get(b)+1);outgoing.get(a).push(b);}
 const ready=p.nodes.filter(n=>incoming.get(n.id)===0).map(n=>n.id);for(let j=0;j<ready.length;j++){const a=ready[j];for(const b of outgoing.get(a)){levels.set(b,Math.max(levels.get(b),levels.get(a)+1));incoming.set(b,incoming.get(b)-1);if(!incoming.get(b))ready.push(b);}}
 const groups=new Map();for(const n of p.nodes){const level=levels.get(n.id);if(!groups.has(level))groups.set(level,[]);groups.get(level).push(n.id);}
 const positions=new Map();let row=0;for(const level of [...groups.keys()].sort((a,b)=>a-b)){const group=groups.get(level);for(let j=0;j<group.length;j++){const chunk=group.slice(Math.floor(j/3)*3,Math.floor(j/3)*3+3);positions.set(group[j],{x:(j%3+1)*650/(chunk.length+1)-85,y:30+(row+Math.floor(j/3))*115});}row+=Math.ceil(group.length/3);}
 const pos=i=>positions.get(p.nodes[i].id),height=Math.max(130,row*115+20);
 const arrow='ar-arrow-'+String(q.artifact_id).replace(/[^a-zA-Z0-9_-]/g,'-');
 const edges=p.edges.map(e=>{const a=pos(index.get(e[0])),b=pos(index.get(e[1])),sameRow=a.y===b.y;const path=sameRow?`M${a.x+85},${a.y} C${a.x+85},${a.y-25} ${b.x+85},${b.y-25} ${b.x+85},${b.y}`:`M${a.x+85},${a.y+52} C${a.x+85},${a.y+82} ${b.x+85},${b.y-30} ${b.x+85},${b.y}`;return `<path d="${path}" marker-end="url(#${arrow})"><title>${esc(e[0])} → ${esc(e[1])}</title></path>`;}).join('');
 const nodes=p.nodes.map((n,i)=>{const a=pos(i),words=String(n.label).split(' '),lines=[''];for(const w of words){if((lines.at(-1)+' '+w).length>22)lines.push(w);else lines[lines.length-1]+=(lines.at(-1)?' ':'')+w;}return `<g><title>${esc(n.label)} — ${esc(n.detail||'')}</title><rect x="${a.x}" y="${a.y}" width="170" height="52" rx="8"/><text x="${a.x+85}" y="${a.y+21}" text-anchor="middle">${lines.slice(0,2).map((line,j)=>`<tspan x="${a.x+85}" dy="${j?15:0}">${esc(line)}</tspan>`).join('')}</text></g>`;}).join('');
 return `<svg class="ar-graph-svg" viewBox="0 0 650 ${height}" role="img" aria-label="${esc(q.title)}"><defs><marker id="${arrow}" markerWidth="7" markerHeight="7" refX="7" refY="3.5" orient="auto"><polygon points="0 0,7 3.5,0 7"/></marker></defs>${edges}${nodes}</svg><div class="ar-graph-key">${p.nodes.map(n=>`<p><strong>${esc(n.label)}</strong> ${esc(n.detail||'')}</p>`).join('')}</div><details class="ar-disclosure"><summary>Graph connections</summary><ul>${p.edges.map(e=>`<li>${esc(p.nodes[index.get(e[0])].label)} → ${esc(p.nodes[index.get(e[1])].label)}</li>`).join('')}</ul></details>`;
}
register('graph',graph);register('diagram',graph);
function fallback(q,opts){const f=q.static_fallback_ref;if(!f)return unavailable({artifact_id:q.artifact_id,artifact_version:q.artifact_version},'static_fallback_missing');if(f.artifact_id===q.artifact_id&&f.artifact_version===q.artifact_version)return unavailable(f,'recursive_fallback');if(f.project_id&&f.project_id!==q.project_id||f.thread_id&&f.thread_id!==q.thread_id)return unavailable(f,'denied');return render({project_id:q.project_id,thread_id:q.thread_id,...f},{...opts,static:true});}
register('mermaid',(q,o)=>`<div class="ar-static-note">Static diagram from the retained revision · Mermaid source preserved</div>${fallback(q,o)}<details class="ar-disclosure"><summary>Mermaid source</summary>${pre(q)}</details>`);
register('image',q=>{const src=q.payload?.data_url;if(!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(src||''))throw Error('untrusted_image_source');return `<img class="ar-image" src="${esc(src)}" alt="${esc(q.title)}">`;});
register('video',(q,o)=>{if(o.print||o.static)return `<p class="ar-static-note">Video · static fallback</p>${fallback(q,o)}`;const src=q.payload?.data_url;if(!/^data:video\/(webm|mp4);base64,[A-Za-z0-9+/=]+$/.test(src||''))return unavailable(q,'video_source_unavailable');return `<video class="ar-video" controls preload="metadata" src="${esc(src)}"></video>`;});
// Only this registered renderer supplies executable code. Source HTML or script
// is never evaluated. The frame gets no same-origin, navigation, form or popup
// capability, and its CSP forbids network. This is not a native security audit.
const TABLE_SCRIPT=`const rows=DATA.rows;const out=document.getElementById('rows');function draw(){out.replaceChildren();let n=0;for(const row of rows){if(!row.join(' ').toLowerCase().includes(document.getElementById('filter').value.toLowerCase()))continue;const tr=document.createElement('tr');for(const cell of row){const td=document.createElement('td');td.textContent=String(cell);tr.append(td);}out.append(tr);n++;}document.getElementById('count').textContent=n+' rows';}document.getElementById('filter').addEventListener('input',draw);draw();`;
register('interactive',(q,o)=>{
 if(o.print||o.static)return `<p class="ar-static-note">Interactive table · static fallback</p>${fallback(q,o)}`;
 if(q.origin!=='pm-local-renderer'||!q.capabilities?.includes('filter_table'))return unavailable(q,'renderer_capability_denied');
 const p=parse(q);if(!Array.isArray(p.rows)||!Array.isArray(p.columns))throw Error('invalid_table');
 const src=`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-pm-table'; style-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; base-uri 'none'"><style>body{font:13px system-ui;color:#e6e9f5;background:#171b29;padding:12px;margin:0}input{box-sizing:border-box;width:100%;padding:9px;background:#101420;color:inherit;border:1px solid #454958;border-radius:8px}table{width:100%;border-collapse:collapse}td,th{text-align:left;border-bottom:1px solid #363b4b;padding:8px;overflow-wrap:anywhere}p{color:#aab1c6}</style></head><body><input id="filter" aria-label="Filter retained rows" placeholder="Filter these retained rows"><p id="count"></p><table><thead><tr>${p.columns.map(x=>'<th>'+esc(x)+'</th>').join('')}</tr></thead><tbody id="rows"></tbody></table><script nonce="pm-table">const DATA=${JSON.stringify(p).replace(/</g,'\\u003c')};${TABLE_SCRIPT}<\/script></body></html>`;
 return `<iframe class="ar-interactive" title="${esc(q.title)}" sandbox="allow-scripts" referrerpolicy="no-referrer" srcdoc="${esc(src)}"></iframe>`;
});
function editor(ref){const x=resolve(ref);return `<article class="editor-doc ar-document" data-artifact-id="${esc(ref.artifact_id)}" data-artifact-version="${esc(ref.artifact_version)}"><header><span class="ar-eyebrow">Retained artifact · V${esc(ref.artifact_version)}</span><h1>${esc(x.revision?.record.title||ref.artifact_id)}</h1></header>${render(ref)}<details class="ar-disclosure"><summary>Identity & source</summary><dl><dt>Artifact</dt><dd>${esc(ref.artifact_id)}</dd><dt>Version</dt><dd>${esc(ref.artifact_version)}</dd><dt>Scope</dt><dd>${esc(ref.project_id)} / ${esc(ref.thread_id)}</dd><dt>Currentness</dt><dd>${esc(x.ok?'Exact retained revision':x.error)}</dd></dl>${x.ok?pre(x.revision.record):''}</details><div class="ar-actions"><button class="soft-button" data-action="ar-download" data-ref="${esc(encodeURIComponent(JSON.stringify(ref)))}"${x.ok?'':' disabled'}>Download exact revision</button></div></article>`;}
E.slot('editorDocument',ctx=>{const ref=fromRoute(ctx.editorId);return ref?editor(ref):'';});
E.slot('editorTabLabel',ctx=>{const ref=fromRoute(ctx.editorId);if(!ref)return '';return esc((resolve(ref).revision?.record.title||'Unavailable artifact')+' · V'+ref.artifact_version);});
E.chainAction('open-artifact',(ctx,btn)=>{if(!btn.dataset.version)return false;let ref;try{ref=JSON.parse(decodeURIComponent(btn.dataset.ref));}catch(e){ctx.toast('Cannot open','The exact artifact reference is missing.');return true;}const x=resolve(ref);ctx.openEditor(route(ref));return true;});
function deliverText(name,text,mime='text/plain;charset=utf-8'){return deliverBytes(name,text,mime);}
function deliverBytes(name,text,mime='application/octet-stream'){
 try{const blob=new Blob([text],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},4000);return {ok:true,result:'handed to the browser as '+name};}
 catch(e){return {ok:false,error:'download_refused',result:'the browser refused the download ('+String(e.message||e)+') — no file was written'};}
}
E.action('ar-download',(ctx,btn)=>{let ref;try{ref=JSON.parse(decodeURIComponent(btn.dataset.ref));}catch(e){return true;}const x=resolve(ref);if(!x.ok){ctx.toast('Download unavailable',x.error);return true;}const q=x.revision.record;if(exporters.has(q.renderer_kind)){try{const e=exporters.get(q.renderer_kind)(q);const out=deliverBytes(e.name,e.bytes,e.mime);if(!out.ok)ctx.toast('Download unavailable',out.error);}catch(e){ctx.toast('Download unavailable',e.message);}return true;}const data=sourceText(q);const out=deliverText(q.title.replace(/[^a-zA-Z0-9._-]/g,'_')+'-v'+q.artifact_version+'.txt',data);if(!out.ok)ctx.toast('Download unavailable',out.error);return true;});

window.PM56_ARTIFACTS={deliverText,deliverBytes,registerExporter:(kind,fn)=>{if(exporters.has(kind))throw Error('duplicate_exporter');exporters.set(kind,fn);},publish,resolve,retain,purge,render,route,fromRoute,editor,registerRenderer:register,kinds:()=>Array.from(renderers.keys()),key,freeze,scopeOf,unavailable};
})();
