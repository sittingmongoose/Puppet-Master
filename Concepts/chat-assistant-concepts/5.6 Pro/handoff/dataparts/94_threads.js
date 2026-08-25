
  /* Archived threads. They are archived, not empty: the packets require
     an archived thread to stay fully searchable, restorable and forkable,
     and a one-line stub proves none of that. Each carries a real
     conversation, and archived-3 hides one of the three contract search
     phrases inside a collapsed message. */
  thread({ id:'archived-1', title:'Archived Accessibility Audit', status:'complete', archived:true, updated:'3d',
    model:'Claude Sonnet 4.6',
    summary:'Archived historical audit.',
    messages:turns('archived-1', { route:'sonnet', startMin:-4320, mode:'ask', persona:'Product Manager', contextStart:5200 }, [
      ['u','Audit the assistant surface for keyboard and screen-reader access.'],
      ['a','Working through it control by control rather than page by page, because the failures here are per-control.'],
      ['a','First problem, and it is the largest: status is carried by colour alone in three places. A coloured left-edge bar marks selection, a coloured dot marks agent state, and a coloured chip marks permission. None of the three has a text or shape equivalent.'],
      ['u','Is a coloured bar not fine if the colour is also in a tooltip?'],
      ['a','A tooltip needs hover, which excludes keyboard and touch. The rule I would hold to is that any status must survive a greyscale screenshot; if it does not, it needs an icon, a word, or a shape as well.'],
      ['e','agent-work',{ title:'Swept 41 interactive controls', detail:'12 unreachable by keyboard · 7 with no accessible name · 3 colour-only status.' }],
      ['a','Twelve controls are unreachable by keyboard. Eleven of those are the same bug: a div with a click handler and no tabindex or role. The twelfth is the orbit ring, which has pointer-events:none on the parent so even the mouse cannot reach it.'],
      ['u','Seven with no accessible name — which ones?'],
      ['a','All seven are icon-only buttons with a title attribute and no aria-label. A title is announced inconsistently across screen readers and never on mobile, so it is not a substitute.'],
      ['a','The focus order is mostly correct, with one exception: the overlay menu appends to a portal at the end of the document, so tabbing out of a menu lands at the end of the page rather than back at the trigger.'],
      ['u','Rank these by how much they cost a real user.'],
      ['a','Keyboard unreachability first — it makes twelve features simply unavailable. Then the accessible names, because an unnamed button is announced as "button" and the user has to guess. Colour-only status third: it is a real failure but the information is usually recoverable from context. Focus return last; it is irritating rather than blocking.'],
      ['a','This audit is being archived rather than closed. Nothing here is fixed yet, and archiving a thread does not resolve its findings — it only means the conversation is finished.']
    ]) });

  thread({ id:'archived-2', title:'Archived Provider Research', status:'complete', archived:true, updated:'5d',
    model:'Qwen 3.8',
    summary:'Archived provider comparison.',
    messages:turns('archived-2', { route:'qwen', startMin:-7200, mode:'ask', persona:'Product Manager', contextStart:4400 }, [
      ['u','Compare the configured providers on cost, context, and latency.'],
      ['a','Comparing only what is configured — there is no value in benchmarking a provider nobody has an account for.'],
      ['a','Cost per million output tokens: GLM 5.2 at 1.9, Qwen 3.8 at 2.2, Kimi K3 at 2.5, Claude Sonnet 4.6 at 15, Claude Opus 5 at 75. Cursor Auto bills against a seat rather than per token, so it has no comparable number.'],
      ['u','Put Cursor at zero then.'],
      ['a','No — zero and unknown are different, and rendering unknown as zero is how a comparison becomes a lie. It should read "not reported" and be visibly absent from the bar rather than drawn at the axis.'],
      ['a','Context windows: Qwen 3.8 at 262K, Kimi K3 at 200K, Claude Opus 5 at 196K, Claude Sonnet 4.6 and GLM 5.2 at 131K and 128K, Cursor Auto at 120K.'],
      ['e','agent-work',{ title:'Measured first-token latency', detail:'20 samples per route, same prompt, same time of day.' }],
      ['a','First-token latency, median of twenty: Kimi K3 265 ms, Alibaba 280 ms, Anthropic Work 410 ms, Anthropic Personal 520 ms.'],
      ['u','Why are the two Anthropic accounts different? Same provider, same model.'],
      ['a','Different plan tiers. The Work account is on Team and the Personal one on Pro, and the queue priority differs. That is exactly why a comparison keyed on the model name would be wrong: these are two routes with measurably different behaviour and identical model names.'],
      ['a','The conclusion I would draw: route bulk refactoring to Qwen or Kimi on cost, keep Sonnet for implementation, and reserve Opus for review and planning where the cost difference is small relative to the value of catching a bad plan.'],
      ['u','And Cursor Auto?'],
      ['a','Genuinely useful for inline edits inside the editor and not useful here, because it does not expose the tool surface this assistant needs. That is a capability difference rather than a quality one.'],
      ['a','Archiving this. The route decision it fed into is recorded in the provider route thread, so the reasoning stays findable even though this conversation is closed.']
    ]) });

  thread({ id:'archived-3', title:'Archived Usage Prototype', status:'complete', archived:true, updated:'8d',
    model:'Kimi K3',
    summary:'Archived usage concept.',
    messages:turns('archived-3', { route:'kimi', startMin:-11520, mode:'ask', persona:'Product Manager', contextStart:4800 }, [
      ['u','Prototype the usage surface. I want to know what I have spent without opening a billing page.'],
      ['a','Three questions a usage surface has to answer: how much of the current window is used, how much of the plan period is used, and what is going to run out first. Most usage dashboards answer the first and ignore the other two.'],
      ['a','The ring came out of this prototype. A ring reads as a proportion at a glance and a number reads as a fact, so the ring carries the percentage and the number carries the tokens.'],
      ['u','What about the plan limits rather than the context window? Those are different things.'],
      ['a','Completely different, and conflating them is the most common mistake here. The context window is per thread and resets when you start a new one. The plan limits are per account and reset on a schedule you do not control.'],
      ['e','agent-work',{ title:'Drafted the plan-limits block', detail:'Product, connection, per-meter percentage, reset time, and a "More limits" expander.' }],
      ['a','The plan-limits block shows the product, the connection, and one row per meter with its percentage and reset time. Anything beyond three meters goes behind a "More limits" expander, because six meters at equal weight reads as a wall.'],
      ['u','How do I know which one runs out first?'],
      ['a','That is the forecast, and it is the piece most usage surfaces are missing. It projects the current growth rate forward and names the first meter to be exhausted, with a date.\n\nThe honesty rule that makes the forecast worth having is that budget exhaustion is not completion. A goal that runs out of tokens has not achieved anything; it has stopped. Showing a progress bar that fills to 100% on exhaustion actively misleads, so exhaustion is a separate state with separate copy.\n\nThere is one retention detail that belongs here rather than in the billing page: usage events are kept on a retention window nine days long, so the forecast can look back nine days and no further. Asking it for a monthly trend produces a confident-looking line drawn from a third of a month, which is worse than refusing.',{ long:true }],
      ['u','Nine days is short. Why not keep more?'],
      ['a','Cost, mostly, and the fact that nobody has asked a question that needed more. It is worth revisiting if anyone wants month-over-month, but that is a decision to make deliberately rather than by accumulating data in case.'],
      ['e','agent-work',{ title:'Cache-hit row added', detail:'Cache hit sits on the action row rather than in the metric grid: it is context for the compact decision, not a headline number.' }],
      ['a','Last piece: cache hit rate sits on the action row next to Compact Now rather than in the metric grid, because it is the number that tells you whether compacting is worth it.'],
      ['u','Good. Archive it and carry the ring into the main concept.'],
      ['a','Archived. The finalized Context Ring came from this prototype and the plan-limits block did too; the forecast has not been carried across yet.']
    ]) });

  thread({ id:'archived-4', title:'Archived Onboarding Notes', status:'idle', archived:true, updated:'12d',
    model:'GLM 5.2',
    summary:'Archived onboarding notes.',
    messages:turns('archived-4', { route:'glm', startMin:-17280, mode:'ask', persona:'Product Manager', contextStart:3600 }, [
      ['u','Write onboarding notes for someone joining this project next week.'],
      ['a','Writing them as things that will confuse you rather than as a feature tour, because the feature tour is already in the README and nobody reads it twice.'],
      ['a','First: the standalone HTML is generated. Editing it directly works right up until the next build silently deletes your change, which is what the --check flag exists to catch.'],
      ['u','That has already happened to two people.'],
      ['a','Then it goes first. Second: the repository is on a network share, so line endings are a live hazard. Both deliverables are CRLF on disk and in git, and a tool that writes LF turns one real change into a five-thousand-line phantom diff.'],
      ['a','Third: the audit suite is not trustworthy on its own. It reported 434 of 434 passing while twelve reported defects were live, because three of its six metrics measured selectors the renderer never emits and were structurally incapable of being non-zero.'],
      ['u','That is the one that worries me most. How does someone avoid trusting it?'],
      ['a','By checking that a metric can fail. If you cannot make an assertion go red on purpose, it is not an assertion. That single habit would have caught all three.'],
      ['e','agent-work',{ title:'Drafted the onboarding checklist', detail:'8 items, each phrased as a failure someone actually hit.' }],
      ['a','Fourth: geometry is not evidence. getBoundingClientRect reports a box for elements that are clipped, occluded, or mid-transition, so a passing visibility check proves nothing. Hit-test the centre and sample the pixels.'],
      ['u','Anything about the codebase itself?'],
      ['a','Two idioms. Rendering is one keyed reconciler over template strings with no inline handlers, so a new control is a data-action attribute plus a branch in the delegated listener. And any node that must survive the two-second work tick needs a stable data-k, or it remounts and replays its entrance animation every tick.'],
      ['a','Last one: animation-fill-mode both beats a declared value, and reduced motion here only stops named loops. A new looping animation that is not added to the stop list runs forever under prefers-reduced-motion, which is the opposite of what the setting asks for.'],
      ['u','Good list. Archive it and I will hand it over on Monday.'],
      ['a','Archived and retained for exact-message search, so a phrase from these notes still finds this thread months from now.']
    ]) });

  thread({ id:'archived-5', title:'Archived Browser API', status:'complete', archived:true, updated:'18d',
    model:'Claude Opus 5',
    summary:'Archived browser API review.',
    messages:turns('archived-5', { route:'opus', startMin:-25920, mode:'ask', persona:'Systems Analyst', contextStart:6200 }, [
      ['u','Should the browser program wrap Playwright or expose a native API?'],
      ['a','Native, and the deciding argument is not performance. A Playwright facade makes the agent think in Playwright terms, which means it writes selectors and waits rather than describing intent.'],
      ['u','But Playwright already solves the waiting problem.'],
      ['a','It solves it for a test author who knows what they are waiting for. An agent does not, and the failure mode is a thirty-second timeout on a selector that was never going to appear because the agent misread the page.'],
      ['a','A native API can answer "what is on this page" as a first-class question. Playwright can only answer "is this selector present", and those produce very different agent behaviour.'],
      ['e','agent-work',{ title:'Prototyped both', detail:'Same six tasks through a Playwright facade and a native describe/act API.' }],
      ['a','Six tasks through both. The facade completed four and timed out on two. The native API completed six, and both of the tasks the facade failed were cases where the page changed shape rather than content.'],
      ['u','What does the native API cost us?'],
      ['a','A lot of surface. Playwright is battle-tested against browser quirks that we would have to rediscover, and the honest version of this recommendation includes that we will spend months on things Playwright already handles.'],
      ['a','The mitigation is to keep Playwright underneath as the transport and expose the native API above it, rather than choosing between them. That is what I would actually build.'],
      ['u','That was not one of the two options.'],
      ['a','No, and I should have offered it in the first message rather than framing it as a binary. The binary came from the question, and I let it stand instead of questioning it.'],
      ['e','agent-work',{ title:'Recommendation revised', detail:'Native API surface over a Playwright transport, rather than either alone.' }],
      ['a','Archiving. The native Browser Program API replaced the Playwright facade idea, and the transport decision went the way described above.']
    ]) });

  thread({ id:'archived-6', title:'Archived Settings Bakeoff', status:'complete', archived:true, updated:'24d',
    model:'Claude Sonnet 4.6',
    summary:'Archived settings concepts.',
    messages:turns('archived-6', { route:'sonnet', startMin:-34560, mode:'ask', persona:'Product Manager', contextStart:5800 }, [
      ['u','Four settings concepts, one winner. What is the criterion?'],
      ['a','Findability under load. All four look fine with twenty settings; the real inventory is eight hundred and eight, and three of the four collapse at that scale.'],
      ['a','Concept one is a flat list with search. It scales technically and fails in practice, because search only helps if you already know the word the setting uses.'],
      ['u','That is the one everyone likes in the mockup.'],
      ['a','Mockups have twenty settings. That is the whole problem with judging this from a mockup, and it is why I loaded all eight hundred and eight into each of them before comparing.'],
      ['e','agent-work',{ title:'Loaded the full inventory into all four', detail:'808 settings · same data · same viewport.' }],
      ['a','Concept two groups by feature area and keeps a persistent tree. It survives the inventory but the tree is nine levels deep in places, and a nine-level tree is a filing cabinet rather than a settings page.'],
      ['a','Concept three is task-oriented: it asks what you are trying to change and routes you there. It is the best of the four for someone who knows what they want and the worst for someone browsing.'],
      ['u','And four?'],
      ['a','Four is the one that won. Grouped like two, searchable like one, with a recently-changed section and a diff against defaults. The diff is the part the others were all missing — most settings questions are really "what did I change" rather than "what can I change".'],
      ['u','Was that criterion obvious from the start?'],
      ['a','No, and I want to be honest that it emerged from loading the real inventory rather than from reasoning. If we had judged from the mockups, concept one would have won and we would have found out at eight hundred settings.'],
      ['a','Archiving. The winner carried forward, and this thread can still be restored, forked, renamed, or searched by any phrase in it.']
    ]) });
