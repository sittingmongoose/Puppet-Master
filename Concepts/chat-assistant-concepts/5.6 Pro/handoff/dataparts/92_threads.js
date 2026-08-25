
  thread({ id:'visuals', title:'Inline Visualizer Gallery', status:'complete', updated:'44m',
    model:'GLM 5.2',
    summary:'Mermaid, dashboard, chart, explorer, quiz, map, periodic table, flowchart, and image.',
    messages:turns('visuals', { route:'glm', startMin:380, mode:'agent', persona:'Product Manager', contextStart:5400 }, [
      ['u','Show several native inline visual artifacts.'],
      ['a','Nine kinds, each rendered inline in the transcript and openable full size in the editor. The rule I am following is that an artifact renders inline only if it is legible at transcript width; anything that needs more space gets a card and opens beside the conversation.'],
      ['e','artifact',{ artifactId:'mermaid-runtime' }],
      ['a','The Mermaid diagram is the clearest case for inline rendering: it is a flowchart with sixteen nodes and it reads fine at 620px.'],
      ['e','artifact',{ artifactId:'dashboard-query' }],
      ['u','The dashboard is too cramped inline.'],
      ['a','Agreed, and that is the boundary. Four series with a target line needs roughly 900px before the axis labels stop colliding, so it should be a card inline and a full render in the editor. I will not shrink the labels to make it fit — that produces a chart that is technically present and practically unreadable.'],
      ['e','artifact',{ artifactId:'generated-image' }],
      ['a','Generated images are the opposite case: they downscale cleanly, so inline at transcript width with a click to open at full resolution is right.'],
      ['u','What happens when one of them fails to render?'],
      ['a','It gets an error state with a stated reason and a retry, plus a fallback to the source. There are two of those in this concept and both are recoverable, because an unrecoverable render failure with no source fallback is a dead card and teaches people not to trust the surface.'],
      ['e','artifact',{ artifactId:'flow-plan' }],
      ['a','The last one is the plan approval flowchart. Seven nodes, eight edges, and it is the only artifact here that is also a control surface — clicking a node opens the corresponding decision.'],
      ['u','Good. Leave the dashboard as a card and ship the rest inline.']
    ]) });

  thread({ id:'debug', title:'Browser Debug Session', status:'working', updated:'51m', unread:4,
    model:'Kimi K3', worktree:'review/query-benchmarks',
    summary:'Browser control, console, network, test evidence, and recovery.',
    messages:turns('debug', { route:'kimi', startMin:196, mode:'debug', persona:'Browser Auditor', contextStart:14200 }, [
      ['u','Debug the intermittent blank dashboard.'],
      ['a','Intermittent is the hard part, so I am going to reproduce before theorising. I will drive the browser through the same workflow repeatedly and capture console, network, and a screenshot on every load.'],
      ['e','working',{ title:'Debugging the dashboard' }],
      ['a','118 loads. It reproduced three times. No console errors on any of the three, no failed network requests, and the DOM is present — the chart container has zero height.'],
      ['u','Zero height sounds like CSS, not data.'],
      ['a','That was my first read too, and it is wrong. The container has zero height because the renderer bailed before drawing, and it bails silently when it gets a series it has already drawn under a different key. The height is the symptom.'],
      ['a','What all three reproductions share: each one immediately follows a route change. None of the 115 clean loads did. That is a strong enough correlation to stop looking at CSS.'],
      ['u','Route change as in switching models?'],
      ['a','As in switching accounts. The renderer caches by model name, and the model name stopped being unique the moment a provider had two configured accounts exposing the same model. Two different routes, same cache key, second one gets a stale entry and bails.'],
      /* terminal:'stopped' -- a long pass the reviewer interrupts. Stop is a
         real outcome, not a decoration, and the composer's Send/Stop machine
         needs a turn that actually ended this way. */
      ['a','Starting a fourth pass at 500 loads to tighten the failure rate from roughly one-in-forty into a real confidence interval.',
        { terminal:'stopped' }],
      ['u','Stopped that. Three reproductions is enough to act on, and I would rather have the fix than a tighter estimate of the bug.'],
      ['a','Right call, and it was my error to start it. A better failure rate would not have changed the diagnosis or the patch, so the pass was cost with no decision attached to it.'],
      ['e','agent-work',{ title:'Reproduced deterministically', detail:'Forcing a route change between two accounts on the same model reproduces it 5 times out of 5.' }],
      ['a','Now deterministic: force a route change between the Work and Personal Anthropic accounts and it reproduces every time. That took it from a flaky bug to a one-line key change.'],
      ['e','artifact',{ artifactId:'test-evidence' }],
      ['u','Add a regression test that would have caught it.'],
      ['a','Added, and I made it assert painted pixels rather than a bounding box. The old probe returned true for anything with a non-zero box, which includes elements that are clipped, occluded, or mid-transition — that is how three previous fixes passed while being invisible on screen.'],
      ['a','The new probe hit-tests the centre with elementFromPoint and then counts distinct colours in a screenshot crop. Distinct colours rather than mean luminance, because a solid placeholder box has a perfectly reasonable mean and exactly one colour.'],
      ['e','artifact',{ artifactId:'data-explorer' }]
    ]) });

  thread({ id:'offline', title:'Offline Replay', status:'recovering', updated:'1h',
    model:'Claude Sonnet 4.6',
    summary:'Queued message, reconnect, deduplicated one-time replay.',
    messages:turns('offline', { route:'sonnet', startMin:330, mode:'agent', persona:'Release Engineer', contextStart:7200 }, [
      ['u','Continue after I reconnect.'],
      ['e','offline',{ title:'Message queued offline', detail:'Will replay once after the connection is restored.' }],
      ['a','Queued. Nothing was sent, so nothing was billed, and the draft is held locally rather than optimistically submitted.'],
      ['u','What stops it sending twice when the connection flaps?'],
      ['a','Each queued turn carries an idempotency key generated when you pressed send, not when the connection returns. The server rejects a repeat of the same key, so a flapping connection produces one turn no matter how many times the client retries.\n\nThe part that is easy to get wrong is the client half. If the client generates the key on retry instead of on send, every retry is a new key and the deduplication never fires — the server is doing exactly what it was asked and the user still gets three copies of their message.\n\nThis concept holds the key alongside the draft in the blue lantern checkpoint record, which is the same record the rewind machinery reads. That is deliberate: a queued turn and a restore point are the same kind of object, and giving them two different stores is how they drift.',{ long:true }],
      ['e','reconnected',{ title:'Connection restored', detail:'Queued message replayed once · no duplicate turn created.' }],
      ['a','Replayed once. The receipt records the idempotency key so you can confirm it rather than take my word for it.'],
      ['u','What happens to work that was running when the connection dropped?'],
      ['a','It keeps running. The execution host is server-side, so a disconnected client is a rendering problem rather than an execution problem. When the client returns it replays the event stream from the last acknowledged sequence number.'],
      ['a','The one case that is genuinely lossy is a browser-program step that needed a client-side confirmation while the client was gone. Those time out rather than auto-approving, and they say so.'],
      ['u','Show me the timeout case.'],
      ['e','permission',{ title:'Permission timed out', detail:'A browser-control step waited 120s for confirmation while the client was offline, then stopped. Nothing was approved by default.' }],
      ['a','That is the whole behaviour: it stopped rather than assuming consent. Resuming re-asks rather than replaying the approval, because the thing it wanted permission for may no longer be the right action.'],
      ['u','Good. That is the behaviour I wanted to check.'],
      ['a','Worth noting one thing this concept does not simulate: a partial write on the execution host at the moment of disconnect. That is a real failure mode and it needs a real transaction boundary rather than a fixture.']
    ]) });

  thread({ id:'attachments', title:'Attachment Routing', status:'idle', updated:'1h',
    model:'Kimi K3',
    summary:'Upload progress, image preview, source routing, and unsupported attachment handling.',
    messages:turns('attachments', { route:'kimi', startMin:300, mode:'agent', persona:'Product Manager', contextStart:5100 }, [
      ['u','I am attaching the schema diagram and an old project package. Tell me what you can do with each.'],
      ['e','attachment',{ title:'schema-diagram.png', detail:'Uploaded · image artifact created · downsampled to 1024px' }],
      ['a','The diagram is in. I downsampled it to 1024px on the long edge, which costs about 4,000 tokens rather than the 14,000 the original would have. If you need me to read small text in it, say so and I will re-ingest at full resolution.'],
      ['e','attachment-error',{ title:'legacy-project.pkg', detail:'Unsupported package · open extraction guidance' }],
      ['u','Why can you not read the package?'],
      ['a','Because it is a compressed installer format rather than an archive, and expanding it requires running its own installer. Doing that would execute vendor code on the execution host, which is not something an attachment should be able to trigger.'],
      ['a','What I can do instead: if you extract it locally and attach the contents, or point me at the source repository, both routes work and neither runs anything.'],
      ['u','Fine. What does the diagram actually tell you?'],
      ['a','Three tables, two of which are already in the schema I read. The third — events_hourly — is the rollup that the composite index makes redundant, and the diagram is the first place I have seen its intended refresh cadence written down.'],
      ['e','agent-work',{ title:'Cross-referenced the diagram against schema.rs', detail:'2 of 3 tables match. events_hourly exists in the diagram and is being removed in the working tree.' }],
      ['u','Does the attachment count against my context permanently?'],
      ['a','It stays resident while the thread is active and appears in the context breakdown as its own family, currently 4,000 tokens of a 131,000-token window. Muting it keeps the rehydration handle; compacting it away does not.'],
      ['a','One thing worth flagging about images specifically: a downsampled image cannot be un-downsampled from context. If I need the full-resolution version later I have to re-read the original file, which is why the original stays in the worktree rather than only in the conversation.'],
      ['u','Attach the benchmark CSV too and tell me if that is a better shape for you.'],
      ['e','attachment',{ title:'traces.csv', detail:'Uploaded · 4,180 rows · parsed as a data artifact rather than as text' }],
      ['a','Much better shape. Parsed as a data artifact, so I can filter and aggregate it without loading all 4,180 rows into context — the whole file is 620 tokens as a schema plus a query surface.']
    ]) });

  thread({ id:'tool-failure', title:'Tool Recovery', status:'blocked', updated:'2h', unread:1,
    model:'Claude Opus 5',
    summary:'Interrupted work, permission denial, checkpoint recovery, and retry.',
    messages:turns('tool-failure', { route:'opus', startMin:270, mode:'agent', persona:'Release Engineer', contextStart:8800 }, [
      ['u','Run the full browser suite against the staging host.'],
      /* terminal:'error' -- the turn that was mid-stream when the host dropped.
         This is the fixture that makes Retry message (cmd.chat.retry_message)
         reachable: the operation is only eligible on a failed or cancelled
         assistant turn, and before this every one of the 190 assistant turns
         was terminal:'complete', so the ENABLED branch of a required operation
         had no data to exercise it. `runtime.error` carries the reason. */
      ['a','Starting. Eleven steps; the first six are setup and the last five are the actual assertions.',
        { terminal:'error', error:'Execution host closed the stream during step 7 of 11.' }],
      ['e','tool-error',{ title:'Browser control interrupted', detail:'Execution host disconnected during step 7.' }],
      ['a','It stopped at step 7 of 11. Nothing was left half-applied — the harness rolls back on disconnect — but the six setup steps are gone with it.'],
      ['u','Can you just resume from 7?'],
      ['a','No, and I want to be precise about why rather than just refusing. Steps 1 to 6 built state on the host: a seeded database, a launched preview server, and an authenticated browser session. That state died with the connection. Resuming from step 7 would run assertions against a host that has none of it, and they would fail for the wrong reason.'],
      ['e','permission',{ title:'Permission required', detail:'Reconnecting to the execution host requires approval.' }],
      ['a','Reconnecting needs your approval because it re-authenticates against staging. I am not going to do that silently.'],
      ['u','Approved. Why did the host drop in the first place?'],
      ['a','The Linux container host is marked degraded — it dropped one stream at 08:44 UTC and this is the second one. That is a host problem rather than a suite problem, and running the suite again on the same host is likely to reproduce it.'],
      ['a','My recommendation is to route this run to the Windows WSL host instead and leave the Linux container out of the pool until someone looks at it. That is a decision about infrastructure rather than about this test, so it is yours.'],
      ['u','Route it to WSL. And flag the container host.'],
      ['e','agent-work',{ title:'Host flagged', detail:'linux-container marked degraded · removed from the eligible pool for this thread only.' }],
      ['a','Flagged for this thread only. I did not remove it globally, because a host that drops one stream in two hours may be fine for read-only work and I do not have enough evidence to take it out of the pool for everyone.'],
      ['a','Re-running on WSL from step 1. Setup takes about ninety seconds before the first assertion, so the first six steps will look like nothing is happening.']
    ]) });

  thread({ id:'goal-replan', title:'Goal Replanning', status:'paused', updated:'2h',
    model:'GLM 5.2', goalId:'goal-query-perf',
    summary:'Edit, pause, resume, stop, clear, evidence, tasks, and material replanning.',
    messages:turns('goal-replan', { route:'glm', startMin:240, mode:'agent', persona:'Product Manager', contextStart:6400 }, [
      ['u','Change the goal to include the write path as well as the read path.'],
      ['a','That is a material scope edit rather than a wording change, so it produces a replan event rather than quietly replacing the objective. The distinction matters: replacing it silently would make the previous phase completions look like progress toward something they were never aimed at.'],
      ['e','goal-receipt',{ title:'Replan recorded', detail:'Revision 4 · added a Verify phase for write amplification · nothing removed.' }],
      ['a','Revision 4 adds a Verify phase for write amplification. Nothing was removed, so the two completed phases still count.'],
      ['u','Pause it while I check with the platform team.'],
      ['e','goal-receipt',{ title:'Goal paused', detail:'Budget stops accruing. Phase state is preserved exactly.' }],
      ['a','Paused. The budget stops accruing and the current phase keeps its in-progress state rather than reverting — resuming should not cost you the work already done in it.'],
      ['u','What is the difference between pause, stop, and clear? I never remember.'],
      ['a','Pause is reversible and keeps everything: phases, evidence, budget, blocker. Stop ends the goal but leaves the record readable, so you can see what it achieved and why it ended. Clear removes the goal from the thread entirely, and it is the only one of the three that loses state.'],
      ['a','They are deliberately three separate states rather than one toggle, because the honest answer to "did that goal finish" is different for each, and a single Stop that sometimes means pause and sometimes means delete is how people lose work.'],
      ['u','And the budget — is running out of budget the same as finishing?'],
      ['a','No, and that is worth being blunt about. Budget exhaustion means the goal ran out of tokens, not that it achieved its objective. The status for that is budget_limited and it is displayed differently from complete, because a progress bar that fills up on exhaustion is a lie.'],
      ['e','goal-receipt',{ title:'Blocker recorded', detail:'Schema approval · policy class · affects phases Implement and Verify · next safe action: answer the migration questionnaire.' }],
      ['a','The blocker is recorded structurally rather than as a sentence: class, cause, affected scope, last attempted recovery, why autonomous recovery cannot continue safely, and the next safe action. A generic failure label would not tell you that answering the queued migration questionnaire is what unblocks it.'],
      ['u','Leave it paused. I will resume after the platform call.'],
      ['a','It will stay exactly where it is. Nothing expires while a goal is paused.']
    ]) });
