
  /* The mid-thread model change lives here: turn 06 switches the route
     from Anthropic · Work (Claude Sonnet 4.6) to Alibaba · Coding Plan
     (Qwen 3.8), and every later turn inherits it. Two different models
     are visible in one transcript, which is the whole point of the
     thread and the thing `threads[].model` alone could never express. */
  thread({ id:'route', title:'Provider Route Change', status:'complete', updated:'3h',
    model:'Qwen 3.8',
    summary:'Configured-account route change, Fast eligibility, quota, and graceful fallback.',
    messages:turns('route', { route:'sonnet', startMin:180, mode:'agent', persona:'Release Engineer', contextStart:6800 }, [
      ['u','Refactor the provider selector so it stops assuming one account per provider.'],
      ['a','Starting on the Work Anthropic account. The assumption is baked into the row key: rows are keyed on the provider id, which was fine while a provider had exactly one account.'],
      ['a','The fix is to key on provider plus account and group the rows under a provider heading. That also means the model NAME stops being unique inside the list, so anything that looked a model up by name has to change too.'],
      ['e','agent-work',{ title:'Rewrote providerRows()', detail:'flatMap over accountsFor(provider) · rows keyed `${providerId}:${accountId}`.' }],
      ['u','How many places looked models up by name?'],
      ['a','Three. The selector itself, the route label in the status bar, and — this is the interesting one — a renderer cache in the dashboard, which is the cause of the intermittent blank dashboard in the other thread. Same root cause, two symptoms.'],
      ['e','route-change',{ title:'Model route changed', detail:'Claude Sonnet 4.6 · Work reached its five-hour cap. Continuing on Qwen 3.8 · Coding Plan.' }],
      ['a','The Work account just hit its five-hour cap mid-task, so this turn and everything after it is Qwen 3.8 on the Alibaba Coding Plan account. I am saying so rather than letting the model change silently, because the second half of this transcript was written by a different model and a reader comparing the two halves deserves to know that.', { route:'qwen' }],
      ['u','Does the work carry over cleanly?'],
      ['a','The context does; the style does not. Everything I had read is still in the window, so I am not re-reading the files. But my formatting and my level of caution are noticeably different from the first half of this thread, and that is normal rather than a fault.'],
      ['a','Continuing the refactor. selectRoute() now refuses to route to an account that needs attention rather than silently falling back to a sibling account — a quiet substitution is how a thread ends up billed to an account nobody chose.'],
      ['e','agent-work',{ title:'Added routeState()', detail:'Returns ok/reason/providerId/accountId/label so callers stop inferring state from the model name.' }],
      ['u','Five accounts need attention right now. Does the selector show why?'],
      ['a','Each row carries its own reason: quota exhausted, credential expired, no API key, sign-in lapsed, CLI not on PATH. A disabled row with a truthful reason is the pattern; a disabled row with no reason just looks broken.'],
      ['a','Done: +92 −18 in provider-selector.js and +61 −39 in access-controls.css. The CSS change also removes the coloured left-edge bar that was carrying permission status, which is unreadable for anyone who cannot separate the hues and collides with the selection accent.'],
      ['e','artifact',{ artifactId:'chart-latency' }]
    ]) });

  thread({ id:'plan-deep', title:'Deep Plan Review', status:'waiting', updated:'4h', unread:2,
    model:'Claude Opus 5',
    summary:'Deep Plan artifact, revision, approval, cancellation, and later Build.',
    messages:turns('plan-deep', { route:'opus', startMin:150, mode:'deep_plan', persona:'Plan Critic', contextStart:11200 }, [
      ['u','Deep plan the analytics work. I want to disagree with specifics, not with the general idea.'],
      ['a','Deep Plan reads the whole surface before proposing anything, so this takes longer and produces something you can argue with in detail. Reading the query builders, the schema, the migration history, the benchmark harness, and the two most recent incident notes.'],
      ['e','plan-card',{ artifactId:'plan-query', deep:true }],
      ['a','Six steps, four acceptance criteria, one rollback gate with a named owner. The acceptance criteria are deliberately binary — p95 below 100 ms, no tenant crossover, write overhead below 8%, all tests green including the rollback rehearsal. Nothing subjective like "performs well".'],
      ['u','Why binary? Some of this is genuinely a judgement call.'],
      ['a','Because a criterion that needs judgement cannot be evaluated by anything except the person who wrote it, and that person is usually gone by the time it matters. If a step genuinely needs judgement, it should be a decision point in the plan rather than an acceptance criterion.'],
      ['a','Plan Critic came back with three gaps, and I agree with all three. The rollback gate had no owner, the write-amplification threshold was missing entirely, and the benchmark evidence had no named custodian.'],
      ['u','The write threshold is the one I care about. Where did 8% come from?'],
      ['a','From the incident notes rather than from me. The last write-path regression that caused a page was at 11% and the one before it at 9%; 8% is the largest number that has never caused an incident here. That is a weak basis and I would rather say so than present it as principled.'],
      ['e','agent-work',{ title:'Revision 4 created', detail:'Split the concurrent index into its own migration file after the migration audit.' }],
      ['u','Approve it but do not build yet.'],
      ['a','Approved and held. Approve-without-build is a real state rather than a deferral: the plan is immutable at revision 4, the build is queued, and nothing will start until you trigger it.'],
      ['e','goal-receipt',{ title:'Plan approved · build deferred', detail:'Revision 4 is immutable. Build can be triggered from the durable chat card at any time.' }],
      ['a','One thing I want on the record before the build. The plan does not cover behaviour under concurrent write load, and it does not cover whether the planner keeps choosing the index after a statistics refresh. Both are outside the acceptance criteria I just wrote, so approving the plan does not mean those are handled.'],
      ['u','Noted. Add them as follow-up todos rather than expanding the plan.'],
      ['a','Added as separate todos. Expanding an approved plan after approval is exactly the move that makes an approval meaningless.']
    ]) });

  thread({ id:'crew', title:'Crew Coordination', status:'working', updated:'5h', unread:5,
    model:'Claude Sonnet 4.6',
    summary:'Crew formation, role assignment, wait, block, timeout, recovery, and completion.',
    messages:turns('crew', { route:'sonnet', startMin:120, mode:'agent', persona:'Product Manager', contextStart:9400 }, [
      ['u','Form a crew for the concept repair work and give each member a real role.'],
      ['e','crew',{ title:'Crew formed', detail:'Planner, implementer, reviewer, and browser auditor.' }],
      ['a','Four roles, and the boundaries between them are the point. The planner never edits, the implementer never reviews its own work, the reviewer never edits, and the auditor only reads the rendered result.'],
      ['u','Before you go further — is this not just overhead for a small change? We are talking about a composite index and two batched queries. Four roles, four separate threads, four sets of context to keep in sync, and three of the four are the same model on the same account.\n\nI have watched this pattern turn a two-hour task into a day twice now, and both times the extra day produced review comments the implementer had already thought of and dismissed for good reasons. So make the case in terms of what specifically goes wrong without it, on this change, rather than in general.',{ long:true }],
      ['a','For a small change, yes. This is worth it here specifically because the failure mode we keep hitting is a fix that passes its own test — the implementer writing the assertion is how three invisible elements got signed off as working.'],
      ['e','agent-work',{ title:'Roles assigned', detail:'Planner · Opus 5 · Implementer · Sonnet 4.6 · Reviewer · Opus 5 · Auditor · Kimi K3.' }],
      ['a','Reviewer and planner are the same model on the same account but separate threads, so neither can see the other’s reasoning. That matters more than using two different models would.'],
      ['u','What happens when one of them stalls?'],
      ['a','The crew waits rather than reassigning. Reassigning a stalled role means two members holding the same responsibility, and then neither of them owns it.'],
      ['e','waiting',{ title:'Reviewer waiting', detail:'The implementer’s working tree is still changing. Reviewing a moving target produces review comments about code that no longer exists.' }],
      ['a','The reviewer is waiting for exactly that reason. It will start when two consecutive reads of the working tree are identical.'],
      ['u','And if the implementer never stops changing it?'],
      ['a','Then the reviewer times out and says so, rather than reviewing a snapshot and presenting it as a review of the current state. A timeout with a reason is a result; a review of stale code is worse than no review.'],
      ['e','artifact',{ artifactId:'crew-board' }],
      ['a','The board is one revision stale — the reviewer role was reassigned after it was written, and it is marked stale rather than silently regenerated, so you can see that a reassignment happened.'],
      ['u','Good. Let it run.']
    ]) });

  thread({ id:'artifact-error', title:'Artifact Recovery', status:'failed', updated:'6h', unread:1,
    model:'Kimi K3',
    summary:'Stale version, render failure, source fallback, and retry.',
    messages:turns('artifact-error', { route:'kimi', startMin:90, mode:'agent', persona:'Product Manager', contextStart:4800 }, [
      ['u','Render the usage projection dashboard.'],
      ['e','artifact',{ artifactId:'broken-viz' }],
      ['a','It failed to render, and the reason is worth reading rather than retrying blindly: the renderer received a series with zero points and refused to draw an empty chart.'],
      ['u','Why is refusing better than drawing an empty chart?'],
      ['a','Because an empty chart and a chart of zeroes look identical, and one of them means "no data" while the other means "the data is zero". Drawing it would turn a missing measurement into a confident claim.'],
      ['a','The source is intact — only the render failed — so the fallback to source is available and a retry re-reads the same source rather than regenerating it.'],
      ['u','Retry it.'],
      ['e','agent-work',{ title:'Retry attempted', detail:'Same source, same result: the projection query genuinely returns zero rows for this window.' }],
      ['a','Same result, which is now informative. The projection query really does return zero rows for this window, so this is a data problem rather than a renderer problem.'],
      ['a','The reason is the retention sweep: this window predates the current retention boundary, so the rows it would project from no longer exist. That is correct behaviour that looks like a bug.'],
      ['u','Can the error say that instead of talking about series length?'],
      ['a','It can, and it should. "No data in this window — rows older than the retention boundary have been swept" is a different message from "the renderer received an empty series", even though the second one is what the renderer literally saw.'],
      ['e','artifact',{ artifactId:'chart-latency' }],
      ['a','The second error in this thread is a different class: the route latency chart failed because two accounts expose the same model name and the previous renderer collapsed them into one series. That one is recoverable by retrying with account keys, and the retry label says so rather than just saying Retry.'],
      ['u','Retry that one and leave the projection alone.'],
      ['a','Retrying with account keys. Five series instead of three, one per configured route rather than one per model name.']
    ]) });

  /* Was `messages:[...plainConversation, …]` -- it shared every message
     id with the `plain` thread. Its own conversation now, own ids. */
  thread({ id:'new-message', title:'Scroll Anchor Test', status:'working', updated:'7h', unread:7,
    model:'Qwen 3.8',
    summary:'New messages arrive while the reader is away from the bottom.',
    messages:turns('new-message', { route:'qwen', startMin:60, mode:'agent', persona:'Product Manager', contextStart:5600 }, [
      ['u','I want to read back through this thread while work is still arriving. Do not move the page under me.'],
      ['a','Understood. The rule I am following: the transcript only auto-scrolls when you are already at the bottom. The moment you scroll up, the anchor detaches and new messages arrive below the fold with a counter instead.'],
      ['u','What counts as at the bottom? I hate the version of this that snaps back if you are two pixels off.'],
      ['a','A threshold rather than an exact position — within about 80 pixels of the end counts as at the bottom, which is roughly one line of text plus the padding. Exact equality fails constantly because of sub-pixel scroll positions and image reflow.'],
      ['e','working',{ title:'Continuing the benchmark run' }],
      ['a','Three messages have arrived since you scrolled up. The counter is showing rather than the page moving.'],
      ['u','Now expand a long message while I am up here.'],
      ['a','Expanding a collapsed message keeps the top edge of that message where it is, rather than keeping the scroll offset. Those produce different results: preserving the offset makes the text you are reading slide upward by the height of everything that just appeared above it.'],
      ['e','new-message',{ title:'3 new messages', detail:'Your reading position was preserved.' }],
      ['u','What about when an image finishes loading above me?'],
      ['a','Same principle, harder problem. Images need reserved height before they load, otherwise the reflow moves everything below them. Anything without intrinsic dimensions gets a placeholder box at its final size.'],
      ['a','The case this concept does not handle well is a streamed message that grows while you are reading something above it. The growth is below the fold so it does not move you, but the scrollbar thumb shrinks continuously, which is its own kind of distracting.'],
      ['u','Jump me to the bottom.'],
      ['a','Jumped, anchor reattached, counter cleared. From here new messages will scroll into view again until you move away.'],
      ['e','agent-work',{ title:'Benchmark run complete', detail:'6 benchmarks · 184s · results attached to the query thread.' }],
      ['u','Good. That is the behaviour I wanted.']
    ]) });

  thread({ id:'no-models', title:'Model Availability', status:'blocked', updated:'8h',
    model:'—',
    summary:'No eligible configured model, authentication, quota, and honest guidance.',
    messages:turns('no-models', { route:'sonnet', startMin:500, mode:'agent', persona:'Product Manager', contextStart:2100 }, [
      ['u','Run the theme sweep on the personal account.'],
      ['a','Trying the Personal Anthropic account. It is the only one with spare weekly budget.'],
      ['e','model-unavailable',{ title:'No available configured model', detail:'Five configured accounts need attention in Provider Settings.' }],
      ['u','Five? I thought it was two.'],
      ['a','Five, and each for a different reason, which is why one generic message was never going to be enough. Personal Anthropic is out of quota for this five-hour window, the Archive credential expired three days ago, the Alibaba Team account was added without a key, the z.ai Research session has lapsed, and cursor-agent is not on PATH on this execution host.'],
      ['a','Kimi K3 Turbo also has an update available, but that one is informational — the current build still routes normally, so I have not counted it.'],
      ['u','Which of those can I fix right now?'],
      ['a','Three of the five in under a minute: paste a key for the Alibaba Team account, sign in again for z.ai Research, re-authenticate the Archive credential. The quota one resets at 18:00 UTC on its own, and the missing CLI needs an install on the execution host rather than anything in this app.'],
      ['e','permission',{ title:'Re-authentication required', detail:'Opening Provider Settings for anthropic-archive. Credentials never leave the server.' }],
      ['u','What happens to queued work while all of this is broken?'],
      ['a','It stays queued rather than failing. Nothing is dropped and nothing is retried against an account that is known to be unusable, because a retry loop against an expired credential is how a rate limit turns into a lockout.'],
      ['a','The Work Anthropic account and the Alibaba Coding Plan account are both healthy, so this thread is the only one actually blocked — the others are still running.'],
      ['u','Then just use the work account.'],
      ['a','I can, but that account is at 64% of its five-hour window and a full theme sweep is 32 combinations. It would probably fit; it would also leave nothing for the rest of the afternoon. Your call rather than mine.'],
      ['u','Leave it. I will fix the personal account.'],
      ['a','Holding. Nothing is queued against the personal account, so fixing it will not trigger a backlog of retries the moment it comes back.']
    ]) });
