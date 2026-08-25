
  /* =====================================================================
     questions -- one flow -> four.

     `state.questionQueue` is initialised to 2 in app.js while exactly one
     flow existed, so the "2 queued" pill was fiction. There are now two
     genuinely queued flows, one active and one completed, which makes
     that literal true without app.js changing.

     `D.questions` stays the FLAT array of the active flow, because
     app.js clones it directly into `state.questions` and the summary
     question reads `state.questions[0..2]` by index. The new
     `questionFlows` collection carries all four; the active flow's
     `questions` array IS `D.questions` by reference on purpose -- the
     alternative is two copies that drift.
     ===================================================================== */
  const questions = [
    { id:'q1', prompt:'Where should the primary Puppet Master server run?', required:true, type:'choice',
      options:['TrueNAS Docker','Windows native','macOS native','Linux native'], answer:'TrueNAS Docker',
      why:'Host selection decides which execution hosts are reachable without a relay.' },
    { id:'q2', prompt:'Which hosts may execute Windows work?', required:true, type:'multi',
      options:['Windows native','Windows WSL','Linux container','macOS'], answer:['Windows native','Windows WSL'],
      why:'Windows-only tooling cannot be routed to a Linux container, so this narrows the eligible host set.' },
    { id:'q3', prompt:'What should happen when the preferred host is offline?', required:true, type:'choice',
      options:['Pause and ask','Use an eligible fallback','Queue until it returns'], answer:'',
      why:'This is the difference between a stalled run and a run that silently changed hosts.' },
    { id:'q4', prompt:'Add any constraints the deployment plan should preserve.', required:false, type:'text',
      answer:'Keep provider credentials on the server and allow clients to reconnect without losing draft state.',
      why:'Free-text constraints are copied verbatim into the resulting Plan artifact.' },
    { id:'q5', prompt:'Review the resolved deployment summary.', required:false, type:'summary', answer:'',
      why:'Nothing is submitted until this page is seen.' }
  ];

  const questionFlows = [
    { id:'flow-deploy', title:'Deployment questionnaire', state:'active', threadId:'questions',
      openedAt:at(432), dueAt:null, expiresAt:null,
      note:'No passive expiry: an unanswered questionnaire waits indefinitely and keeps its draft.',
      questions },

    { id:'flow-migration', title:'Migration approval', state:'queued', threadId:'query',
      openedAt:at(506), dueAt:null, expiresAt:null,
      note:'Queued behind the deployment questionnaire. Answering is what unblocks todos t9 and t10.',
      questions:[
        { id:'mq1', prompt:'Does the payload bound apply to existing rows or only to new writes?', required:true, type:'choice',
          options:['New writes only','Backfill existing rows','Backfill in a separate migration'], answer:'',
          why:'A backfill on 128,400 rows is a different migration with a different rollback.' },
        { id:'mq2', prompt:'May the unused events_hourly foreign key be dropped in the same migration?', required:true, type:'choice',
          options:['Yes, same migration','No, separate migration','Leave it in place'], answer:'',
          why:'Bundling an unrelated drop into a migration makes the rollback less precise.' },
        { id:'mq3', prompt:'Which window may the concurrent index build run in?', required:true, type:'multi',
          options:['Weekday off-peak','Weekend','Any time','Maintenance window only'], answer:[],
          why:'CONCURRENTLY takes two table passes and holds no exclusive lock, but it is still load.' },
        { id:'mq4', prompt:'Anything the migration plan must preserve?', required:false, type:'text', answer:'',
          why:'Copied verbatim into the migration plan artifact.' }
      ] },

    { id:'flow-hosts', title:'Execution host capabilities', state:'queued', threadId:'subagents',
      openedAt:at(512), dueAt:null, expiresAt:null,
      note:'Queued. Two of its three questions are already answerable from the host map artifact.',
      questions:[
        { id:'hq1', prompt:'Which host should own browser-program work?', required:true, type:'choice',
          options:['Windows native','Linux container','macOS','Whichever is idle'], answer:'',
          why:'Browser control is the one capability that is not uniform across the hosts.' },
        { id:'hq2', prompt:'May child agents run on a different host from their parent?', required:true, type:'choice',
          options:['Yes','No','Only for read-only agents'], answer:'',
          why:'A child on another host cannot see the parent worktree without a bind.' },
        { id:'hq3', prompt:'Notes for the host routing policy.', required:false, type:'text', answer:'',
          why:'Copied into the routing policy document.' }
      ] },

    { id:'flow-retention', title:'Retention policy', state:'completed', threadId:'archived-1',
      openedAt:at(-2880), completedAt:at(-1440), dueAt:null, expiresAt:null,
      note:'Completed and retained for exact-message search. Answers stay readable after submission.',
      questions:[
        { id:'rq1', prompt:'How long should analytics events be retained?', required:true, type:'choice',
          options:['Nine days','Thirty days','Ninety days','Indefinitely'], answer:'Nine days',
          why:'Retention drives the partition key and the sweep schedule.' },
        { id:'rq2', prompt:'Which surfaces may read expired events?', required:true, type:'multi',
          options:['Nobody','Audit tooling','Support tooling','Analytics'], answer:['Audit tooling'],
          why:'A retention window with an exception list is a different window.' },
        { id:'rq3', prompt:'Should the sweep be scheduled or on demand?', required:true, type:'choice',
          options:['Scheduled nightly','Scheduled weekly','On demand'], answer:'Scheduled nightly',
          why:'A nightly sweep keeps the partition count bounded.' },
        { id:'rq4', prompt:'Anything the retention policy must record?', required:false, type:'text',
          answer:'Record the retention window nine days decision beside the partition key so the two never drift apart.',
          why:'Copied into the retention policy document.' }
      ] }
  ];

  const questionQueueDepth = questionFlows.filter((f) => f.state === 'queued').length;
