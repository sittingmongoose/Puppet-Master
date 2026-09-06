/* Delivery repair: presentation/navigation only. Domain modules retain their
   own actions and data; no second scheduler, Goal, To-Do or browser runtime. */
(function(){
  'use strict';
  var EXT=window.PM56_EXT;
  if(!EXT)return;
  var demoOnly=new Set(['cs-quota-demo','cs-quota-source','af-eli5-demo','af-revert-seed',
    'af-title-race-demo','af-debug-start','af-debug-advance','af-debug-recover','bc-open',
    'collab-build-with-crew']);
  var groups=[['assist','Assistance','goal'],['work','Workflows','users'],
    ['schedule','Scheduling','history'],['memory','Memory & teaching','brain'],
    ['preferences','Preferences','settings']];
  function template(html){var t=document.createElement('template');t.innerHTML=html;return t;}
  function groupFor(el){
    var a=el.dataset.action||'',sub=el.dataset.submenu||'';
    if(a.indexOf('sched-')===0)return 'schedule';
    if(a==='af-memory-open'||a==='af-teach-open')return 'memory';
    if(a.indexOf('collab-')===0||el.matches('label'))return 'work';
    if(a==='af-settings-open'||sub==='thought-menu')return 'preferences';
    return 'assist';
  }
  function wand(html,ctx){
    var t=template(html),buckets={};groups.forEach(function(g){buckets[g[0]]=[];});
    Array.from(t.content.children).forEach(function(el){
      if(!el.matches('button,label'))return;
      if(demoOnly.has(el.dataset.action))return;
      /* Original descriptive copy remains available in the tooltip, but no
         longer turns the whole menu into documentation. */
      var description=el.querySelector('.menu-copy>span');
      if(description){el.setAttribute('title',description.textContent.trim());description.remove();}
      buckets[groupFor(el)].push(el.outerHTML);
    });
    var open=ctx.state.polishWandGroup||'';
    return '<div class="menu-head"><strong>Assistant capabilities</strong><span class="spacer"></span>'+ctx.icon('wand',13)+'</div>'+
      groups.map(function(g){var on=g[0]===open;return '<div class="polish-wand-group" data-k="wand-group:'+g[0]+'"><button class="menu-item polish-group-toggle" type="button" data-action="polish-wand-group" data-group="'+g[0]+'" aria-expanded="'+on+'"><span class="menu-icon">'+ctx.icon(g[2],13)+'</span><span class="menu-copy"><strong>'+g[1]+'</strong></span>'+ctx.icon(on?'down':'chevron',11)+'</button>'+(on?'<div class="polish-group-body">'+buckets[g[0]].join('')+'</div>':'')+'</div>';}).join('');
  }
  var galleryRows=[
    ['Quota wait strip','cs-quota-demo'],['Quota reset-time source','cs-quota-source'],
    ['ELI5 · two explanations','af-eli5-demo'],['Revert · eligible / ineligible / conflict','af-revert-seed'],
    ['Title · delayed result race','af-title-race-demo'],
    ['Debug · start investigation','af-debug-start'],['Debug · advance phase','af-debug-advance'],
    ['Capture · browser fixture','bc-open'],
    ['To-Dos · refused bulk completion','todo-attempt-bulk-complete'],
    ['To-Dos · provider proposal','todo-attempt-provider-proposal']
  ];
  function gallery(ctx){
    return (window.PM56_REPAIR_DEMOS?window.PM56_REPAIR_DEMOS.gallery(ctx):'')+'<section class="demo-section polish-demo-section"><h3>Feature demonstrations</h3><div class="demo-section-body">'+
      galleryRows.map(function(r){return '<button type="button" class="demo-trigger" data-action="polish-demo-action" data-target="'+r[1]+'">'+ctx.esc(r[0])+'</button>';}).join('')+'</div></section>';
  }
  function hover(html,domain,ctx){
    var t=template(html);
    t.content.querySelectorAll('.ab-foot,.todo-hover-foot').forEach(function(x){x.remove();});
    t.content.querySelectorAll('button').forEach(function(x){if(x.textContent.trim()==='Open Activity')x.remove();});
    t.content.querySelectorAll('.ab-row').forEach(function(x,i){
      if(i>=4){x.remove();return;}
      if(!x.dataset.action){var btn=document.createElement('button');Array.from(x.attributes).forEach(function(a){btn.setAttribute(a.name,a.value);});btn.type='button';btn.dataset.action='open-activity';btn.dataset.domain=domain;btn.innerHTML=x.innerHTML;x.replaceWith(btn);}
    });
    return t.innerHTML;
  }
  EXT.action('polish-wand-group',function(ctx,btn){ctx.state.polishWandGroup=ctx.state.polishWandGroup===btn.dataset.group?'':btn.dataset.group;ctx.state.menu.sub=null;ctx.renderOverlays();return true;});
  EXT.action('polish-context-toggle',function(ctx,btn){var s=ctx.state.context.polishSections||(ctx.state.context.polishSections={});s[btn.dataset.section]=!s[btn.dataset.section];ctx.renderOverlays();return true;});
  EXT.action('polish-demo-action',function(ctx,btn,ev){
    var target=btn.dataset.target;
    if(!galleryRows.some(function(r){return r[1]===target;}))return true;
    ctx.state.dialog=null;ctx.state.menu=null;ctx.state.hover=null;
    if(target.indexOf('todo-')===0){ctx.switchThread('query');ctx=EXT.ctx();}
    var button=document.createElement('button');button.dataset.action=target;
    if(target==='af-debug-advance'){
      var inv=ctx.state.threads.find(function(t){return t.id===ctx.state.selectedThread;});
      var message=inv&&inv.messages.slice().reverse().find(function(m){return m.investigationId;});
      if(message)button.dataset.value=message.investigationId;
    }
    var fn=EXT._actions[target];if(fn)fn(ctx,button,ev);
    ctx.renderApp();
    if(target.indexOf('todo-')===0){Object.assign(ctx.state.activity,{open:true,domain:'todo',scope:'focus'});ctx.renderApp();}
    else if(!ctx.state.dialog)requestAnimationFrame(function(){var t=document.querySelector('.transcript');if(t)t.scrollTop=t.scrollHeight;});
    return true;
  });
  function positionAttachment(ev){
    var thumb=ev.target.closest&&ev.target.closest('.att-msg-thumb');if(!thumb)return;
    var r=thumb.getBoundingClientRect(),tr=thumb.closest('.transcript'),bounds=tr?tr.getBoundingClientRect():{left:0,right:innerWidth};
    var left=Math.max(12,bounds.left+8),right=Math.min(innerWidth-12,bounds.right-8);
    var w=Math.min(226,Math.max(120,right-left));
    /* Local coordinates: transformed message surfaces are containing blocks.
       Viewport coordinates on a fixed child would extend scrollWidth. */
    var dx=Math.max(left-r.left,Math.min(0,right-r.left-w));
    document.body.style.setProperty('--polish-attachment-dx',dx+'px');
    document.body.style.setProperty('--polish-attachment-width',w+'px');
  }
  document.addEventListener('pointerover',positionAttachment,true);
  document.addEventListener('focusin',positionAttachment,true);
  ['open-agent','open-change','open-artifact','collab-open-panel'].forEach(function(a){EXT.chainAction(a,function(ctx,btn){if(btn&&btn.closest('.hover-card'))ctx.state.hover=null;return false;});});
  window.PM56_POLISH={wand:wand,gallery:gallery,hover:hover};
})();
