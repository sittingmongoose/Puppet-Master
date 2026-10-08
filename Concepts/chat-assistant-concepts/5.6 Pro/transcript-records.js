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
  /* an activity record wears its domain's glyph, the activity bar's (one glyph per concept: a Crew update is the Crew
     mark, not the Subagents people) */
  const DOMAIN_GLYPH={goal:'goal',todo:'todo',subagents:'users',crew:'kind-crew',brainstorm:'kind-brainstorm',review:'kind-review',chat_room:'kind-chat_room',changes:'changes',artifacts:'page'};
  function kindLabel(ref){return ({change:'File change',inspection:'File inspection',activity:ref.label||'Activity',artifact:'Artifact',plan:'Plan'})[ref.kind]||'Work note';}
  /* The same glyph the work card uses: a file edit, an inspection, the activity
     domain's mark, or the document mark for a work note. */
  function workGlyphName(ref){
    return ref.kind==='change'?'file-edit':ref.kind==='inspection'?'search':ref.kind==='activity'?(DOMAIN_GLYPH[ref.domain]||'users'):'document';
  }
  /* One line for the read-only subagent feed: the recorded title is already the
     short verb plus object; the detail (and a linked path) stays off the line. */
  function feedLine(m){
    const ref=reference(m||{});
    const label=String((m&&m.title)||'').trim()||kindLabel(ref);
    let detail=String((m&&m.detail)||'').trim();
    if(ref.path) detail=detail?(ref.path+' — '+detail):ref.path;
    return {glyph:workGlyphName(ref), label, detail, kind:ref.kind};
  }
  E.slot('workRecord',ctx=>{
    const m=ctx.m;if(m?.type!=='agent-work')return '';
    const ref=reference(m),c=ref.path&&D.changes.find(c=>c.path===ref.path);
    const label=kindLabel(ref),icon=workGlyphName(ref);
    return '<article class="work-output" data-output-kind="'+ctx.esc(ref.kind)+'" data-message-id="'+ctx.esc(m.id)+'"><button class="work-output-open" type="button" data-action="open-work-record" data-id="'+ctx.esc(m.id)+'"><span class="work-output-icon">'+ctx.icon(icon,16)+'</span><span class="work-output-copy"><span class="work-output-kind">'+ctx.esc(label)+'</span><strong>'+ctx.esc(m.title||label)+'</strong>'+ (ref.path?'<span class="work-output-path">'+ctx.esc(ref.path)+'</span>':'')+'</span><span class="work-output-target">'+(c&&ref.kind==='change'?'<span class="work-output-diff"><span class="diff-added">+'+c.add+'</span> <span class="diff-removed">−'+c.del+'</span></span>':'')+ctx.icon('chevron',13)+'</span></button><div class="work-output-summary">'+formatRecord(ctx,m.detail)+'</div></article>';
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

  /* ---- Work stretches: the read-only subagent feed (Jared, card 7) ------------------------------------------------
     Consecutive agent-work records between two pieces of prose are ONE stretch, drawn as one quiet row: a compact
     Step Rail (one disc per record: finished discs lit green, the live one the dark disc rimmed in its phase hue,
     pulsing, its glyph acting), a plain count of what the records say ("Ran 3 tools · read 2 files"; live, the Step
     Rail's shimmering verb: "Benchmarking the index under concurrent writes · 2 tools so far"), the time of the
     stretch's last record and a chevron. The row is a real toggle; open, it lists the stretch's records, one line
     each, with the full detail in the app hover card, and a line and its disc light together. app.js groups the
     records (renderTranscriptItems) and calls feedStretch; the parent transcript never draws a stretch.
     A record's step comes from what it says: an output reference first (a file change, an inspection, an activity
     owner), else the verb its title leads with ("Read", "Ran", "Created", "Checked", "Handed"), else the first past
     participle in it ("Union computed", "Rollback rehearsed"). A detail that reports passing tests or green
     assertions makes it a test step. The step picks the disc's glyph and its Step Rail phase hue (--pm-step). */
  const STEP={
    read:['files','page','read'], search:['files','folder-search','search'], run:['bash','terminal','run'],
    edit:['edit','file-edit','edit'], check:['validate','check-circle','check'], test:['test','flask','test'],
    hand:['artifact','upload','hand'], agents:['agents','users','agents']
  };
  const VERB={
    read:'read', opened:'read', inspected:'read', scanned:'read',
    searched:'search', grepped:'search', found:'search',
    ran:'run', running:'run', profiled:'run', executed:'run', reproduced:'run', benchmarked:'run', benchmarking:'run',
    created:'edit', regenerated:'edit', rewrote:'edit', wrote:'edit', written:'edit', drafted:'edit', edited:'edit',
    updated:'edit', converted:'edit', generated:'edit',
    checked:'check', checking:'check', measured:'check', verified:'check', validated:'check', swept:'check',
    computed:'check', compared:'check', confirmed:'check',
    rehearsed:'test', tested:'test', testing:'test',
    handed:'hand', shared:'hand', published:'hand', delegated:'agents'
  };
  const PASSED=/(\d[\d,]*)\s+(?:tests?\s+)?passed\b/i, GREEN=/(\d[\d,]*)\s+assertions?\b[^.]*?\b(?:all green|passed)\b/i;
  const FAILED=/(\d[\d,]*)\s+(?:tests?\s+)?failed\b/i;
  /* a title that leads with a present participle ("Benchmarking the index ...") is a step still under way */
  const GERUND=/^\s*([A-Z][a-z]+ing)\b\s*(.*)$/;
  function stepOf(m){
    const ref=reference(m||{});
    const pick=k=>{const s=STEP[k];return {kind:s[0],glyph:s[1],verb:s[2]};};
    if(ref.kind==='change') return pick('edit');
    if(ref.kind==='inspection') return pick('read');
    if(ref.kind==='activity') return {kind:'agents',glyph:DOMAIN_GLYPH[ref.domain]||'users',verb:'agents'};
    const title=String((m&&m.title)||''), detail=String((m&&m.detail)||'');
    const words=title.toLowerCase().match(/[a-z]+/g)||[];
    let v=VERB[words[0]];
    if(!v){const w=words.find(w=>VERB[w]&&/(?:ed|en|wrote|swept|ran)$/.test(w));v=w?VERB[w]:'';}
    if(PASSED.test(detail)||GREEN.test(detail)||(v==='run'&&/\btests?\b|\btest suite\b/i.test(title))) v='test';
    return v?pick(v):{kind:'',glyph:'page',verb:''};
  }
  /* The path a "Read <path>" record names (a range like migrations/0038..0042 counts its files), or null. */
  function readCount(m,step){
    if(step.verb!=='read') return null;
    const ref=reference(m||{});if(ref.path) return {path:ref.path,n:1};
    const mt=/^\s*\S+\s+(\S+)/.exec(String((m&&m.title)||''));if(!mt) return null;
    const p=mt[1];if(!/\/|\.[a-z0-9]{1,5}$/i.test(p)) return null;
    const r=/(\d+)\.\.(\d+)/.exec(p);
    return {path:p,n:r?Math.max(1,Number(r[2])-Number(r[1])+1):1};
  }
  const plural=(n,one,many)=>n+' '+(n===1?one:(many||one+'s'));
  /* The row's words. Finished: "Ran N tools", then only what the records themselves report: files read (distinct
     paths), files edited (a file change's path), tests or assertions passed and tests failed (the detail's own
     numbers). A stretch of one record is summed up by that record's own title. Live, the Step Rail's label: the
     current step's verb, bold and shimmering, then what it is on and the count so far ("Benchmarking the index under
     concurrent writes · 2 tools so far"); a latest record that does not lead with a verb in -ing is "Working · " and
     its title. */
  function stretchSummary(list,live,steps){
    steps=steps||list.map(stepOf);
    const read=new Map(),edited=new Set();let tests=0,asserts=0,failed=0;
    const num=x=>Number(String(x).replace(/,/g,''));
    list.forEach((m,i)=>{
      const rc=readCount(m,steps[i]);if(rc) read.set(rc.path,rc.n);
      const ref=reference(m||{});if(ref.kind==='change'&&ref.path) edited.add(ref.path);
      const d=String((m&&m.detail)||''),pt=PASSED.exec(d),gr=!pt&&GREEN.exec(d),fl=FAILED.exec(d);
      if(pt) tests+=num(pt[1]);
      else if(gr) asserts+=num(gr[1]);
      if(fl) failed+=num(fl[1]);
    });
    const facts=[];
    let nRead=0;read.forEach(n=>{nRead+=n;});
    if(nRead) facts.push('read '+plural(nRead,'file'));
    if(edited.size) facts.push('edited '+plural(edited.size,'file'));
    if(tests) facts.push(plural(tests,'test')+' passed');
    if(asserts) facts.push(plural(asserts,'assertion')+' passed');
    if(failed) facts.push(plural(failed,'test')+' failed');
    const n=list.length,title=String((list[n-1]&&list[n-1].title)||'').trim()||'Work note';
    if(live){
      const g=GERUND.exec(title),tail=n>1?[plural(n,'tool')+' so far'].concat(facts):[];
      return {verb:g?g[1]:'Working',sep:g?' ':' · ',rest:[g?g[2]:title].concat(tail).filter(Boolean).join(' · '),facts,underway:!!g};
    }
    if(n===1) return {verb:'',sep:'',rest:title,facts};
    return {verb:'Ran',sep:' ',rest:[plural(n,'tool')].concat(facts).join(' · '),facts};
  }
  /* Open stretches, by stretch id (the first record's id), so a re-render keeps them open. */
  const OPEN=new Set();
  const RAIL_MAX=12;
  /* o: {id, live, esc, icon, clock}. Markup only: every attribute the toggle changes in place (aria-expanded,
     data-open, hidden) is written here from OPEN too, so pmPatch never undoes it. */
  function feedStretch(list,o){
    const esc=o.esc,icon=o.icon,clock=o.clock||(()=>'');
    const n=list.length,live=!!o.live,open=OPEN.has(o.id),steps=list.map(stepOf);
    const sum=stretchSummary(list,live,steps);
    const domId='txs-'+String(o.id).replace(/[^\w-]/g,'_');
    /* the hover card: the record's title, then its detail (a linked path first). The live one leads with where it
       is: "In progress" for a step still under way, else "Latest step" while the agent works on. */
    const nowWord=sum.underway?'In progress':'Latest step, still working';
    const tipOf=(m,cur)=>{
      const f=feedLine(m),more=(cur?nowWord+(f.detail?'. ':''):'')+(f.detail||'');
      return esc(f.label)+(more?'&#10;'+esc(more):'');
    };
    /* past RAIL_MAX the earliest records fold into one counted disc; the rows still list every record */
    const fold=n>RAIL_MAX?n-(RAIL_MAX-1):0;
    const nodes=(fold?'<span class="tx-stretch-node is-done is-fold" data-k="snf:'+esc(o.id)+'" data-hover-key="feed-fold-'+esc(o.id)+'" data-hover-tip="Earlier in this stretch&#10;'+plural(fold,'record')+', listed when the stretch is open.">'+'<b>'+(fold>99?'99+':'+'+fold)+'</b></span>':'')
      +list.slice(fold).map((m,j)=>{
        const i=j+fold,s=steps[i],cur=live&&i===n-1;
        /* the live disc's glyph is drawn at 14, where its moving parts pass the registry's size gate, and painted at
           12 (the Step Rail's narrow tier does the same), so it acts; finished discs are drawn at 10, still */
        return '<span class="tx-stretch-node '+(cur?'is-live':'is-done')+'" data-k="sn:'+esc(m.id)+'"'+(s.kind?' data-step-kind="'+esc(s.kind)+'"':'')
          +' data-hover-key="feed-node-'+esc(m.id)+'" data-hover-tip="'+tipOf(m,cur)+'">'+icon(s.glyph,cur?14:10)+'</span>';
      }).join('');
    const lastKind=steps[n-1]&&steps[n-1].kind;
    /* the live verb is keyed by its record, so a new step's label settles in (the Step Rail's 90 ms label beat) */
    const verb=sum.verb?'<span class="tx-stretch-verb'+(live?' pm-shimmer':'')+'"'+(live?' data-k="sv:'+esc(list[n-1].id)+'"':'')+'>'+esc(sum.verb)+'</span>'+(sum.rest?'<span class="tx-stretch-rest">'+esc(sum.sep+sum.rest)+'</span>':''):'<span class="tx-stretch-rest">'+esc(sum.rest)+'</span>';
    const sumText=(sum.verb?sum.verb+sum.sep:'')+sum.rest;
    const rows=list.map((m,i)=>{
      const s=steps[i],cur=live&&i===n-1,f=feedLine(m);
      const aria=f.label+(cur?', '+nowWord.toLowerCase():'')+(f.detail?'. '+f.detail:'');
      return '<div class="tx-work-line tx-stretch-row'+(cur?' is-live':'')+'" role="listitem" tabindex="0" data-k="sr:'+esc(m.id)+'"'+(s.kind?' data-step-kind="'+esc(s.kind)+'"':'')
        +' data-hover-key="feed-work-'+esc(m.id)+'" data-hover-tip="'+tipOf(m,cur)+'" aria-label="'+esc(aria)+'">'
        +'<span class="tx-work-glyph" aria-hidden="true">'+icon(s.glyph,13)+'</span><span class="tx-work-label">'+esc(f.label)+'</span>'
        +(f.detail?'<span class="tx-work-detail">'+esc(f.detail)+'</span>':'')
        +'<span class="tx-work-time">'+esc(clock(m))+'</span></div>';
    }).join('');
    const listLabel=(live?'Work so far':'Work records')+', '+plural(n,'record');
    return '<div class="tx-stretch" data-k="stretch:'+esc(o.id)+'" data-stretch="'+esc(o.id)+'" data-open="'+(open?'1':'0')+'"'+(live?' data-live="1"':'')+(live&&lastKind?' data-step-kind="'+esc(lastKind)+'"':'')+'>'
      +'<button type="button" class="tx-stretch-head" data-action="feed-stretch" data-stretch="'+esc(o.id)+'" aria-expanded="'+(open?'true':'false')+'" aria-controls="'+domId+'" aria-label="'+esc(sumText+', '+clock(list[n-1]))+'">'
      +'<span class="tx-stretch-rail" aria-hidden="true">'+nodes+'</span>'
      +'<span class="tx-stretch-sum">'+verb+'</span>'
      +'<span class="tx-stretch-time">'+esc(clock(list[n-1]))+'</span>'
      +'<span class="tx-stretch-chev" aria-hidden="true">'+icon('down',12)+'</span></button>'
      +'<div class="tx-stretch-rows" id="'+domId+'" role="list" aria-label="'+esc(listLabel)+'"'+(open?'':' hidden')+'>'+rows+'</div></div>';
  }
  /* The toggle. It patches the three attributes in place (the next render writes the same from OPEN) and moves the
     list by height and opacity, its rows by transform and opacity, one beat apart (the Step Rail's row cascade), in
     the feed's voice (--nx-ease: Retro and NieR step). All three reduced routes: the end state at once. */
  function stillMotion(){
    return !!((window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      ||document.body.classList.contains('pm56-reduced')||document.documentElement.getAttribute('data-motion')==='reduced');
  }
  function token(name,d){const v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));return isFinite(v)&&v>0?v:d;}
  E.action('feed-stretch',(ctx,btn)=>{
    const id=btn&&btn.dataset.stretch,box=btn&&btn.closest('.tx-stretch');
    const rows=box&&box.querySelector(':scope > .tx-stretch-rows');
    if(!id||!rows) return false;
    const open=!OPEN.has(id);
    if(open) OPEN.add(id); else OPEN.delete(id);
    btn.setAttribute('aria-expanded',open?'true':'false');
    box.setAttribute('data-open',open?'1':'0');
    rows.getAnimations().forEach(a=>a.cancel());
    for(const r of rows.children) r.getAnimations().forEach(a=>a.cancel());
    if(stillMotion()){rows.hidden=!open;return true;}
    const feed=box.closest('.tx-feed');
    const ease=(feed&&getComputedStyle(feed).getPropertyValue('--nx-ease').trim())||'cubic-bezier(.2,.75,.25,1)';
    const dur=token('--pm-t-panel',320);
    if(open){
      rows.hidden=false;
      const h=rows.scrollHeight;
      rows.animate([{height:'0px',opacity:0},{height:h+'px',opacity:1}],{duration:dur,easing:ease});
      const beat=token('--pm-t-cascade',45),rd=token('--pm-t-handoff',220);
      Array.from(rows.children).forEach((r,i)=>r.animate([{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'none'}],{duration:rd,delay:Math.min(i,6)*beat,easing:ease,fill:'backwards'}));
    }else{
      const h=rows.offsetHeight;
      const a=rows.animate([{height:h+'px',opacity:1},{height:'0px',opacity:0}],{duration:token('--pm-t-handoff',220),easing:ease,fill:'forwards'});
      a.onfinish=()=>{if(!OPEN.has(id)) rows.hidden=true;a.cancel();};
    }
    return true;
  });
  /* Disc and line are one record: pointing at (or focusing) a record's line in an open stretch rings its disc on the
     rail (the Step Rail's pinned look), and pointing at a disc marks its line. A class only, set and cleared here;
     a re-render simply drops it. */
  function pairOf(el){
    const box=el.closest('.tx-stretch'),k=el.getAttribute('data-k')||'',row=el.classList.contains('tx-stretch-row');
    const id=k.slice(3);if(!box||!id) return null;
    return box.querySelector(row?'.tx-stretch-node[data-k="sn:'+CSS.escape(id)+'"]':'.tx-stretch-row[data-k="sr:'+CSS.escape(id)+'"]');
  }
  function pairs(e,on){
    const el=e.target&&e.target.closest&&e.target.closest('.tx-feed .tx-stretch-row, .tx-feed .tx-stretch-node:not(.is-fold)');
    if(!el||(!on&&e.relatedTarget&&el.contains(e.relatedTarget))) return;
    const mate=pairOf(el);
    el.classList.toggle('is-paired',on);if(mate) mate.classList.toggle('is-paired',on);
  }
  document.addEventListener('pointerover',e=>pairs(e,true),{passive:true});
  document.addEventListener('pointerout',e=>pairs(e,false),{passive:true});
  document.addEventListener('focusin',e=>pairs(e,true));
  document.addEventListener('focusout',e=>pairs(e,false));
  window.PM56_RECORDS={reference,kindLabel,formatRecord,feedLine,stepOf,stretchSummary,feedStretch};
})();
