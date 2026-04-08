## 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop
- **Steer mode vs Queue mode:** The user can send messages in **Steer mode** or **Queue mode** (configurable in chat or settings), similar to [Codex's Steer feature](https://github.com/openai/codex/pull/10690):
  - **Steer mode (steer enabled):** **Enter** submits the message **immediately**, even when a task is running (the new message is sent right away and can steer or interrupt the flow). **Tab** (or a dedicated "Queue" action) **queues** the message when a task is running, so the user can build up a queue of follow-up messages.
  - **Queue mode (steer disabled):** **Enter** **queues** the message when a task is running (preserves "queue while a task is running" behavior). When no task is running, Enter submits as usual.
  So the user chooses whether Enter means "submit now" (Steer) or "queue when busy" (Queue). Tab (or equivalent) is used to queue when in Steer mode. **"Task is running"** means there is an active agent run in **this thread** (queue/steer behavior is per-thread).
- **Interrupt vs. Stop (distinct):**
  - **Interrupt** means sending a new message into the flow (steer): the new message is delivered to the agent and can change or redirect the current run. **Interrupt is not stop.**
  - **Stop** means cancelling the current agent run without sending any message. The run ends; queued messages remain. The user can then send a new message or process the queue. Implementation must not treat Stop as steer.
- **Chat footer layout (bottom of chat, top to bottom):** The bottom of the chat has a fixed order, similar to Cursor:
  1. **Pending queued messages** -- Just **above** the text entry (composer). Up to **two** messages (FIFO). Each queued message shows the text and three actions: **Edit** (change before send), **Send now (steer)** (send immediately), **Cancel** (remove from queue). When more than one message is queued, show an **ordered list** (first queued at top).
  2. **Text entry (composer)** -- The main input for typing and sending messages.
  3. **Active subagent count** -- Just **below** the text entry: show the **number of active subagents** in this thread (e.g. "2 active subagents" or "0 active subagents"). Keeps the user aware of how many agents are currently working in the thread.
  4. **Files touched + diff count** -- Just **below** the active subagent count: list **files that have been touched** in this thread, with a **diff count** per file (e.g. `src/main.rs` (+12 −3), `docs/readme.md` (+2 −0)). Gives a quick audit of what changed in the thread without opening the diff view.
- **Queued messages (max 2, FIFO):** When a message is **queued** (e.g. via Tab in Steer mode, or Enter in Queue mode while a task is running), it appears in the **pending queued messages** area above the composer. Each queued message has:
  - **Edit** -- the user can change the text before it is sent (e.g. icon or button).
  - **Send now (steer)** -- send that message immediately (steer). Once sent, it is no longer shown as queued.
  - **Cancel** -- remove that message from the queue (do not send).
  If the queue is full (2 messages), the UI must prevent adding another until one is sent or removed (or show a clear "queue full" state).
- **Keyboard shortcuts:** Chat actions (Send, New thread, Stop, focus composer, queue edit/cancel controls, etc.) must be reachable via **keyboard shortcuts** and/or the **command palette**. See Plans/newfeatures.md §11.
- **Stop the agent:** The user must be able to **stop** the agent at any time (e.g. a "Stop" button or shortcut). Stop **cancels** the current run and does **not** send any message. Stopping does not remove queued messages; the next queued message can be processed after stop, or the user can edit/remove queued messages individually.
- **Error and failure UX:** When the CLI fails, times out, or returns an error, the thread must show a **clear error state**: the error message (or a user-friendly summary) and, where applicable, **Resend** and **Cancel** (or Dismiss) actions. `Resend` replays the latest eligible user message using the canonical history-aware resend path; Cancel dismisses the error and leaves the queue unchanged. Failed runs do not consume a queued message unless the user explicitly resends; the queue remains so the user can edit, send now, or cancel queued items individually. If the failure was due to a platform or network issue, the UI can suggest switching platform or model (see §12 rate limit hit).

### 4.0A Composer Behavior

The composer follows one stable control model across idle, streaming, interrupted, and scrolled-away states.

Required rules:
- the primary composer action is **Send** while no assistant generation is active in the thread
- once the assistant is generating, the same primary action morphs in place from **Send** to **Stop** instead of introducing a second competing control elsewhere in the footer
- when generation completes, fails, or is cancelled, the primary action returns to **Send** for the next user turn
- the currently streaming assistant message also exposes a per-message **Stop** icon; selecting it halts generation for that specific in-flight message/run and preserves already-rendered partial output in history
- when the user is scrolled above the newest content, the thread shows a **Jump to bottom** control with an unseen-count badge; the badge increments as new messages/cards arrive below the viewport
- activating **Jump to bottom** scrolls to the latest visible boundary, clears the unseen-count badge for content now in view, and restores normal auto-follow behavior
- assistant messages expose an always-visible **Copy** icon in message chrome so copying the latest assistant output does not require hover discovery
- user messages are not deletable from thread history; the corrective path is limited to **Edit** plus submit/resend under the canonical history-aware replay rules

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 4.1 Chat footer, queue UI, and files touched -- implementation detail
Message sending supports a small per-conversation queue so the user can stage one follow-up while a response is already in flight.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

Queue rules:
- queued sends are FIFO
- queue max is exactly `2`
- queue state is transient per conversation and is not restored across reload or restart
- when the queue is full, further sends are blocked until a slot opens
- stale affordances `Clear queue` and `Send now — replace first` are retired from canonical UI behavior

Files-touched and footer state remain lightweight per-thread UI state; they do not become a second persistence layer for queued messages.

#### Message-level hover actions and resend contract

Message-level controls use a hover/focus row directly below the message body.

Rules:
- the row is hidden until hover or keyboard focus and does not create permanent always-visible chrome under every message
- the left cluster is icon-only message actions
- the right cluster is compact runtime summary plus the info icon
- `Copy` is available on every message
- assistant messages additionally pin a small always-visible `Copy` icon in message chrome; the hover/focus row remains canonical for all other message actions
- `Edit` and `Resend` are available only on the most recent user-sent message
- `Delete` is not available for user-authored thread history
- this subsection supersedes earlier message-level `Retry` wording in this document

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

`Resend` is a history-aware replay action, not transport retry.

Rules:
- `Resend` rewinds the thread to the selected latest user message, discards later generated assistant/subagent/runtime history after that point, and replays that user message
- `Resend` is distinct from provider retry, network retry, backoff, or error recovery terminology
- if the selected message is no longer the most recent user message, `Resend` is unavailable rather than silently retargeted
- `Edit` restores the selected latest user message into the composer for user modification before submission

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

Compact runtime summary rules:
- compact display label is one of `Ask`, `Agent`, `Plan`, or `Deep Plan`
- compact row shows the resolved display label, model, and either assistant thinking time/duration or the user timestamp
- the info icon opens the message runtime popover

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Additional canonical rules:
- Stop/Edit/Resend attach ONLY to most recent user-sent message
- discards all later history/work
- FIFO, max 2 queued messages
- Stop does NOT clear the queue
- always-visible copy affordance on fenced code blocks
- queue state is transient and is not restored across reload or restart
- Stop becomes disabled when a run completes and no next message is queued
- Keep recovery and restore surfaces pointed at this owner section for queue semantics
