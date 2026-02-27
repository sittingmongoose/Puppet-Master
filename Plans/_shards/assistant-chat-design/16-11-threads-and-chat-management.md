## 11. Threads and chat management

- **Multiple threads, single chat window:** The user can add **additional chats** (message threads). This **switches to another message thread** in the same chat UI -- it does **not** open a new chat window or pop-out. So there is one chat panel with a **thread list** (or equivalent); selecting a thread shows that thread's messages. This lets the user run **multiple things in parallel** (e.g. one thread in Plan mode, another in Ask mode) by switching between threads.
- **Responsive chat UI -- icons when narrow:** The **chat area** (composer, footer, queue strip, header buttons) must be **responsive** to the chat window or panel width. When the chat window is **made small**, **buttons and other components** that normally show **text labels** (e.g. "Send", "Stop", "Edit", "Send now", "Cancel", "Clear queue") should **switch to small icons only** to save space and avoid crowding. When the window is **wide enough**, show text labels (with or without icons). When the chat panel width is below **280px**, the UI switches to icon-only mode (labels hidden, only icons shown). Config: `ui.chat.icon_only_breakpoint_px`, default `280`, stored in redb. **Tooltips** must remain available so the user can hover to see the action name when in icon-only mode. Applies to: composer actions, queue message buttons (Edit, Send now, Cancel), footer controls, and any other labeled buttons in the chat panel.
- **Thread list (sidebar) -- resizable and collapsible:** The **side part that shows prior thread history** (the thread list) must be **adjustable in size** and **collapsible**. (1) **Resizable:** The user can **drag** the divider between the thread list and the chat area to make the list wider or narrower. (2) **Collapsible:** The user can **collapse** the thread list to a **much smaller** strip (e.g. narrow column or icon rail). **Expanded** state: show a **larger preview** of each thread name (more of the title visible, more list items in view). **Collapsed** state: show a **much smaller** strip--e.g. narrow width with a compact thread name (truncated or icon/short label) so the user still sees which thread is selected and can expand again or switch threads. Toggle via a button (e.g. chevron or panel toggle) or by double-clicking the divider. Persist the user's choice (expanded/collapsed and width if resizable) per session or in settings.
- **New thread:** A **plus button** (or equivalent) starts a **new chat/thread**. New thread gets a default title (e.g. "New chat" or first message snippet); user can rename it (see below).
- **Thread state indicators:** In the **thread list** (message thread history), each thread has an **indicator** showing:
  - **Working** -- this thread has an agent run in progress (e.g. spinner, "Working...", or status text).
  - **Completed** -- the last agent turn in this thread finished (e.g. checkmark or "Done").
  - **Attention Required** -- the thread is paused waiting for the user to answer clarification questions from the requirements quality reviewer (see §11.1). Shown as an amber ⚠ badge with a numeric count of unanswered questions.
  So at a glance the user can see which threads are active, idle, or awaiting user attention.
- **Rename threads:** The user can **rename** a thread (e.g. via context menu, inline edit, or thread settings). The chosen title is shown in the thread list and in any history/search.
- **Archive threads:** The user can **archive** a thread. Archived threads are hidden from the default thread list but remain **searchable** (in chat history search) and recoverable (e.g. "View archived" or filter). Archiving keeps the list manageable without losing history.
- **Resume and rewind:** The user can **resume** a thread from persisted state (restore context and continue) and **rewind** (or "Restore to here") to a given message -- i.e. branch/rollback using the same restore-point mechanism as Plans/newfeatures.md §8. Exposed via slash command or thread actions.
- **Session share:** The user can **share session** -- produce a bundle (e.g. messages + metadata, no secrets) for support or replay. Available via slash command or menu.
- **Delete thread:** The user can **delete** a thread permanently (in addition to archiving). Deletion requires confirmation; archive remains the default for "hide but keep."
- **Copy message:** Message content is **selectable** so the user can copy text (e.g. assistant reply) to the clipboard; or provide a "Copy" action on messages. Use selectable widgets per docs/gui-widget-catalog.md.
- **Run-complete notification:** When a run completes in a **different** thread than the one the user is viewing, the app shows a notification (e.g. badge or toast). A **setting in application settings** (e.g. under Chat or Notifications: "Notify when run completes in another thread") allows the user to **turn this off**. Default: on.
- **Concurrent threads:** A **setting** controls the maximum number of threads that can have an agent run in progress at the same time. Default: **10** concurrent threads. When the limit is reached, new runs **queue** automatically (FIFO). Config: `orchestrator.max_concurrent_threads`, default `10`. Platform rate/process limits still apply.
- **Plan panel scope:** The **plan panel** (§8) is **per thread**: when the user switches threads, the panel shows the plan (and todo) for the **current thread**.
- **Persistence -- everything in the chat thread:** **Everything** in the chat thread must **persist**. The thread is the full record of the conversation and must survive app restart, re-open, and resume/rewind. Nothing shown in the thread is ephemeral-only. Implementation: canonical event stream (seglog) and projections (redb, Tantivy) per Plans/storage-plan.md. Specifically, persist (e.g. per project under `.puppet-master/` or in app data):
  - **Thread list** and per-thread metadata (title, archive state, etc.).
  - **Messages** -- every user and assistant message (prompts and replies).
  - **Prompts** -- user prompts and any composed-but-queued or sent prompts, so the full prompt history is retained.
  - **Thought streams** -- reasoning/chain-of-thought (thinking) content when the normalized stream provides it; persist so scrolling back or re-opening the thread shows past reasoning.
  - **Code block diffs** -- code blocks and their diffs (e.g. edits, patches, file changes shown in the thread) must be stored with the thread so the user can review what was proposed or applied at any point.
  - **Subagent blocks** -- which subagents ran and what they worked on (§14); first-class entries in thread history.
  - **Plan and todo** -- the plan panel content (written plan, todo list) per thread.
  - **Queue state** -- when a run is not active, the pending queued messages for that thread.
  - **Activity transparency data** -- what was searched, which files were explored or changed, bash output summaries (or references), so the audit trail in the thread is complete.
  - **Attachments** -- references to attached files/images so the thread can restore context (blobs may be stored separately; thread stores references and metadata).
  - **Usage per turn** -- tokens (input/output/reasoning/cache if available) and cost per assistant turn, so the **context circle** and **thread Usage tab** (§12, Plans/usage-feature.md §5) can show per-thread usage without rescanning. When seglog is in place, this can be derived from `usage.event` (with `thread_id`); until then, persist with the thread or in usage.jsonl keyed by thread/session id.
  Resume and rewind rely on this; see Plans/newfeatures.md for recovery and snapshot behavior. If the UI shows it in the thread, it must be persisted.
- **Backup and sync to other devices:** Chat threads and messages (including **Interview** threads and messages) must be **included in the application's backup and sync-to-other-devices feature**. When the user exports, backs up, or syncs to another device (e.g. via manual export/import or BYOS per Plans/newfeatures.md §22), the payload must include all chat and interview thread data (thread list, full message content, and all persisted thread content listed above) so the user can restore or continue conversations on another machine. Same scope as the sync payload defined in newfeatures.md §22 (thread/history index and message blobs for Assistant and Interview).

### 11.1 Thread State: `attention_required`

**State definition:** A thread enters `attention_required` when the requirements quality reviewer generates `needs_user_clarification[]` entries that could not be auto-resolved. The wizard is paused; no further agent execution occurs until the user submits answers.

#### Thread List Indicator (sidebar)

When a thread is in `attention_required` state, its entry in the thread list shows:

- An amber/warning-colored badge (⚠ or equivalent icon) to the left of the thread name.
- A numeric count badge showing the number of unanswered clarification questions (e.g., "3 questions").
- The thread entry is visually elevated -- moved to the top of its section, or rendered bold -- so it is immediately noticeable.
- The badge clears when all questions are answered and the wizard returns to a non-`attention_required` state.

#### Badge data model

```json
{
  "thread_id": "<string>",
  "state": "attention_required",
  "unanswered_question_count": "<integer ≥ 1>",
  "wizard_id": "<string>",
  "wizard_step": "<string>",
  "quality_report_path": "<string path to quality report file>"
}
```

ContractRef: `SchemaID:pm.requirements_quality_report.schema.v1`, `ContractName:Plans/chain-wizard-flexibility.md#requirements-quality-escalation-semantics`

### 11.2 System Message Type: `clarification_request`

This message is automatically posted to the thread when the requirements quality reviewer generates `needs_user_clarification[]` entries that could not be auto-resolved.

#### Message schema (within the thread message model)

```json
{
  "type": "clarification_request",
  "message_id": "<string>",
  "timestamp_utc": "<ISO-8601 date-time>",
  "wizard_id": "<string>",
  "wizard_step": "<string>",
  "quality_report_path": "<string path to quality report>",
  "questions": [
    {
      "question_id": "<string>",
      "question": "<specific, answerable, non-overlapping question>",
      "context": "<background context for the user>",
      "answer_format": "<free_text|single_choice|multi_choice|yes_no|identifier>",
      "choices": ["<option1>", "<option2>"]
    }
  ],
  "resume_url": "<deep-link to exact wizard step>",
  "answered": false
}
```

- `answered` transitions to `true` when all questions have received user responses.
- When `answered` becomes `true`, the wizard re-runs Pass 1 + Pass 2 automatically.

#### Visual rendering spec

- Displayed as a distinct card/panel within the thread (not a regular chat bubble).
- **Header:** ⚠ "Requirements Clarification Needed" in amber.
- **Sub-header:** "Wizard: [wizard_step]" + "Resume →" link.
- Each question rendered as a labeled form field matching `answer_format`:
  - `free_text` → textarea
  - `yes_no` → radio buttons (Yes / No)
  - `single_choice` → radio button group using `choices[]`
  - `multi_choice` → checkbox group using `choices[]`
  - `identifier` → text input with validation
- "Submit Answers" button at bottom; disabled until all questions have a value.
- After submit: system posts a confirmation message and the card shows a "Submitted ✓" state.

ContractRef: `SchemaID:pm.requirements_quality_report.schema.v1`, `ContractName:Plans/chain-wizard-flexibility.md#requirements-quality-escalation-semantics`, `ContractName:Plans/FinalGUISpec.md`

### 11.3 Thread State Lifecycle: `attention_required`

```
[wizard running]
    → quality reviewer runs
    → needs_user_clarification[] non-empty
    → state: attention_required
    → clarification_request system message posted
    → user views + answers questions
    → "Submit Answers" clicked
    → wizard re-runs Pass 1 + Pass 2
    → [if PASS] state: active  (attention_required cleared, badge removed)
    → [if FAIL again] state: attention_required  (new clarification_request posted, old one archived)
```

**State transitions:**

| From | To | Trigger |
|------|----|---------|
| `active` | `attention_required` | Quality reviewer reports `needs_user_clarification[]` non-empty |
| `attention_required` | `active` | User submits answers and Pass 1 + Pass 2 return PASS verdict |
| `attention_required` | `attention_required` | User submits answers but Pass 1 + Pass 2 still return FAIL (new round of questions) |

**Max clarification rounds:** **3**. After 3 consecutive rounds still failing, wizard state becomes `blocked` and a different escalation path is triggered -- outside the scope of this spec; see `Plans/chain-wizard-flexibility.md`.

ContractRef: `ContractName:Plans/chain-wizard-flexibility.md#requirements-quality-escalation-semantics`

---

