## 14. Subagents & Crew

- **Automatic subagents:** The chat can **automatically spawn subagents** when it determines that a task benefits from specialized help (e.g. research, code review, debugging). Logic should align with orchestrator subagent selection where applicable (e.g. `subagent_registry`, task type).
- **User-requested subagents:** The user can explicitly ask the agent to use subagents (e.g. "use a code reviewer for this" or "run this with subagents").
- **Subagent visibility in the thread:** When a subagent is **active** in the thread, the chat must show **in the message stream** (inline in the thread):
  - **Which persona** is being used (e.g. "Rust Expert", "Technical Writer", "Code Reviewer") -- the display name from `subagent_registry` or persona config.
  - **What they are working on** -- a short description or task (e.g. "Reviewing `src/lib.rs`", "Researching best practices for ..."). This can come from the orchestrator/subagent runtime (current step or task label) or from the first message/tool call assigned to that subagent.
  So the user always sees which specialist is active and what they're doing, without leaving the chat. Behavior aligns with Cursor's in-thread subagent indicators.
- **Subagents kept in thread history:** The **subagents used** in the thread must be **kept in the chat thread history**. Each subagent block (persona + task) is a first-class entry in the message/event stream: when the user scrolls back or re-opens the thread, they see not only user and assistant messages but also **which subagents ran and what they did** at those points in time (e.g. "Rust Expert -- Reviewing `src/lib.rs`", "Technical Writer -- Drafting API docs"). Persist these blocks with the thread so the full audit trail -- who (which persona) worked on what and when -- is always visible in the thread history.
- **Crew mode:** A **Crew** is a multi-agent group (see Plans/orchestrator-subagent-integration.md). The user can invoke crew via:
  - A **button** in the chat UI, or  
  - A natural-language request (e.g. "use a crew" or "run this with a crew").  
- **Crew + Plan:** Plan mode and Crew mode **must work together**: e.g. user can run Plan mode and then execute the plan with a crew, or run a crew for a planned set of steps. See §15.

### 14.1 Subagent visibility in thread -- implementation detail

**GUI updates**

- **In-thread indicator:** When a subagent is active, the **message stream** (same area as user/assistant messages) must show an **inline block** (or message-like row) that includes:
  - **Persona name** (e.g. "Rust Expert", "Technical Writer") -- from `subagent_registry` or persona config; use the same display name used elsewhere (e.g. crew/subagent list).
  - **What they're working on** -- short task label (e.g. "Reviewing `src/lib.rs`", "Researching best practices for error handling"). One line is enough; optional expand for detail.
- **Placement:** Show the indicator **when the subagent run starts** (e.g. at the point in the thread where the system hands off to that subagent). Optionally update the same block when the task label changes (e.g. "Reviewing..." → "Writing summary") or leave it static until the subagent finishes. When the subagent finishes, the block **remains in the thread** as a permanent history entry (e.g. "Rust Expert -- Reviewing \`src/lib.rs\`" or "Rust Expert -- completed"); it is **not** removed. Main requirement: visibility **while** active and **persistence in thread history** so scrolling back or re-opening the thread shows which subagents were used and when.
- **Visual treatment:** Differentiate from regular user/assistant messages (e.g. secondary background, icon, or "Subagent" chip) so the user can scan quickly. Use existing widgets (e.g. `status_badge`, `selectable_label`) where possible; tag new ones with `// DRY:WIDGET:...`.
- **Multiple subagents:** If several subagents are active at once, show one block per subagent (or a compact "2 subagents: Rust Expert (reviewing ...), Technical Writer (drafting ...)"). Align with footer "active subagent count" (§4.1) so the number matches the number of blocks shown.

**Backend updates**

- **Data per active subagent:** For each active subagent in a thread, the backend (or event stream) must provide:
  - **Persona id or name** -- to resolve to display name via `subagent_registry` or persona config.
  - **Task label** -- short string describing what they're working on (e.g. step title, first message snippet, or "Working on step 2"). If the execution layer does not provide this, derive from: plan step title, tool call name, or "Working..." as fallback.
- **Events:** Emit (or model in unified events) **subagent_start** and **subagent_end** (or equivalent) with `thread_id`, `subagent_id`/persona name, and optional `task_label`. The chat view subscribes and inserts/updates the in-thread indicator. Optionally **task_progress** events to update "what they're working on" without a new block.
- **Source of task label:** Orchestrator/crew runtime (Plans/orchestrator-subagent-integration.md) should pass a **task label** when delegating to a subagent (e.g. "Review `src/lib.rs`", "Research error-handling patterns"). If not available, UI shows persona name only or "Working..." until the first tool call or message can be used as a proxy label.

**Examples (unchanged)**

- "**Rust Expert** -- Reviewing `src/lib.rs`"
- "**Technical Writer** -- Researching best practices for API docs"
- "**Code Reviewer** -- Checking test coverage"

**Gaps and missing details**

| Gap | Description | Recommendation |
|-----|-------------|----------------|
| **Task label optional** | Some runs may not have a step title or task label. | Require execution layer to set a default (e.g. "Working..." or first tool/message summary). GUI must handle empty/missing label (show only persona name). |
| **Order in thread** | Subagent blocks interleaved with assistant messages; order must be clear. | Order by **event time** so the subagent block appears at the position in the thread where the handoff happened. |
| **Persistence** | When thread is persisted and re-opened, do we show past subagent blocks? | **Yes.** Subagent blocks are first-class thread history: persist as part of thread message/event history so "Rust Expert reviewed ..." remains visible after reload and when scrolling back. Requirement: chat thread history **keeps** all subagents used in that thread. |
| **Interview vs Assistant** | Interview may use different subagent naming or flow. | Use same persona display names from `subagent_registry`; task label can be phase-specific (e.g. "Phase: Architecture -- Researching patterns"). |

**Potential issues**

| Issue | Risk | Mitigation |
|-------|------|------------|
| **Flicker** | Subagent starts and ends quickly; block appears and disappears. | Keep a short "just finished" state (e.g. "Rust Expert -- completed") for a few seconds, or leave a collapsed summary line so the user saw that someone worked. |
| **Long task labels** | "Researching best practices for error handling in async Rust and ..." truncates badly. | Truncate with tooltip or "..." (e.g. max 40-50 chars); full text on hover or expand. |
| **No persona display name** | Unknown subagent id or missing from registry. | Fallback: show raw id or "Subagent" so the slot is never empty. |
| **Concurrent subagents** | Several blocks in a row; thread gets long. | Allow collapsing "N subagents active" to one line when more than 2-3, with expand to list; or keep one block per subagent but use compact layout. |

---

