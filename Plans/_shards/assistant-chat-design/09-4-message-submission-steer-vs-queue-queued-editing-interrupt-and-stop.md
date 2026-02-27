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
- **Keyboard shortcuts:** Chat actions (Send, New thread, Stop, focus composer, Clear queue, etc.) must be reachable via **keyboard shortcuts** and/or the **command palette**. See Plans/newfeatures.md §11.
- **Clear queue:** The user can **clear the entire queue** (e.g. "Clear queue" action when one or more messages are queued), removing all queued messages at once.
- **Stop the agent:** The user must be able to **stop** the agent at any time (e.g. a "Stop" button or shortcut). Stop **cancels** the current run and does **not** send any message. Stopping does not remove queued messages; the next queued message can be processed after stop, or the user can edit/remove queued messages or clear the queue.
- **Error and failure UX:** When the CLI fails, times out, or returns an error, the thread must show a **clear error state**: the error message (or a user-friendly summary) and, where applicable, **Retry** and **Cancel** (or Dismiss) actions. Retry re-sends the last user message (or re-runs the same request); Cancel dismisses the error and leaves the queue unchanged. Failed runs do not consume a queued message unless the user explicitly retries; the queue remains so the user can edit, send now, or clear. If the failure was due to a platform or network issue, the UI can suggest switching platform or model (see §12 rate limit hit).

### 4.1 Chat footer, queue UI, and files touched -- implementation detail

**GUI updates**

- **Footer container:** Add a **chat footer** region at the bottom of the chat view that hosts, in order (top to bottom): (1) pending queued messages strip, (2) composer (text entry), (3) status line for active subagent count, (4) files-touched strip. The footer is **per thread** -- when the user switches threads, it shows that thread's queue, count, and files. Use existing widget patterns (e.g. selectable labels for file paths, styled buttons for Edit / Send now / Cancel) per `docs/gui-widget-catalog.md`; tag new reusable pieces with `// DRY:WIDGET:...`.
- **Queued messages strip:** When the queue is non-empty, render one row per queued message (max 2). Each row: **preview of message text** (truncate with tooltip or expand on click), plus three actions: **Edit** (opens inline edit or small modal), **Send now (steer)**, **Cancel** (remove from queue). Order: first queued at top. When queue is full, show a "Queue full (2 messages)" hint and disable or warn on further queue attempts. **Empty state:** when queue is empty, this strip can be hidden or show a minimal "No queued messages" so the composer is not pushed down unnecessarily.
- **Active subagent count line:** A single line below the composer, e.g. "0 active subagents" or "2 active subagents". Style as secondary/muted text; optional: make it a control that expands to list active personas (if we have that data) or links to the thread's run state. **Empty state:** "0 active subagents" when none.
- **Files touched strip:** A compact list of **file paths** with **diff counts** (additions, deletions). Example: `src/main.rs` (+12 −3) - `docs/readme.md` (+2 −0). Paths should be **selectable/copyable** (e.g. `selectable_label_mono`). **Click opens the file in the in-app IDE-style editor** (Plans/FileManager.md); when the entry has line/range info, the editor opens at that location. **Empty state:** "No files changed in this thread" or hide the strip when empty. If many files (e.g. >10), show a fixed number (e.g. 5) with "+ N more" and expand on click or hover.
- **Scrolling and layout:** Message area scrolls independently; footer stays fixed at bottom. Ensure keyboard focus (e.g. Tab order) goes: composer → queue actions → other footer controls, and that "focus composer" shortcut is available.

**Backend updates**

- **Thread state:** Each thread must expose (or the chat view must subscribe to):
  - **Queued messages:** Ordered list (max 2) of `{ id, text }`. Actions: add (when queueing), remove (Cancel or Send now), edit (update text), reorder not required (FIFO only).
  - **Active subagent count:** Integer -- number of subagents currently "active" for this thread. Define "active" as: subagent run started and not yet completed for this thread (e.g. has an in-flight tool call or turn). Backend or execution layer must emit this (e.g. from orchestrator/crew runtime or from normalized event stream).
  - **Files touched:** List of `{ path, additions, deletions }` (or `path` + `diff_summary`) for this thread. Source: accumulate from **edit/tool events** in the thread (e.g. `file_edit`, `write`, or platform tool results). Diff counts come from **git diff** (e.g. `git diff --numstat` for the path since thread start or since last commit) or from the **event stream** if the platform reports line-level changes. Prefer a single source of truth (e.g. "files changed in this thread" maintained by the run/thread state).
- **Events:** The unified event model (Plans/rewrite-tie-in-memo.md) must support (or be extended with):
  - **Queue events:** `queue_add`, `queue_remove`, `queue_edit`, `queue_clear`; and a way to read current queue per thread.
  - **Subagent lifecycle:** Events (or state) that indicate "subagent X started for thread T" and "subagent X finished for thread T" so the UI can compute active count and show persona/task in the thread (see §14.1).
  - **File change events:** Per-thread accumulation of file edits (path + optional add/delete counts) so the footer can show files touched without re-scanning the filesystem on every paint.
- **Persistence:** Queue state is per-thread and must be persisted (e.g. with thread list and messages) so after app restart the user sees the same queued messages if the run was not active. Active count and files touched are derived from run state; if the run is not persisted mid-flight, on restart show 0 active and last known files touched (or empty).

**Examples (unchanged)**

- Queued strip: first message "Add tests for login"; second "Then update the README." Buttons: [Edit] [Send now] [Cancel] for each.
- Active count: "2 active subagents".
- Files touched: `src/auth.rs` (+12 −3) - `src/lib.rs` (+2 −2) - `README.md` (+5 −0).

**Gaps and missing details**

| Gap | Description | Recommendation |
|-----|-------------|----------------|
| **Definition of "active" subagent** | When does a subagent count as active? (e.g. from first tool call until turn end.) | **Resolved:** A subagent is **active** from the moment its Provider process is spawned until it emits a final result event (`run.completed`, `run.failed`, or `run.cancelled`) in the seglog. A spawned subagent that has not yet emitted a final result is active. The "what they're working on" label comes from the `task_label` field in the `run.started` seglog event. |
| **Source of "what they're working on"** | §14 says persona + task; task can come from "current step or first message." | Backend must expose a short **task label** per active subagent (e.g. from plan step title, or first user/tool message). If missing, show only persona name. |
| **Diff count source** | Git vs event stream vs both. | Prefer **event stream** for consistency (what the agent reported). Fallback: `git diff --numstat` for listed paths since thread start (or since last clean state). Define in backend so GUI only displays. |
| **Files touched scope** | "This thread" -- do we include only edits in this thread's run, or all edits in the project since thread start? | Scope to **edits made during this thread's runs** (agent-originated edits in this conversation). Exclude user edits outside chat. |
| **Queue Full Behavior (Resolved)** | What exactly happens when user tries to queue a third message? | When the queue is full (2 messages): (1) Show a **"Queue full"** label above the input area. (2) Offer two actions (in this order): **[Clear queue]** (removes all queued messages) and **[Send now — replace first]** (discards the oldest queued message, sends new message immediately). (3) Further typing in queue mode is **disabled** until queue space is available (either via Clear, Send now, or a queued message being consumed by the agent). |

**Potential issues**

| Issue | Risk | Mitigation |
|-------|------|------------|
| **Many files touched** | Long list pushes footer or scrolls. | Display up to **5** files touched, then show '+ N more' as a clickable expander. Config: `ui.chat.files_touched_display_cap`, default `5`, stored in redb. |
| **Stale Diff Counts — Files Touched (Resolved)** | User or another process edits file after agent; diff no longer matches "agent's edit." | The chat footer shows "last known" file counts from the most recent agent turn. Counts are recomputed automatically when the user **switches to the thread** (focus event). No manual "Refresh" button — event-based counts (from seglog `file.edited` events) are preferred; focus-triggered recompute is the fallback for stale data. Diff source: `git diff --numstat` scoped to agent-originated edits in this thread's runs. |
| **Multiple threads with runs** | Active count is per-thread, but runs might be concurrent. | Backend must attribute each subagent run to a thread id; count only subagents for the **current** thread in the footer. |
| **Edit queued message (Resolved)** | Inline expand. | Clicking "Edit" on a queued message expands the row in-place into an editable text field pre-filled with the original message. Below the field: [Save] and [Cancel] buttons. No modal, no popover. While editing, the message remains in queue position. Saving replaces the queued message content; cancelling restores the original. |
| **Accessibility** | Footer has many interactive elements. | Ensure focus order, keyboard activation for Edit/Send now/Cancel, and screen-reader-friendly labels (e.g. "Edit queued message 1", "Send now (steer)", "Remove from queue"). |

---

