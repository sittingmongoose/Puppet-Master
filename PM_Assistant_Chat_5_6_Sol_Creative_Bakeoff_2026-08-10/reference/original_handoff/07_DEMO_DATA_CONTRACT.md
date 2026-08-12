# Shared Demo Data and Fake Interaction Contract

## 1. Purpose

The original PMConcept7 chat demo contains too little sustained user and assistant back-and-forth to evaluate conversation readability. The new concepts need enough history, variation, and active state to reveal whether they work as actual chat experiences rather than isolated component samples.

All eight window concepts and all eight thread concepts from one agent may use the same dataset.

A complete starter dataset is supplied in:

- `machine/demoData.json`

It contains:

- 15 threads.
- 400 stored user and assistant messages.
- 22 prewritten prototype responses.
- Goals.
- Todos.
- Subagent groups.
- Diffs.
- Questionnaires.
- Artifacts.
- Browser sessions.
- Activity history.
- Thought-stream examples.
- Draft and revision-history state.
- One substantial long-history thread.

The agent may extend the dataset, but it must not reduce the required coverage or replace it with shorter one-turn samples.

## 2. Thread-volume requirement

Every thread contains sustained back-and-forth. No thread should exist only as a single user message and one assistant response.

The dataset includes:

- Ordinary project conversation.
- Product planning.
- Usage and context discussion.
- Planning Wizard handoff.
- Provider and model routing.
- Browser research.
- Test investigation.
- Theme review.
- Draft recovery.
- Search over old decisions.
- Pull-request review.
- Active Goal work.
- Queued questionnaires.
- Generated artifacts.
- Blocked security work.
- A less technical weekend-project conversation.

This variety is intended to test the interface, not direct its visual design.

## 3. Message content

The conversation data should feel like realistic sustained interaction:

- Users correct earlier assumptions.
- Users change scope.
- Users ask follow-up questions.
- Assistants explain current understanding.
- Work can pause, block, resume, complete, or wait for input.
- Long messages appear on both sides.
- Some messages contain exact search targets near the end of content that is collapsed by default.
- Some conversations are ordinary and do not contain Goal, subagent, diff, or questionnaire state.

The demo should not read like a schema dump or a wall of internal implementation terminology.

## 4. Long-history behavior

At least one thread must have substantially more stored messages than are initially rendered.

The supplied `Finding an old decision` thread contains a large stored history and initially exposes only its newest window.

Required behavior:

- The message list may render only the latest `initialVisibleMessageCount` messages.
- Search indexes the complete stored message list.
- Selecting an older result loads the needed range.
- The exact target becomes visible and receives a temporary highlight.
- Returning to the prior location restores the prior anchor.
- Cross-thread search can select a result from this thread even when it is not active.

## 5. Long-message behavior

The supplied data contains long user and assistant messages that are eligible for visual collapse.

The concept must prove that:

- The collapsed preview remains useful.
- The message can expand and collapse.
- The scroll anchor remains stable.
- Copy returns the full message.
- Search can find a phrase located inside hidden content.
- Context Lens acts on the complete message.

Exact test phrases include:

- `retention window nine days`
- `blue lantern checkpoint`
- `canonical source history`

These phrases exist to make hidden-content search testable.

## 6. Fake sending behavior

The concepts allow the evaluator to type and send arbitrary text.

The fake interaction does not call a model and does not attempt to understand the text.

Required sequence:

1. The typed user message is appended exactly as entered.
2. Its timestamp and runtime hover row become available.
3. The thread enters a working state.
4. The live current-action summary advances through the next prewritten sequence.
5. The next response from the thread's `scriptedReplyIds` is appended.
6. The cursor advances and later sends use the next prewritten response, cycling if necessary.

If Stop is used before completion:

- The working sequence ends.
- A stopped result is recorded.
- Accumulated Worked for remains available.
- The prewritten completed response is not inserted for that attempt.

If the user starts typing during work:

- The composer button changes from Stop to Send.
- Sending the text appends another user message rather than stopping the run.

The concepts do not need to produce a semantically relevant response to the evaluator's text.

## 7. Draft recovery behavior

The dataset includes a thread-scoped draft with attachments and several saved revisions.

The prototype should support a simulated restart or reload that restores:

- Current draft text.
- Attachment references.
- Useful earlier revisions.
- The active thread.
- Other persistent chat state.

The question-draft state remains separate.

## 8. Questionnaire data

The dataset contains:

- An active questionnaire.
- A second queued questionnaire in the same thread.
- A completed questionnaire represented in history.
- Selected answers.
- A freeform draft.
- Required and optional questions.

The active state demonstrates oldest-first ordering and persistence.

The concepts should implement the fixed Submit, Skip, and Cancel semantics from `01_FIXED_REQUIREMENTS.md`.

## 9. Goal and dynamic work data

The dataset contains examples of:

- Goal only.
- Goal plus Todo.
- Goal plus Todo, subagents, and diffs.
- Paused Goal.
- Running Goal.
- Blocked Goal with exact reason.
- Goal replan after edit.
- No Goal.

The underlying records remain distinct even when a concept combines their presentation.

## 10. Subagent data

The dataset contains:

- Active agents.
- Completed agents.
- Blocked agents.
- Waiting for parent.
- Aggregate counts.
- Task labels.
- One-line current activity.
- Worked durations.

The data is sufficient to demonstrate inline collapsed and expanded states and a route to full details.

## 11. Activity and thought data

The dataset contains:

- A complete staged activity record based on the functional categories observed in the activity video.
- A compact final summary.
- Expandable historical stages.
- Active and completed permitted thought segments.
- A current-thought setting example.

No demo field claims access to hidden model chain-of-thought.

## 12. Artifact and browser data

Artifacts retain:

- Title.
- Kind.
- Project path.
- Editor-tab target.

Browser sessions retain:

- Title.
- Status.
- Current page description.
- Pages visited.
- Screenshot count.
- Editor-tab target.

The concepts should use these records as shortcuts and state references, not duplicate editor or browser implementations inside the transcript.

## 13. Search coverage

The data contains terms that repeat across threads and unique terms that identify one message.

The search demo must prove:

- Current-thread filtering.
- All-thread grouping by thread.
- Exact-message focus.
- Search in unloaded history.
- Search in collapsed long messages.
- Search in Context Lens-shaped history without removing the shaping state.

## 14. Thread-history variety

The 15 threads include different combinations of:

- Pinned and unpinned.
- Idle, running, paused, blocked, and awaiting-question state.
- Goal summary.
- Question indicator.
- Long history.
- Artifacts.
- Browser work.
- Draft state.

The concepts may derive thread-history summaries from this data.

## 15. Display-text policy

The data uses camel-case keys internally, but internal keys are not user-facing prose.

Visible labels must:

- Use ordinary words and spaces.
- Avoid internal underscored enums.
- Contain no emoji.
- Use an underscore only when displaying a literal file name that contains one.
