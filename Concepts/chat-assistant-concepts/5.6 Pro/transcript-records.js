/* Transcript records: presentation and exact navigation only.
 * A work notice is NOT automatically an artifact. Fixture references are
 * explicit and resolve to existing recorded files, plans, or activity owners.
 * No diff or source content is fabricated by this module.
 */
(function(){
  'use strict';
  const E=window.PM56_EXT,D=window.PM56_DATA;
  const REFERENCES={
    'route-04':{kind:'change',path:'threads/provider-selector.js',line:65},
    'route-12':{kind:'change',path:'threads/provider-selector.js',line:227},
    'bsd-09':{kind:'change',path:'migrations/0043_tenant_created_index.sql',line:1},
    'attachments-10':{kind:'inspection',path:'src/analytics/schema.rs',line:1},
    'query-13':{kind:'activity',domain:'subagents',label:'Agent delegation'},
    'crew-06':{kind:'activity',domain:'crew',label:'Crew update'}
  };
  function formatRecord(ctx,text){
    // This is a small inline-text projection, not arbitrary HTML execution.
    return String(text||'').split(/\n{2,}/).map(p=>'<p>'+p.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g).map(t=>t.startsWith('`')&&t.endsWith('`')?'<code>'+ctx.esc(t.slice(1,-1))+'</code>':t.startsWith('**')&&t.endsWith('**')?'<strong>'+ctx.esc(t.slice(2,-2))+'</strong>':ctx.esc(t).replace(/\n/g,'<br>')).join('')+'</p>').join('');
  }
  function lookup(ctx,id){for(const t of ctx.state.threads){const m=t.messages.find(m=>m.id===id);if(m)return {m,t};}return null;}
  function reference(m){return m.outputRef||REFERENCES[m.id]||{kind:'note'};}
  function kindLabel(ref){return ({change:'File change',inspection:'File inspection',activity:ref.label||'Activity',artifact:'Artifact',plan:'Plan'})[ref.kind]||'Work note';}
  E.slot('workRecord',ctx=>{
    const m=ctx.m;if(m?.type!=='agent-work')return '';
    const ref=reference(m),c=ref.path&&D.changes.find(c=>c.path===ref.path);
    const label=kindLabel(ref),icon=ref.kind==='change'?'file-edit':ref.kind==='inspection'?'search':ref.kind==='activity'?'users':'document';
    return '<article class="work-output" data-output-kind="'+ctx.esc(ref.kind)+'" data-message-id="'+ctx.esc(m.id)+'"><button class="work-output-open" type="button" data-action="open-work-record" data-id="'+ctx.esc(m.id)+'"><span class="work-output-icon">'+ctx.icon(icon,16)+'</span><span class="work-output-copy"><span class="work-output-kind">'+ctx.esc(label)+'</span><strong>'+ctx.esc(m.title||label)+'</strong>'+ (ref.path?'<span class="work-output-path">'+ctx.esc(ref.path)+'</span>':'')+'</span><span class="work-output-target">'+(c&&ref.kind==='change'?'<span class="work-output-diff">+'+c.add+' −'+c.del+'</span>':'')+ctx.icon('chevron',13)+'</span></button><div class="work-output-summary">'+formatRecord(ctx,m.detail)+'</div></article>';
  });
  E.action('open-work-record',(ctx,btn)=>{
    const hit=lookup(ctx,btn.dataset.id);if(!hit)return true;
    const ref=reference(hit.m);ctx.closeMenu();ctx.closeDialog();
    if(ref.path&&D.changes.some(c=>c.path===ref.path)){
      ctx.state.fileFocus=ctx.state.fileFocus||{};ctx.state.fileFocus[ref.path]=ref.line;ctx.openEditor('file:'+ref.path);requestAnimationFrame(()=>document.querySelector('.editor-pane .diff-line.focus')?.scrollIntoView({block:'center'}));
    }else if(ref.kind==='activity'){
      Object.assign(ctx.state.activity,{open:true,pinned:true,domain:ref.domain,scope:'focus'});ctx.renderApp();
    }else if(ref.kind==='plan'&&window.PM56_PLANS?.get(ref.id))window.PM56_PLANS.openDetails(ctx,ref.id);
    else if(ref.kind==='artifact'&&D.artifacts.some(a=>a.id===ref.id))ctx.openEditor(ref.id);
    else ctx.openEditor('work-record:'+hit.m.id);
    return true;
  });
  E.slot('editorTabLabel',ctx=>{
    if(!ctx.editorId?.startsWith('work-record:'))return '';
    return lookup(ctx,ctx.editorId.slice(12))?.m.title||'Work note';
  });
  E.slot('editorDocument',ctx=>{
    if(!ctx.editorId?.startsWith('work-record:'))return '';
    const hit=lookup(ctx,ctx.editorId.slice(12));if(!hit)return '<div class="editor-empty">Work note unavailable</div>';
    const m=hit.m;
    return '<article class="editor-doc work-record-document"><div class="editor-meta"><span class="meta-pill">Work note</span><span class="meta-pill">No linked file or artifact</span></div><h1>'+ctx.esc(m.title||'Work note')+'</h1><div class="work-record-body">'+formatRecord(ctx,m.detail)+'</div><div class="work-record-source"><span>Source thread</span><button class="text-button" data-action="work-record-source" data-thread="'+ctx.esc(hit.t.id)+'" data-id="'+ctx.esc(m.id)+'">'+ctx.esc(hit.t.title)+'</button></div></article>';
  });
  E.action('work-record-source',(ctx,btn)=>{ctx.state.editorRevealed=false;ctx.switchThread(btn.dataset.thread);requestAnimationFrame(()=>document.querySelector('[data-message-id="'+CSS.escape(btn.dataset.id)+'"]')?.scrollIntoView({block:'center',behavior:'smooth'}));return true;});
  window.PM56_RECORDS={reference,kindLabel,formatRecord};
})();
