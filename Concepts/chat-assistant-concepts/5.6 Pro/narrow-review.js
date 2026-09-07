/* v3 fixture presentation. This is authored demonstration data, never a
   filter on real provider errors. Original source and negative fixtures remain
   in data.js and the recovery threads. Product state machines are unchanged. */
(function(){
 'use strict';
 const D=window.PM56_DATA,E=window.PM56_EXT;
 const stories={
 query:['Query performance','Optimize the tenant-scoped analytics read path and show me the plan.','I’ll check the query and schema, then propose a bounded change with a benchmark and rollback check.','Keep the rollout reversible.','The plan is ready to inspect. Open it to review the steps, revise the scope, or start the build.'],
 'orbit-run':['Two-stage rollout'],
 'queue-demo':['Follow-up messages'],
 plain:['Product design discussion','Help me simplify the project dashboard.','Start with the current project, the next useful action, and recent work. Keep secondary metrics in their own detail view.','What belongs above the fold?','The project name, current task, and one clear next action. History and advanced configuration can remain one click away.'],
 questions:['Deployment questions','Plan a deployment for the analytics change.','First, let’s confirm the target and rollout window. Your answers stay with the plan.','Use staging before production.','Noted. The remaining questions cover the deployment window, rollback conditions, and who receives the result.'],
 subagents:['Architecture review','Review the runtime boundary with independent specialists. Do not change files.','The reviewers will inspect ownership, persistence, and command routing, then return a combined findings report.','Keep the findings tied to their source.','Each finding includes its location and supporting evidence. Suggested repairs remain proposals until you choose to act.'],
 bsd:['Advisor feedback','Check the migration approach before implementation.','Back Seat Driver can offer a separate read-only opinion without taking over the main task.','Preserve the existing migration history.','The proposed change uses a new forward migration. The file-change record opens the recorded diff.'],
 context:['Focus a conversation','Focus this conversation on the current renderer and tests.','Context Lens lets you focus relevant turns, mute irrelevant material, and preview a smaller context without losing the original thread.','Show what changes before compacting.','Open Context More Details to inspect sources and the compaction preview. Applying a preview is a separate action.'],
 visuals:['Working with artifacts','Show the architecture and benchmark results in a form I can explore.','The diagram, chart, and data table are separate artifacts. Open each one to inspect its underlying content.','Keep the source available.','Each artifact retains its source view; a rendered visualization is not a replacement for the original data.'],
 debug:['Investigate a browser issue','Investigate the account-switching bug and verify the repair.','I’ll bind the target, reproduce the issue, inspect the evidence, then check the candidate repair and cleanup.','Use the existing browser session.','The session and evidence stay attached to this investigation. The recorded file change can be reviewed before applying it.'],
 offline:['Recovery · offline delivery','Send this message when the connection returns.','The message is queued once. It will not create duplicate turns after reconnecting.','Has the connection returned?','The reconnect receipt shows the queued message was delivered once. Approval requests are never granted automatically during an outage.'],
 attachments:['Files in a conversation','Inspect this schema and compare it with the attached runbook.','The files remain attached to this turn. Preview a file to inspect its source, version, and what was included in context.','Can I attach a folder as well?','Yes. The folder starts with a bounded manifest; its files are read only as needed rather than all being inserted into the prompt.'],
 'tool-failure':['Recovery · interrupted tool','The execution host disconnected. Keep the evidence and resume safely.','The interrupted step is recorded. Reconnect and revalidate the target before continuing.','Don’t repeat a completed change.','The resume path uses the existing operation identity and evidence. It does not blindly replay the entire run.'],
 'goal-replan':['Revise a goal','Keep improving the query until the benchmark is under the target.','The Goal holds that objective and its lifecycle. Its To-Dos remain the separate, actionable task list.','Pause while I change the scope.','Paused. You can edit the objective and resume when ready; changing the Goal does not silently rewrite an approved Plan.'],
 route:['Provider route change','Use the coding-plan account for the next step.','The selected route includes the provider, model, and account—not just the model’s display name.','Show the related implementation change.','The file record opens the exact recorded diff. Subsequent messages retain their own route attribution.'],
 'plan-deep':['Deep Plan','Research the session cache problem and produce a plan before changing code.','I’ll compare the approaches and turn the chosen one into a plan with explicit verification steps.','Let me review it first.','Open the plan in the left tab. Build, Revise, and the other controls remain with the plan document.'],
 crew:['Crew and shared work','Use a Crew to coordinate the implementation and review.','The coordinator assigns bounded work to each role and combines their results. Models and Personas can be chosen per participant.','How is this different from Chat Room?','Crew assigns work. Chat Room hosts a discussion; turning a conclusion into a task or plan requires an explicit action.'],
 'artifact-error':['Recovery · artifact rendering','The chart could not render. Keep the source so I can inspect it.','The source remains available. Retry the renderer without replacing the original artifact.','Is an empty result a renderer failure?','No. An empty dataset and a rendering error are separate states and should be reported separately.'],
 'new-message':['Continue reading','Continue the benchmark while I read the earlier results.','New messages will not move your reading position. Use the new-message indicator when you are ready to catch up.','Keep the last result visible when I reach the bottom.','The transcript clears the floating Activity Bar and composer at its settled bottom position.'],
 'no-models':['Recovery · unavailable account','This account needs attention. What happens to the pending request?','The request stays visible. Choose an available configured route or repair the account in Provider Settings.','Don’t silently switch accounts.','Account changes remain explicit; an unavailable route must not be represented as a successful provider attempt.'],
 'archived-1':['Archived · control review','Check the controls and navigation in this concept.','The review checks names, destinations, disabled states, and whether every visible action leads to the expected view.'],
 'archived-2':['Archived · route comparison','Compare the configured model routes for this project.','Model names, account identities, capabilities, and usage availability are separate properties. The picker keeps them together when choosing a route.'],
 'archived-3':['Archived · usage layout','Make the usage view easy to scan.','Show the active window, the amount used, and the reset time first. Keep additional meters and technical evidence behind disclosure.'],
 'archived-4':['Archived · onboarding decisions','Keep onboarding focused on what I need to get started.','Ask for essential connection details first. Move advanced settings into their manager rather than filling the first-run flow with options.'],
 'archived-5':['Archived · browser integration','How should browser work appear in Assistant Chat?','Browser actions use Puppet Master’s Browser Program surface. Captures can attach to a conversation, while the browser’s main launcher stays outside the composer.'],
 'archived-6':['Archived · Settings layout','Organize the Settings managers so they work in narrow layouts.','Use aligned labels and values, distinct section spacing, and short action rows. Show explanations on demand instead of repeating them beneath every control.']
 };
 const review=[];
 function recoveryThread(id,title){
   let t=D.threads.find(t=>t.id===id);if(t)return t;
   t={id,title,summary:'Explicit recovery examples; not the normal workflow.',status:'idle',pinned:false,archived:false,unread:0,updated:'Demo',messages:[],model:'',worktree:'feature/query-index',goalId:null};D.threads.push(t);return t;
 }
 const scheduler=window.PM56_SCHED;
 const notes=[];
 D.threads.slice().forEach(t=>{
   const before=t.messages.map(m=>({id:m.id,type:m.type})),story=stories[t.id];
   if(!story)return;
   t.title=story[0];t.summary=story[2]||t.summary;
   if(story.length>1){let i=1;const messages=[];
     t.messages.forEach(m=>{
       if(m.type==='text'){
         if(i>=story.length)return;
         const intendedRole=i%2?'user':'assistant';if(m.role!==intendedRole)return;
         m.body=story[i++];messages.push(m);
       } else messages.push(m);
     });t.messages=messages;
   }
   t.messages.forEach(m=>{
     if(m.type==='agent-work'&&window.PM56_RECORDS.reference(m).kind==='note'){m.internalOnly=true;notes.push({thread:t.id,message:m});}
     if(m.id==='bsd-09'){m.title='Forward migration';m.detail='Add the index in a new migration; preserve applied history.';}
     if(m.id==='route-04'){m.title='Account-aware provider rows';m.detail='Each row identifies its provider and account.';}
     if(m.id==='route-12'){m.title='Explicit route status';m.detail='Use the selected provider and account to resolve availability.';}
     if(m.id==='route-07')m.detail='Selected Qwen 3.8 · Coding Plan for the next turn.';
     if(t.id==='goal-replan'&&m.type==='goal-receipt'){
       m.title=m.id==='goal-replan-06'?'Goal paused':'Goal updated';
       m.detail=m.id==='goal-replan-06'?'Resume when the objective is ready.':'The objective changed; the approved Plan remains unchanged.';
     }
   });
   // Keep failure fixtures intact, but out of the everyday query conversation.
   if(t.id==='query')t.messages=t.messages.filter(m=>{
     if(m.type==='sched-message'){
       const record=scheduler?.list().messages.find(r=>r.scheduled_dispatch_id===m.scheduleId);
       if(/failed|held|expired|canceled/.test(m.id)){
         const dest=recoveryThread('recovery-scheduling','Recovery · scheduled delivery');dest.messages.push(m);if(record)record.thread_id=dest.id;return false;
       }
     }
     if(m.type==='plan-card-v2'&&['ap-auth','ap-flags','ap-embeds'].includes(m.planId)){
       const p=window.PM56_PLANS.get(m.planId),dest=recoveryThread('plan-example-'+m.planId,p?.title||'Plan example');dest.summary='Open the plan to inspect or control it.';dest.messages.push(m);if(p)p.thread_id=dest.id;return false;
     }
     return true;
   });
   if(t.id==='attachments')t.messages=t.messages.filter(m=>{if(m.type!=='attachment-error')return true;recoveryThread('recovery-attachments','Recovery · attachment input').messages.push(m);return false;});
   review.push({thread_id:t.id,title:t.title,previous_components:before,components:t.messages.map(m=>({id:m.id,type:m.type,internal:!!m.internalOnly})),disposition:t.title.startsWith('Recovery')?'explicit_recovery':'current_example'});
 });
 // Exceptional collaboration fixture cards are grouped without mutating outcomes.
 function regroupRuns(threads){
  const runs=window.PM56_COLLAB.runs();
  for(const run of runs){
   if(!['blocked','failed'].includes(run.status)&&!run.participants.some(p=>['blocked','failed','disabled'].includes(p.status)))continue;
   const target=threads.find(t=>t.id==='recovery-collaboration');if(!target)continue;
   for(const thread of threads){if(thread===target)continue;const cards=thread.messages.filter(m=>m.type==='collab-run'&&m.runId===run.id);if(cards.length){thread.messages=thread.messages.filter(m=>!cards.includes(m));target.messages.push(...cards);}}
   run.threadId=target.id;
  }
 }
 recoveryThread('recovery-collaboration','Recovery · collaboration');regroupRuns(D.threads);
 D.internalWorkNotes=notes;
 function bindFixtureDestinations(threads){
  for(const t of threads)for(const m of t.messages){
   if(m.type==='sched-message'){const r=scheduler.list().messages.find(r=>r.scheduled_dispatch_id===m.scheduleId);if(r)r.thread_id=t.id;}
   if(m.type==='plan-card-v2'){const r=window.PM56_PLANS.get(m.planId);if(r)r.thread_id=t.id;}
  }
 }
 bindFixtureDestinations(D.threads);
 E.actionAfter('reset-all',()=>{const ctx=E.ctx();regroupRuns(ctx.state.threads);bindFixtureDestinations(ctx.state.threads);ctx.renderApp();});
 window.PM56_HISTORY_REVIEW={version:'3-rebuilt',review,internalNotes:notes,threadCount:()=>D.threads.length};
})();
