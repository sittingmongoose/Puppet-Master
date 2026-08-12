# Fixed Product Behavior

This file consolidates the original Assistant Chat redesign contract. Exact source detail remains in `machine/original_requirements.json` and `reference/original_handoff/`.

## 1. Concept system and shell

Each agent produces eight window concepts and eight thread concepts. Window and thread are independently selectable, creating 64 valid pairings in one interactive comparison workspace.

The workspace:

- is a prototype gallery, not Puppet Master's Home;
- shows interactive concepts rather than static thumbnails;
- applies the selected Puppet Master theme to the host and concept;
- exposes a continuous 520–1200 px Chat-width control and 520/750/975/1200 presets;
- exposes reduced motion;
- supports docked and pop-out inspection;
- uses a quiet simplified current Puppet Master shell with the left Activity Bar and its adjacent side-panel slot.

Chat width is independent of the Activity Bar/side-panel width.

Docked and pop-out are mutually exclusive views of the same state. Preserve active thread, scroll anchor, draft, attachments, search, Context Lens, questions, Goal/work expansions, selectors, history, artifacts, and long-message state.

All scrollable surfaces use the Puppet Master custom scrollbar. Popup menus use the established Model/Mode selector family: click activation, shared chrome, corner-origin animation, nested submenus, in-place resize, collision handling, one transient overlay, and reduced-motion final state.

## 2. Themes and visual language

Support:

```text
Friendly Dark / Light
Retro Dark / Light
Basic Dark / Light
Glass Dark / Light
```

No emoji. Interface symbols are SVG. Display text is human-readable. Internal underscore enums do not appear as prose. Do not use colored left-edge accent bars for selection or status. Cards are allowed.

## 3. Message structure and metadata

The message action row is a sibling immediately below the message body, not another nested bubble.

Assistant row:

```text
Copy · Provider · Model · Working for/Worked for · More Info
```

User row:

```text
Copy · Edit when eligible · Provider · Model · Working for/Worked for · More Info
```

No Resend. No message-level Stop. Stop belongs to the composer.

More Info may show sent/start/first-response/terminal times, worked duration, total elapsed, mode, provider, account/connection when useful, model, effort, Persona, tokens, context, cost or plan usage, turn/run identity, and terminal reason.

Store UTC; render user locale. Worked time excludes explicit pause and waiting for user answers. Total elapsed may include waiting.

## 4. Long messages

Completed long user or assistant prose can collapse visually.

- Preview remains meaningful but bounded.
- User controls expansion.
- Streaming output does not repeatedly collapse.
- Manual expansion persists across mount changes.
- Scroll anchor remains stable.
- Copy, search, and Context Lens operate on full canonical content.
- Search inside hidden text reveals the matching region.
- Message prose and execution history expand independently.

## 5. Composer, sending, draft, and fake response

Composer button behavior:

```text
Agent active + empty draft -> Stop
Agent active + user types -> Send
Draft cleared while active -> Stop
Agent terminal -> Send
```

Sending during active work steers or queues; it is never misread as Stop.

Each thread has a durable independent draft with text, attachments, composer state, and a bounded deduplicated revision history. Demonstrate thread switching, crash/restart restoration, restore an earlier revision, explicit clear, send/archive, and separate questionnaire drafts.

The prototype supports fake sending: append exact user text, run a scripted working sequence, add the next prewritten response, allow Stop, and never pretend to semantically answer arbitrary text.

## 6. Search

One search bar with two scopes:

```text
Current Thread — default
All Threads
```

Search covers complete stored history, including unloaded/virtualized content. Results use the standard popup family. Current-thread results load the needed slice and highlight the exact message. All-thread results group by thread, switch thread when selected, restore that thread's view state, and jump exactly.

Search state persists across dock/pop-out.

## 7. Context Lens and Context Ring

Context Lens supports:

```text
Mute
Focus
Subcompact
Turn Off
Multi-message selection
```

Mute and Focus apply immediately. Subcompact requires Apply. One Apply may cover up to 25 messages; multiple operations may accumulate. Preserve state across mounts.

Human search always uses canonical stored history. Agent retrieval uses effective shaping: muted excluded, focused prioritized, subcompacted regions represented by summary plus rehydration handles. Search does not silently change Lens state.

Context Ring remains present. Its detailed internals belong to the Usage/context owner; Chat must not create a conflicting second system. Use the shared compact context projection with visibly distinct composition segments, `Compact Now`, and `More Details`. Avoid redundant labels such as provider-reported or generic High/Medium states. More Details may open Context Lens/context details, but never a raw giant prompt dump.

## 8. Goal Mode

When no Goal exists, do not reserve empty Goal chrome. When active, Goal remains discoverable and supports:

```text
View · Expand/collapse · Edit · Pause · Resume · Stop · Clear
Tasks · Subgoals · Evidence · Logs
Running · Paused · Stopped · Blocked · Complete
```

Blocked state exposes cause, affected scope, attempted recovery, why autonomy stopped, and next safe action. Material edits create visible impact analysis/replan rather than silently replacing the objective.

Goal is a projection of shared durable Goal Runtime, not a local Chat-only lifecycle.

## 9. Dynamic work surfaces

Goal, Todo, subagents, diffs, activity, questions, and artifacts are separate state owners even when a concept combines their presentation.

Any subset can appear. Do not permanently reserve space for all of them. Question flows may temporarily take priority without discarding underlying state.

Todo uses normalized task state, including pending, running, verifying, complete, blocked, failed, skipped, cancelled, stale, and replanned where relevant.

## 10. Activity and thoughts

During work, show a concise continuously updated description and worked timer. Update in place rather than appending one permanent card per small step. Reflect subagent work when useful.

After completion, condense the sequence into inspectable history. Preserve complete stage details.

Thought/reasoning streams are collapsed by default. A setting may keep the currently permitted provider-exposed reasoning stream or reasoning summary open while active; it collapses when that segment ends. Never claim hidden chain-of-thought access.

## 11. Subagents

Subagent activity appears in the parent transcript while active and remains in historical position.

Collapsed state summarizes active, complete, blocked, or waiting counts. Expanded state shows human-readable task, one-line current/final activity, status, and elapsed time. Full detail can expand inline or open a dedicated detail surface.

Child agents do not question the user directly. They wait for parent; the parent creates the main-thread questionnaire, returns the answer, and resumes/replans the child.

## 12. Questionnaires

Questionnaires are queued per thread, oldest unresolved first, one visible at a time. The normal composer is unavailable while a questionnaire is active.

Persist across thread change, pause, app close, crash/restart, long delay, and mount change. No passive expiration.

- Skip affects only the current question and can be reversed before submission.
- Cancel ends the entire current questionnaire and leaves a historical cancelled record.
- Submit includes answers and explicit skips; required unanswered questions block completion.
- Completed/cancelled questions remain inline and may condense.
- The next queued questionnaire appears only after the current one resolves.

## 13. Artifacts and browser previews

The conversation retains an artifact shortcut. Opening an artifact does not remove it from the thread and does not depend on the source message remaining rendered.

Artifacts are Project-backed and can be opened/revealed in the editor/file system. Related artifacts may group. Browser previews route to the PM editor/browser workspace rather than becoming a second browser inside Chat.

The later left-side artifact requirement in `03_CUMULATIVE_THREAD_DECISIONS.md` determines the visible host relationship.

## 14. Thread history and long threads

Support thread create/select/search/pin/rename/archive/delete/export/branch/restore where current canon permits.

For very long threads:

- older stored content may stay unloaded;
- search indexes it;
- exact jumps load the required range;
- expanding content preserves the scroll anchor;
- streaming does not force the user to bottom after they scroll up;
- Jump to latest remains available.

## 15. Demo depth

Use at least 15 credible threads with sustained back-and-forth, several long messages, one large virtualized history, ordinary conversation, planning, active work, questions, Goals, Todos, subagents, diffs, artifacts, browser work, search, Context Lens, blocked/paused/completed states, and draft recovery.

The supplied original dataset contains 15 threads and 400 messages and remains the baseline fixture.
