
/* PM7 Guided Tour: deterministic real-shell teacher */
(function () {
  'use strict';
  function installGuidedTour() {
  var root=document.getElementById('pm7-guided-tour'),resumeButton=document.getElementById('pm7-guided-tour-resume'),replayButton=document.getElementById('pm7-guided-tour-replay'),eli5Button=document.getElementById('pm7gt-eli5');
  if(!root||!resumeButton||!replayButton||!eli5Button||window.PM7_GUIDED_TOUR)return;
  var stage=root.querySelector('[data-guided-tour-layer="current"]'),halo=root.querySelector('.pm7gt-halo'),pointer=root.querySelector('.pm7gt-pointer'),callout=root.querySelector('.pm7gt-callout');
  var backButton=root.querySelector('[data-ui-action-id="ui.guided_tour.back"]'),progress=root.querySelector('.pm7gt-progress'),forwardSlot=root.querySelector('.pm7gt-forward-slot');
  var AUTHORITATIVE_PROMPT='What happens before Puppet Master changes my files?';
  var AUTHORITATIVE_ANSWER={id:'before_files_change',normal:'Before work begins, Puppet Master turns your request into a plan. You can review the important choices, correct anything that looks wrong, and decide when to begin. Your Project permissions still control what the work may change.',eli5:'First, Puppet Master writes down what it thinks you want. You can fix the plan before anything starts. It waits for your decision to begin.'};
  var BOOK_CLUB_GOAL='Create a simple website for my neighborhood book club. It should show the next meeting, the current book, and how to join.';
  var BOOK_CLUB_OUTCOMES=['Visitors can see the next meeting.','Visitors can see the current book.','New members can learn how to join.'];
  var WHY_COPY='This decides whether the site needs shared sign-in and editing. Answering now keeps Puppet Master from planning the wrong kind of site.';
  var UI_ACTIONS=['ui.guided_tour.start','ui.guided_tour.next','ui.guided_tour.show_me','ui.guided_tour.back','ui.guided_tour.pause','ui.guided_tour.resume','ui.guided_tour.skip','ui.guided_tour.focus_route','ui.guided_tour.toggle_eli5','ui.guided_tour.finish','ui.guided_tour.replay'];
  var STEP_DEFS=[
    {id:'tour.intro.comfort',chapter:'intro',meaningful:false,dwell_ms:0,action_id:'ui.guided_tour.next'},
    {id:'tour.chat.open',chapter:'chat_teacher',meaningful:false,dwell_ms:650,action_id:'ui.guided_tour.next'},
    {id:'tour.chat.teacher.select',chapter:'chat_teacher',meaningful:true,dwell_ms:650,action_id:'cmd.persona.select'},
    {id:'tour.chat.teacher.ask',chapter:'chat_teacher',meaningful:true,dwell_ms:700,action_id:'cmd.chat.send'},
    {id:'tour.chat.teacher.reply',chapter:'chat_teacher',meaningful:false,dwell_ms:500,action_id:'ui.guided_tour.next'},
    {id:'tour.chat.teacher.eli5',chapter:'chat_teacher',meaningful:true,dwell_ms:650,action_id:'cmd.chat.eli5.set'},
    {id:'tour.workspace.navigation',chapter:'workspace',meaningful:false,dwell_ms:650,action_id:'ui.guided_tour.next'},
    {id:'tour.workspace.chat.dock',chapter:'workspace',meaningful:true,dwell_ms:700,action_id:'cmd.workspace_layout.move_surface'},
    {id:'tour.workspace.panels.rearrange',chapter:'workspace',meaningful:true,dwell_ms:750,action_id:'cmd.workspace_layout.move_surface'},
    {id:'tour.workspace.usage.open',chapter:'workspace',meaningful:true,dwell_ms:650,action_id:'ui.guided_tour.focus_route'},
    {id:'tour.workspace.widget.manage',chapter:'workspace',meaningful:true,dwell_ms:900,action_id:'cmd.widget.configure'},
    {id:'tour.planning.open',chapter:'planning_wizard',meaningful:true,dwell_ms:900,action_id:'ui.planning_wizard.open'},
    {id:'tour.planning.project_source',chapter:'planning_wizard',meaningful:true,dwell_ms:900,action_id:'wizard.attach'},
    {id:'tour.planning.goal',chapter:'planning_wizard',meaningful:true,dwell_ms:1000,action_id:'wizard.practice_goal'},
    {id:'tour.planning.guided_help',chapter:'planning_wizard',meaningful:true,dwell_ms:900,action_id:'wizard.intent'},
    {id:'tour.planning.requirements',chapter:'planning_wizard',meaningful:true,dwell_ms:950,action_id:'wizard.to_requirements'},
    {id:'tour.planning.question',chapter:'planning_wizard',meaningful:true,dwell_ms:1050,action_id:'wizard.practice_answer'},
    {id:'tour.planning.why',chapter:'planning_wizard',meaningful:true,dwell_ms:950,action_id:'wizard.practice_why'},
    {id:'tour.planning.review',chapter:'planning_wizard',meaningful:true,dwell_ms:1100,action_id:'wizard.practice_review'},
    {id:'tour.planning.edit',chapter:'planning_wizard',meaningful:true,dwell_ms:1100,action_id:'wizard.practice_edit'},
    {id:'tour.planning.consequence',chapter:'planning_wizard',meaningful:false,dwell_ms:900,action_id:'ui.guided_tour.next'},
    {id:'tour.planning.approval_boundary',chapter:'planning_wizard',meaningful:false,dwell_ms:900,action_id:'ui.guided_tour.finish'}
  ];
  var STEP_BY_ID={};STEP_DEFS.forEach(function(row,index){row.index=index;STEP_BY_ID[row.id]=row;});
  var STORYBOARD={schema_id:'pm.guided_tour.storyboard.v3',revision:'newbie-first-chat-workspace-planning-2026-09-04',order:STEP_DEFS.map(function(row){return row.id;}),chapter_order:['chat_teacher','workspace','planning_wizard'],promise:'Ask Teacher, make the workspace yours, then plan before building.',continuity:'Assistant Chat and Teacher come first; workspace navigation and reversible layout practice come second; Planning Wizard owns the final and longest chapter.',final_destination:'planning_wizard',work_started:false};
  var meaningful=STEP_DEFS.filter(function(row){return row.meaningful;}),planningMeaningful=meaningful.filter(function(row){return row.chapter==='planning_wizard';}),meaningfulDwell=meaningful.reduce(function(sum,row){return sum+row.dwell_ms;},0),planningDwell=planningMeaningful.reduce(function(sum,row){return sum+row.dwell_ms;},0);
  var timings={step_ms:500,focus_ms:460,show_me_normal_ms:260,show_me_reduced_ms:80,minimum_non_retro_ms:420,maximum_non_retro_ms:560,retro_ms:140,reduced_ms:80,same_frame_ack_ms:0};
  var state={open:false,status:'first_launch',step_id:'tour.intro.comfort',step:'intro',step_index:0,phase:0,phase_key:'comfort',last_action:null,last_result:null,last_error:null,action_mode:null,action_status:'idle',choreography_state:'idle',layout_disposition:'pending',layout_snapshot_restored:false,completed:false,skipped:false,transition_serial:0,motion:'idle',source:'unknown',eli5_enabled:false,teacher_mode:'local_deterministic_zero_provider',teacher_thread_id:null,teacher_persona_selected:false,teacher_message_sent:false,teacher_answer_id:null,teacher_response_message_id:null,teacher_response_index:null,teacher_copy_mode:'normal',active_widget_id:null,panel_demo_pair_ids:null,panel_demo_complete:false,usage_card_demo_complete:false,planning_goal:'',planning_answer:null,planning_why_open:false,planning_reviewed:false,planning_edited:false,planning_consequence_visible:false,planning_project_selected:false,planning_requirements_opened:false,work_started:false,provider_request_baseline:0,usage_baseline:0,provider_request_delta:0,usage_delta:0,zero_provider_verified:true,zero_usage_verified:true,low_resource_profile:false,shell_squeezed:false};
  var original=null,history=[],uiActionLog=[],effectReceipts=[],listeners=[],receiptSerial=0,sessionSerial=0,transitionTimer=0,choreographyTimers=[],targetFrame=0,targetResizeObserver=null,activeTarget=null,lastOutsideFocus=null,lastOutsideFocusAt=0,teacherOriginalSend=null,teacherPending=null,teacherMessageSerial=0,restoring=false,widgetCheckpoint=null,planningFixture=null,reduced=motionReduced();
  function clone(value){if(value===undefined)return undefined;return JSON.parse(JSON.stringify(value));}
  function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
  function motionReduced(){try{return document.documentElement.getAttribute('data-motion')==='reduced'||!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(error){return false;}}
  function currentTheme(){return document.documentElement.getAttribute('data-theme')||'unknown';}
  function stepDef(id){return STEP_BY_ID[id||state.step_id]||STEP_DEFS[0];}
  function chapterPhase(def){var rows=STEP_DEFS.filter(function(row){return row.chapter===def.chapter;});return Math.max(0,rows.indexOf(def));}
  function syncCompatibility(){var def=stepDef();state.step=def.chapter;state.step_index=def.index;state.phase=chapterPhase(def);state.phase_key=def.id.split('.').slice(2).join('_')||'comfort';}
  function counterNumber(value){if(Array.isArray(value))return value.length;return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;}
  function firstCounter(values){for(var i=0;i<values.length;i+=1){var value=counterNumber(values[i]);if(value!==null)return value;}return null;}
  function measureCounters(){var d=window.PM_DEMO,s=d&&d.state||{},usage=s.usage||{},provider=s.providers||{};return {provider_requests:firstCounter([s.provider_request_count,provider.request_count,provider.requests,d&&d.provider_request_log]),usage:firstCounter([s.usage_count,usage.request_count,usage.events,usage.receipts])};}
  function updateCounterDeltas(){var now=measureCounters();state.provider_request_delta=now.provider_requests===null||state.provider_request_baseline===null?null:now.provider_requests-state.provider_request_baseline;state.usage_delta=now.usage===null||state.usage_baseline===null?null:now.usage-state.usage_baseline;state.zero_provider_verified=state.provider_request_delta===0;state.zero_usage_verified=state.usage_delta===0;return now;}
  function recordUi(id,payload){var row={action_id:id,step_id:state.step_id,serial:uiActionLog.length+1,payload:clone(payload||{})};uiActionLog.push(row);return row;}
  function receipt(actionId,targetId,status,reason,before,after,owner,mode,metadata){var row={schema_id:'pm.guided_tour.concept_effect_receipt.v2',receipt_id:'guided-tour-effect-'+(++receiptSerial),action_id:actionId,step_id:state.step_id,target_id:targetId||null,status:status,reason:reason||null,before:clone(before),after:clone(after),owner_receipt:clone(owner||null),mode:mode||state.action_mode||'try',concept_simulation_only:true,production_receipt:false};if(metadata)row.local_action_result=clone(metadata);effectReceipts.push(row);state.last_result=clone(row);state.last_error=status==='failed'||status==='disabled'?reason||status:null;notify();return row;}
  function snapshot(){syncCompatibility();updateCounterDeltas();var def=stepDef();return {schema_id:'pm.guided_tour.concept_snapshot.v2',schema_version:'2.0.0',concept_simulation_only:true,durable_session_record:false,real_shell_owner_observation:true,production_runtime_certification:false,open:state.open,status:state.status,step_id:state.step_id,step:state.step,step_index:state.step_index,phase:state.phase,phase_key:state.phase_key,chapter:def.chapter,last_action:state.last_action,last_result:clone(state.last_result),last_error:state.last_error,action_mode:state.action_mode,action_status:state.action_status,choreography_state:state.choreography_state,layout_disposition:state.layout_disposition,layout_snapshot_restored:state.layout_snapshot_restored,completed:state.completed,skipped:state.skipped,transition_serial:state.transition_serial,motion:state.motion,source:state.source,eli5_enabled:state.eli5_enabled,teacher_mode:state.teacher_mode,teacher_thread_id:state.teacher_thread_id,teacher_persona_selected:state.teacher_persona_selected,teacher_message_sent:state.teacher_message_sent,teacher_answer_id:state.teacher_answer_id,teacher_response_message_id:state.teacher_response_message_id,teacher_copy_mode:state.teacher_copy_mode,active_widget_id:state.active_widget_id,panel_demo_pair_ids:clone(state.panel_demo_pair_ids),panel_demo_complete:state.panel_demo_complete,usage_card_demo_complete:state.usage_card_demo_complete,planning_goal:state.planning_goal,planning_answer:state.planning_answer,planning_why_open:state.planning_why_open,planning_reviewed:state.planning_reviewed,planning_edited:state.planning_edited,planning_consequence_visible:state.planning_consequence_visible,planning_project_selected:state.planning_project_selected,planning_requirements_opened:state.planning_requirements_opened,work_started:false,provider_request_baseline:state.provider_request_baseline,provider_request_delta:state.provider_request_delta,provider_use_count:state.provider_request_delta,usage_baseline:state.usage_baseline,usage_delta:state.usage_delta,zero_provider_verified:state.zero_provider_verified,zero_usage_verified:state.zero_usage_verified,reduced_motion:reduced,low_resource_profile:state.low_resource_profile,shell_squeezed:state.shell_squeezed,theme:currentTheme(),timings:clone(timings),storyboard_revision:STORYBOARD.revision,story_order:STORYBOARD.order.slice(),chapter_order:STORYBOARD.chapter_order.slice(),meaningful_action_count:meaningful.length,planning_meaningful_action_count:planningMeaningful.length,meaningful_dwell_ms:meaningfulDwell,planning_dwell_ms:planningDwell,planning_action_share:planningMeaningful.length/meaningful.length,planning_dwell_share:planningDwell/meaningfulDwell,history:history.slice(),layout_snapshot_captured:!!original,journal_depth:0,effect_receipts:clone(effectReceipts),ui_action_log:clone(uiActionLog),target:targetAdapter.status(state.step_id)};}
  function notify(){var value=snapshot();listeners.slice().forEach(function(fn){try{fn(value);}catch(error){}});}
  function ack(control,id){state.last_action=id;if(control){control.setAttribute('data-ack','true');control.dataset.ackFrame='same';}root.dataset.ack=id;root.dataset.ackFrame='same';notify();}

  function createGuidedPlanningPractice(options) {
    var choices=['me','organizers','unsure'];
    function create() {
      return {schema_id:'pm.guided_tour.planning_fixture.v2',project_selected:false,
        goal:options.goal,goal_submitted:false,guided_selected:false,outcomes_visible:false,
        answer:null,why_visible:false,review_visible:false,editing:false,edit_from:null,
        edited:false,consequence_revision:0,work_started:false};
    }
    function apply(current,action,value) {
      var next=Object.assign({},current),error=null;
      if(action==='project')next.project_selected=true;
      else if(action==='goal'){
        if(!current.project_selected)error='Choose the practice Project first.';
        else if(!String(value||'').trim())error='Add one sentence about the result you want.';
        else {next.goal=String(value).trim();next.goal_submitted=true;}
      }else if(action==='guided')next.guided_selected=true;
      else if(action==='outcomes'){
        if(!current.goal_submitted||!current.guided_selected)error='Add your goal and choose guided planning first.';
        else next.outcomes_visible=true;
      }else if(action==='answer'){
        if(!current.outcomes_visible||choices.indexOf(value)<0)error='Choose one of the available answers.';
        else if(current.editing&&value===current.edit_from)error='Choose a different answer to see what changes.';
        else {
          next.answer=value;
          if(current.editing){
            next.editing=false;next.edited=true;next.review_visible=true;
            next.consequence_revision=current.consequence_revision+1;
          }
        }
      }else if(action==='why'){
        if(!current.outcomes_visible)error='Open the outcomes first.';
        else next.why_visible=true;
      }else if(action==='review'){
        if(!current.answer)error='Answer the editing question first.';
        else next.review_visible=true;
      }else if(action==='edit'){
        if(!current.review_visible||!current.answer)error='Review the practice plan first.';
        else {next.editing=true;next.edit_from=current.answer;next.edited=false;}
      }else error='That practice action is unavailable.';
      return {ok:!error,error:error,state:error?current:next,
        changed:!error&&JSON.stringify(next)!==JSON.stringify(current),
        concept_simulation_only:true,production_receipt:false,work_started:false};
    }
    function view(current) {
      var unknown=current.answer===null||current.answer==='unsure';
      return {decision:current.answer==='me'?'Only I can update it':current.answer==='organizers'?
          'A few organizers can update it':'Who can update it is still open',
        access_state:unknown?'unresolved':current.answer==='organizers'?'included':'not_needed',
        access:unknown?'Shared access needs a decision':current.answer==='organizers'?
          'Sign-in and organizer access included':'Shared sign-in is not needed for only me',
        unresolved:unknown?'Editor access still needs a decision':'No blocking choices in this practice',
        assumption:'The meeting, book, and joining details are supplied by the club.',
        edit_choice:current.answer==='me'?'organizers':'me'};
    }
    return {create:create,apply:apply,view:view,choices:choices.slice()};
  }
  function teacherTopic(id,priority,test,normal,eli5){return {id:id,priority:priority,test:test,normal:normal,eli5:eli5};}
  var TEACHER_ANSWERS=[
    teacherTopic('app_map',90,/main parts|parts of puppet master|workspace map|what am i looking at/i,'Puppet Master is organized into page navigation, a working area, movable panels, and Assistant Chat. Pages change the job you are viewing; panels change which tools stay beside it. Start by locating the page tabs, then keep only the panels you need.','Think of Puppet Master as a workshop with labeled rooms and movable tool carts. Tabs choose a room, and panels bring a cart beside you. Start by finding the tabs at the top.'),
    teacherTopic('page_navigation',100,/move between pages|page navigation|page tabs|open (the )?(usage|planning|settings) page/i,'Page tabs change the primary view without changing project data. The active tab identifies the page you are on, while panels can remain available beside it. Select Usage or Planning once and watch the active tab move.','Tabs are doors to different rooms. Opening another door changes what you see, not your saved work. Try the Usage tab once.'),
    teacherTopic('panel_move',110,/rearrange panels|move a panel|drag.*panel|panel.*grip/i,'A panel is a workspace surface whose host and order can change independently of its contents. Use its top-right move grip to dock it elsewhere; moving the panel does not move or delete project files. Make one move, then use Back if you prefer the old arrangement.','A panel is a tool tray you can slide around your desk. The little corner grip moves the tray, not the things inside it. Try one move and use Back to put it back.'),
    teacherTopic('panel_resize',110,/resize a panel|panel size|make.*panel (bigger|smaller)/i,'Panel dividers change the space assigned to adjacent surfaces; a floating panel also has a corner resize control. Resizing affects presentation only. Drag a divider a short distance and stop when both sides remain readable.','A divider is like the edge between two desk trays. Slide it a little to give one tray more room. Your work stays the same.'),
    teacherTopic('panel_restore',110,/restore.*layout|reset.*layout|put.*panels? back|old arrangement/i,'Layout restore returns panels to a known arrangement without changing project content. Use the workspace reset action for a full reset, or Back during this tour for its reversible demonstration. Save a custom layout only after it feels comfortable.','Layout restore puts the furniture back where it started. It does not throw away anything on the desk. Use Back in this tour or Reset Layout later.'),
    teacherTopic('panel_definition',70,/what is a panel|panels? do/i,'A panel is a dockable view such as Chat, an editor, or a dashboard. Its placement, size, visibility, and collapsed state are workspace settings separate from project data. Open one useful panel first and add others only when needed.','A panel is a movable window tile. Sliding or hiding the tile changes the desk, not the work inside it. Keep one helpful tile open first.'),
    teacherTopic('usage',100,/what does usage show|usage page|usage dashboard|activity.*limits.*cost/i,'Usage consolidates activity, capacity, limits, and cost signals into cards. Each card is a view of owner data, so hiding or moving it does not erase the underlying records. Open one card menu to see presentation choices.','Usage is the dashboard of gauges. Moving or hiding a gauge does not change the machine. Open one card menu to see your choices.'),
    teacherTopic('cards',80,/what is a card|usage card|hide a card|card options/i,'A card is a configurable view of one category of information. Its options can change presentation or visibility without changing the work it reports. Keep the cards you check often and hide only the views you do not need.','A card is a note that shows one kind of news. Putting the note away does not erase the news. Keep the notes you read most.'),
    teacherTopic('costs_limits',100,/costs?|spending|limits?|quota|tokens? used/i,'Cost and limit cards summarize measured usage from the named service or account. Treat them as status signals, then check that source before making a billing decision. Start with the time range and account shown on the card.','These cards are fuel gauges. Check which trip and which car the gauge describes before worrying about the number. Start with the card’s time range.'),
    teacherTopic('open_local_folder',110,/open a (local )?folder|folder on this (computer|machine)|local folder/i,'Opening a local folder points a project at an existing directory on this device. It does not require an online host, although source control can be added separately. Choose a folder you recognize and confirm its path before continuing.','This lets Puppet Master work with a folder already on this computer. It is like opening a labeled drawer. Pick a drawer you recognize first.'),
    teacherTopic('bring_online',110,/bring.*from online|clone.*online|online repository|git url/i,'An online project is normally brought in by cloning a Git URL or selecting a repository through a connected host account. The result is still a local working copy with an optional remote. Confirm the repository and destination before cloning.','This copies an online project into a working folder here. It is like checking out a library book while the library keeps its copy. Check the title and destination first.'),
    teacherTopic('cursor_origin',120,/cursor origin|origin host|origin repository/i,'Cursor Origin is an online Git host. It can hold a private or team-visible repository and work beside local Git or Jujutsu history. Connect an eligible Cursor account, choose the team or codebase, then verify the repository before the first push.','Cursor Origin is an online home for another copy of your project. Your save points still live here too. Connect the right Cursor team, check the project name, and then send the copy.'),
    teacherTopic('already_connected_source',120,/already connected.*source|source control.*already connected|already connected.*git/i,'Already Connected should mean the project already has a usable source-control remote and credentials outside this step. The setup must verify that remote instead of silently doing nothing. Check the detected remote name and a read-only connection result before continuing.','This means the project already knows where its online copy lives. Puppet Master should check the address instead of asking you to connect twice. Look for a successful check.'),
    teacherTopic('project',60,/what is a project|new project|project keeps/i,'A project groups one goal, its working files, configuration, recoverable versions, and approved work. Storage location and online source control are separate choices. Start with one clearly named project and verify its folder.','A project is one labeled box for an idea. Its pieces and save points stay together. Start with one box whose name you recognize.'),
    teacherTopic('requirements',105,/requirements?|why.*questions|planning.*ask/i,'Requirements record the result, constraints, exclusions, and decisions that a plan must respect. Planning asks only what it cannot safely infer, then carries those answers into review. Answer with the outcome you need and say when something must not change.','Requirements are the rules for the recipe. Say what the meal should be and what ingredients cannot be used. Answer one clear question at a time.'),
    teacherTopic('review_approval',105,/when.*work begin|review.*approve|approval|approve.*build/i,'Planning is preparatory until you approve the resulting plan or build action. Review scope, risky changes, and unresolved questions before approval. If a step is unclear, ask Teacher or revise the requirement first.','Nothing should start just because you answered questions. You get to read the recipe before cooking begins. Stop and ask about any step that feels wrong.'),
    teacherTopic('planning',80,/what does planning do|planning wizard|make a plan|planning/i,'Planning converts a goal and its constraints into reviewable work units while keeping unresolved decisions visible. It should use the chosen project context and never treat a first draft as approval. Begin with the outcome, then review every consequential step.','Planning turns a wish into a recipe you can check. It asks small questions and waits for your yes before cooking. Start with one clear wish.'),
    teacherTopic('source_control',75,/source control|what is git\b|what is jujutsu/i,'Source control records a structured history of file changes. Git or Jujutsu can maintain that history locally; an online host is optional for sharing or another copy. Start locally and add a remote only when it serves a clear purpose.','Source control is a labeled photo album of your changes. Git or Jujutsu arranges the album here, and an online site can keep another copy. Begin with the local album.'),
    teacherTopic('safe_history',115,/safe history|restore point|save point|undo changes/i,'Safe History creates recoverable versions on this computer. Git or Jujutsu can organize that local timeline; GitHub or GitLab can hold an optional online copy, while FileSafe protects selected file copies beside it. Keep local history enabled before adding optional sharing.','Safe History is a stack of save points kept on this computer. An online host may keep another stack, and FileSafe is a spare copy of important papers. Start with the local save points.'),
    teacherTopic('filesafe',115,/filesafe|file safe|protect.*files/i,'FileSafe protects selected file copies and complements recoverable history; it does not replace Safe History, Git, or Jujutsu. Confirm its destination and retention settings before relying on it. Use both protections when the files matter.','FileSafe is a spare folder of important papers. Safe History is the row of moments you can return to. Check where the spare folder lives.'),
    teacherTopic('github',115,/github account|sign in.*github|github.*sign in|use github/i,'GitHub is an optional online Git host. An account is needed for private repositories and authenticated account features, while public repositories may be readable without signing in. Connect it only if you want its hosting or collaboration features.','GitHub is an optional online library for Git projects. You need a library card for private shelves and account tools. Use it only if you want that library.'),
    teacherTopic('gitlab',115,/gitlab account|sign in.*gitlab|gitlab.*sign in|use gitlab/i,'GitLab is an optional Git host and may be cloud-hosted or self-managed. Account and authentication requirements come from the selected GitLab instance and repository access. Verify the instance address before signing in.','GitLab is another kind of online Git library, and some people run their own. Check which library address you are using before getting a key.'),
    teacherTopic('ssh_folder',120,/folder.*ssh|ssh.*folder|remote over ssh|ssh workflow/i,'An SSH-backed project works on a reachable remote machine rather than an SMB or NFS share. It requires a host, user, and approved authentication method, while the project path belongs to that remote host. Test a read-only connection before selecting the path.','SSH is a secure hallway to a folder on another computer. You need the computer address, your name there, and a safe key. Test the hallway before choosing the folder.'),
    teacherTopic('network_share',115,/smb|nfs|network share|shared folder/i,'SMB and NFS expose a remote folder through the operating system. Puppet Master should use the mounted path after the OS or VPN establishes access; it should not pretend that a path alone creates the connection. Confirm the share is mounted and readable first.','A network share is a drawer from another computer that your system makes look local. Connect the drawer first, then choose it like any other folder.'),
    teacherTopic('backup_location',110,/backup location|choose.*backup|where.*backup|advanced.*backup/i,'A backup destination and a project path are both locations, but they have different write, retention, and recovery requirements. A backup target should be separate enough to survive loss of the working copy. Verify free space and perform a restore test.','Your work folder is the desk; the backup should be a spare copy somewhere safer. Do not keep the only spare in the same drawer. Test that you can bring one file back.'),
    teacherTopic('connect_existing',120,/connect.*existing puppet|already have.*puppet master|existing server|another computer.*puppet/i,'Connecting to an existing Puppet Master should discover or accept that server’s reachable address, then authenticate this device with a pairing code or approved credential. It should not make you create another project or server. Start with local discovery when both devices are on the same reachable network.','You are visiting a clubhouse that already exists, not building a new one. Find the clubhouse, then use its invitation code to prove this device belongs.'),
    teacherTopic('local_discovery',125,/local discovery|find.*nearby|discover.*device|find.*server/i,'Local discovery advertises reachable Puppet Master instances on the current local network. It should present verified candidates and still require pairing; discovery is not authentication. Make sure both devices share the same reachable network and try again.','Discovery is calling out in the same building to find the clubhouse. Hearing an answer does not unlock the door. You still use an invitation code.'),
    teacherTopic('vpn',125,/local or vpn|through.*vpn|vpn.*discover|use.*vpn/i,'A VPN can make remote devices reachable through private network addresses, so discovery may behave like local discovery when multicast or the product’s discovery mechanism crosses that VPN. The VPN itself must already be connected. Enable it first, then discover or enter the server’s private name.','A VPN is a private hallway that can make far-away devices feel nearby. Open the hallway first, then look for the server. The hallway is not the invitation code.'),
    teacherTopic('tailscale',130,/tailscale/i,'Puppet Master includes its own Tailscale connection and never borrows or controls a Tailscale app already installed on this computer. After you sign in, it creates the Server’s private address automatically. The Puppet Master app can use this built-in path; a regular web browser still needs its device to reach that private network, or a separate path such as Reverse Proxy, Funnel, or Remote Link. Puppet Master pairing is still required.','Puppet Master carries its own pass for a private Tailscale road. It does not borrow another Tailscale app. The Puppet Master app can use that road; a normal web browser needs its device on the same road or needs another safe road. You still use Puppet Master’s invitation at the door.'),
    teacherTopic('headscale',130,/headscale/i,'Headscale is the sign-in service for a private network you or your organization runs. Give Puppet Master its protected Headscale address and approve enrollment; Puppet Master then creates its own private Server address automatically. Headscale supports the private path but not public Funnel access, and Puppet Master pairing remains a separate safety step.','Headscale is your own guest-list desk for the private road. Tell Puppet Master where that desk lives and approve its pass. It gets a private address, but not a public Funnel entrance. You still use Puppet Master’s invitation at the door.'),
    teacherTopic('reverse_proxy',130,/reverse proxy|custom address|caddy|traefik/i,'A reverse proxy gives an existing Puppet Master a stable HTTPS URL and forwards requests to it. A client connecting to an already configured server usually needs only that URL and Puppet Master pairing; proxy setup belongs on the server side. Label this option Reverse Proxy and ask for server configuration only when creating it.','A reverse proxy is a front desk with one public address. Visitors need the front-desk address and an invitation; they do not rebuild the desk on every device.'),
    teacherTopic('remote_link',130,/remote link|connection code|short code|qr code/i,'Remote Link should provide a product-managed path to an existing server using a short-lived connection code or QR code, followed by device approval. The server should display that information in its connection or device settings. Treat the code as temporary and do not post it publicly.','Remote Link is a temporary invitation card. Show or scan the card on the new device, approve it on the server, and keep the card private.'),
    teacherTopic('pairing',125,/pairing|pair.*device|where.*code|qr code|short code/i,'Pairing authenticates a new device after network reachability is established. The existing Puppet Master should show a short-lived code or QR in its device or connection settings, and the server owner should approve the request. A network address is not a substitute for pairing.','Finding the house is not the same as getting a key. Pairing uses a temporary invitation from the existing server. Approve only devices you recognize.'),
    teacherTopic('tls_certificates',125,/https certificate|tls|let'?s encrypt|certificate.*caddy|certificate.*traefik/i,'Caddy and Traefik can both obtain and renew ACME certificates, commonly from Let’s Encrypt, when DNS, ports, and configuration allow it. Certificate automation belongs to the reverse proxy on the server, not the connecting client. Verify renewal status before relying on the public URL.','HTTPS certificates are identity cards for the front desk. Caddy or Traefik can often renew them automatically. The server handles that card; a visiting device does not.'),
    teacherTopic('permissions',105,/permission|approve.*access|what.*allow/i,'Permissions limit what a person, device, or automation may read or change. Review the requested scope and deny access that is broader than the task requires. Approve one recognizable device or action at a time.','Permissions are keys for particular rooms. Give only the smallest key someone needs. Check the name before saying yes.'),
    teacherTopic('privacy_secrets',120,/password|private key|secret|token|safe to paste|privacy/i,'Do not paste passwords, private keys, recovery codes, access tokens, or unredacted personal data into Chat. Use the product’s credential controls and share only the minimum diagnostic detail. If a secret was exposed, rotate it at its owner immediately.','Secrets are house keys. Never paste a key into a message. Use the locked credential box, and replace any key that was shown by mistake.'),
    teacherTopic('runs_queue',100,/runs?|queue|queued|job status|what is running/i,'A run is one tracked execution; the queue orders work waiting for available capacity, and status shows its current lifecycle state. Opening a run should expose its inputs, progress, receipts, and any blocker. Inspect the oldest blocked or failed item first.','A run is one trip, and the queue is the line of trips waiting to leave. Status says waiting, moving, done, or stuck. Check the first stuck trip.'),
    teacherTopic('teacher_doctor',115,/teacher or doctor|doctor|getting unstuck|stuck|something.*wrong|error/i,'Teacher explains concepts and safe next actions; Doctor diagnoses product or environment failures. Describe what you expected, what occurred, and the exact visible error without including secrets. Use Teacher for understanding and Doctor for a malfunction.','Teacher explains the map; Doctor checks why the car will not start. Say what you tried and what surprised you. Never include a password.'),
    teacherTopic('settings_accessibility',105,/eli5|reduced motion|replay.*tour|accessibility|settings/i,'Settings controls presentation preferences such as ELI5 wording, reduced motion, and replaying onboarding or the tour. These preferences should change explanation and animation without changing project data. Adjust one preference and confirm the preview feels comfortable.','Settings changes how Puppet Master talks and moves. It does not change your project. Pick calmer motion or simpler words if that helps.'),
    teacherTopic('remote_access',85,/remote access|connect from away|phone.*server|laptop.*server/i,'Remote access combines network reachability with Puppet Master device authentication. Choose one supported path—private network, Tailscale or Headscale, reverse proxy, or Remote Link—then pair the device. Do not configure multiple paths unless you need them.','Remote access is a road to the server plus a key for its door. Choose one road, then pair the device. More roads are not automatically safer.'),
    teacherTopic('server',70,/what does.*server|what is.*server|server do|home base/i,'The Puppet Master server is the computer that keeps the authoritative service available to approved clients. Its network address answers where it is; pairing answers who may enter. Start on an existing always-on device only when you need shared or remote access.','The server is the clubhouse that stays ready. Its address tells you where the clubhouse is, and pairing gives your device a key. Use one clubhouse unless you need another.'),
    teacherTopic('teacher',60,/what can.*teacher|ask teacher|teacher help|explain/i,'Teacher explains Puppet Master features, gives examples, and suggests safe next steps. The tour’s built-in lesson works offline. Choose a suggested question or type a specific Puppet Master question.','Teacher is the guide beside the controls. Ask one clear Puppet Master question and I will explain it with a simple next step.'),
    teacherTopic('getting_started',50,/getting started|where do i start|first thing/i,'Begin by identifying whether you are creating a local project or connecting to an existing Puppet Master. Then confirm the project location, keep local recovery enabled, and add remote services only when needed. Use the setup summary to review each choice.','First decide whether you are making a new workspace or visiting one that already exists. Check the folder and save points, then add online parts only when you need them.'),
    teacherTopic('device_name_address',120,/device name|private address|server address|where.*address/i,'The existing server should display its recognized device name and reachable addresses in connection settings. Which address works depends on the active path: local network, VPN, tailnet, or public reverse proxy. Copy the value from the server instead of guessing it.','The server can have different street addresses for different roads. Open its connection settings and copy the address for the road you are using.'),
    teacherTopic('authentication',100,/authentication|credentials?|sign in|login/i,'Authentication proves an account or device identity after the network path reaches the service. Host sign-in, VPN enrollment, and Puppet Master pairing are separate layers and should be requested only when that layer needs them. Follow the prompt naming the exact owner.','Authentication is showing the right key at the right door. A neighborhood pass, website account, and Puppet Master invitation are different keys. Use only the one the named door asks for.'),
    teacherTopic('setup_summary',95,/review my choices|setup summary|choices update/i,'The setup summary should be derived from current selections and update whenever an earlier answer changes. It must distinguish configured, detected, deferred, and incomplete items. Review any incomplete row before applying setup.','The summary is your shopping list. It should change when you change your mind and mark what is ready or missing. Read the missing rows before continuing.')
  ];
  var TEACHER_FALLBACK={id:'supported_topics',normal:'This practice Teacher can answer more than forty Puppet Master topics across navigation, panels, projects, Planning, history, online copies, storage, Servers, connections, security, runs, and accessibility. Ask one specific product question, such as “How do I rearrange panels?” or “How does local discovery work?” Broader questions can go to the regular Assistant after the tour.',eli5:'This guidebook knows more than forty Puppet Master questions. Ask about moving around, projects, save points, connecting devices, safety, or getting unstuck. Try “How do I rearrange panels?”'};
  function teacherAnswer(text){var matches=TEACHER_ANSWERS.filter(function(item){item.test.lastIndex=0;return item.test.test(text);}).sort(function(a,b){return b.priority-a.priority||a.id.localeCompare(b.id);}),row=matches[0]||TEACHER_FALLBACK,eli5=state.eli5_enabled;return {id:row.id,copy_mode:eli5?'eli5':'normal',html:eli5?row.eli5:row.normal};}

  var broadTeacherAnswer=teacherAnswer;
  function guidedTeacherAnswer(text){if(/what happens before puppet master changes my files/i.test(String(text||'')))return {id:AUTHORITATIVE_ANSWER.id,copy_mode:state.eli5_enabled?'eli5':'normal',html:state.eli5_enabled?AUTHORITATIVE_ANSWER.eli5:AUTHORITATIVE_ANSWER.normal};return broadTeacherAnswer(text);}
  function homeSurface(id,layout){return (layout&&layout.surfaces||[]).filter(function(row){return row.surface_instance_id===id;})[0]||null;}
  function semanticHome(layout){var surfaces=layout&&layout.surfaces||[],mainTotal=surfaces.reduce(function(sum,surface){return sum+(surface.visible&&!surface.collapsed&&surface.host==='home_main'?Number(surface.size&&surface.size.basis_px)||0:0);},0);return surfaces.map(function(surface){var size=surface.size||{},semanticSize=surface.host==='home_main'&&surface.visible&&!surface.collapsed&&mainTotal?{basis_share_ppm:Math.round((Number(size.basis_px)||0)*1000000/mainTotal),cross_basis_px:Number(size.cross_basis_px),flex_weight:Number(size.flex_weight),min_width_px:Number(size.min_width_px),min_height_px:Number(size.min_height_px)}:{basis_px:Number(size.basis_px),cross_basis_px:Number(size.cross_basis_px),flex_weight:Number(size.flex_weight),min_width_px:Number(size.min_width_px),min_height_px:Number(size.min_height_px)};return {id:surface.surface_instance_id,host:surface.host,slot_index:surface.slot_index,visible:surface.visible,collapsed:surface.collapsed,size:semanticSize,floating_bounds:surface.host==='floating'?clone(surface.floating_bounds):null};}).sort(function(a,b){return a.id.localeCompare(b.id);});}
  function usageLayout(){var api=window.PM7_USAGE;if(!api||!api.state)return null;var ids=[];try{ids=api.visibleWidgets().map(function(item){return item.id;});}catch(error){}var layouts={};ids.forEach(function(id){var item=api.widgetById&&api.widgetById(id);if(item&&api.layoutFor)layouts[id]=clone(api.layoutFor(item));});return {room:api.state.room,visible_widget_ids:ids,hidden:clone(api.state.hidden||{}),layouts:layouts};}
  function layoutNow(){var home=window.PM_HOME_WORKSPACE;return {home:home?semanticHome(home.layout):null,usage:usageLayout()};}
  function rememberOutsideFocus(event){var node=event&&event.target&&event.target.closest?event.target.closest('button,a,input,textarea,select,[tabindex]:not([tabindex="-1"])'):null;if(!node||root.contains(node))return;lastOutsideFocus=node;lastOutsideFocusAt=Date.now();}
  document.addEventListener('pointerdown',rememberOutsideFocus,true);
  function captureOriginal(preferredFocus){var api=window.PM_HOME_WORKSPACE,tab=document.querySelector('.page-tab.active[data-page]'),toggle=document.querySelector('#chatPanel .toggle-eli5,#floatingChat .toggle-eli5'),persona=document.querySelector('#chatPanel .persona-label,#floatingChat .persona-label'),input=document.querySelector('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input'),active=document.activeElement,focus=preferredFocus||(active&&active!==document.body&&active!==document.documentElement&&active!==root?active:(lastOutsideFocus&&Date.now()-lastOutsideFocusAt<1200?lastOutsideFocus:null)),attach=document.querySelector('#panel-wizard .pm6-wiz-attach-card.selected'),intent=document.querySelector('#panel-wizard .pm6-wiz-intent-chip.sel'),wizStage=document.querySelector('#panel-wizard .pm6-wiz-stage.active[data-wiz-stage]'),counters=measureCounters();original={semantic:layoutNow(),home_layout:api?clone(api.layout):null,usage:usageLayout(),page:window.PM_PAGES&&window.PM_PAGES.current||tab&&tab.getAttribute('data-page')||'dashboard',chat_thread:window.PM_DEMO&&window.PM_DEMO.state&&window.PM_DEMO.state.chat&&window.PM_DEMO.state.chat.activeThread||null,persona:persona&&persona.textContent.trim()||'Product Manager',chat_placeholder:input&&input.getAttribute('placeholder')||'',chat_draft:input&&input.value||'',eli5_active:!!(toggle&&toggle.classList.contains('active')),attach:attach&&attach.getAttribute('data-demo-arg')||null,intent:intent&&intent.getAttribute('data-demo-arg')||null,wizard_stage:wizStage&&wizStage.getAttribute('data-wiz-stage')||'intake',focus_node:focus&&focus!==document.body?focus:null,scroll_left:Number(window.scrollX)||0,scroll_top:Number(window.scrollY||(document.scrollingElement&&document.scrollingElement.scrollTop))||0,counters:counters};state.provider_request_baseline=counters.provider_requests;state.usage_baseline=counters.usage;return clone(original.semantic);}
  function restoreDocumentScroll(){var left=original?original.scroll_left:0,top=original?original.scroll_top:0;try{window.scrollTo(left,top);}catch(error){}if(document.scrollingElement){document.scrollingElement.scrollLeft=left;document.scrollingElement.scrollTop=top;}}
  function setUsageVisible(id,visible){var api=window.PM7_USAGE,item=api&&api.widgetById&&api.widgetById(id),key=api&&api.state&&(api.state.room+':'+id);if(!api||!item)return false;var current=!api.state.hidden[key];if(current===visible)return true;if(!visible){var card=document.querySelector('#pm7uBoard .pm7u-card[data-widget="'+id+'"]'),menu=card&&card.querySelector('.pm7u-cardmenu');if(menu)menu.click();var hide=document.querySelector('#pm7uCardPop [data-hide-card="'+id+'"]');if(hide)hide.click();}else{var chooser=document.getElementById('pm7uCustomize');if(chooser)chooser.click();var show=document.querySelector('#pm7uCustomizePop [data-toggle-widget="'+id+'"]');if(show)show.click();if(document.querySelector('#pm7uCustomizePop.open')&&chooser)chooser.click();}return !api.state.hidden[key]===visible;}
  function restoreHomeSizes(api,surfaces){
    // Placement can normalize row bases; restore their saved ratios only after
    // moving, through the workspace's bounded semantic resize owner.
    if(typeof api.resizeSurface!=='function')return false;
    return surfaces.every(function(want){
      var layout=api.layout,now=homeSurface(want.surface_instance_id,layout);if(!now)return false;
      if(now.size.basis_px===want.size.basis_px&&now.size.cross_basis_px===want.size.cross_basis_px&&now.size.flex_weight===want.size.flex_weight)return true;
      var result=api.resizeSurface(want.surface_instance_id,{width_px:want.size.basis_px,height_px:want.size.cross_basis_px,flex_weight:want.size.flex_weight,expected_layout_revision:layout.layout_revision});
      return !!result&&result.ok===true;
    });
  }
  function restoreWorkspaceSnapshot(){
    var failures=[],api=window.PM_HOME_WORKSPACE;
    if(original&&api&&original.home_layout){
      var surfaces=original.home_layout.surfaces||[];
      surfaces.slice().sort(function(a,b){return a.slot_index-b.slot_index;}).forEach(function(want){
        try{
          var id=want.surface_instance_id,now=homeSurface(id,api.layout);if(!now)return failures.push('missing:'+id);
          // Unchanged hidden panels must not be opened and reinserted as visible slots.
          if(now.host!==want.host||now.slot_index!==want.slot_index||want.host==='floating'&&!same(now.floating_bounds,want.floating_bounds)){
            var insertion={index:want.slot_index};if(want.floating_bounds)insertion.bounds=clone(want.floating_bounds);var moved=api.moveSurface(id,want.host,insertion);if(!moved||moved.ok===false)failures.push('move:'+id);
          }
          now=homeSurface(id,api.layout);if(now&&now.collapsed!==want.collapsed)api.setCollapsed(id,want.collapsed);
          now=homeSurface(id,api.layout);if(now&&now.visible!==want.visible)api.setSurfaceVisible(id,want.visible,'cmd.panel.switch');
        }catch(error){failures.push(want.surface_instance_id);}
      });
      try{if(!restoreHomeSizes(api,surfaces))failures.push('size_restore');}catch(error){failures.push('size_restore');}
    }
    var u=window.PM7_USAGE;if(original&&original.usage&&u){Object.keys(original.usage.layouts||{}).forEach(function(id){var item=u.widgetById&&u.widgetById(id),want=original.usage.layouts[id];if(item&&want&&u.setLayout&&!same(u.layoutFor(item),want))u.setLayout(item,want.cols,want.rows,'cmd.widget.resize','guided_tour_snapshot_restore');});Object.keys(u.state.hidden||{}).forEach(function(key){var id=key.split(':').slice(1).join(':'),want=!!original.usage.hidden[key];if(id)setUsageVisible(id,!want);});if(u.rerender)u.rerender();}
    var after=layoutNow(),ok=!!original&&same(original.semantic,after);return {ok:ok&&failures.length===0,failures:failures,before:original&&clone(original.semantic),after:after};
  }
  function selectPersona(name){var label=document.querySelector('#chatPanel .persona-label,#floatingChat .persona-label');if(label&&label.textContent.trim()===name)return true;var button=document.querySelector('#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn');if(!button)return false;if(!document.querySelector('.pm6-chat-persona-popout-portal.is-open'))button.click();var item=[].slice.call(document.querySelectorAll('.pm6-chat-persona-popout-portal.is-open .pm6-chat-personaitem')).find(function(row){return row.getAttribute('data-persona')===name;});if(item)item.click();label=document.querySelector('#chatPanel .persona-label,#floatingChat .persona-label');return !!(label&&label.textContent.trim()===name);}
  function restoreChatState(preserveTeacher){
    var d=window.PM_DEMO;if(!original||!d||!d.state||!d.state.chat)return false;
    if(original.chat_thread&&!d.state.chat.threads[original.chat_thread])return false;
    if(!selectPersona(original.persona))return false;
    if(original.chat_thread){var item=document.querySelector('.chat-thread-item[data-thread="'+original.chat_thread+'"]');if(item)item.click();d.state.chat.activeThread=original.chat_thread;}
    var inputs=document.querySelectorAll('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input');if(!inputs.length)return false;
    inputs.forEach(function(input){input.setAttribute('placeholder',original.chat_placeholder);input.value=original.chat_draft;input.dispatchEvent(new Event('input',{bubbles:true}));});
    document.querySelectorAll('#chatPanel .toggle-eli5,#floatingChat .toggle-eli5').forEach(function(toggle){toggle.classList.toggle('active',original.eli5_active);});
    var id=state.teacher_thread_id;if(!preserveTeacher&&id&&id!==original.chat_thread){delete d.state.chat.threads[id];if(Array.isArray(d.state.chat.order))d.state.chat.order=d.state.chat.order.filter(function(row){return row!==id;});if(window.PM6_CHAT_THREADS)delete window.PM6_CHAT_THREADS[id];document.querySelectorAll('.chat-thread-item[data-thread="'+id+'"]').forEach(function(row){row.remove();});}
    return (!original.chat_thread||d.state.chat.activeThread===original.chat_thread)&&[].every.call(inputs,function(input){return input.value===original.chat_draft&&input.getAttribute('placeholder')===original.chat_placeholder;});
  }
  function restorePlanningChoice(){if(!original)return;restoring=true;var attach=original.attach&&document.querySelector('#panel-wizard .pm6-wiz-attach-card[data-demo-arg="'+original.attach+'"]'),intent=original.intent&&document.querySelector('#panel-wizard .pm6-wiz-intent-chip[data-demo-arg="'+original.intent+'"]');if(attach&&!attach.classList.contains('selected'))attach.click();if(intent&&!intent.classList.contains('sel'))intent.click();restoring=false;}
  function originalFocus(){var node=original&&original.focus_node;if(node&&node.isConnected&&node.getClientRects().length){requestAnimationFrame(function(){try{node.focus({preventScroll:true});}catch(error){}restoreDocumentScroll();});}}
  function mountedTarget(selector){if(!selector)return null;var selectors=selector.split(',');for(var i=0;i<selectors.length;i+=1){var nodes=document.querySelectorAll(selectors[i].trim());for(var j=0;j<nodes.length;j+=1){var rect=nodes[j].getBoundingClientRect();if(rect.width>0&&rect.height>0)return nodes[j];}}return null;}
  function visibleTarget(selector){if(!selector)return null;var selectors=selector.split(',');for(var i=0;i<selectors.length;i+=1){var nodes=document.querySelectorAll(selectors[i].trim());for(var j=0;j<nodes.length;j+=1){var rect=nodes[j].getBoundingClientRect();if(rect.width>0&&rect.height>0&&rect.bottom>0&&rect.right>0&&rect.top<innerHeight&&rect.left<innerWidth)return nodes[j];}}return null;}
  function activeChat(){return visibleTarget('#chatPanel:not(.hidden),#floatingChat');}
  function chatOpenControl(){return visibleTarget('.activity-bar .icon[title="Chat"],[data-demo-action="cmd.panel.switch"][data-demo-arg*="chat"]');}
  function teacherPersonaButton(){return visibleTarget('.pm6-chat-persona-popout-portal.is-open .pm6-chat-personaitem[data-persona="Teacher"]');}
  function mountTeacherPersonaControl(){var existing=teacherPersonaButton(),list=document.querySelector('.pm6-chat-persona-popout-portal.is-open .pm6-chat-personalist');if(existing||!list)return existing;var teacher=document.createElement('button');teacher.type='button';teacher.className='pm6-chat-personaitem';teacher.setAttribute('data-persona','Teacher');teacher.setAttribute('data-od-id','persona-item-teacher');teacher.setAttribute('data-pm-hover-label','Choose Teacher');teacher.setAttribute('data-pm-hover-detail','Ask for a clear explanation or a safe next step in Puppet Master.');teacher.innerHTML='<span class="pm6-chat-personaname">Teacher</span><span class="pm6-chat-personacheck" aria-hidden="true"></span>';list.insertBefore(teacher,list.firstChild);return teacher;}
  function openChatSurface(){var api=window.PM_HOME_WORKSPACE,chat=api&&homeSurface('chat',api.layout);if(api&&chat&&!chat.visible)api.setSurfaceVisible('chat',true,'cmd.panel.switch');var panel=document.getElementById('chatPanel');if(panel)panel.classList.remove('hidden');return !!activeChat();}
  function setTeacherPlaceholder(){document.querySelectorAll('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input').forEach(function(input){input.setAttribute('placeholder','Ask Teacher anything about Puppet Master…');});}
  var guidedThreadIds=Object.create(null);
  function teacherTurnCurrent(pending){var d=window.PM_DEMO;return !!(pending&&teacherPending===pending&&pending.session===sessionSerial&&d&&d.state.chat.threads[pending.thread]===pending.thread_record&&(!pending.stream||d.state.chat.activeStream===pending.stream));}
  function cancelTeacherTurn(){
    var pending=teacherPending,d=window.PM_DEMO;if(!pending)return;teacherPending=null;
    if(pending.stream&&typeof pending.stream.cancel==='function')pending.stream.cancel();
    if(d&&d.state.chat.activeStream===pending.stream){d.state.chat.busy=false;d.state.chat.activeStream=null;d.emit('chat.stream',{threadId:pending.thread,msgId:pending.message,type:'stopped'});d.emit('chat.state',{busy:false,context:d.state.chat.context,queue:d.state.chat.queue});}
  }
  function completeTeacherTurn(d,pending,answer,how){
    if(!teacherTurnCurrent(pending))return false;
    var threadId=pending.thread,msgId=pending.message,thread=pending.thread_record,currentLesson=threadId===state.teacher_thread_id&&d.state.chat.activeThread===threadId;
    thread.messages.push({role:'assistant',html:answer.html,stopped:how==='stopped',guided_example:true});
    d.state.chat.busy=false;d.state.chat.activeStream=null;
    d.emit('chat.stream',{threadId:threadId,msgId:msgId,type:how==='stopped'?'stopped':'done'});d.emit('chat.state',{busy:false,context:d.state.chat.context,queue:d.state.chat.queue});
    if(currentLesson){state.teacher_response_index=thread.messages.length-1;state.teacher_message_sent=how!=='stopped';state.teacher_answer_id=answer.id;state.teacher_response_message_id=msgId;state.teacher_copy_mode=answer.copy_mode;}
    teacherPending=null;
    setTimeout(function(){
      if(pending.session!==sessionSerial||d.state.chat.threads[threadId]!==thread)return;
      var message=document.querySelector('[data-pm6-mid="'+msgId+'"]'),sink=message&&message.querySelector('.pm6-chat-sink');
      if(message){message.classList.add('pm7gt-teacher-message');message.setAttribute('data-guided-example','true');message.querySelectorAll('.runtime-snapshot,.msg-runtime-compact').forEach(function(node){node.remove();});}
      if(sink)sink.setAttribute('data-pm7gt-teacher-response','true');
      if(how!=='stopped'&&currentLesson&&state.open&&state.step_id===pending.step_id&&pending.step_id==='tour.chat.teacher.ask'&&state.action_status==='watching')completeStep('applied',{thread_id:threadId,message_id:msgId,local_deterministic:true});
    },0);return true;
  }
  function installTeacherSendAdapter(){
    var d=window.PM_DEMO;if(!d||!d.chat||typeof d.chat.send!=='function')return false;if(teacherOriginalSend)return true;
    teacherOriginalSend=d.chat.send;
    d.chat.send=function(threadId,text){
      var thread=d.state.chat.threads[threadId],guided=!!(guidedThreadIds[threadId]||thread&&thread.guided_example===true);
      if(!guided)return teacherOriginalSend.apply(d.chat,arguments);
      // A guided thread remains local when paused, in another chapter, or retained after a replay.
      if(!thread)return {ok:false,toast:'This guided example has ended. Replay the tour to start another.'};
      text=String(text==null?'':text).trim();if(!text)return {toast:'Type a message first.'};
      if(d.state.chat.busy)return {toast:'Teacher is finishing the last reply.'};
      var answer=guidedTeacherAnswer(text),msgId='pm7gt-teacher-'+(++teacherMessageSerial),pending={session:sessionSerial,thread:threadId,thread_record:thread,message:msgId,step_id:state.step_id,stream:null};
      if(threadId===state.teacher_thread_id)state.teacher_last_prompt=text;
      thread.messages.push({role:'user',text:text,guided_example:true});d.emit('chat.stream',{threadId:threadId,type:'user',text:text});d.state.chat.busy=true;
      d.emit('chat.state',{busy:true,context:d.state.chat.context,queue:d.state.chat.queue});d.emit('chat.stream',{threadId:threadId,msgId:msgId,type:'start',intent:'guided_teacher'});teacherPending=pending;
      function chunk(html){if(teacherTurnCurrent(pending))d.emit('chat.stream',{threadId:threadId,msgId:msgId,type:'chunk',html:html});}
      if(d.stream&&typeof d.stream.start==='function'){pending.stream=d.stream.start(chunk,answer.html,{onDone:function(how){completeTeacherTurn(d,pending,answer,how);}});if(teacherPending===pending&&pending.session===sessionSerial)d.state.chat.activeStream=pending.stream;}
      else{chunk(answer.html);completeTeacherTurn(d,pending,answer,'done');}
      return {ok:true,local_deterministic:true,provider_dispatch:false,usage_write:false,answer_id:answer.id,copy_mode:answer.copy_mode,available_after_tour:!state.open};
    };return true;
  }
  function uninstallTeacherSendAdapter(){cancelTeacherTurn();/* Keep the local guard for retained threads and retired IDs. Ordinary threads still delegate. */}
  function prepareTeacherPractice(){
    openChatSurface();installTeacherSendAdapter();setTeacherPlaceholder();var d=window.PM_DEMO;
    if(!d||!d.chat||typeof d.chat.newThread!=='function')return false;
    if(!state.teacher_thread_id){
      var created=d.chat.newThread('teacher');state.teacher_thread_id=created&&created.threadId||null;
      if(state.teacher_thread_id&&d.state.chat.threads[state.teacher_thread_id]){var thread=d.state.chat.threads[state.teacher_thread_id];thread.title='Guided example · Teacher';thread.guided_example=true;guidedThreadIds[state.teacher_thread_id]=true;}
      if(window.PM6_CHAT_THREADS&&state.teacher_thread_id)window.PM6_CHAT_THREADS[state.teacher_thread_id].title='Guided example · Teacher';
      document.querySelectorAll('.chat-thread-item[data-thread="'+state.teacher_thread_id+'"] .thread-title').forEach(function(node){node.textContent='Guided example · Teacher';});
      // Re-enter through the existing thread switcher after the title is set;
      // changing only the roster model left the mounted header saying New thread.
      var row=document.querySelector('.chat-thread-item[data-thread="'+state.teacher_thread_id+'"]');if(row)row.click();
      document.querySelectorAll('#chatPanel .pm6-chat-sys,#floatingChat .pm6-chat-sys').forEach(function(node){if(node.textContent.indexOf('New thread')===0)node.textContent='Guided example · Replies are built into this tour. No online AI service is used.';});
    }
    return !!(state.teacher_thread_id&&d.state.chat.threads[state.teacher_thread_id]);
  }
  function sendGuidedComposer(event){
    var target=event.target,d=window.PM_DEMO;if(!target||!target.closest||!d||!d.state||!d.state.chat)return;
    var input=event.type==='keydown'&&target.matches('.pm6-chat-input')?target:null;
    if(event.type==='keydown'&&(!input||event.key!=='Enter'||event.shiftKey||event.isComposing))return;
    if(event.type==='click'){var button=target.closest('.pm6-chat-send');if(!button)return;var host=button.closest('#chatPanel,#floatingChat');input=host&&host.querySelector('.pm6-chat-input');}
    if(!input||!input.closest('#chatPanel,#floatingChat'))return;
    var id=d.state.chat.activeThread,thread=d.state.chat.threads[id];if(!guidedThreadIds[id]&&!(thread&&thread.guided_example===true))return;
    // Capture before the ordinary composer's /web parser or queue shortcuts.
    // Deterministic guided text must never become a tool or provider request.
    event.preventDefault();event.stopImmediatePropagation();installTeacherSendAdapter();
    var result=d.chat.send(id,input.value);if(result&&result.ok){input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));}
    else if(result&&result.toast){state.last_error=result.toast;if(state.open)render('forward');}
  }
  document.addEventListener('keydown',sendGuidedComposer,true);
  document.addEventListener('click',sendGuidedComposer,true);
  function fillTeacherQuestion(){var input=visibleTarget('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input');if(!input)return false;input.value=AUTHORITATIVE_PROMPT;input.dispatchEvent(new Event('input',{bubbles:true}));try{input.focus({preventScroll:true});}catch(error){}return true;}
  function applyTeacherMode(){var d=window.PM_DEMO,thread=d&&d.state&&d.state.chat&&d.state.chat.threads[state.teacher_thread_id],answer=guidedTeacherAnswer(state.teacher_last_prompt||AUTHORITATIVE_PROMPT),html=answer.html;if(thread&&Number.isFinite(state.teacher_response_index)&&thread.messages[state.teacher_response_index])thread.messages[state.teacher_response_index].html=html;var sink=document.querySelector('[data-pm6-mid="'+state.teacher_response_message_id+'"] .pm6-chat-sink,[data-pm7gt-teacher-response="true"]');if(sink)sink.textContent=html;state.teacher_answer_id=answer.id;state.teacher_copy_mode=answer.copy_mode;return !!sink;}
  function syncEli5(){eli5Button.setAttribute('aria-pressed',String(state.eli5_enabled));eli5Button.textContent=state.eli5_enabled?'ELI5: On':'ELI5: Off';eli5Button.setAttribute('data-pm-hover-label',state.eli5_enabled?'Use regular wording':'Use simpler wording');eli5Button.setAttribute('data-pm-hover-detail',state.eli5_enabled?'Return to the fuller explanation.':'Keep the same meaning with fewer, friendlier words.');document.querySelectorAll('#chatPanel .toggle-eli5,#floatingChat .toggle-eli5').forEach(function(toggle){toggle.classList.toggle('active',state.eli5_enabled);});}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(character){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];});}
  var STEP_COPY={
    'tour.intro.comfort':{kicker:'A short guided film',title:'Let’s make Puppet Master feel familiar.',normal:'You’ll try a few real actions. This guided example does not change your files or use your AI plan.',eli5:'We will practice together. Nothing here changes your files or uses your AI plan.',note:'Want gentler movement or simpler words? Reduced Motion is in Settings, and ELI5 stays at the top of this tour.'},
    'tour.chat.open':{kicker:'Ask and understand',title:'Meet Assistant Chat.',normal:'Assistant Chat begins at the far right, where you can ask for help without leaving what you are doing.',eli5:'Assistant Chat waits on the right so help stays beside your work.',success:'Assistant Chat is ready.'},
    'tour.chat.teacher.select':{kicker:'Ask and understand',title:'Choose Teacher.',normal:'Teacher explains the screen you are on, an unfamiliar term, or why a choice matters.',eli5:'Teacher explains what you see and why a choice matters.',success:'Teacher is listening.'},
    'tour.chat.teacher.ask':{kicker:'Ask and understand',title:'Ask the example question.',normal:'Send “What happens before Puppet Master changes my files?” The answer is built into this guide and uses no online AI service.',eli5:'Send the example question. Its answer is already in this guide, so it costs nothing.',success:'Teacher answered inside Assistant Chat.'},
    'tour.chat.teacher.reply':{kicker:'Teacher answered',title:'A useful answer stays close to the work.',normal:AUTHORITATIVE_ANSWER.normal,eli5:AUTHORITATIVE_ANSWER.eli5,note:'This thread is labeled as a guided example. After the tour, Teacher can explain many more Puppet Master topics.'},
    'tour.chat.teacher.eli5':{kicker:'Choose your reading style',title:'Try ELI5.',normal:'ELI5 makes the same answer shorter and clearer without changing what it means.',eli5:'ELI5 uses fewer, simpler words but keeps the same meaning.',success:'The same answer is now easier to read.'},
    'tour.workspace.navigation':{kicker:'Make the workspace yours',title:'Pages and panels do different jobs.',normal:'The tabs across the top change your main page. Panels such as Assistant Chat can stay beside you as you move around.',eli5:'Top tabs change the main page. Side panels can follow you.'},
    'tour.workspace.chat.dock':{kicker:'Make the workspace yours',title:'Move Assistant Chat.',normal:'Drag Assistant Chat toward the highlighted side. The same conversation stays with you; only its place changes.',eli5:'Move Chat to the highlighted side. The messages stay the same.',success:'Assistant Chat moved and kept the same conversation.'},
    'tour.workspace.panels.rearrange':{kicker:'Make the workspace yours',title:'Rearrange one more panel.',normal:'Use a panel’s move handle to put the tools you need next to each other. Your project files do not move.',eli5:'Move one panel. Only the window moves, not your files.',success:'The panel moved to its new place.'},
    'tour.workspace.usage.open':{kicker:'Make the workspace yours',title:'Open Usage.',normal:'Usage gathers activity, limits, and cost signals into cards. Moving a card never changes the work it reports.',eli5:'Usage is a page of gauges. Moving a gauge does not change your work.',success:'Usage is open.'},
    'tour.workspace.widget.manage':{kicker:'Make the workspace yours',title:'Keep a useful card nearby.',normal:'Add or resize a card so the information you check often is easy to glance at while planning.',eli5:'Put one useful card where it is easy to see.',success:'The card changed through its real widget controls.'},
    'tour.planning.open':{kicker:'Plan before building',title:'Open Planning Wizard.',normal:'Planning Wizard turns a rough idea into a plan you can inspect before any work begins.',eli5:'Planning Wizard turns your idea into steps you can check first.',success:'Planning Wizard is open.'},
    'tour.planning.project_source':{kicker:'Plan before building',title:'Choose the project for this practice.',normal:'The Wizard keeps every decision attached to the right Project. Choose the local practice Project.',eli5:'Choose which Project this practice belongs to.',success:'The practice Project is selected.'},
    'tour.planning.goal':{kicker:'Plan before building',title:'Describe the outcome in one sentence.',normal:'Use the book-club example. A clear result is more useful than a list of technical instructions.',eli5:'Say what you want to make. One clear sentence is enough.',success:'The idea is ready to turn into outcomes.'},
    'tour.planning.guided_help':{kicker:'Plan before building',title:'Choose guided planning.',normal:'Guided planning asks only the decisions that can change the result and explains why each one matters.',eli5:'Guided planning asks one useful question at a time.',success:'Guided planning is selected.'},
    'tour.planning.requirements':{kicker:'Plan before building',title:'Turn the idea into outcomes.',normal:'Open the outcome view and check that it describes what visitors should be able to do.',eli5:'See the three things the finished site should do.',success:'Three clear outcomes are visible.'},
    'tour.planning.question':{kicker:'Plan before building',title:'Answer the question that changes the result.',normal:'Choose who should be able to update the meeting and book. This affects whether shared sign-in and editing are needed.',eli5:'Choose who can change the meeting and book.',success:'Your decision is part of the plan.'},
    'tour.planning.why':{kicker:'Plan before building',title:'See why the question matters.',normal:WHY_COPY,eli5:'This answer decides whether other people need a safe way to sign in and edit.',success:'The reason is visible beside the decision.'},
    'tour.planning.review':{kicker:'Plan before building',title:'Review before anything starts.',normal:'Check the outcomes, decisions, assumptions, and anything that is still uncertain.',eli5:'Read what Puppet Master understood before it starts.',success:'The complete practice plan is open for review.'},
    'tour.planning.edit':{kicker:'Plan before building',title:'Change one answer and watch the plan react.',normal:'Choose Edit, then select a different answer about who can update the site. Only shared sign-in and organizer access should change; the three outcomes stay still.',eli5:'Choose Edit, then change who can update the site. Only the related part of the plan should move.',success:'One answer changed one consequence.'},
    'tour.planning.consequence':{kicker:'Cause and effect',title:'The unaffected outcomes stayed put.',normal:'Shared sign-in and organizer access changed because your answer changed. The meeting, book, and join outcomes did not.',eli5:'Your one answer changed one matching part. Everything else stayed still.'},
    'tour.planning.approval_boundary':{kicker:'Ready when you are',title:'This is the boundary before building.',normal:'Nothing has been built yet. That is the planning loop: describe the outcome, answer only what matters, review the plan, then decide whether to begin.',eli5:'Nothing started. You described, answered, checked, and now you decide.',note:'Your Project is ready. Start with one sentence about what you want to make or change.'}
  };
  var chapterLabels={intro:'Introduction',chat_teacher:'Ask and understand',workspace:'Make the workspace yours',planning_wizard:'Plan before building'};
  var stepBaseline=null,stepPoll=0,practiceRoot=null,practiceWidget=null,practiceWidgetId=null,workspacePanelId=null;
  function cancelStepPoll(){if(stepPoll){clearInterval(stepPoll);stepPoll=0;}}
  function clearChoreography(){choreographyTimers.forEach(clearTimeout);choreographyTimers=[];state.choreography_state='idle';root.dataset.choreography='idle';pointer.style.opacity='';}
  function scheduleChoreography(fn,delay){var timer=setTimeout(fn,delay);choreographyTimers.push(timer);return timer;}
  function currentDef(){return stepDef(state.step_id);}
  function copyForStep(){var row=STEP_COPY[state.step_id]||STEP_COPY['tour.intro.comfort'];return {kicker:row.kicker,title:row.title,body:state.eli5_enabled?row.eli5:row.normal,note:row.note||'',success:row.success||''};}
  function localActionResult(actionId,status,reason,extra){return Object.assign({schema_id:'pm.guided_tour.local_action_result.v1',action_id:actionId,step_id:state.step_id,status:status,disabled_reason:reason||null,domain_mutation:false,persistence_write:false,concept_simulation_only:true},extra||{});}
  function persistCheckpoint(){try{sessionStorage.setItem('pm7:guided-tour:checkpoint:v3',JSON.stringify({schema_id:'pm.guided_tour.safe_checkpoint.v1',step_id:state.step_id,eli5_enabled:state.eli5_enabled,status:state.status,source:state.source}));}catch(error){}}
  function clearCheckpoint(){try{sessionStorage.removeItem('pm7:guided-tour:checkpoint:v3');}catch(error){}}
  function savedCheckpoint(){try{var value=JSON.parse(sessionStorage.getItem('pm7:guided-tour:checkpoint:v3')||'null');return value&&value.schema_id==='pm.guided_tour.safe_checkpoint.v1'&&STEP_BY_ID[value.step_id]?value:null;}catch(error){return null;}}
  function ownerActionEvent(actionId,payload){var detail=Object.assign({schema_id:'pm.guided_tour.owner_action.v1',action_id:actionId,step_id:state.step_id,mode:state.action_mode||'try',concept_simulation_only:true,production_receipt:false},payload||{});window.dispatchEvent(new CustomEvent('pm7.guided-tour.owner-action',{detail:detail}));return detail;}
  function pageIs(page){return !!(window.PM_PAGES&&window.PM_PAGES.current===page)||!!document.querySelector('.page-tab.active[data-page="'+page+'"]');}
  function goPage(page){var tab=visibleTarget('.page-tab[data-page="'+page+'"]');if(tab)tab.click();else if(window.PM_PAGES&&typeof window.PM_PAGES.go==='function')window.PM_PAGES.go(page);return pageIs(page);}
  function chatSurfaceRecord(){var api=window.PM_HOME_WORKSPACE;return api&&homeSurface('chat',api.layout);}
  function chatMoved(){var now=chatSurfaceRecord();return !!(stepBaseline&&stepBaseline.chat&&now&&(now.host!==stepBaseline.chat.host||now.slot_index!==stepBaseline.chat.slot_index));}
  function movablePanel(){var api=window.PM_HOME_WORKSPACE,surfaces=api&&api.layout&&api.layout.surfaces||[],row=surfaces.filter(function(item){return item.visible&&item.surface_instance_id!=='chat';})[0]||null;workspacePanelId=row&&row.surface_instance_id||null;return row;}
  function panelMoved(){var api=window.PM_HOME_WORKSPACE,now=api&&homeSurface(workspacePanelId,api.layout);return !!(stepBaseline&&stepBaseline.panel&&now&&(now.host!==stepBaseline.panel.host||now.slot_index!==stepBaseline.panel.slot_index));}
  function alternateHost(surface){var api=window.PM_HOME_WORKSPACE,hosts=Object.keys(api&&api.host_registries||{}),preferred=['dock_right','home_right','home_main','dock_left','floating'];for(var i=0;i<preferred.length;i+=1)if(hosts.indexOf(preferred[i])>=0&&preferred[i]!==surface.host)return preferred[i];return hosts.filter(function(host){return host!==surface.host;})[0]||surface.host;}
  function moveWorkspaceSurface(id){var api=window.PM_HOME_WORKSPACE,surface=api&&homeSurface(id,api.layout);if(!api||!surface||typeof api.moveSurface!=='function')return false;var host=alternateHost(surface),before=clone(surface);api.moveSurface(id,host,{index:0});var after=homeSurface(id,api.layout),ok=!!after&&(after.host!==before.host||after.slot_index!==before.slot_index);ownerActionEvent('cmd.workspace_layout.move_surface',{surface_instance_id:id,from_host:before.host,to_host:host,success:ok});return ok;}
  function chooseUsageWidget(){var api=window.PM7_USAGE;if(!api||!api.state)return null;var rows=typeof api.roomWidgets==='function'?api.roomWidgets(api.state.room):[],hidden=rows.filter(function(item){return api.state.hidden[api.state.room+':'+item.id];})[0],visible=rows.filter(function(item){return !api.state.hidden[api.state.room+':'+item.id];})[0];return hidden||visible||null;}
  function usageWidgetReady(){var item=practiceWidgetId&&window.PM7_USAGE&&window.PM7_USAGE.widgetById&&window.PM7_USAGE.widgetById(practiceWidgetId),card=item&&document.querySelector('#pm7uBoard .pm7u-card[data-widget="'+practiceWidgetId+'"]');if(!item||!card)return false;var layout=window.PM7_USAGE.layoutFor&&window.PM7_USAGE.layoutFor(item);return !!layout&&!!stepBaseline&&!!stepBaseline.widget&&(layout.cols!==stepBaseline.widget.cols||layout.rows!==stepBaseline.widget.rows||stepBaseline.widget.hidden);}
  function configureUsageWidget(){var api=window.PM7_USAGE,item=chooseUsageWidget();if(!api||!item)return false;practiceWidgetId=item.id;state.active_widget_id=item.id;var key=api.state.room+':'+item.id,hidden=!!api.state.hidden[key];if(hidden){setUsageVisible(item.id,true);ownerActionEvent('cmd.widget.add',{widget_id:item.id,success:!api.state.hidden[key]});return !api.state.hidden[key];}var before=api.layoutFor(item),presets=api.sizePresets?api.sizePresets(item):[],next=presets.filter(function(row){return row[0]!==before.cols||row[1]!==before.rows;})[0];if(!next)next=[Math.min((before.cols||2)+1,6),before.rows||2];api.setLayout(item,next[0],next[1],'cmd.widget.configure','guided_tour');var after=api.layoutFor(item),ok=after.cols!==before.cols||after.rows!==before.rows;ownerActionEvent('cmd.widget.configure',{widget_id:item.id,before:before,after:after,success:ok});return ok;}
  var practiceModel=createGuidedPlanningPractice({goal:BOOK_CLUB_GOAL});
  function freshPlanningFixture(){return practiceModel.create();}
  function practiceButton(action,label,extra){
    return '<button type="button" data-ui-action-id="ui.guided_tour.next" data-practice-action="'+action+'" '+(extra||'')+' data-pm-hover-label="'+esc(label)+'" data-pm-hover-detail="Use this choice in the local guided example.">'+esc(label)+'</button>';
  }
  function planningFixtureMarkup(){
    var f=planningFixture||freshPlanningFixture(),view=practiceModel.view(f);
    var outcomes=f.outcomes_visible?'<section data-practice-key="outcomes" class="pm7gt-practice-outcomes" data-tour-fixture-id="planning-outcomes"><strong>What success looks like</strong>'+BOOK_CLUB_OUTCOMES.map(function(item,index){return '<div data-practice-key="outcome-'+index+'">'+esc(item)+'</div>';}).join('')+'</section>':'';
    var question=f.outcomes_visible?'<section data-practice-key="question" class="pm7gt-practice-question" data-tour-fixture-id="planning-question" data-editing="'+String(f.editing)+'"><strong>Who should be able to update the meeting and book?</strong><div class="pm7gt-practice-choices">'+[['me','Only me.'],['organizers','A few organizers.'],['unsure','I’m not sure yet.']].map(function(row){
      return practiceButton('answer',row[1],'data-practice-key="answer-'+row[0]+'" data-practice-value="'+row[0]+'" aria-pressed="'+String(f.answer===row[0])+'"'+(f.editing&&row[0]===f.edit_from?' disabled':''));
    }).join('')+'</div>'+(f.editing?'<p data-practice-key="edit-instruction" class="pm7gt-practice-why" role="status">Choose a different answer. The review below will show exactly what changes.</p>':'')+
      (f.why_visible?'<p data-practice-key="why" class="pm7gt-practice-why" role="note">'+esc(WHY_COPY)+'</p>':practiceButton('why','Why this matters','data-practice-key="why" class="pm7gt-practice-link"'))+'</section>':'';
    var review=f.review_visible?'<section data-practice-key="review" class="pm7gt-practice-review" data-tour-fixture-id="planning-review"><header><strong>Plan review</strong><span>Nothing has been built</span></header>'+
      '<div data-practice-key="review-outcomes"><small>OUTCOMES</small><b>3 clear results</b></div>'+
      '<div data-practice-key="review-decision"><small>DECISION</small><b>'+esc(view.decision)+'</b></div>'+
      '<div data-practice-key="review-access" data-tour-fixture-id="planning-shared-access" data-state="'+view.access_state+'" data-consequence-revision="'+f.consequence_revision+'"><small>SHARED ACCESS</small><b>'+esc(view.access)+'</b></div>'+
      '<div data-practice-key="review-assumptions"><small>ASSUMPTION</small><b>'+esc(view.assumption)+'</b></div>'+
      '<div data-practice-key="review-uncertain"><small>UNRESOLVED CHOICES</small><b>'+esc(view.unresolved)+'</b></div>'+
      practiceButton('edit',f.editing?'Choose your new answer above':'Edit who can update it','data-practice-key="review-edit"'+(f.editing?' disabled':''))+'</section>':'';
    var goal=f.goal_submitted?'<div data-practice-key="goal" class="pm7gt-practice-goal is-set" data-tour-fixture-id="planning-goal"><small>Your practice goal</small><strong>'+esc(f.goal)+'</strong></div>':
      '<label data-practice-key="goal" class="pm7gt-practice-goal" data-tour-fixture-id="planning-goal"><span>What would you like to make?</span><textarea rows="3" data-practice-goal data-pm-hover-label="Practice goal" data-pm-hover-detail="Describe the result in everyday words.">'+esc(f.goal)+'</textarea>'+practiceButton('goal','Use this idea')+'</label>';
    return '<header data-practice-key="head" class="pm7gt-practice-head"><span>PLANNING WIZARD · GUIDED EXAMPLE</span><strong>Neighborhood book club</strong><small>Local practice · no files changed · no work started</small></header><div data-practice-key="body" class="pm7gt-practice-body">'+
      '<button type="button" data-practice-key="project" class="pm7gt-practice-project" data-ui-action-id="ui.guided_tour.next" data-practice-action="project" aria-pressed="'+String(f.project_selected)+'" data-pm-hover-label="Choose the practice Project" data-pm-hover-detail="Keep these practice decisions together in the local guided example."><span>Project</span><strong>'+(f.project_selected?'Book club · selected':'Choose Book club')+'</strong></button>'+goal+
      '<button type="button" data-practice-key="guided" class="pm7gt-practice-guided" data-ui-action-id="ui.guided_tour.next" data-practice-action="guided" aria-pressed="'+String(f.guided_selected)+'" data-pm-hover-label="Use guided planning" data-pm-hover-detail="Ask only decisions that can change the result."><span>Planning style</span><strong>'+(f.guided_selected?'Guided planning · selected':'Use guided planning')+'</strong></button>'+
      (f.goal_submitted&&f.guided_selected&&!f.outcomes_visible?practiceButton('outcomes','Show the outcomes','data-practice-key="open-outcomes" class="pm7gt-practice-primary"'):'')+outcomes+question+
      (f.answer&&!f.review_visible?practiceButton('review','Review this plan','data-practice-key="open-review" class="pm7gt-practice-primary"'):'')+review+'</div>';
  }
  function ensurePlanningFixture(){
    if(practiceRoot&&practiceRoot.isConnected)return practiceRoot;
    var host=document.getElementById('panel-wizard');if(!host)return null;
    planningFixture=planningFixture||freshPlanningFixture();host.classList.add('pm7gt-practice-host');
    practiceRoot=document.createElement('section');practiceRoot.id='pm7gt-planning-practice';practiceRoot.className='pm7gt-planning-practice';
    practiceRoot.setAttribute('data-concept-fixture-only','true');practiceRoot.setAttribute('aria-label','Guided Planning Wizard example');
    practiceRoot.innerHTML=planningFixtureMarkup();host.appendChild(practiceRoot);return practiceRoot;
  }
  function updatePracticeTree(current,next){
    if(current.isEqualNode(next))return current;
    if(current.nodeType!==next.nodeType||current.nodeName!==next.nodeName){var replacement=next.cloneNode(true);current.replaceWith(replacement);return replacement;}
    if(current.nodeType!==1){current.nodeValue=next.nodeValue;return current;}
    [].slice.call(current.attributes).forEach(function(attr){if(!next.hasAttribute(attr.name))current.removeAttribute(attr.name);});
    [].slice.call(next.attributes).forEach(function(attr){if(current.getAttribute(attr.name)!==attr.value)current.setAttribute(attr.name,attr.value);});
    var prior=[].slice.call(current.childNodes),used=[];
    [].slice.call(next.childNodes).forEach(function(want,index){
      var key=want.nodeType===1&&want.getAttribute('data-practice-key'),have=key?prior.find(function(node){return node.nodeType===1&&node.getAttribute('data-practice-key')===key;}):prior[index];
      if(have&&(used.indexOf(have)>=0||(!key&&have.nodeType===1&&have.hasAttribute('data-practice-key'))))have=null;
      if(have){used.push(have);if(current.childNodes[index]!==have)current.insertBefore(have,current.childNodes[index]||null);updatePracticeTree(have,want);}
      else current.insertBefore(want.cloneNode(true),current.childNodes[index]||null);
    });
    prior.forEach(function(node){if(used.indexOf(node)<0&&node.parentNode===current)node.remove();});
    return current;
  }
  function renderPlanningFixture(){
    var node=ensurePlanningFixture();if(!node)return null;
    var template=document.createElement('section');template.innerHTML=planningFixtureMarkup();
    var before=node.querySelector('[data-tour-fixture-id="planning-shared-access"]'),revision=before&&before.getAttribute('data-consequence-revision');
    [].slice.call(template.children).forEach(function(next){var current=node.querySelector(':scope > [data-practice-key="'+next.getAttribute('data-practice-key')+'"]');if(current)updatePracticeTree(current,next);else node.appendChild(next.cloneNode(true));});
    var consequence=node.querySelector('[data-tour-fixture-id="planning-shared-access"]');
    if(consequence&&revision!==null&&revision!==consequence.getAttribute('data-consequence-revision')){
      consequence.classList.remove('pm7gt-practice-changed');void consequence.offsetWidth;consequence.classList.add('pm7gt-practice-changed');
    }
    return node;
  }
  function removePlanningFixture(){var host=document.getElementById('panel-wizard');if(practiceRoot&&practiceRoot.isConnected)practiceRoot.remove();if(host)host.classList.remove('pm7gt-practice-host');practiceRoot=null;}
  function planningAction(action,value){
    planningFixture=planningFixture||freshPlanningFixture();
    if(action==='goal'){var input=practiceRoot&&practiceRoot.querySelector('[data-practice-goal]');value=input?input.value:planningFixture.goal;}
    var result=practiceModel.apply(planningFixture,action,value);
    if(!result.ok){state.last_error=result.error;return false;}
    planningFixture=result.state;
    Object.assign(state,{planning_project_selected:planningFixture.project_selected,planning_goal:planningFixture.goal_submitted?planningFixture.goal:'',
      planning_answer:planningFixture.answer,planning_why_open:planningFixture.why_visible,planning_reviewed:planningFixture.review_visible,
      planning_edited:planningFixture.edited,planning_consequence_visible:planningFixture.edited&&!planningFixture.editing,planning_requirements_opened:planningFixture.outcomes_visible});
    renderPlanningFixture();
    if(action==='edit'){
      var choice=practiceRoot&&practiceRoot.querySelector('[data-practice-action="answer"]:not([disabled])');
      if(choice){choice.scrollIntoView({block:'nearest'});if(state.action_mode!=='show_me')choice.focus({preventScroll:true});}
    }
    ownerActionEvent(({project:'wizard.attach',goal:'wizard.practice_goal',guided:'wizard.intent',outcomes:'wizard.to_requirements',answer:'wizard.practice_answer',why:'wizard.practice_why',review:'wizard.practice_review',edit:'wizard.practice_edit'})[action]||'ui.guided_tour.next',{fixture_action:action,value:value||null,editing:planningFixture.editing,consequence_revision:planningFixture.consequence_revision,work_started:false});
    scheduleTargetTracking();return true;
  }
  function planningPredicate(id){var f=planningFixture||{};return id==='tour.planning.project_source'?!!f.project_selected:id==='tour.planning.goal'?!!f.goal_submitted:id==='tour.planning.guided_help'?!!f.guided_selected:id==='tour.planning.requirements'?!!f.outcomes_visible:id==='tour.planning.question'?!!f.answer:id==='tour.planning.why'?!!f.why_visible:id==='tour.planning.review'?!!f.review_visible:id==='tour.planning.edit'?!!f.edited&&!f.editing:false;}
  var TEACHER_SUGGESTIONS=['What are the main parts of Puppet Master?','How do I rearrange panels?','What does Planning do?','Can I use Safe History with GitHub?','What is a Server?','How does local discovery work?'];
  var TEACHER_MORE_GROUPS=[
    {label:'Projects and save points',questions:['How do I open a folder on this computer?','How do I bring a project from online?','What is the difference between Git and Jujutsu?','What does FileSafe protect?','How do I restore a backup?','How does Cursor Origin work?']},
    {label:'Computers and connections',questions:['Can Storage live on a different computer?','How do I connect through Tailscale?','How does Headscale differ?','What is a reverse proxy?','How does Remote Link work?','How does a VPN help?']},
    {label:'Planning and the work',questions:['What should I put in requirements?','When does work actually begin?','How do I read a plan before approving it?','What does a run show me?','How do I stop something safely?','Where do I see errors?']},
    {label:'Comfort and safety',questions:['What does ELI5 change?','How do I use calmer motion?','How do permissions keep me safe?','What can Teacher explain?','When should I use Settings?','When should I use Doctor?']}
  ];
  function teacherQuestionButton(question){return '<li><button type="button" data-ui-action-id="ui.guided_tour.next" data-teacher-question="'+esc(question)+'" data-pm-hover-label="Ask Teacher" data-pm-hover-detail="Send this built-in question without using an online AI service.">'+esc(question)+'</button></li>';}
  function teacherQuestionsMarkup(){return '<details class="pm7gt-question-more"><summary>See 30 example questions</summary><ul class="pm7gt-question-list"><li class="pm7gt-question-group">Good starting points</li>'+TEACHER_SUGGESTIONS.map(teacherQuestionButton).join('')+TEACHER_MORE_GROUPS.map(function(group){return '<li class="pm7gt-question-group">'+esc(group.label)+'</li>'+group.questions.map(teacherQuestionButton).join('');}).join('')+'</ul></details><p class="pm7gt-question-count">Teacher knows 46 built-in Puppet Master topics and works without an online AI account.</p>';}
  function closeTeacherPicker(){var portal=document.querySelector('.pm6-chat-persona-popout-portal.is-open'),button=document.querySelector('#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn');if(portal&&button)button.click();return !document.querySelector('.pm6-chat-persona-popout-portal.is-open');}
  function placeChatRight(){var api=window.PM_HOME_WORKSPACE,chat=api&&homeSurface('chat',api.layout);if(!api||!chat)return false;if(!chat.visible&&api.setSurfaceVisible)api.setSurfaceVisible('chat',true,'cmd.panel.switch');chat=homeSurface('chat',api.layout);if(chat&&chat.host!=='dock_right'&&api.moveSurface){var hosts=Object.keys(api.host_registries||{});if(hosts.indexOf('dock_right')>=0)api.moveSurface('chat','dock_right',{index:0});}openChatSurface();return !!activeChat();}
  function fillTeacherQuestionText(question){var input=visibleTarget('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input');if(!input)return false;input.value=String(question||AUTHORITATIVE_PROMPT);input.dispatchEvent(new Event('input',{bubbles:true}));try{input.focus({preventScroll:true});}catch(error){}return true;}
  function sendTeacherQuestion(question){prepareTeacherPractice();fillTeacherQuestionText(question);var send=visibleTarget('#chatPanel .pm6-chat-send,#floatingChat .pm6-chat-send');if(send){send.click();return true;}var input=visibleTarget('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input');if(input){input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));return true;}return false;}
  function toggleEli5(force){var before=state.eli5_enabled;state.eli5_enabled=typeof force==='boolean'?force:!before;syncEli5();if(state.teacher_response_message_id)applyTeacherMode();ownerActionEvent('cmd.chat.eli5.set',{enabled:state.eli5_enabled,meaning_preserved:true});recordUi('ui.guided_tour.toggle_eli5',{enabled:state.eli5_enabled});return state.eli5_enabled!==before||state.eli5_enabled===force;}
  function stepTargetSelector(id){
    if(id==='tour.chat.open')return '#chatPanel:not(.hidden),#floatingChat';
    if(id==='tour.chat.teacher.select')return '.pm6-chat-persona-popout-portal.is-open .pm6-chat-personaitem[data-persona="Teacher"],#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn';
    if(id==='tour.chat.teacher.ask')return '#chatPanel .pm6-chat-send,#floatingChat .pm6-chat-send,#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input';
    if(id==='tour.chat.teacher.reply')return state.teacher_response_message_id?'[data-pm6-mid="'+state.teacher_response_message_id+'"] .pm6-chat-sink,[data-pm7gt-teacher-response="true"]':'#chatPanel .messageStream,#floatingChat .messageStream';
    if(id==='tour.chat.teacher.eli5')return '#pm7gt-eli5';
    if(id==='tour.workspace.navigation')return '.title-bar .page-tabs,.page-tabs';
    if(id==='tour.workspace.chat.dock')return '[data-pm-home-handle="chat"],[data-pm-home-surface="chat"]';
    if(id==='tour.workspace.panels.rearrange')return workspacePanelId?'[data-pm-home-handle="'+workspacePanelId+'"],[data-pm-home-surface="'+workspacePanelId+'"]':'[data-pm-home-host="home_main"]';
    if(id==='tour.workspace.usage.open')return '.page-tab[data-page="usage"],#tab-usage';
    if(id==='tour.workspace.widget.manage')return practiceWidgetId?'#pm7uBoard .pm7u-card[data-widget="'+practiceWidgetId+'"] .pm7u-cardmenu,#pm7uBoard .pm7u-card[data-widget="'+practiceWidgetId+'"],#pm7uCustomize':'#pm7uCustomize,#pm7uBoard';
    if(id==='tour.planning.open')return '.page-tab[data-page="wizard"],#tab-wizard';
    if(id==='tour.planning.project_source')return '#pm7gt-planning-practice [data-practice-action="project"]';
    if(id==='tour.planning.goal')return '#pm7gt-planning-practice [data-practice-action="goal"],#pm7gt-planning-practice [data-practice-goal]';
    if(id==='tour.planning.guided_help')return '#pm7gt-planning-practice [data-practice-action="guided"]';
    if(id==='tour.planning.requirements')return '#pm7gt-planning-practice [data-practice-action="outcomes"]';
    if(id==='tour.planning.question')return '#pm7gt-planning-practice .pm7gt-practice-choices';
    if(id==='tour.planning.why')return '#pm7gt-planning-practice [data-practice-action="why"],#pm7gt-planning-practice .pm7gt-practice-why';
    if(id==='tour.planning.review')return '#pm7gt-planning-practice [data-practice-action="review"]';
    if(id==='tour.planning.edit')return planningFixture&&planningFixture.editing?'#pm7gt-planning-practice .pm7gt-practice-choices':'#pm7gt-planning-practice [data-practice-action="edit"]';
    if(id==='tour.planning.consequence')return '#pm7gt-planning-practice [data-tour-fixture-id="planning-shared-access"]';
    if(id==='tour.planning.approval_boundary')return '#pm7gt-planning-practice .pm7gt-practice-review,#pm7gt-planning-practice';
    return '';
  }
  function prepareStep(def){
    cancelStepPoll();clearChoreography();stepBaseline=null;state.action_mode=null;state.action_status=stepIsComplete(def.id)?'complete':'idle';state.last_error=null;root.dataset.actionMode=state.action_status;
    if(def.id.indexOf('tour.chat.')===0){placeChatRight();installTeacherSendAdapter();setTeacherPlaceholder();}
    if(def.id==='tour.chat.teacher.select'){var picker=visibleTarget('#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn');if(picker&&!document.querySelector('.pm6-chat-persona-popout-portal.is-open'))picker.click();mountTeacherPersonaControl();}
    if(def.id==='tour.chat.teacher.ask'){selectPersona('Teacher');state.teacher_persona_selected=true;prepareTeacherPractice();fillTeacherQuestion();}
    if(def.id==='tour.workspace.navigation'){closeTeacherPicker();goPage('dashboard');}
    if(def.id==='tour.workspace.chat.dock'){goPage('dashboard');var chat=chatSurfaceRecord();stepBaseline={chat:clone(chat)};}
    if(def.id==='tour.workspace.panels.rearrange'){goPage('dashboard');var panel=movablePanel();stepBaseline={panel:clone(panel)};}
    if(def.id==='tour.workspace.widget.manage'){goPage('usage');if(window.PM7_USAGE&&window.PM7_USAGE.rerender)window.PM7_USAGE.rerender();var widget=chooseUsageWidget();practiceWidgetId=widget&&widget.id||null;var hidden=!!(widget&&window.PM7_USAGE.state.hidden[window.PM7_USAGE.state.room+':'+widget.id]),layout=widget&&window.PM7_USAGE.layoutFor(widget);stepBaseline={widget:{id:practiceWidgetId,hidden:hidden,cols:layout&&layout.cols,rows:layout&&layout.rows}};}
    if(def.id.indexOf('tour.planning.')===0&&def.id!=='tour.planning.open'){goPage('wizard');ensurePlanningFixture();renderPlanningFixture();}
    syncCompatibility();persistCheckpoint();var mounted=mountedTarget(stepTargetSelector(def.id));if(mounted&&mounted.scrollIntoView)mounted.scrollIntoView({block:'nearest',inline:'nearest'});setTimeout(function(){activeTarget=targetAdapter.resolve(def.id);scheduleTargetTracking();},0);
  }
  function stepPredicate(id){
    if(id==='tour.chat.teacher.select'){var label=document.querySelector('#chatPanel .persona-label,#floatingChat .persona-label');return !!(label&&label.textContent.trim()==='Teacher');}
    if(id==='tour.chat.teacher.ask')return !!state.teacher_message_sent;
    if(id==='tour.chat.teacher.eli5')return !!state.eli5_enabled&&state.teacher_copy_mode==='eli5';
    if(id==='tour.workspace.chat.dock')return chatMoved();
    if(id==='tour.workspace.panels.rearrange')return panelMoved();
    if(id==='tour.workspace.usage.open')return pageIs('usage');
    if(id==='tour.workspace.widget.manage')return usageWidgetReady();
    if(id==='tour.planning.open')return pageIs('wizard');
    if(id.indexOf('tour.planning.')===0)return planningPredicate(id);
    return false;
  }
  function performOwnerAction(def){
    var ok=false,action=def.action_id;
    if(def.id==='tour.chat.teacher.select'){ok=selectPersona('Teacher');state.teacher_persona_selected=ok;}
    else if(def.id==='tour.chat.teacher.ask')ok=sendTeacherQuestion(AUTHORITATIVE_PROMPT);
    else if(def.id==='tour.chat.teacher.eli5')ok=toggleEli5(true);
    else if(def.id==='tour.workspace.chat.dock')ok=moveWorkspaceSurface('chat');
    else if(def.id==='tour.workspace.panels.rearrange')ok=!!workspacePanelId&&moveWorkspaceSurface(workspacePanelId);
    else if(def.id==='tour.workspace.usage.open'){ok=goPage('usage');ownerActionEvent(action,{page_id:'usage',success:ok});}
    else if(def.id==='tour.workspace.widget.manage')ok=configureUsageWidget();
    else if(def.id==='tour.planning.open'){ok=goPage('wizard');ownerActionEvent(action,{page_id:'wizard',success:ok});}
    else if(def.id==='tour.planning.project_source')ok=planningAction('project');
    else if(def.id==='tour.planning.goal')ok=planningAction('goal');
    else if(def.id==='tour.planning.guided_help')ok=planningAction('guided');
    else if(def.id==='tour.planning.requirements')ok=planningAction('outcomes');
    else if(def.id==='tour.planning.question')ok=planningAction('answer','organizers');
    else if(def.id==='tour.planning.why')ok=planningAction('why');
    else if(def.id==='tour.planning.review')ok=planningAction('review');
    else if(def.id==='tour.planning.edit'){
      ok=planningAction('edit');
      if(ok&&state.action_mode==='show_me'){
        var changeTo=practiceModel.view(planningFixture).edit_choice,session=sessionSerial;
        scheduleChoreography(function(){
          if(!state.open||state.step_id!==def.id||state.action_mode!=='show_me'||session!==sessionSerial)return;
          var choice=visibleTarget('#pm7gt-planning-practice [data-practice-action="answer"][data-practice-value="'+changeTo+'"]');
          if(choice){var box=choice.getBoundingClientRect();pointer.style.opacity='1';pointer.style.left=(box.left+box.width/2)+'px';pointer.style.top=(box.top+box.height/2)+'px';}
          scheduleChoreography(function(){if(choice&&choice.isConnected&&state.open&&state.step_id===def.id&&state.action_mode==='show_me'&&session===sessionSerial)choice.click();},reduced?80:560);
        },reduced?80:360);
      }
    }
    return localActionResult(action,ok?'applied':'failed',ok?null:'The highlighted action is not available yet.',{owner_action_dispatched:true,target_id:def.id,work_started:false});
  }
  var completedSteps={},autoAdvanceTimer=0;
  function clearAutoAdvance(){if(autoAdvanceTimer){clearTimeout(autoAdvanceTimer);autoAdvanceTimer=0;}}
  function stepIsComplete(id){return !!completedSteps[id];}
  function completeStep(status,metadata){
    var def=currentDef();if(status!=='applied'&&status!=='no_change'){state.action_status='failed';state.last_error=metadata&&metadata.reason||'That action did not finish. Try it again or choose Show Me.';render('forward');return snapshot();}
    if(stepIsComplete(def.id))return snapshot();
    cancelStepPoll();clearChoreography();state.action_status='complete';state.last_error=null;completedSteps[def.id]={status:status,mode:state.action_mode||'try',at:Date.now(),metadata:clone(metadata||{})};
    receipt(def.action_id,def.id,status,null,stepBaseline,{predicate:true,work_started:false},metadata&&metadata.owner_receipt||null,state.action_mode||'try',localActionResult(def.action_id,status,null,{predicate_verified:true,work_started:false}));
    render('forward');clearAutoAdvance();autoAdvanceTimer=setTimeout(function(){autoAdvanceTimer=0;if(state.open&&state.step_id===def.id)goTo(def.index+1,'forward',true);},reduced?90:560);return snapshot();
  }
  function watchCurrentPredicate(){
    cancelStepPoll();var id=state.step_id;
    function check(){if(!state.open||state.step_id!==id){cancelStepPoll();return;}var ok=false;try{ok=stepPredicate(id);}catch(error){state.last_error=String(error&&error.message||error);}if(ok)completeStep('applied',{observed_predicate:id,provider_request_delta:0,usage_delta:0,work_started:false});}
    stepPoll=setInterval(check,120);setTimeout(check,0);
  }
  function beginTry(control){var def=currentDef();if(!def.meaningful)return next();ack(control,'ui.guided_tour.next');state.action_mode='try';state.action_status='watching';state.last_error=null;root.dataset.actionMode='try';recordUi('ui.guided_tour.next',{mode:'try',step_id:def.id,owner_action_id:def.action_id});render('forward');watchCurrentPredicate();return snapshot();}
  function runShowMeAction(def){if(!state.open||state.step_id!==def.id)return;state.choreography_state='arrival';root.dataset.choreography='arrival';var result=performOwnerAction(def);state.last_result=clone(result);scheduleTargetTracking();watchCurrentPredicate();scheduleChoreography(function(){if(state.open&&state.step_id===def.id){state.choreography_state='settle';root.dataset.choreography='settle';pointer.style.opacity='0';if(result.status==='failed'&&!stepPredicate(def.id)){state.action_status='failed';state.last_error=result.disabled_reason;render('forward');}}},reduced?80:180);}
  function beginShowMe(control){
    var def=currentDef();if(!def.meaningful)return next();ack(control,'ui.guided_tour.show_me');clearChoreography();state.action_mode='show_me';state.action_status='watching';state.last_error=null;root.dataset.actionMode='show_me';recordUi('ui.guided_tour.show_me',{step_id:def.id,owner_action_id:def.action_id,same_handler:'performOwnerAction',predicate:'stepPredicate'});render('forward');
    var target=targetAdapter.resolve(def.id),calloutRect=callout.getBoundingClientRect(),targetRect=target&&target.getBoundingClientRect(),startX=Math.max(16,Math.min(innerWidth-16,calloutRect.right-28)),startY=Math.max(16,Math.min(innerHeight-16,calloutRect.bottom-24));pointer.style.left=startX+'px';pointer.style.top=startY+'px';pointer.style.opacity='1';state.choreography_state='pre_cue';root.dataset.choreography='pre_cue';
    var pre=reduced?0:90,travel=reduced?80:460;scheduleChoreography(function(){if(!state.open||state.step_id!==def.id)return;state.choreography_state='travel';root.dataset.choreography='travel';if(targetRect){pointer.style.left=(targetRect.left+targetRect.width/2)+'px';pointer.style.top=(targetRect.top+targetRect.height/2)+'px';}},pre);scheduleChoreography(function(){runShowMeAction(def);},pre+travel);return snapshot();
  }
  function stageButton(action,label,kind,extra){return '<button type="button" class="'+(kind==='primary'?'pm7gt-primary':'pm7gt-secondary')+'" data-ui-action-id="'+action+'" '+(extra||'')+'>'+esc(label)+'</button>';}
  function render(direction){
    clearTimeout(transitionTimer);reduced=motionReduced();syncCompatibility();syncEli5();var def=currentDef(),copy=copyForStep(),done=stepIsComplete(def.id),actions='',status='Ready';state.motion=direction||'forward';state.transition_serial+=1;root.dataset.stepId=def.id;root.dataset.chapter=def.chapter;root.dataset.motion=reduced?'idle':state.motion;root.dataset.actionMode=state.action_mode||'idle';
    if(def.id==='tour.planning.approval_boundary'){actions='<label class="pm7gt-note"><input type="checkbox" data-tour-keep-layout '+(state.keep_layout?'checked':'')+'> Keep this workspace arrangement</label><p class="pm7gt-note">Leave this off to restore your starting layout. Your practice plan will be cleared either way.</p>'+stageButton('ui.guided_tour.finish','Finish at Planning','primary','data-tour-action="finish"');status='No work has started';}
    else if(!def.meaningful){actions=stageButton('ui.guided_tour.next',def.index===0?'Begin with Teacher':'Continue','primary','data-tour-action="continue"');status='Take this at your pace';}
    else if(done||state.action_status==='complete'){actions=stageButton('ui.guided_tour.next','Continue','primary','data-tour-action="continue"');status=copy.success||'Done';}
    else if(state.action_status==='watching'){actions=stageButton('ui.guided_tour.show_me','Show me','secondary','data-tour-action="show"');status=state.action_mode==='show_me'?'Showing the same action':'Waiting for the highlighted control';}
    else{actions=stageButton('ui.guided_tour.next','Try it','primary','data-tour-action="try"')+stageButton('ui.guided_tour.show_me','Show me','secondary','data-tour-action="show"');status='You stay in control';}
    var note=copy.note?'<p class="pm7gt-note">'+esc(copy.note)+'</p>':'',error=state.last_error?'<p class="pm7gt-reason" role="alert">'+esc(state.last_error)+'</p>':'',questions=def.id==='tour.chat.teacher.reply'?teacherQuestionsMarkup():'';
    stage.innerHTML='<p class="pm7gt-kicker">'+esc(copy.kicker)+'</p><h2 id="pm7gt-title" tabindex="-1" data-pm-hover-exempt="programmatic-focus-landmark">'+esc(copy.title)+'</h2><p class="pm7gt-copy" id="pm7gt-copy">'+esc(done&&copy.success?copy.success:copy.body)+'</p>'+note+error+'<div class="pm7gt-actions">'+actions+'</div>'+questions;
    var clip=stage.parentElement;if(clip)clip.scrollTop=0;callout.setAttribute('aria-labelledby','pm7gt-title');callout.setAttribute('aria-describedby','pm7gt-copy');backButton.disabled=def.index===0;backButton.setAttribute('aria-disabled',String(def.index===0));progress.textContent='Step '+(def.index+1)+' of '+STEP_DEFS.length+' · '+chapterLabels[def.chapter];forwardSlot.innerHTML='<span class="pm7gt-status">'+esc(status)+'</span>';
    activeTarget=targetAdapter.resolve(def.id);positionTarget(activeTarget);scheduleTargetTracking();var heading=stage.querySelector('h2');if(!def.meaningful&&heading)try{heading.focus({preventScroll:true});}catch(error){}
    var serial=state.transition_serial,delay=reduced?80:(currentTheme().indexOf('retro')===0?timings.retro_ms:timings.step_ms);transitionTimer=setTimeout(function(){if(serial!==state.transition_serial)return;root.dataset.motion='idle';state.motion='idle';transitionTimer=0;notify();},delay);notify();
  }
  function goTo(index,direction,remember){
    clearAutoAdvance();cancelStepPoll();clearChoreography();if(index<0||index>=STEP_DEFS.length)return snapshot();var leaving=state.step_id;if(remember&&leaving)history.push(leaving);state.step_id=STEP_DEFS[index].id;state.step_index=index;state.action_mode=null;state.action_status=stepIsComplete(state.step_id)?'complete':'idle';state.last_error=null;prepareStep(STEP_DEFS[index]);render(direction||'forward');return snapshot();
  }
  function next(){var def=currentDef();recordUi('ui.guided_tour.next',{step_id:def.id});if(def.id==='tour.planning.approval_boundary')return finish('complete');if(def.meaningful&&!stepIsComplete(def.id)){state.last_error='Try the highlighted action, or choose Show Me and I will demonstrate it.';render('forward');return snapshot();}return goTo(def.index+1,'forward',true);}
  function back(){var def=currentDef();recordUi('ui.guided_tour.back',{step_id:def.id});if(def.index===0)return snapshot();if(history.length)history.pop();return goTo(def.index-1,'back',false);}
  function stopTargetTracking(){if(targetFrame){cancelAnimationFrame(targetFrame);targetFrame=0;}if(targetResizeObserver){targetResizeObserver.disconnect();targetResizeObserver=null;}}
  function scheduleTargetTracking(){if(!state.open)return;if(targetFrame)cancelAnimationFrame(targetFrame);targetFrame=requestAnimationFrame(function(){targetFrame=0;activeTarget=targetAdapter.resolve(state.step_id);positionTarget(activeTarget);});if(typeof ResizeObserver!=='undefined'){if(targetResizeObserver)targetResizeObserver.disconnect();targetResizeObserver=new ResizeObserver(function(){if(state.open&&!targetFrame)scheduleTargetTracking();});try{targetResizeObserver.observe(callout);if(activeTarget)targetResizeObserver.observe(activeTarget);}catch(error){}}}
  function overlapArea(a,b){return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));}
  function positionTarget(target){
    var margin=10,descriptor=targetAdapter.descriptor(state.step_id);callout.style.setProperty('--pm7gt-fit-w',Math.max(1,innerWidth-margin*2)+'px');callout.style.setProperty('--pm7gt-fit-h',Math.max(1,innerHeight-margin*2)+'px');
    if(target&&callout.contains(target)){root.dataset.target='internal';root.dataset.targetKey=descriptor.key;root.dataset.targetOverlapPx='0';halo.style.opacity='0';callout.style.left='50%';callout.style.top='50%';return;}
    var rect=target&&target.getBoundingClientRect?target.getBoundingClientRect():null,visible=rect?{left:Math.max(margin,rect.left),top:Math.max(margin,rect.top),right:Math.min(innerWidth-margin,rect.right),bottom:Math.min(innerHeight-margin,rect.bottom)}:null,usable=!!(visible&&rect.width>0&&rect.height>0&&visible.right>visible.left&&visible.bottom>visible.top);
    root.dataset.target=usable?'available':'missing';root.dataset.targetKey=descriptor.key;if(!usable){halo.style.opacity='0';callout.style.left='50%';callout.style.top='50%';root.dataset.targetOverlapPx='0';return;}
    halo.style.opacity='';var pad=8,hLeft=Math.max(margin,visible.left-pad),hTop=Math.max(margin,visible.top-pad),hRight=Math.min(innerWidth-margin,visible.right+pad),hBottom=Math.min(innerHeight-margin,visible.bottom+pad);halo.style.left=((hLeft+hRight)/2)+'px';halo.style.top=((hTop+hBottom)/2)+'px';halo.style.width=(hRight-hLeft)+'px';halo.style.height=(hBottom-hTop)+'px';
    var cw=Math.min(callout.offsetWidth||420,innerWidth-margin*2),ch=Math.min(callout.offsetHeight||360,innerHeight-margin*2),gap=22,cx=(visible.left+visible.right)/2,cy=(visible.top+visible.bottom)/2,candidates=[{side:'right',x:visible.right+gap+cw/2,y:cy},{side:'left',x:visible.left-gap-cw/2,y:cy},{side:'below',x:cx,y:visible.bottom+gap+ch/2},{side:'above',x:cx,y:visible.top-gap-ch/2}],best=null;
    if(innerWidth<680)candidates=[candidates[2],candidates[3],candidates[0],candidates[1]];
    candidates.forEach(function(candidate,index){var x=Math.max(margin+cw/2,Math.min(innerWidth-margin-cw/2,candidate.x)),y=Math.max(margin+ch/2,Math.min(innerHeight-margin-ch/2,candidate.y)),box={left:x-cw/2,top:y-ch/2,right:x+cw/2,bottom:y+ch/2},overlap=overlapArea(box,visible),travel=Math.abs(x-candidate.x)+Math.abs(y-candidate.y),score=overlap*1000+travel+index;if(!best||score<best.score)best={x:x,y:y,side:candidate.side,overlap:overlap,score:score};});
    callout.style.left=best.x+'px';callout.style.top=best.y+'px';root.dataset.calloutSide=best.side;root.dataset.targetOverlapPx=String(Math.round(best.overlap));
  }
  var targetAdapter={
    schema_id:'pm.guided_tour.deterministic_target_adapter.v3',
    descriptor:function(step){var id=step||state.step_id;return {key:id+':'+(practiceWidgetId||workspacePanelId||'default'),step_id:id,selector:stepTargetSelector(id)};},
    resolve:function(step){var descriptor=this.descriptor(step);return visibleTarget(descriptor.selector);},
    status:function(step){var descriptor=this.descriptor(step),target=this.resolve(step),def=stepDef(step),reason=null;if(def.chapter==='workspace'&&!window.PM_HOME_WORKSPACE)reason='The workspace controls are not ready yet.';if(def.chapter==='planning_wizard'&&!window.PM_PAGES)reason='Planning is not ready yet.';if(def.chapter==='chat_teacher'&&!window.PM_DEMO)reason='Assistant Chat is not ready yet.';return {step_id:def.id,target_key:descriptor.key,selector:descriptor.selector,available:!!target&&!reason,visible:!!target,reason:reason||(!target&&def.meaningful?'The highlighted control is still coming into view.':null)};},
    perform:function(actionId){var def=currentDef();if(actionId&&actionId!==def.action_id&&actionId!=='ui.guided_tour.show_me')return localActionResult(actionId,'disabled','That action belongs to another tour step.');return performOwnerAction(def);},
    predicate:function(step){return stepPredicate(step||state.step_id);},layoutSnapshot:function(){return layoutNow();},captureOriginal:function(){return captureOriginal();}
  };
  function cleanupForExit(complete){
    clearAutoAdvance();cancelStepPoll();clearChoreography();stopTargetTracking();cancelTeacherTurn();closeTeacherPicker();
    var keep=!!complete&&state.keep_layout===true,restoration,chatOk=false,routeOk=false;
    try{restoration=keep?{ok:!!original,kept_by_explicit_choice:true,before:original&&clone(original.semantic),after:layoutNow()}:restoreWorkspaceSnapshot();}catch(error){restoration={ok:false,failures:['workspace_restore_failed']};}
    try{chatOk=restoreChatState(complete);restorePlanningChoice();}catch(error){chatOk=false;}
    removePlanningFixture();
    try{routeOk=goPage(complete?'wizard':original&&original.page);if(!complete&&routeOk&&original.page==='wizard'&&window.PM_PAGES)window.PM_PAGES.go('wizard',original.wizard_stage);}catch(error){routeOk=false;}
    state.layout_snapshot_restored=!keep&&!!restoration.ok;state.layout_disposition=restoration.ok?(keep?'kept':'restored'):'restore_failed';
    restoreDocumentScroll();return {ok:!!restoration.ok&&chatOk!==false&&routeOk,layout:restoration,chat_restored:chatOk!==false,teacher_preserved:!!complete,final_page:routeOk?(complete?'wizard':original&&original.page):null,work_started:false};
  }
  function finish(reason){
    var complete=reason==='complete',action=complete?'ui.guided_tour.finish':'ui.guided_tour.skip';
    if(!original||(!state.open&&state.status!=='paused'&&state.status!=='recovery_required'))return snapshot();
    if(complete&&(state.step_id!=='tour.planning.approval_boundary'||meaningful.some(function(def){return !stepIsComplete(def.id);})||!planningFixture||!planningFixture.review_visible||!planningFixture.edited||teacherPending)){
      state.last_error='Finish the practice actions before ending the tour. You can skip at any time.';if(state.open)render('forward');return snapshot();
    }
    recordUi(action,{reason:reason,keep_layout:complete&&state.keep_layout===true});var restoration=cleanupForExit(complete);
    if(!restoration.ok){
      state.completed=false;state.skipped=false;state.status='recovery_required';state.open=true;state.action_status='failed';state.last_error='Your starting arrangement could not be fully restored. The tour has not finished. Try again when the workspace controls are ready.';
      root.hidden=false;root.dataset.open='true';document.documentElement.setAttribute('data-pm7-guided-tour-open','true');resumeButton.hidden=true;replayButton.hidden=true;
      receipt(action,'original_workspace','failed',state.last_error,original&&original.semantic,layoutNow(),restoration,'try',localActionResult(action,'failed','restore_incomplete',{work_started:false}));persistCheckpoint();render('forward');return snapshot();
    }
    state.open=false;state.completed=complete;state.skipped=!complete;state.status=complete?'completed':'skipped';state.work_started=false;root.hidden=true;root.dataset.open='false';document.documentElement.removeAttribute('data-pm7-guided-tour-open');resumeButton.hidden=true;replayButton.hidden=false;clearCheckpoint();
    receipt(action,complete?'planning_wizard':'original_workspace','applied',null,original&&original.semantic,layoutNow(),restoration,'try',localActionResult(action,'applied',null,{final_page:restoration.final_page,work_started:false}));if(complete)focusPlanningPage();else originalFocus();notify();return snapshot();
  }
  function focusPlanningPage(){var session=sessionSerial;requestAnimationFrame(function(){if(session!==sessionSerial||state.open||!state.completed||!pageIs('wizard'))return;var host=document.getElementById('panel-wizard');if(!host)return;if(!host.hasAttribute('tabindex'))host.setAttribute('tabindex','-1');if(!host.hasAttribute('role'))host.setAttribute('role','region');if(!host.hasAttribute('aria-label'))host.setAttribute('aria-label','Planning Wizard');host.setAttribute('data-pm-hover-exempt','programmatic-focus-landmark');try{host.focus({preventScroll:true});}catch(error){host.focus();}});}
  function skip(){return finish('skip');}
  function pause(reason){if(!state.open)return snapshot();clearAutoAdvance();cancelStepPoll();clearChoreography();stopTargetTracking();cancelTeacherTurn();removePlanningFixture();state.open=false;state.status='paused';root.hidden=true;root.dataset.open='false';document.documentElement.removeAttribute('data-pm7-guided-tour-open');resumeButton.hidden=false;replayButton.hidden=true;recordUi('ui.guided_tour.pause',{reason:reason||'user',step_id:state.step_id});persistCheckpoint();notify();return snapshot();}
  function start(options){
    options=options||{};clearAutoAdvance();cancelStepPoll();clearChoreography();stopTargetTracking();cancelTeacherTurn();if(original&&!state.completed&&!state.skipped){var previous=cleanupForExit(false);if(!previous.ok){state.last_error='The previous practice could not be restored. Resume it and retry before starting another tour.';state.status='recovery_required';resumeButton.hidden=false;return snapshot();}}uninstallTeacherSendAdapter();removePlanningFixture();planningFixture=null;practiceWidgetId=null;workspacePanelId=null;completedSteps={};history=[];effectReceipts.length=0;uiActionLog.length=0;receiptSerial=0;sessionSerial+=1;captureOriginal(options.focus_node||null);state.keep_layout=false;
    Object.assign(state,{open:true,status:'demonstrating',completed:false,skipped:false,last_action:'ui.guided_tour.start',last_result:null,last_error:null,action_mode:null,action_status:'idle',choreography_state:'idle',layout_disposition:'pending',layout_snapshot_restored:false,source:options.source||'manual',teacher_thread_id:null,teacher_persona_selected:false,teacher_message_sent:false,teacher_answer_id:null,teacher_response_message_id:null,teacher_response_index:null,teacher_copy_mode:'normal',teacher_last_prompt:AUTHORITATIVE_PROMPT,eli5_enabled:false,active_widget_id:null,panel_demo_pair_ids:null,panel_demo_complete:false,usage_card_demo_complete:false,planning_goal:'',planning_answer:null,planning_why_open:false,planning_reviewed:false,planning_edited:false,planning_consequence_visible:false,planning_project_selected:false,planning_requirements_opened:false,work_started:false,shell_squeezed:innerWidth<720||innerHeight<560});
    var aliases={chat_teacher:'tour.chat.open',workspace:'tour.workspace.navigation',usage:'tour.workspace.usage.open',widget_workspace:'tour.workspace.widget.manage',planning_wizard:'tour.planning.open'},requested=aliases[options.step]||options.step,index=requested&&STEP_BY_ID[requested]?STEP_BY_ID[requested].index:0;state.step_id=STEP_DEFS[index].id;state.step_index=index;root.hidden=false;root.dataset.open='true';document.documentElement.setAttribute('data-pm7-guided-tour-open','true');resumeButton.hidden=true;replayButton.hidden=true;placeChatRight();recordUi('ui.guided_tour.start',{source:state.source,session:'concept-'+sessionSerial,storyboard_revision:STORYBOARD.revision});prepareStep(STEP_DEFS[index]);render('forward');return snapshot();
  }
  function resume(){recordUi('ui.guided_tour.resume',{step_id:state.step_id});if(!original)return start({source:'checkpoint',step:state.step_id});state.open=true;state.status='demonstrating';root.hidden=false;root.dataset.open='true';document.documentElement.setAttribute('data-pm7-guided-tour-open','true');resumeButton.hidden=true;replayButton.hidden=true;prepareStep(currentDef());render('forward');return snapshot();}
  function replay(options){return start(Object.assign({source:'replay'},options||{}));}
  root.addEventListener('change',function(event){if(event.target&&event.target.matches('[data-tour-keep-layout]'))state.keep_layout=event.target.checked===true;});
  root.addEventListener('click',function(event){
    var control=event.target&&event.target.closest&&event.target.closest('button[data-ui-action-id],button[data-command-id]');if(!control||!root.contains(control)||control.disabled||control.getAttribute('aria-disabled')==='true')return;var id=control.getAttribute('data-ui-action-id')||control.getAttribute('data-command-id'),tourAction=control.getAttribute('data-tour-action');
    if(control.hasAttribute('data-teacher-question')){ack(control,id);sendTeacherQuestion(control.getAttribute('data-teacher-question'));return;}
    if(tourAction==='try'){beginTry(control);return;}if(tourAction==='show'){beginShowMe(control);return;}if(tourAction==='continue'){ack(control,id);next();return;}if(tourAction==='finish'){ack(control,id);finish('complete');return;}
    if(id==='ui.guided_tour.toggle_eli5'){ack(control,id);toggleEli5();render('forward');if(state.step_id==='tour.chat.teacher.eli5'&&state.action_status==='watching'&&stepPredicate(state.step_id))completeStep('applied',{eli5_enabled:true,meaning_preserved:true});}
    else if(id==='ui.guided_tour.back'){ack(control,id);back();}
    else if(id==='ui.guided_tour.pause'){ack(control,id);pause('user');}
    else if(id==='ui.guided_tour.skip'){ack(control,id);skip();}
  });
  document.addEventListener('click',function(event){
    var control=event.target&&event.target.closest&&event.target.closest('[data-practice-action],[data-teacher-question]');if(!control)return;
    if(control.hasAttribute('data-teacher-question')&&!root.contains(control)){sendTeacherQuestion(control.getAttribute('data-teacher-question'));return;}
    if(!state.open||!control.hasAttribute('data-practice-action'))return;planningAction(control.getAttribute('data-practice-action'),control.getAttribute('data-practice-value'));if(state.action_status==='watching')setTimeout(function(){if(stepPredicate(state.step_id))completeStep('applied',{via:'planning_practice_control',work_started:false});},0);
  },true);
  document.addEventListener('click',function(){if(!state.open||state.action_status!=='watching')return;setTimeout(function(){if(state.open&&state.action_status==='watching'&&stepPredicate(state.step_id))completeStep('applied',{via:'mounted_owner_control',work_started:false});},0);});
  resumeButton.addEventListener('click',function(){ack(resumeButton,'ui.guided_tour.resume');resume();});
  replayButton.addEventListener('click',function(){ack(replayButton,'ui.guided_tour.replay');replay();});
  function tabStops(){var selector='button:not([disabled]):not([aria-disabled="true"]),input:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])',nodes=[].slice.call(callout.querySelectorAll(selector));if(state.action_status==='watching'){var target=targetAdapter.resolve(state.step_id);if(target)nodes.push(target);if(practiceRoot)nodes=nodes.concat([].slice.call(practiceRoot.querySelectorAll(selector)));}return nodes.filter(function(node,index,list){var rect=node.getBoundingClientRect();return rect.width>0&&rect.height>0&&list.indexOf(node)===index;});}
  document.addEventListener('keydown',function(event){if(!state.open)return;if(event.key==='Escape'){event.preventDefault();pause('escape');return;}if(event.key!=='Tab')return;var nodes=tabStops();if(!nodes.length)return;var index=nodes.indexOf(document.activeElement),next=event.shiftKey?(index<=0?nodes[nodes.length-1]:nodes[index-1]):(index<0||index===nodes.length-1?nodes[0]:nodes[index+1]);event.preventDefault();try{next.focus({preventScroll:true});}catch(error){next.focus();}},true);
  window.addEventListener('resize',function(){state.shell_squeezed=innerWidth<720||innerHeight<560;if(state.open)scheduleTargetTracking();},{passive:true});
  window.addEventListener('scroll',function(){if(state.open)scheduleTargetTracking();},{passive:true,capture:true});
  if(window.matchMedia){var motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)'),onMotionChange=function(){reduced=motionReduced();if(state.open)render('forward');};if(motionQuery.addEventListener)motionQuery.addEventListener('change',onMotionChange);else if(motionQuery.addListener)motionQuery.addListener(onMotionChange);}
  if(window.MutationObserver){
    new MutationObserver(function(records){var motionChanged=records.some(function(record){return record.attributeName==='data-motion'&&record.oldValue!==document.documentElement.getAttribute('data-motion');}),themeChanged=records.some(function(record){return record.attributeName==='data-theme'&&record.oldValue!==document.documentElement.getAttribute('data-theme');});if(!state.open)return;if(motionChanged){reduced=motionReduced();render('forward');}else if(themeChanged)scheduleTargetTracking();}).observe(document.documentElement,{attributes:true,attributeOldValue:true,attributeFilter:['data-motion','data-theme']});
    new MutationObserver(function(){if(state.open&&state.step_id==='tour.chat.teacher.select'&&!teacherPersonaButton())mountTeacherPersonaControl();}).observe(document.body,{childList:true,subtree:true});
  }
  var checkpoint=savedCheckpoint();if(checkpoint&&checkpoint.status==='paused'){state.step_id=checkpoint.step_id;state.step_index=stepDef(checkpoint.step_id).index;state.eli5_enabled=!!checkpoint.eli5_enabled;state.source=checkpoint.source||'checkpoint';state.status='paused';resumeButton.hidden=false;}
  window.PM7_GUIDED_TOUR={schema_id:'pm.guided_tour.concept_api.v3',concept_simulation_only:true,production_runtime_certification:false,timings:clone(timings),storyboard:clone(STORYBOARD),start:start,next:next,back:back,pause:pause,resume:resume,skip:skip,finish:function(){return finish('complete');},replay:replay,snapshot:snapshot,target_adapter:targetAdapter,effect_receipts:effectReceipts,ui_action_log:uiActionLog,teacher_topics:TEACHER_ANSWERS.length,subscribe:function(fn){if(typeof fn==='function')listeners.push(fn);return function(){listeners=listeners.filter(function(item){return item!==fn;});};}};
  }
  var installObserver=null;
  function mountGuidedTour(){installGuidedTour();if(window.PM7_GUIDED_TOUR&&installObserver){installObserver.disconnect();installObserver=null;}}
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',mountGuidedTour,{once:true});
    if(window.MutationObserver){installObserver=new MutationObserver(mountGuidedTour);installObserver.observe(document.documentElement,{childList:true,subtree:true});}
  }else mountGuidedTour();
})();
