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
  function heldFindings(){ return P().findings.filter(function(f){ return f.status==='held'; }); }
  function emitted(){ return P().findings.filter(function(f){ return f.status==='emitted'; }); }

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
    var stale = (f.status==='emitted' && f.deliveredAtGeneration < P().generation - 1)
      ? '<p class="bsd-stale">Delivered against generation '+f.deliveredAtGeneration+' and not reconfirmed since. Treat as stale, not current.</p>' : '';
    return '<div class="bsd-finding" data-k="bsd-f-'+esc(f.id)+'">'+
      '<div class="bsd-finding-head">'+badge+status+
        '<span class="bsd-gen">raised at generation '+f.raisedAtGeneration+'</span>'+
        '<span class="spacer"></span>'+
        '<button class="text-button" data-action="bsd-open-finding" data-id="'+esc(f.id)+'">History</button></div>'+
      '<strong class="bsd-finding-title">'+esc(f.title)+'</strong>'+
      '<p class="bsd-finding-detail">'+esc(f.detail)+'</p>'+ stale +
      (RT.bsdOpenFinding===f.id
        ? '<div class="bsd-history">'+f.history.map(function(h){
            return '<div class="bsd-hrow"><span class="bsd-hgen">gen '+h.gen+'</span><span>'+esc(h.what)+'</span></div>';
          }).join('')+'</div>'
        : '')+
    '</div>';
  }

  function detailsSection(ctx){
    var p=P(), st=liveState();
    var bound=p.stages.filter(function(s){return s.bound;});
    return '<section class="context-section bsd-section" data-k="bsd-section" id="ctx-bsd">'+
      '<h3>Back Seat Driver</h3>'+
      '<div class="context-section-body">'+
        '<div class="bsd-policy" data-k="bsd-policy">'+
          '<div class="metric-card"><label>Mode</label><strong>'+esc(p.mode==='auto'?'Auto':p.mode==='on'?'On':'Off')+'</strong></div>'+
          '<div class="metric-card"><label>State</label><strong>'+esc(STATE_LABEL[st])+'</strong></div>'+
          '<div class="metric-card"><label>Cursor</label><strong>'+p.cursor+' / '+p.generation+'</strong></div>'+
          '<div class="metric-card"><label>Cooldown</label><strong>'+p.cooldownRemaining+' / '+p.cooldownTurns+'</strong></div>'+
        '</div>'+
        '<p class="bsd-identity">Requested <b>'+esc(p.model.requested)+'</b> · effective <b>'+esc(p.model.effective)+'</b> · Persona <b>'+esc(p.persona.effective)+'</b>'+
          (p.model.requested!==p.model.effective?' <span class="bsd-sub">(the resolver chose the effective model; the request is recorded)</span>':'')+'</p>'+
        '<p class="bsd-isolation">Runs in its own isolated context and tool session with bounded deltas. It reads a redacted projection of the primary work and can write nothing. Self-compacts at '+Math.round(p.selfCompactThreshold*100)+'% of its own window; that compaction never touches your conversation.</p>'+
        '<div class="bsd-stages" data-k="bsd-stages">'+
          '<div class="bsd-stages-head"><strong>Stage bindings</strong><span class="spacer"></span>'+
            '<button class="text-button" data-action="bsd-configure-stages">Configure</button></div>'+
          '<div class="bsd-stage-chips">'+p.stages.map(function(s){
            return '<span class="bsd-stage'+(s.bound?' on':'')+'">'+esc(s.label)+'</span>';
          }).join('')+'</div>'+
          '<p class="bsd-sub">'+bound.length+' of '+p.stages.length+' stages bound. Advice at a bound stage is still read-only and never gates the stage.</p>'+
        '</div>'+
        '<div class="bsd-findings" data-k="bsd-findings">'+p.findings.map(function(f){return findingRow(ctx,f);}).join('')+'</div>'+
        '<div class="bsd-usage" data-k="bsd-usage">'+
          '<strong>Usage · attributed to Back Seat Driver only</strong>'+
          '<div class="bsd-usage-grid">'+
            [['Calls',p.usage.calls],['No-call evaluations',p.usage.noCalls],['Held',p.usage.held],['Cleared',p.usage.cleared],
             ['Emitted',p.usage.emitted],['Suppressed',p.usage.suppressed],['Timeouts',p.usage.timeouts],
             ['Quota pauses',p.usage.quotaPauses],['Failures',p.usage.failures],['Catch-up latency',p.usage.catchUpLatencyMs+' ms']]
              .map(function(r){return '<div><label>'+esc(r[0])+'</label><b>'+esc(r[1])+'</b></div>';}).join('')+
          '</div>'+
          '<p class="bsd-sub">'+esc(p.usage.model)+' · account '+esc(p.usage.account)+' · '+p.usage.inputTokens.toLocaleString()+' in / '+p.usage.outputTokens.toLocaleString()+' out · $'+p.usage.costUsd.toFixed(3)+'. These totals are separate from the primary run and are never folded into it.</p>'+
          '<button class="soft-button" data-action="bsd-open-usage">'+ctx.icon('chart',12)+' Open Usage</button>'+
          '<button class="soft-button" data-action="bsd-open-transcript">'+ctx.icon('document',12)+' Advisor transcript</button>'+
        '</div>'+
        (p.quarantined?'<div class="bsd-quarantine">'+ctx.icon('warning',13)+'<div><strong>Advisor output quarantined</strong><p>The advisor returned malformed output and was isolated. Your work continued without interruption, and nothing it produced was admitted.</p></div></div>':'')+
        /* The two behaviours worth PROVING rather than describing. Both actions
           existed from the first draft of this module but nothing rendered a
           control for them, so the hold/reconfirm cycle and the failure
           isolation were unreachable and therefore unverifiable. bsd-verify.mjs
           drives these two buttons. */
        '<div class="bsd-demo" data-k="bsd-demo">'+
          '<strong>Demonstrate</strong>'+
          '<p class="bsd-sub">A concern raised against generation '+p.generation+' is held and re-evaluated against newer work before it is delivered. Advance the primary flow to watch a held finding be cleared or re-confirmed rather than delivered as if it were current.</p>'+
          '<div class="bsd-demo-row">'+
            '<button class="soft-button" data-action="bsd-advance-generation">'+ctx.icon('step',12)+' Advance a generation</button>'+
            '<button class="soft-button" data-action="bsd-simulate-failure">'+ctx.icon('warning',12)+' '+(p.quarantined?'Recover the advisor':'Fail the advisor')+'</button>'+
          '</div>'+
        '</div>'+
        '<p class="bsd-sub bsd-watch">Watch guidance: BSD reads the project through the same permission ceiling as the primary flow and never widens it. It cannot approve, merge, certify, or stand in for a required review or test.</p>'+
      '</div>'+
    '</section>';
  }

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
        '<p class="bsd-attr">Back Seat Driver · '+esc(P().persona.effective)+' · '+esc(P().model.effective)+' · read-only advice against generation '+f.raisedAtGeneration+'</p>'+
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
    if(d.type==='bsd-stages'){
      return '<div class="demo-dialog bsd-dialog" data-k="bsd-stage-dialog">'+
        '<div class="demo-dialog-head"><strong>Back Seat Driver stages</strong><span class="spacer"></span>'+
          '<button class="icon-button" data-action="bsd-close-dialog">'+ctx.icon('close',13)+'</button></div>'+
        '<div class="demo-dialog-body">'+
          '<p class="bsd-sub">Bind the advisor to the stages where a second opinion is worth its cost. Every binding is read-only: a bound stage is never gated, blocked, or certified by BSD.</p>'+
          p.stages.map(function(s){
            return '<label class="bsd-stage-row" data-k="bsd-sr-'+esc(s.id)+'">'+
              '<input type="checkbox" data-action="bsd-toggle-stage" data-id="'+esc(s.id)+'"'+(s.bound?' checked':'')+'>'+
              '<span>'+esc(s.label)+'</span></label>';
          }).join('')+
        '</div>'+
        '<div class="demo-dialog-foot"><button class="primary-button" data-action="bsd-close-dialog">Done</button></div>'+
      '</div>';
    }
    if(d.type==='bsd-transcript'){
      return '<div class="demo-dialog bsd-dialog" data-k="bsd-transcript-dialog">'+
        '<div class="demo-dialog-head"><strong>Advisor transcript</strong><span class="spacer"></span>'+
          '<button class="icon-button" data-action="bsd-close-dialog">'+ctx.icon('close',13)+'</button></div>'+
        '<div class="demo-dialog-body">'+
          '<p class="bsd-sub">This is the advisor\'s own isolated session. It is retained because <code>assistant.bsd.retain_transcript</code> is on.</p>'+
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
      reRender(ctx);
      setTimeout(function(){ var el=document.getElementById('ctx-bsd'); if(el) el.scrollIntoView({block:'start'}); }, 30);
    },
    'bsd-configure-stages': function(ctx){ ctx.openDialog({type:'bsd-stages'}); },
    'bsd-close-dialog': function(ctx){ ctx.closeDialog(); },
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
      p.cursor=p.generation;
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
    return prevReset ? prevReset(ctx,btn,ev) : false;
  });

  window.PM56_BSD = {
    policy:P, state:liveState, held:heldFindings, emitted:emitted,
    restore:function(){ RT.bsd = JSON.parse(BSD0); }
  };
})();
