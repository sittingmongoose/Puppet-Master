/* bsd.js — feature module.  OWNER: Back Seat Driver (Assistant redesign, 2026-09-03).
 *
 * WHAT BSD IS
 * -----------
 * A separate PASSIVE ADVISOR. It is deliberately NOT one of the four
 * collaborative workflow kinds and is deliberately NOT in the Multi-Agent
 * Workflows manager: modelling it as a workflow would imply it participates in
 * a run, and it never does. It is read-only, it never authorizes, mutates,
 * certifies or substitutes for required review, and the primary flow must
 * complete identically whether BSD is Off, Auto, On, degraded or quarantined.
 *
 * THE ONE THING WORTH DEMONSTRATING
 * ---------------------------------
 * OMP-like HELD AND RECONFIRMED advice. An asynchronous advisor that raises a
 * concern against generation N and delivers it at generation N+2 is delivering
 * a claim about work that no longer exists. So a finding raised here is HELD,
 * re-evaluated against newer generations before delivery, and then either
 * CLEARED (the newer work already addressed it) or EMITTED (it still stands).
 * A one-step immediate warning would not prove the design, so the fixture runs
 * the full N -> hold -> N+2 -> clear/emit cycle and the panel shows every step
 * with its generation number.
 *
 * OWNERSHIP: Plans/Back_Seat_Driver.md. Settings owns the defaults
 * (assistant.bsd.*); this module owns the policy projection, the assignments,
 * the review cycles, the findings and their hold state.
 * NOT owned here: Usage totals (usage-feature), context materialization
 * (Prompt Pipeline), permissions, the primary run.
 */
(function(){
  'use strict';
  var D = window.PM56_DATA; if(!D) return;
  var EXT = window.PM56_EXT; if(!EXT || !EXT.slot) return;
  var RT = window.PM56_RUNTIME = window.PM56_RUNTIME || {};

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  /* ===================================================================
     1. POLICY + FIXTURE
     Defaults mirror machine/settings.json assistant.bsd.* exactly. Settings
     owns those values; this record is the operational projection of them.
     =================================================================== */
  var SEED = {
    demo:true,
    sessionEpoch:1,
    reprimeRequired:false,
    mode:'auto',                       /* off | auto | on -- Auto is the default */
    model:{ requested:'Default resolver', effective:'Claude Sonnet 4.6' },
    persona:{ requested:'Critical Advisor', effective:'Critical Advisor' },
    sensitivity:'balanced',
    catchUpSeconds:30,
    cooldownTurns:3,
    retainTranscript:true,
    selfCompactThreshold:0.8,
    /* Liveness. `state` drives the compact Context row's nine states. */
    state:'idle',                      /* off|idle|reviewing|catching_up|held|delivered|quota_paused|failed|unavailable */
    checkedSecondsAgo:18,
    generation:14,                     /* the primary flow's current generation */
    cursor:12,                         /* the last generation BSD has read     */
    cooldownRemaining:0,
    quarantined:false,
    /* Stage bindings: BSD is configurable per workflow stage, and Auto binds a
       subset. Every one of these is read-only advice at that stage. */
    stages:[
      { id:'prd_builder',   label:'PRD Builder',            bound:true  },
      { id:'planning_wizard', label:'Planning Wizard',      bound:true  },
      { id:'ledger',        label:'Ledger / PlanUnit work', bound:true  },
      { id:'plan_compile',  label:'Plan Compile',           bound:false },
      { id:'worknode_create', label:'WorkNode creation',    bound:false },
      { id:'worknode_audit',  label:'WorkNode audit',       bound:true  },
      { id:'execution',     label:'Execution',              bound:true  },
      { id:'verification',  label:'Verification',           bound:false },
      { id:'remediation',   label:'Remediation',            bound:false },
      { id:'certification', label:'Certification',          bound:false }
    ],
    /* Findings. severity is exactly nit | concern | critical. */
    findings:[
      { id:'bsd-f1', severity:'critical', stage:'execution',
        title:'History rewrite would break the deployed rollback path',
        detail:'The proposed force-push rewrites two commits that the rehearsed rollback runbook references by hash.',
        raisedAtGeneration:11, status:'emitted', deliveredAtGeneration:11,
        history:[ {gen:11, what:'Raised against generation 11.'},
                  {gen:11, what:'Delivered immediately: the boundary was still current.'} ] },
      { id:'bsd-f2', severity:'concern', stage:'execution',
        title:'Index migration has no measured write-amplification bound',
        detail:'The migration adds a covering index without a recorded write-amplification measurement, and the objective caps it at 8%.',
        raisedAtGeneration:12, status:'held', heldSinceGeneration:12,
        history:[ {gen:12, what:'Raised against generation 12.'},
                  {gen:13, what:'Held: generation 13 changed the migration file; re-evaluating rather than delivering a stale claim.'},
                  {gen:14, what:'Still held at generation 14. Awaiting the next safe boundary.'} ] },
      { id:'bsd-f3', severity:'concern', stage:'ledger',
        title:'Two ledger atoms record the same decision',
        detail:'Atoms 0058 and 0079 both close the same question with different wording.',
        raisedAtGeneration:9, status:'cleared', clearedAtGeneration:11,
        history:[ {gen:9,  what:'Raised against generation 9.'},
                  {gen:10, what:'Held while generation 10 rewrote the ledger section.'},
                  {gen:11, what:'Cleared at generation 11: the newer work already merged both atoms. Never delivered.'} ] },
      { id:'bsd-f4', severity:'nit', stage:'planning_wizard',
        title:'Topic 4 restates topic 2 verbatim',
        detail:'Low value; suppressed under the balanced sensitivity setting.',
        raisedAtGeneration:13, status:'suppressed',
        history:[ {gen:13, what:'Raised and immediately suppressed: nit severity under balanced sensitivity.'} ] }
    ],
    /* Distinct Usage attribution. These are BSD's own numbers and are never
       folded into the primary run's totals. */
    usage:{ calls:24, noCalls:9, held:1, cleared:1, emitted:1, suppressed:1,
            timeouts:0, quotaPauses:1, failures:1,
            inputTokens:41200, outputTokens:3800, costUsd:0.021,
            model:'Claude Sonnet 4.6', account:'work', catchUpLatencyMs:820 },
    transcript:[
      { gen:12, role:'advisor', text:'Reading the delta for generation 12 in an isolated session. No primary context is shared and nothing here can write.' },
      { gen:12, role:'advisor', text:'Concern: the migration adds a covering index with no recorded write-amplification measurement.' },
      { gen:13, role:'system',  text:'Generation 13 changed the migration file. Holding the concern rather than delivering it against superseded work.' },
      { gen:14, role:'advisor', text:'Re-evaluated at generation 14. The measurement is still absent, so the concern stands and stays held for the next safe boundary.' }
    ]
  };
  SEED.findings.forEach(f=>{f.sessionEpoch=SEED.sessionEpoch;f.advisorModel=SEED.model.effective;f.advisorPersona=SEED.persona.effective;});
  RT.bsd = RT.bsd || JSON.parse(JSON.stringify(SEED));
  var BSD0 = JSON.stringify(SEED);
  function P(){ return RT.bsd; }

  var STATE_LABEL = {
    off:'Off', idle:'Idle', reviewing:'Reviewing', catching_up:'Catching up',
    held:'Finding held', delivered:'Advice delivered', quota_paused:'Quota paused',
    failed:'Failed', unavailable:'Unavailable'
  };
  var STATE_TONE = {
    off:'idle', idle:'idle', reviewing:'working', catching_up:'working',
    held:'attention', delivered:'changed', quota_paused:'attention',
    failed:'blocked', unavailable:'blocked'
  };
  var SEV_LABEL = { nit:'Nit', concern:'Concern', critical:'Critical' };

  function liveState(){
    var p=P();
    if(p.mode==='off') return 'off';
    if(p.quarantined) return 'failed';
    return p.state;
  }
  function heldFindings(){ return P().findings.filter(function(f){ return f.status==='held' && f.sessionEpoch===P().sessionEpoch; }); }
  function emitted(){ return P().findings.filter(function(f){ return f.status==='emitted' && f.sessionEpoch===P().sessionEpoch; }); }

  /* ===================================================================
     2. COMPACT CONTEXT ROW
     Two lines exactly, per the packet: mode + Persona, then liveness.
     The row OPENS Context Details scrolled to BSD; it never sets the mode.
     =================================================================== */
  function contextRow(ctx){
    var p=P(), st=liveState(), held=heldFindings().length;
    var line2 = st==='off' ? 'Not running'
      : st==='catching_up' ? 'Catching up · cursor at generation '+p.cursor+' of '+p.generation
      : st==='held' ? held+' finding'+(held===1?'':'s')+' held · not shown as confirmed'
      : st==='quota_paused' ? 'Paused on provider usage · primary flow unaffected'
      : st==='failed' ? 'Isolated failure · primary flow unaffected'
      : st==='unavailable' ? 'Advisor route unavailable'
      : st==='reviewing' ? 'Reviewing the delta for generation '+p.generation
      : 'Caught up · checked '+p.checkedSecondsAgo+'s ago';
    return '<div class="menu-divider" data-k="bsd-div"></div>'+
      '<button class="menu-item bsd-ctx-row" data-action="bsd-open-details" data-k="bsd-ctx-row">'+
        '<span class="menu-icon">'+ctx.icon('eye',13)+'</span>'+
        '<span class="menu-copy"><strong>BSD</strong>'+
          '<span>'+esc(STATE_LABEL[st])+(st!=='off'?' · '+esc(p.persona.effective):'')+'</span></span>'+
        '<span class="bsd-live bsd-tone-'+esc(STATE_TONE[st])+'">'+esc(line2)+'</span>'+
      '</button>';
  }

  /* ===================================================================
     3. CONTEXT DETAILS SECTION
     Policy, identity, stage bindings, cursor, triggers, findings (with the
     full hold history), isolated context, Usage, failure, watch guidance.
     =================================================================== */
  function findingRow(ctx,f){
    var badge = '<span class="bsd-sev bsd-sev-'+esc(f.severity)+'">'+esc(SEV_LABEL[f.severity])+'</span>';
    var status = '<span class="bsd-status bsd-status-'+esc(f.status)+'">'+esc(f.status)+'</span>';
    var stale = f.sessionEpoch!==P().sessionEpoch ? '<span class="bsd-stale">Previous session · '+esc(f.advisorModel)+'</span>' : (f.status==='emitted' && f.deliveredAtGeneration < P().generation - 1)
      ? '<span class="bsd-stale">Not reconfirmed · gen '+f.deliveredAtGeneration+'</span>' : '';
    return '<div class="bsd-finding" data-k="bsd-f-'+esc(f.id)+'">'+
      '<div class="bsd-finding-head">'+badge+status+
        '<span class="bsd-gen">gen '+f.raisedAtGeneration+'</span>'+
        '<span class="spacer"></span>'+
        '<button class="text-button" data-action="bsd-open-finding" data-id="'+esc(f.id)+'">History</button></div>'+
      '<strong class="bsd-finding-title">'+esc(f.title)+'</strong>'+
      (RT.bsdOpenFinding===f.id?'<p class="bsd-finding-detail">'+esc(f.detail)+'</p>':'')+ stale +
      (RT.bsdOpenFinding===f.id
        ? '<div class="bsd-history">'+f.history.map(function(h){
            return '<div class="bsd-hrow"><span class="bsd-hgen">gen '+h.gen+'</span><span>'+esc(h.what)+'</span></div>';
          }).join('')+'</div>'
        : '')+
    '</div>';
  }

  function detailsSection(ctx){
    var p=P(), st=liveState(), bound=p.stages.filter(s=>s.bound);
    return '<section class="bsd-section" data-k="bsd-section" id="ctx-bsd">'+
      '<div class="bsd-summary-head"><span class="bsd-live">'+esc(STATE_LABEL[st])+' · '+esc(p.mode)+'</span><button class="soft-button" data-action="bsd-configure-stages">'+ctx.icon('sliders',12)+' Configure</button></div>'+
      '<div class="bsd-summary-identity"><strong>'+esc(p.model.effective)+'</strong><span>'+esc(p.persona.effective)+'</span></div>'+
      '<div class="bsd-summary-metrics"><span>Checked '+p.cursor+'/'+p.generation+'</span><span>'+bound.length+' stages</span><span>'+heldFindings().length+' held</span></div>'+
      '<details class="bsd-disclosure"><summary>Findings <span>'+p.findings.length+'</span></summary><div class="bsd-findings">'+p.findings.map(f=>findingRow(ctx,f)).join('')+'</div></details>'+
      '<details class="bsd-disclosure"><summary>Session & usage</summary><dl class="bsd-session-grid">'+
        [['Session',p.sessionEpoch],['Context',p.reprimeRequired?'Awaiting priming':'Current'],['Requested model',p.model.requested],['Effective model',p.model.effective],['Persona',p.persona.requested],['Sensitivity',p.sensitivity],['Catch-up cap',p.catchUpSeconds+' sec'],['Cooldown',p.cooldownTurns+' turns'],['Self-compact',Math.round(p.selfCompactThreshold*100)+'%'],['Calls',p.usage.calls],['No calls',p.usage.noCalls],['Cost','$'+p.usage.costUsd.toFixed(3)]].map(r=>'<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>').join('')+'</dl>'+
        '<div class="bsd-summary-actions"><button class="soft-button" data-action="bsd-open-usage">Usage</button><button class="soft-button" data-action="bsd-open-transcript" '+(!p.retainTranscript?'disabled':'')+'>Transcript</button></div></details>'+
      (p.quarantined?'<p class="bsd-quarantine">Advisor unavailable · primary work unaffected</p>':'')+'</section>';
  }

  var configDraft=null;
  function beginConfig(ctx){
    configDraft=JSON.parse(JSON.stringify(P()));
    configDraft.modelId=configDraft.model.id||(D.models.find(m=>m.name===configDraft.model.effective)||D.models[0]).id;
    ctx.closeMenu();ctx.openDialog({type:'bsd-stages'});
  }
  function configDialog(ctx){
    var d=configDraft;if(!d){configDraft=JSON.parse(JSON.stringify(P()));d=configDraft;d.modelId=(D.models.find(m=>m.name===d.model.effective)||D.models[0]).id;}
    const pick=window.PM56_PICKERS;
    return '<section class="demo-dialog bsd-dialog bsd-configure" role="dialog" aria-label="Configure Back Seat Driver" data-k="bsd-configure">'+
      '<div class="demo-dialog-head"><strong>Back Seat Driver</strong><span class="meta-pill">Read-only advisor</span><span class="spacer"></span><button class="icon-button" data-action="bsd-close-dialog" title="Cancel">'+ctx.icon('close',13)+'</button></div>'+
      '<div class="demo-dialog-body"><div class="bsd-config-mode">'+['off','auto','on'].map(v=>'<button class="soft-button '+(d.mode===v?'active':'')+'" data-action="bsd-config-mode" data-value="'+v+'">'+v[0].toUpperCase()+v.slice(1)+'</button>').join('')+'</div>'+
      '<div class="bsd-config-pickers"><label>Advisor model'+pick.modelButton('bsd-pick-model','bsd-model',d.modelId)+'</label><label>Persona'+pick.personaButton('bsd-pick-persona','bsd-persona',d.persona.requested)+'</label></div>'+
      '<div class="bsd-config-grid"><label>Trigger sensitivity<select data-bsd-field="sensitivity">'+['conservative','balanced','frequent'].map(v=>'<option value="'+v+'" '+(d.sensitivity===v?'selected':'')+'>'+v[0].toUpperCase()+v.slice(1)+'</option>').join('')+'</select></label>'+
      '<label>Catch-up cap<select data-bsd-field="catchUpSeconds">'+[0,15,30,60].map(v=>'<option value="'+v+'" '+(d.catchUpSeconds===v?'selected':'')+'>'+(v?v+' seconds':'Never wait')+'</option>').join('')+'</select></label>'+
      '<label>Cooldown · turns<input data-bsd-field="cooldownTurns" type="number" min="0" max="100" value="'+d.cooldownTurns+'"></label>'+
      '<label>Self-compact · %<input data-bsd-field="selfCompactThreshold" type="number" min="10" max="95" step="5" value="'+Math.round(d.selfCompactThreshold*100)+'"></label></div>'+
      '<label class="bsd-retain"><input type="checkbox" data-bsd-field="retainTranscript" '+(d.retainTranscript?'checked':'')+'>Retain advisor transcript</label>'+
      '<details class="bsd-disclosure"><summary>Workflow stages <span>'+d.stages.filter(s=>s.bound).length+' of '+d.stages.length+'</span></summary><div class="bsd-stage-grid">'+d.stages.map(s=>'<label class="bsd-stage-row"><input type="checkbox" data-bsd-stage="'+esc(s.id)+'" '+(s.bound?'checked':'')+'><span>'+esc(s.label)+'</span></label>').join('')+'</div></details>'+
      '<div class="bsd-config-error" role="alert">'+esc(d.error||'')+'</div></div>'+
      '<div class="demo-dialog-foot"><button class="soft-button" data-action="bsd-close-dialog">Cancel</button><button class="primary-button" data-action="bsd-save-config">Save configuration</button></div></section>';
  }
  document.addEventListener('change',function(e){
    if(!configDraft)return;
    const el=e.target, key=el.dataset.bsdField, stage=el.dataset.bsdStage;
    if(stage){const s=configDraft.stages.find(x=>x.id===stage);if(s)s.bound=el.checked;return;}
    if(!key)return;
    configDraft[key]=key==='retainTranscript'?el.checked:key==='selfCompactThreshold'?Number(el.value)/100:['cooldownTurns','catchUpSeconds'].includes(key)?Number(el.value):el.value;
  });
  ['model','persona'].forEach(kind=>EXT.action('bsd-pick-'+kind,function(ctx,btn){
    const draft=configDraft;if(!draft)return true;
    window.PM56_PICKERS[kind==='model'?'openModel':'openPersona'](btn,{model:draft.modelId,persona:draft.persona.requested,effort:draft.model.effort,fast:draft.model.fast},v=>{
      if(configDraft!==draft||ctx.state.dialog?.type!=='bsd-stages')return;
      if(kind==='persona')draft.persona={requested:v.persona,effective:v.persona};
      else{
        const model=D.models.find(m=>m.id===v.model);if(!model)return;
        draft.modelId=v.model;draft.model={id:v.model,requested:model.name,effective:model.name,effort:v.effort,fast:v.fast};
      }
      ctx.renderOverlays();
    });return true;
  }));
  EXT.action('bsd-config-mode',function(ctx,btn){if(configDraft)configDraft.mode=btn.dataset.value;ctx.renderOverlays();return true;});
  EXT.action('bsd-save-config',function(ctx){
    const d=configDraft;if(!d)return true;
    if(!Number.isInteger(d.cooldownTurns)||d.cooldownTurns<0||d.cooldownTurns>100||!Number.isFinite(d.selfCompactThreshold)||d.selfCompactThreshold<.1||d.selfCompactThreshold>.95){d.error='Check cooldown and compaction limits.';ctx.renderOverlays();return true;}
    const p=P();
    const identityChanged=JSON.stringify([p.model.id||p.model.effective,p.model.effort,p.model.fast,p.persona.effective])!==JSON.stringify([d.model.id||d.model.effective,d.model.effort,d.model.fast,d.persona.effective]);
    ['mode','model','persona','sensitivity','catchUpSeconds','cooldownTurns','retainTranscript','selfCompactThreshold','stages'].forEach(k=>p[k]=JSON.parse(JSON.stringify(d[k])));
    if(identityChanged){
      // Historical findings retain their own advisor identity. A replacement
      // advisor has not read the old cursor and must not reconfirm old advice.
      p.sessionEpoch+=1;p.reprimeRequired=true;p.cursor=0;p.checkedSecondsAgo=null;p.cooldownRemaining=0;
      p.transcript.push({gen:p.generation,role:'system',sessionEpoch:p.sessionEpoch,text:'Advisor changed. New session awaits context priming.'});
    }
    p.revision=(p.revision||0)+1;p.state=p.mode==='off'?'off':p.cursor<p.generation?'catching_up':'idle';
    configDraft=null;ctx.closeMenu();ctx.closeDialog();ctx.renderApp();return true;
  });

  /* ===================================================================
     4. TRANSCRIPT ADVICE CARD
     Silent, duplicate and cleared evaluations create NO transcript noise --
     only an emitted finding renders. Held findings never render here.
     =================================================================== */
  EXT.slot('transcriptMessage', function(ctx){
    var m=ctx.m; if(!m || m.type!=='bsd-advice-v2') return '';
    var f=P().findings.filter(function(x){return x.id===m.findingId;})[0];
    if(!f || f.status!=='emitted') return '';
    return '<article class="event-card bsd-card" data-k="bsd-card-'+esc(f.id)+'" data-message-id="'+esc(m.id||'')+'">'+
      '<span class="event-icon">'+ctx.icon('eye',14)+'</span>'+
      '<div class="event-copy">'+
        '<strong><span class="bsd-sev bsd-sev-'+esc(f.severity)+'">'+esc(SEV_LABEL[f.severity])+'</span> '+esc(f.title)+'</strong>'+
        '<p>'+esc(f.detail)+'</p>'+
        '<p class="bsd-attr">Back Seat Driver · '+esc(f.advisorModel||P().model.effective)+' · gen '+f.raisedAtGeneration+'</p>'+
      '</div>'+
      '<div class="plan-actions">'+
        '<button class="soft-button" data-action="bsd-open-finding" data-id="'+esc(f.id)+'">Evidence</button>'+
        '<button class="text-button" data-action="bsd-dismiss" data-id="'+esc(f.id)+'">Dismiss</button>'+
      '</div></article>';
  });

  /* ===================================================================
     5. WAND ROW  (Off / Auto / On / Configure…)
     Check state comes from the owner projection, not a local checkbox.
     =================================================================== */
  EXT.slot('wandRows', function(ctx){
    var p=P();
    return '<button class="menu-item" data-submenu="bsd-v2" data-k="bsd-wand">'+
      '<span class="menu-icon">'+ctx.icon('eye',13)+'</span>'+
      '<span class="menu-copy"><strong>Back Seat Driver</strong><span>Passive read-only advisor</span></span>'+
      '<span class="shortcut">'+esc(p.mode==='auto'?'Auto':p.mode==='on'?'On':'Off')+'</span>'+
      '<span class="chevron">'+ctx.icon('chevron',11)+'</span></button>';
  });

  /* The wand row above declares data-submenu="bsd-v2"; this renders it.
     Without it the row opened a real but EMPTY sidecar. Off / Auto · Default /
     On, then a divider and Configure…, exactly as 04_GUI_IMPACTS §4 specifies. */
  EXT.slot('submenu', function(ctx){
    if(ctx.id !== 'bsd-v2') return '';
    var p=P();
    var opts=[['off','Off','No advisor runs; nothing about the primary work changes'],
              ['auto','Auto','Advise only when a delta is material · Default'],
              ['on','On','Evaluate every substantial turn']];
    return '<div class="menu-head"><strong>Back Seat Driver</strong><span class="spacer"></span>'+
        '<span class="chat-meta">Read-only</span></div>'+
      opts.map(function(o){
        return '<button class="menu-item'+(p.mode===o[0]?' active':'')+'" data-action="bsd-set-mode" data-value="'+o[0]+'">'+
          '<span class="menu-copy"><strong>'+esc(o[1])+'</strong><span>'+esc(o[2])+'</span></span>'+
          (p.mode===o[0]?ctx.icon('check',11):'')+'</button>';
      }).join('')+
      '<div class="menu-divider"></div>'+
      '<button class="menu-item" data-action="bsd-configure-stages">'+
        '<span class="menu-copy"><strong>Configure…</strong><span>Stage bindings, severity and cooldown</span></span>'+
      '</button>';
  });

  EXT.slot('contextBsdRow', contextRow);
  EXT.slot('contextBsdSection', detailsSection);

  /* ===================================================================
     6. DIALOGS — stage configuration, finding detail, advisor transcript
     =================================================================== */
  EXT.slot('dialog', function(ctx){
    var d=ctx.state.dialog; if(!d) return '';
    var p=P();
    if(d.type==='bsd-stages')return configDialog(ctx);
    if(d.type==='bsd-transcript'){
      return '<div class="demo-dialog bsd-dialog" data-k="bsd-transcript-dialog">'+
        '<div class="demo-dialog-head"><strong>Advisor transcript</strong><span class="spacer"></span>'+
          '<button class="icon-button" data-action="bsd-close-dialog">'+ctx.icon('close',13)+'</button></div>'+
        '<div class="demo-dialog-body">'+
          '<p class="bsd-sub">Advisor session history</p>'+
          p.transcript.map(function(t){
            return '<div class="bsd-tline bsd-tline-'+esc(t.role)+'"><span class="bsd-hgen">gen '+t.gen+'</span><p>'+esc(t.text)+'</p></div>';
          }).join('')+
        '</div></div>';
    }
    return '';
  });

  /* ===================================================================
     7. ACTIONS
     =================================================================== */
  function reRender(ctx){ ctx.renderApp(); ctx.renderOverlays && ctx.renderOverlays(); }

  var ACTIONS = {
    'bsd-set-mode': function(ctx,btn){
      var p=P(); p.mode=btn.dataset.value;
      p.state = p.mode==='off' ? 'off' : (p.cursor<p.generation ? 'catching_up' : 'idle');
      reRender(ctx);
      ctx.toast('Back Seat Driver '+(p.mode==='auto'?'set to Auto':p.mode==='on'?'turned On':'turned Off'),
        p.mode==='off' ? 'No advisor runs. Nothing about your primary work changes -- it never depended on BSD.'
                       : 'Read-only advice only. It cannot approve, mutate, or certify anything.');
    },
    'bsd-open-details': function(ctx){
      ctx.closeMenu && ctx.closeMenu();
      ctx.state.context = ctx.state.context || {};
      ctx.state.context.details = true;
      ctx.state.context.drawerView='curated';
      ctx.state.context.polishSections=Object.assign({},ctx.state.context.polishSections,{'Back Seat Driver':true});
      reRender(ctx);
      setTimeout(function(){ var el=document.getElementById('ctx-bsd'); if(el) el.scrollIntoView({block:'start'}); }, 30);
    },
    'bsd-configure-stages': beginConfig,
    'bsd-close-dialog': function(ctx){ configDraft=null;ctx.closeMenu();ctx.closeDialog(); },
    'bsd-toggle-stage': function(ctx,btn){
      var id=btn.dataset.id, p=P();
      p.stages.forEach(function(s){ if(s.id===id) s.bound=!s.bound; });
      reRender(ctx);
    },
    'bsd-open-finding': function(ctx,btn){
      RT.bsdOpenFinding = (RT.bsdOpenFinding===btn.dataset.id) ? null : btn.dataset.id;
      ctx.state.context = ctx.state.context || {};
      ctx.state.context.details = true;
      reRender(ctx);
    },
    'bsd-open-transcript': function(ctx){ ctx.openDialog({type:'bsd-transcript'}); },
    'bsd-open-usage': function(ctx){
      ctx.toast('Usage · Back Seat Driver', 'BSD usage is attributed separately: '+P().usage.calls+' calls, $'+P().usage.costUsd.toFixed(3)+', never folded into the primary run.');
    },
    'bsd-dismiss': function(ctx,btn){
      var id=btn.dataset.id;
      P().findings.forEach(function(f){ if(f.id===id){ f.status='suppressed'; f.history.push({gen:P().generation, what:'Dismissed by the user at generation '+P().generation+'.'}); } });
      reRender(ctx);
    },
    /* The demonstration the packet asks for: advance the primary flow a
       generation and let the held finding be re-evaluated for real. */
    'bsd-advance-generation': function(ctx){
      var p=P();
      p.generation += 1;
      p.cursor = p.generation - 1;
      p.state='catching_up';
      var held=heldFindings();
      held.forEach(function(f){
        var age = p.generation - f.raisedAtGeneration;
        if(age>=3){
          /* Re-evaluated against work that already addressed it. */
          f.status='cleared'; f.clearedAtGeneration=p.generation;
          f.history.push({gen:p.generation, what:'Cleared at generation '+p.generation+': the newer work addressed it. Never delivered as current.'});
        } else {
          f.history.push({gen:p.generation, what:'Still held at generation '+p.generation+'. Re-evaluated against the newer delta rather than delivered.'});
        }
      });
      p.cursor=p.generation;p.reprimeRequired=false;
      p.state = heldFindings().length ? 'held' : 'idle';
      p.checkedSecondsAgo=2;
      reRender(ctx);
      ctx.toast('Generation '+p.generation,
        'Held findings were re-evaluated against the newer work. A concern raised two generations ago is never delivered as if it were current.');
    },
    'bsd-simulate-failure': function(ctx){
      var p=P(); p.quarantined=!p.quarantined; p.state=p.quarantined?'failed':'idle';
      reRender(ctx);
      ctx.toast(p.quarantined?'Advisor quarantined':'Advisor recovered',
        p.quarantined?'The advisor failed in isolation. Your primary work is unaffected and continues normally.'
                     :'The advisor is reading again from its recorded cursor.');
    }
  };
  Object.keys(ACTIONS).forEach(function(n){ EXT.action(n, function(ctx,btn,ev){ ACTIONS[n](ctx,btn,ev); return true; }); });

  var prevReset = EXT._actions && EXT._actions['reset-all'];
  EXT.chainAction('reset-all', function(ctx,btn,ev){
    RT.bsd = JSON.parse(BSD0); RT.bsdOpenFinding=null;
    configDraft=null;return false;
  });

  window.PM56_BSD = {
    policy:P, state:liveState, held:heldFindings, emitted:emitted,
    restore:function(){ RT.bsd = JSON.parse(BSD0); }
  };
})();
