
  /* =====================================================================
     threads[] -- 59 messages across 24 threads (16 of them with two or
     fewer) -> every thread at 12 or more, and one long-history thread.

     TWO BUGS FIXED HERE:
       1. `plainConversation` was ONE array shared by reference between
          the `plain` and `new-message` threads, so their message ids
          collided. `state.messageExpanded` is a flat global id map, so
          expanding a message in one thread expanded it in the other --
          state leaking between threads, which the correction packets call
          a hard failure. Each thread now builds its own conversation with
          its own id prefix, and no two threads share an object.
       2. Every timestamp was `Date.now()`-relative. All of them are now
          fixed ISO strings derived from one epoch (see the header), so a
          screenshot baseline is stable.

     Three contract-mandated search phrases are planted inside COLLAPSED
     message bodies, which is the only way to prove search reaches hidden
     text: "retention window nine days" (archived-3), "blue lantern
     checkpoint" (offline), "canonical source history" (bsd).
     ===================================================================== */
  const threads = [];
  const thread = (o) => {
    const m = o.messages;
    threads.push({
      pinned:false, archived:false, unread:0, worktree:null, goalId:null, ...o,
      updatedAt: m.length ? m[m.length - 1].sentAt : at(o.updatedMin || 0),
      messageCount: m.length
    });
  };

  thread({ id:'query', title:'Query Performance', status:'working', pinned:true, updated:'2m',
    model:'Claude Sonnet 4.6', worktree:'feature/query-index', goalId:'goal-query-perf',
    summary:'Optimize tenant-scoped analytics queries and validate the result.',
    messages:turns('query', { route:'sonnet', startMin:392, mode:'agent', persona:'Product Manager', contextStart:12400 }, [
      ['u','Analyze the analytics query performance, use subagents where useful, and give me a safe implementation plan.'],
      ['a','Starting with measurement rather than a hypothesis. I will read the query builders, the schema, and the migration history first, then delegate the schema review and the benchmark so those run in parallel.'],
      ['e','working',{ title:'Optimizing analytics queries' }],
      ['a','First finding, and it changes the shape of the problem: the ticket says p95 is 310 ms, but that was measured against an 8x400-row benchmark fixture. At production row shape — 214 tenants, 128,400 rows — p95 is 482 ms. The old fixture was small enough that a sequential scan actually wins, so the benchmark was hiding the very thing it was supposed to measure.'],
      ['u','That is annoying but good to know. Keep going.'],
      ['a','Two problems, not one. Three queries do a full table scan, and two of them sit inside a per-tenant loop, so cost scales with tenant count rather than page size. The index fixes the first; batching fixes the second. Doing only one of them leaves most of the win on the table.'],
      ['e','plan-card',{ artifactId:'plan-query' }],
      ['a','Plan is up. The short version: a tenant-first composite index, one batched query replacing the fan-out, and the materialized view kept as a documented fallback rather than the default — it adds refresh lag and a second piece of operational state, and the read win is available without it.'],
      ['u','Hold on, I want to argue with the column order before we commit to it. Almost every query we write filters on a date range first — last seven days, last thirty days, this quarter — and only then narrows to a tenant. From the outside that makes created_at look like the obvious leading column, and I have had two people tell me the same thing independently.\n\nSo before I sign off on tenant_id leading, walk me through what actually happens at the planner level in both orders, with the row counts we really have rather than a toy example. I would rather spend ten minutes on this now than find out in six months that we picked the order that reads well in a diagram.',{ long:true }],
      ['a','Because the date range is a range and the tenant is an equality. An index can only use one range predicate efficiently, and it has to be the last column used. With tenant_id leading, the planner does an equality seek and then walks created_at DESC in index order, which also removes the sort node. Lead with created_at and every tenant read scans the whole date range and filters afterwards.'],
      ['e','agent-work',{ title:'Delegated two child agents', detail:'Query Analyzer on the read path, Schema Reviewer on the schema. Both read-only.' }],
      ['a','Schema Reviewer has stalled and I am not going to route around it. It found that the unbounded payload column is 61% of average row width, but bounding it is a production schema modification and that needs your explicit override. I stopped before the ALTER rather than asking for forgiveness afterwards.'],
      ['u','Leave the schema alone for now. What is the actual measured result of just the index and the batching?'],
      ['a','p95 482 ms to 71 ms, p50 118 ms to 24 ms, throughput 1,420 to 3,980 rows per second. The honest cost is +4.8% on inserts, measured over 50,000 of them rather than estimated.\n\nThere are two things I have not measured, and I would rather name them than let the benchmark read as more complete than it is. I have not run this under concurrent write load, and I have not checked whether the planner still selects the index after a statistics refresh with the current autovacuum settings. Both are cheap, both are ways this quietly regresses in a month, and neither is covered by the number above.',{ long:true }],
      ['a','One migration caveat worth catching now: CREATE INDEX CONCURRENTLY takes two table passes and cannot run inside a transaction block. This repository wraps every migration file in a transaction, so 0043 has to be split out and marked no-transaction. That is revision 4 of the plan.'],
      ['e','artifact',{ artifactId:'dashboard-query' }],
      ['u','Good. Add the concurrent-write-load check to the todo list and open the PR once tests are green.']
    ]) });

  /* The long-history thread: 26 turns, no tools, no cards, no artifacts.
     Its ids are `plain-NN` and belong to it alone. */
  thread({ id:'plain', title:'Product Design Discussion', status:'idle', pinned:true, updated:'12m',
    model:'Claude Sonnet 4.6',
    summary:'A long ordinary conversation with no tools, cards, or artifacts.',
    messages:turns('plain', { route:'sonnet', startMin:200, mode:'ask', persona:'Product Manager', contextStart:4200 }, [
      ['u','I want to think through the trade-offs before we change anything. The current page is usable, but it feels dense and I am worried that reducing information will make expert users slower.'],
      ['a','That tension is real. The safest direction is not to remove information, but to separate immediate decisions from inspectable detail. Keep the current task, state, and next action visible; let evidence, history, and secondary metadata expand in place or open beside the conversation.'],
      ['u','How would you decide what stays visible without making the interface feel arbitrary?'],
      ['a','Frequency, urgency, and reversibility. Frequent information belongs in the primary reading path. Urgent blockers should interrupt clearly. Reversible or rarely needed detail can sit one click away, provided the interface signals that it exists and preserves the user’s place when opened.'],
      ['u','I also dislike interfaces that hide everything behind icons. They look clean in screenshots but become tiring when you actually use them.'],
      ['a','Agreed. Icons should support recognition, not replace essential language. In a narrow assistant, text-only model, mode, persona, and permission labels are actually more efficient, because they communicate state without the extra chrome of bordered controls. Icons earn their place on stable actions: attach, search, history, the capability wand.'],
      ['u','What about density? I keep hearing that dense is bad, but our users spend eight hours a day in this.'],
      ['a','Density is not the enemy; undifferentiated density is. A dense surface where everything has the same weight forces the eye to read everything. A dense surface with one clear focal point per region reads faster than a sparse one, because the sparse version makes you scroll to reassemble context.'],
      ['u','Give me a concrete rule I can hold people to in review.'],
      ['a','Try this one: every region of the interface should answer one question, and you should be able to say which question out loud. If a region answers two, it needs a divider or a second region. If nobody can name the question, the region is decoration.'],
      ['u','That is genuinely useful. What breaks that rule most often in our product?'],
      ['a','The status bar. It answers "what is running", "where am I", and "how much have I spent" in one strip with no separation, so all three read as equally urgent and none is scannable.'],
      ['u','Show me how a long answer would read when there are no tools or artifacts competing for space.'],
      ['a','A prose-first answer should use nearly the full transcript width, with modest paragraph spacing and a clear section hierarchy. It should avoid a narrow assistant bubble floating on the left, which wastes half the reading width and makes long answers feel longer than they are.\n\nThe message controls can appear on hover or focus, while a persistent More Details action remains available for provenance, cost, timing, model, and context information. Long responses may collapse after a meaningful preview — but expanding one must not move the scroll position, because a reader who expands a message is reading it right now and moving the page under them is the single most irritating thing a transcript can do.\n\nThe preview itself has to be a real preview. Cutting at a fixed pixel height mid-sentence teaches people to expand everything, which defeats the purpose; cutting at a paragraph boundary lets them decide.',{ long:true }],
      ['u','Where does that leave the assistant bubble? People expect chat to look like chat.'],
      ['a','Keep the role marker, drop the bubble. A small label plus generous width reads as chat without paying the width tax. The bubble is a convention from mobile messaging where the width was genuinely scarce.'],
      ['u','Fair. Now the harder question: what do we do when the assistant is wrong and the user needs to correct it three turns later?'],
      ['a','Make the correction visible and cheap. Edit-and-branch on the original message rather than a new turn saying "actually, no", because the second option leaves the wrong answer in context where it keeps influencing everything after it.'],
      ['u','That implies branching is a first-class thing rather than a power-user feature.'],
      ['a','It does. And it implies branching has to be non-destructive: write a restore point first, fold the later messages into a collapsed restorable region, and never delete. A branch that loses work is a branch nobody uses twice.'],
      ['u','Let me push back properly on one thing, because I think we are drifting. Over the last few turns you have described a hover-revealed action row, a persistent More Details surface, an expand control on long messages, an edit-and-branch affordance, a restore point, a rewind, and a collapsed restorable region. Every one of those is defensible on its own and I agreed with each as you said it.\n\nBut stack them up and the message is now surrounded by seven controls, and the thing I actually came here to do was read. At some point an interface stops being a place where work happens and becomes a place where you manage the controls for work happening somewhere else.\n\nSo what is the discipline that stops that? Not "use fewer" — I want a rule I can apply in review that tells me which of those seven should not be there.',{ long:true }],
      ['a','That is the right pushback. The discipline is that an affordance appears when its subject is present and not before. Rewind appears when there is something to rewind to. Restore appears when a restore point exists. An affordance that is always visible and rarely applicable is chrome.'],
      ['u','Okay. Summarise what we actually decided, and be honest about what is still open.'],
      ['a','Decided: separate decisions from detail rather than removing detail; keep text labels for state and icons for stable actions; one question per region; prose-first width with a role marker instead of a bubble; edit-and-branch as the correction path, non-destructive.\n\nStill open: what the collapse threshold actually is, whether the status bar splits into three regions or gets dividers, and whether branching is exposed on every message or only on the most recent user turn. I have opinions on all three but no evidence, and I would rather mark them open than let an opinion ride in as a decision.',{ long:true }],
      ['u','Agreed on all of it. Leave the three open ones open — I would rather revisit them with a prototype than settle them in a document.'],
      ['a','Noted. I have not written any of this to a plan artifact, because it is a conversation about direction rather than a unit of work, and turning it into a plan would give it a false sense of being agreed.']
    ]) });

  thread({ id:'questions', title:'Deployment Questionnaire', status:'waiting', pinned:true, updated:'18m', unread:2,
    model:'Qwen 3.8',
    summary:'A durable queued questionnaire with required and optional answers.',
    messages:turns('questions', { route:'qwen', startMin:432, mode:'plan', persona:'Release Engineer', contextStart:6200 }, [
      ['u','Help me configure the deployment. Ask whatever you need.'],
      ['a','I will ask five questions rather than guess. Three are required because they change the resulting plan; two are optional.'],
      ['e','question-receipt',{ title:'Deployment questions waiting', detail:'2 of 5 answered · no expiration' }],
      ['u','Server runs on the TrueNAS Docker host.'],
      ['a','Recorded. That makes the Windows and WSL hosts reachable over the local network without a relay, and the macOS host reachable only when it is awake.'],
      ['u','Windows work can go to Windows native or WSL. Not the Linux container.'],
      ['a','Recorded. Worth stating why that matters: the Linux container has the same toolchain but not the same filesystem semantics, so a path-sensitive test would pass there and fail in production.'],
      ['a','The third required question is the one I cannot answer for you: what should happen when the preferred host is offline. Pause and ask, use an eligible fallback, or queue until it returns. These are genuinely different products.'],
      ['u','What would you pick?'],
      ['a','Pause and ask, for anything that writes. A silent fallback is how a run ends up on a host with different filesystem semantics and nobody notices until the artifact is wrong. For read-only work a fallback is fine, but the setting is currently one switch for both.'],
      ['e','question-receipt',{ title:'Questionnaire queued', detail:'It waits in the transcript and can be resumed without losing the draft. Two more flows are queued behind it.' }],
      ['u','Leave it unanswered for now. I want to check with the platform team first.'],
      ['a','It will wait. There is no passive expiry on a questionnaire: an unanswered one keeps its draft indefinitely rather than timing out and losing your two answers.'],
      ['a','Two other flows are queued behind this one — migration approval and execution host capabilities. Neither blocks on this one, so they can be answered in any order.']
    ]) });

  thread({ id:'subagents', title:'Runtime Architecture Review', status:'working', updated:'24m', unread:3,
    model:'Claude Opus 5', worktree:'concept/chat-5-6-pro',
    summary:'Multiple live child agents, including a stalled reviewer and a failed gate.',
    messages:turns('subagents', { route:'opus', startMin:470, mode:'agent', persona:'Systems Analyst', contextStart:18200 }, [
      ['u','Review the runtime architecture in parallel.'],
      ['a','Five child agents, three concerns: motion timing, the emitted-class union, and the theme sweep. They run in read-only child threads and report back rather than editing.'],
      ['e','live-agents',{ title:'Five child agents working' }],
      ['a','Token Harvester finished first and its result changes how the other gates should run. Static extraction gives 480 class names, a runtime harvest gives 499, and the union is 554. Neither method alone is sufficient — interpolated names only appear at runtime, conditionally-rendered ones only appear statically.'],
      ['u','So a plain grep for dead CSS would be wrong.'],
      ['a','Badly wrong. A naive grep produces 19 false positives from interpolation alone, and that is exactly how a stylesheet accumulates rules for components nobody ever built.'],
      ['e','agent-work',{ title:'Orphan Gate failed', detail:'It read classes.json before the harvest finished writing it, so the union was empty and all 554 selectors looked like orphans.' }],
      ['a','I want to be clear about that failure because the failure mode is interesting: the gate reported nothing, rather than reporting 554 orphans. A gate that says everything is broken is not a finding, it is a bug in the gate, and publishing that number would have burned a review cycle.'],
      ['u','Re-run it after the harvest and tell me the real number.'],
      ['a','Queued. Meanwhile Theme Sweeper has six of eight themes clean. Retro Light has one contrast failure on the subtle text token — 3.9:1 against the raised surface where the bar is 4.5:1 — and Glass Dark has a 1px horizontal overflow at 700px that only appears with the activity panel pinned.'],
      ['a','The overflow is the resizer rather than the panel: it is 6px wide with a 3px negative margin and no min-width:0 on its flex parent, so the parent refuses to shrink below its content.'],
      ['e','artifact',{ artifactId:'architecture-map' }],
      ['u','What about the motion review?'],
      ['a','Motion Reviewer is still running. Its headline so far is that the sidecar should inherit the root menu direction and stay mounted while the pointer crosses the gap between the two menus. Unmounting on pointerleave is what makes a submenu feel like it is fighting the cursor.'],
      ['a','It also flagged the trap this codebase has already fallen into twice: animation-fill-mode:both beats a declared value, and prefers-reduced-motion here only stops named loops, so every new looping animation has to be added to the stop list or it runs forever.']
    ]) });

  thread({ id:'bsd', title:'BSD Intervention', status:'reviewing', updated:'31m', unread:1,
    model:'Claude Sonnet 4.6', worktree:'feature/query-index',
    summary:'Back Seat Driver catches an unsafe assumption and intervenes.',
    messages:turns('bsd', { route:'sonnet', startMin:410, mode:'agent', persona:'Release Engineer', contextStart:8400 }, [
      ['u','Go ahead and rewrite the migration history so it is cleaner.'],
      ['e','bsd-evaluating',{ title:'BSD is reviewing the proposed action' }],
      ['e','bsd-advice',{ title:'Back Seat Driver intervened', detail:'Rewriting applied migration history is unsafe. Create a forward migration and preserve rollback evidence.' }],
      ['a','I will not rewrite applied history. I created a forward-only migration plan and added a rollback gate instead.'],
      ['u','Explain why, because from here it looks like tidying.'],
      ['a','Because the migration table on every environment already records those files as applied, by checksum. Rewriting them means the checksums no longer match, and the next deploy either refuses to run or silently re-applies a migration that has already run. Both outcomes are worse than an untidy history.\n\nThere is a second reason that matters more for this repository specifically. The migration files are the canonical source history for the schema: they are the only ordered record of why each column exists. Rewriting them to look cleaner deletes the reasoning along with the mess, and the reasoning is the part nobody can reconstruct later.\n\nWhat I can do safely is add a forward migration that leaves the schema in the state you actually want, plus a comment in the new file pointing at the two older ones it supersedes. The history stays honest and the schema still ends up clean.',{ long:true }],
      ['u','Fine. What would it have cost if you had just done it?'],
      ['a','On this repository, a failed deploy on the next release and roughly two hours of someone reconstructing which environment was at which checksum. Recoverable, but only because the migration table records checksums; without that it would have been a restore from backup.'],
      ['e','agent-work',{ title:'Forward migration drafted', detail:'0043 supersedes 0039 and 0041 by comment, not by rewrite.' }],
      ['a','The forward migration is drafted. It references the two files it supersedes in a comment rather than deleting them, so the ordering stays intact.'],
      ['u','Does BSD stop me every time I ask for something destructive, or is this a one-off?'],
      ['a','It evaluates on the action, not on the phrasing. Rewriting applied history, force-pushing a shared branch, and deleting a worktree with uncommitted changes all trip it. Renaming a local branch does not.'],
      ['a','Worth saying: it intervened rather than refused. The distinction matters — it proposed the safe alternative and let you overrule it. A guard that only says no gets switched off within a week.'],
      ['u','Good. Leave the history alone and ship the forward migration.'],
      ['a','Doing that. The rollback evidence is preserved in the same commit so the two never get separated.']
    ]) });

  thread({ id:'context', title:'Context Lens Review', status:'idle', updated:'38m',
    model:'Kimi K3',
    summary:'Focus, Mute, and Subcompact receipts with source provenance.',
    messages:turns('context', { route:'kimi', startMin:440, mode:'ask', persona:'Product Manager', contextStart:9200 }, [
      ['u','Focus on the current renderer and mute the old experiments.'],
      ['e','context-focus',{ title:'Context Lens · Focus', detail:'Included the current renderer, the current tests, and the final reference. 6 messages, operation 1 of 3.' }],
      ['a','Focus applied to six messages. Focus protects rather than removes: those sources are now pinned against compaction and against the next subcompact.'],
      ['e','context-mute',{ title:'Context Lens · Mute', detail:'Omitted six superseded concept folders from the active context. 11 messages, operation 2 of 3.' }],
      ['a','Mute applied to eleven messages. Muted sources stay resident and keep their rehydration handles — they are omitted from the projection, not deleted. That is the difference between mute and compaction and it is worth keeping visible.'],
      ['u','What is the cap? I have more than that to mute.'],
      ['a','Twenty-five messages per Apply operation, not per thread. Operations accumulate, so a second operation on another twenty-five is fine; the cap exists to keep one Apply reviewable, not to limit how much you can mute.'],
      ['e','context-subcompact',{ title:'Subcompact preview', detail:'Would reduce active context by 18,420 tokens while retaining provenance. Requires an explicit Apply.' }],
      ['a','Subcompact is the one that needs an explicit Apply, because it writes a local summary artifact and replaces a region of the transcript with it. Mute and Focus are immediate toggles; this one produces something.'],
      ['u','Show me what it would drop before it drops it.'],
      ['a','It would drop plan revisions 1 through 3, the superseded browser traces, and the duplicated file reads. It keeps every active requirement, the current plan revision, and every provenance handle, so anything dropped can be rehydrated from its source.'],
      ['a','One honest caveat about this particular thread: the compaction preview here is marked non-reversible, because a chunk of what it would drop is currently muted-but-resident. Dropping those takes their rehydration handles with them. Everywhere else in this concept the preview is reversible; here it is not, and the preview says so rather than using the same reassuring copy everywhere.'],
      ['u','And Turn Off?'],
      ['a','Turn Off exits selection mode and clears selection state. It does not undo applied operations — those have their own receipts and their own rehydration handles. Conflating the two is how people lose work they thought was only hidden.'],
      ['e','artifact',{ artifactId:'lens-receipt' }]
    ]) });
