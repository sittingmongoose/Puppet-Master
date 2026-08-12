# Fixed Requirements and Open Design Space

## 1. Scope

The work covers the Assistant Chat experience represented in and around the current PMConcept7 chat implementation:

- The docked chat window.
- The actual conversation transcript where user and assistant messages appear.
- Thread-history and thread-management areas related to the chat.
- The pop-out chat form.
- Composer and attachment behavior.
- Message controls and runtime metadata.
- Search, Context Lens, Context Ring entry points, Persona, Model, Mode, reasoning effort, and Worktree behavior.
- Goal Mode, Todo, subagents, diffs, activity, thought streams, questions, artifacts, and browser handoffs.
- Narrow-width and very-long-thread behavior.

The current PMConcept7 implementation is evidence of existing behavior and problems. It is not a visual template that must be retained.

## 2. Primary design problem

The largest problem is chat-thread readability.

The current demo is difficult to parse because:

- The useful message column is narrow after surrounding chrome and the thread-history rail consume width.
- Only a small portion of the conversation is visible at once.
- Conversational prose, execution telemetry, nested cards, Todo state, subagents, diffs, artifacts, and metadata often compete at similar visual weight.
- There are many boxes inside other boxes.
- Wrapping magnifies every nested surface at narrow width.
- The current demo contains too little sustained user and assistant back-and-forth to judge whether the transcript works over time.

The concepts must prioritize the ability to follow the human conversation at the minimum width while preserving full access to secondary detail.

No prescribed visual solution follows from this statement.

## 3. Concept quantity and interchangeability

Each agent creates:

- Eight distinct chat-window concepts.
- Eight distinct chat-thread concepts.

The window and thread are separate selectable modules in the comparison workspace. Any one of the eight thread concepts can be placed inside any one of the eight window concepts made by the same agent.

This produces 64 possible pairings per agent. They do not need 64 manually designed combined concepts. They need an interoperable composition system.

Thread concepts do not need to interchange across different agents' workspaces.

## 4. Concept comparison workspace

The comparison workspace is inspired by the behavior of `Concepts/rail-concepts/`.

It must:

- Show all concepts in a comparison-oriented index or dashboard.
- Keep previews interactive rather than presenting only static thumbnails.
- Apply the selected theme to the comparison workspace itself and to every hosted concept.
- Identify the originating model at the workspace level and inside every concept using the exact assigned label.
- Allow the selected window concept and selected thread concept to be changed independently.
- Provide a continuous chat-width slider.
- Provide four reproducible chat-width presets.
- Provide a reduced-motion toggle.
- Support docked and pop-out inspection.

The comparison workspace is not Puppet Master's actual Home page.

## 5. Fake Puppet Master shell

Every concept must be viewable inside a basic fake Puppet Master shell that includes:

- A basic dashboard or background page.
- A left application rail that can open and close.

The fake dashboard and application rail may be shared across all eight concepts from the same agent. They exist to expose realistic spacing pressure and are not additional design assignments.

The application rail width is independent of the Assistant Chat width.

## 6. Themes

All concepts must transform correctly across these eight themes:

- Friendly Dark
- Friendly Light
- Retro Dark
- Retro Light
- Basic Light
- Basic Dark
- Glass Dark
- Glass Light

Motion behavior does not need a different personality for each theme. The same motion contract may operate across all eight themes while theme tokens change visual presentation.

## 7. Widths

The Assistant Chat test range uses the current PMConcept7 resize limits:

- Minimum: 520 px
- Normal: 750 px
- Wider: 975 px
- Wide: 1200 px

The comparison workspace must also provide continuous movement between 520 and 1200 px.

These values apply to the Assistant Chat, not the left application rail.

Most real use will be closer to the narrow side of the range. A concept is not successful if it only becomes understandable at Wide.

## 8. Docked and pop-out forms

The docked and pop-out forms use the same underlying thread and view state.

Only one form exists at a time. The user does not keep a docked and floating instance open simultaneously.

Switching form must preserve:

- Active thread.
- Scroll anchor.
- Composer draft and attachments.
- Search query, scope, selected result, and focused target.
- Context Lens mode, applied shaping, and active selection.
- Questionnaire queue, current question, answers, skipped state, and freeform draft.
- Goal state and expansion state.
- Todo, subagent, diff, and activity state.
- Persona, Model, Mode, effort, and Worktree selection.
- Thread-history state.
- Long-message expansion state.

Geometry changes. Semantic state does not.

## 9. Scrollbars

Every scrollable surface in these concepts uses the Puppet Master scrollbar treatment from the Settings page.

Do not use unstyled operating-system scrollbars.

This applies to the transcript, thread history, popup results, menus, expanded details, and any other scrollable prototype surface.

## 10. Popup and submenu system

Popup menus use the established Model and Mode selector family rather than operating-system menus.

The required behavior includes:

- Click activation rather than hover activation.
- Corner-origin opening.
- Existing Puppet Master popup chrome.
- Animated opening and closing.
- In-place resizing when option count or submenu content changes.
- Submenus.
- Mutual exclusion so only one transient overlay is active.
- Reduced-motion final-state behavior.
- Viewport-aware placement.

Model and Persona lists remain searchable. Reasoning effort is reached through Model rather than presented as a fourth peer selector.

## 11. Selector and header functions

The following functions are required:

- Persona.
- Model.
- Mode.
- Reasoning effort through Model.
- Worktree where applicable.
- Search.
- Context Lens.
- Context Ring entry point.
- More/options behavior needed by the concept's thread and window functions.

The Context Ring dropdown and Context Detail destination are being redesigned by a separate Usage-page effort. These concepts preserve their required entry points and surrounding interaction but do not establish an incompatible replacement for the owned internals.

## 12. Message hover row

Use the structural relationship demonstrated in the `Tastebook — planning chat` thread in PMConcept7: the hover row is immediately below the message as a sibling of the message body rather than another nested container inside the bubble.

### Assistant message row

The compact row contains, in this order:

- Copy
- Provider
- Model
- Working for, while active, or Worked for, once terminal
- More Info

The word `Agent` is not required in this row.

### User message row

The compact row contains:

- Copy
- Edit, only when that message is eligible
- Provider
- Model
- Working for, while the launched turn is active, or Worked for, once terminal
- More Info

Provider, Model, and duration describe the effective turn launched by that user message.

Edit is the only control whose presence is conditional. When the message cannot be edited safely, the control is absent rather than disabled.

Resend is removed. Editing and submitting the revised message replaces that workflow.

Copy may remain hover-only. This intentionally supersedes the older Plan rule that Copy could not depend on hover discovery.

### More Info

More Info adds exact time information to the useful runtime information already demonstrated in PMConcept7. It may contain:

- Message timestamp.
- Execution start.
- Completion, stop, failure, or cancellation time when terminal.
- Worked for.
- Total elapsed when different.
- Mode.
- Provider.
- Model.
- Effort.
- Persona.
- Tokens.
- Context use.
- Estimated cost or plan usage when available.
- Turn or run identity when useful.

The compact row shows duration. Exact clock timestamps belong in More Info.

## 13. Timestamp and duration meaning

Every message and execution unit stores UTC timestamps and renders them in the user's locale.

A turn may retain:

- Message sent time.
- Execution start time.
- First visible response time.
- Terminal time.
- Worked duration.
- Total wall-clock elapsed duration.

Worked duration measures active execution and includes model work, tools, tests, browser activity, and subagent work. It does not count explicit pause time or time blocked waiting for a user questionnaire.

Total elapsed may include waiting time. More Info can show it when it differs from Worked for.

The same terminology applies consistently to Assistant turns, Goals, subagents, activity stages, diffs, artifacts, and questionnaires.

## 14. Long-message collapsing

Long human-readable message blocks from either the user or assistant become eligible for visual collapsing after completion.

Requirements:

- The collapsed preview remains substantial enough to understand the message's subject and direction.
- The preview has a firm upper limit so one message cannot occupy most of a narrow viewport.
- The exact cutoff, preview length, placement, appearance, and transition are design decisions.
- A hover control on the eligible message expands and collapses it.
- An actively streaming assistant response does not repeatedly collapse as it grows.
- Manual expansion state remains stable while the user reads and survives docked/pop-out changes.
- Expanding or collapsing preserves the scroll anchor.
- Copy returns the complete message.
- Search indexes the complete message.
- A search hit inside hidden text reveals the matching portion.
- Context Lens operates on the complete canonical message.
- Message metadata and More Info remain independent of prose expansion.
- Collapsing prose does not implicitly collapse or expand the associated execution history, and vice versa.

## 15. Composer, Send, Stop, spellcheck, and draft recovery

### Send and Stop

- Active agent and empty composer: Stop.
- Active agent and user begins typing: Send.
- User clears the draft while the agent remains active: Stop.
- Agent is no longer active: Send.

Pressing Send while an agent is working must not be interpreted as Stop. It sends the new user text through the active-run steering or queue behavior represented by the prototype.

Stop is not duplicated under individual messages.

### Spellcheck

The text-entry area enables platform spellcheck while retaining the custom Puppet Master visual treatment.

### Draft persistence

Each thread has an independent durable draft containing text, attachment references, and relevant composer state.

The prototype must demonstrate:

- Saving across thread switches.
- Restoration after simulated restart or crash.
- A bounded, deduplicated revision history with useful recovery points.
- No requirement to save every keystroke as a separate revision.
- Sending archives the submitted text in the conversation and clears the active draft.
- Explicitly clearing a draft is distinct from sending.
- Questionnaire drafts remain separate from ordinary composer drafts.

The appearance and placement of draft-history recovery are design decisions.

## 16. Fake message sending

The interactive concepts allow the evaluator to type and send messages.

Prototype behavior:

1. Append the user's text exactly as entered.
2. Show the relevant timestamp and hover metadata.
3. Play a prewritten working-state sequence.
4. Insert the next prewritten response assigned to that thread.
5. Do not interpret or semantically answer the user's text.
6. Allow Stop to interrupt the prewritten sequence.
7. Allow typing during the working state and demonstrate the Send/Stop button transition.

The supplied `machine/demoData.json` contains a response bank for this behavior.

## 17. Search

There is one Assistant Chat search bar.

Its result popup uses the standard popup family and contains two scope controls at the top:

- Current Thread, selected by default.
- All Threads.

### Current Thread

- Searches the complete stored thread, including older unloaded content.
- Selecting a result loads the required message slice.
- Jumps to the exact message.
- Temporarily highlights the target.

### All Threads

- Searches complete stored history across threads.
- Groups results by thread.
- Selecting a current-thread result jumps within the current thread.
- Selecting another thread's result switches threads and jumps to the exact message.

Search state survives a docked/pop-out change.

## 18. Search and Context Lens

Human-facing search operates on canonical stored conversation history regardless of Context Lens shaping.

Therefore:

- Muted messages remain findable by the user.
- Focused messages remain findable normally.
- Subcompacted source messages remain findable.
- Results may disclose Muted, Focused, or Subcompacted state.
- Selecting a result does not silently change Context Lens state.
- A result inside a Subcompact source range resolves to canonical source history.
- The summary and its source messages are not presented as unrelated duplicate results.
- Cross-thread search restores the target thread's own Context Lens state.

Agent-side chat-history retrieval respects effective Context Lens shaping:

- Muted content is excluded.
- Focused content is prioritized.
- Subcompacted regions return the local summary with rehydration handles.

There is no second Context Lens-specific search bar.

## 19. Context Lens

Context Lens is required and supports:

- Mute.
- Focus.
- Subcompact.
- Turn Off.
- Multi-message selection.

Mute and Focus apply immediately as selection changes. Subcompact requires an explicit Apply action. Turn Off exits the selection mode.

A single Apply operation supports up to 25 messages. This is not a total thread-wide limit; multiple operations may accumulate.

Selection presentation, range behavior, conflict presentation, and narrow-width interaction are design decisions for the concept agents.

The prototype should preserve Context Lens state while switching between docked and pop-out form.

## 20. Goal Mode

When no Goal is active, Goal UI does not consume unnecessary space.

When a Goal is active, its presence and state remain discoverable. The user must be able to:

- View the Goal.
- Expand and collapse it.
- Edit it.
- Pause it.
- Resume it.
- Stop it.
- Clear it as an operation distinct from Stop.
- Show tasks.
- Show subgoals.
- Show evidence and logs.

Visible states include:

- Running.
- Stopped.
- Paused.
- Blocked.
- Complete.

Blocked state carries the exact blocker when available, including cause, affected scope, attempted recovery, why autonomous recovery stopped, and next safe action.

A material edit does not silently replace the objective. It pauses or gates scheduling, performs impact analysis, updates tasks, produces visible replan feedback, and then resumes according to Goal Runtime behavior.

Goal UI is an additive projection of Goal Runtime and does not redefine Goal lifecycle policy.

## 21. Goal, Todo, subagents, diffs, and activity

These are separate underlying state and command surfaces.

Any subset may be present:

- None.
- One surface.
- Several surfaces.
- All surfaces.

They appear only when relevant or active. A thread does not permanently reserve space for every possible surface.

Concepts may keep them visually separate or combine only the currently relevant parts into a shared presentation. Different concepts should explore genuinely different relationships. The packet does not prefer one arrangement.

When an active questionnaire needs visual priority, these surfaces may temporarily yield space or hide. Their underlying state continues and must reappear without loss after the questionnaire resolves.

## 22. Todo

The Todo surface is collapsible and is backed by normalized task state rather than decorative checklist text.

It may be shown alone or alongside Goal, subagent, diff, or activity information depending on the active state and the concept's independent design.

The demo includes pending, running, verifying, complete, blocked, failed, skipped, cancelled, stale, and replanned examples where relevant.

## 23. Live activity and compact history

While an agent is working, the transcript includes a short, continuously updated description of what it is currently doing.

It should:

- Update in place.
- Include a worked timer.
- Avoid appending a permanent message or full card for every tiny execution step.
- Reflect subagent work when relevant.

After completion, the execution sequence condenses into an inspectable historical representation. The complete stage history remains available.

The designers determine the visual model and motion outside the already locked popup behavior.

## 24. Thought streams

Thought streams are collapsed by default.

A setting allows the currently active permitted thought stream to remain expanded while that segment is active. When the segment completes, it automatically collapses.

Completed historical thought segments remain manually expandable.

Only provider-exposed reasoning streams or permitted reasoning summaries are represented. The prototype must not claim access to hidden model chain-of-thought.

## 25. Subagents

Subagent activity is visible in the parent transcript while work is active and remains in historical position afterward.

Collapsed state:

- Shows aggregate working and completion information.
- May also disclose blocked or waiting counts where relevant.

Expanded state:

- Shows each subagent's human-readable task.
- Shows a one-line current activity or final activity.
- Shows status.
- Shows elapsed work time where available.

Full child details remain inspectable. A concept may expand them inline or open a dedicated editor-tab detail surface. A group detail surface may cover all children in that group rather than creating one tab per child.

Child agents do not ask the user directly. When a child needs input:

1. It enters Waiting for parent.
2. It sends the need and origin to the parent.
3. The parent creates the questionnaire in the main thread.
4. The question is not duplicated in the child card.
5. The parent passes the answer back and resumes or replans the child.

User-facing labels use ordinary words and spaces, such as Waiting for parent. Internal underscored enum labels do not appear as display prose.

## 26. Questionnaire queue and lifecycle

Questionnaires are queued per thread.

- The oldest unresolved questionnaire in the active thread displays first.
- Only one questionnaire displays at a time.
- A questionnaire in another thread remains attached to that other thread.
- After the current questionnaire is submitted or cancelled, the next oldest becomes active.

The ordinary message composer is unavailable while the questionnaire is active.

Unresolved state persists across:

- Thread switching.
- Pausing the thread.
- Closing Puppet Master.
- Simulated crash.
- Restart.
- Docked/pop-out changes.
- Long periods of time.

There is no passive expiration.

### Skip

Skip applies only to the current question.

- The question is recorded as skipped.
- The questionnaire advances.
- The user may navigate back and answer it before submission.
- Answering replaces the skipped state.
- A submitted questionnaire may contain intentionally skipped optional questions.

### Cancel

Cancel applies to the entire current questionnaire instance.

- Remaining questions in that questionnaire are cancelled.
- Draft answers are not submitted as completed answers.
- The parent receives a cancelled result.
- A historical record remains.
- The next queued questionnaire in that thread may then become active.
- Other threads are unaffected.

### Submit

Submit completes the questionnaire with answered questions and explicit skips. Required unanswered questions prevent completion and must be identifiable.

### Transcript history

Completed or cancelled questions and answers remain inline in the transcript and may collapse into a compact historical representation. Their origin and details remain inspectable.

Presentation, transitions, and whether destructive Cancel receives confirmation are design decisions.

## 27. Artifacts and browser previews

An artifact representation remains in the conversation as a shortcut.

Opening it:

- Does not remove it from the thread.
- Does not require a special active/open visual state on the message.
- Opens the artifact in an editor tab.
- Leaves the artifact available through its project path in the file explorer.
- Continues to work if the source message is outside the rendered viewport.

Related artifacts from one response may be grouped. The grouping treatment is a design decision.

Browser previews also open in editor tabs.

The chat concept owns the source interaction and routing. It does not redesign the editor, browser, or file explorer internals.

## 28. Thread history and very long threads

The thread-history area must support the existing thread-management functions discovered in the Plans and current concept, including creation, selection, search, pinning, rename, archive, delete, export, branching, and restoration where applicable.

The visual organization is open to redesign.

The active transcript must work with very long histories:

- Older stored content can remain unloaded from the visible list.
- Search still indexes it.
- Exact-message jumps load the needed range.
- Expanding cards or messages preserves the scroll anchor.
- Streaming updates do not force the user to the bottom after the user scrolls upward.
- Jump-to-latest remains available when needed.

The shared demo contains one substantial long-history thread and more than the 15-thread minimum.

## 29. Demo-data volume

The concepts use one shared dataset across all eight window and thread concepts.

Minimum requirements:

- At least 15 threads.
- Sustained user and assistant back-and-forth in every thread.
- No thread that exists only as one user message and one assistant response.
- Several long messages.
- At least one large stored thread whose older messages are not initially rendered.
- A variety of ordinary conversation, planning, active work, questions, Goals, Todos, subagents, diffs, artifacts, browser work, search, Context Lens, blocked state, paused state, completed state, and draft recovery.
- Content grounded in Puppet Master concepts and realistic project conversations rather than only dense internal implementation terminology.

The supplied dataset contains 15 threads and 400 messages.

## 30. Text and icon policy

- No emoji characters are allowed anywhere in the interface or demo prose.
- Interface symbols use SVG.
- Do not use colored left-side accent borders as a selection, status, or active-state treatment.
- All display text is human readable.
- Do not expose underscored internal status names in prose.
- An underscore is acceptable when it is literally part of a file name being shown.

## 31. Motion

Motion and animation are a major evaluation criterion.

Requirements:

- Motion should communicate state and relationship rather than obscure them.
- All motion-bearing interactions have a reduced-motion alternative.
- Reduced motion must reach the same complete state without leaving partial transitions.
- Motion must be visually checked for clipping, layout shifts, stacking errors, and readability at all required widths and themes.
- The popup family retains its existing motion contract.

No other motion choreography is prescribed by this packet.

## 32. Accessibility scope

For this concept exercise, reduced motion is the required accessibility focus.

The production Plans continue to contain keyboard, focus, and screen-reader obligations. The prototypes do not retire those obligations, but the agent should not allow exhaustive accessibility work to displace the stated concept goals.

## 33. Under-specification discovery

While building, the agent must identify and record:

- Missing behavior.
- Missing states and transitions.
- Conflicts between Plans and PMConcept7.
- Controls present in concepts but absent from Plans.
- Planned behavior with no concept representation.
- Undefined long-thread, search, Context Lens, Goal, Todo, subagent, diff, activity, question, artifact, draft, or mount behavior.
- Missing command IDs.
- Missing schema fields.
- Missing wiring.
- DRY Method impacts.
- Dependencies on the parallel Usage redesign.

The concept agent records these issues in a separate gap report. It does not repair Plans, commands, schemas, wiring, or DRY Method contracts.

## 34. Open design decisions

The following are deliberately left to each design agent:

- Visual language.
- Layout and spatial arrangement.
- Thread-history composition.
- Message visual treatment.
- Long-message preview length and cutoff.
- Activity-history presentation.
- Goal, Todo, subagent, diff, and activity grouping.
- Questionnaire presentation and transition.
- Context Lens selection treatment.
- Full subagent detail inline versus editor tab.
- Artifact grouping.
- Motion choreography outside locked menu behavior.
- How surfaces yield space at minimum width.
- How each concept differs from the other seven.

Research observations are not recommendations. The agent is expected to create original, non-generic concepts without copying the videos or external projects.
