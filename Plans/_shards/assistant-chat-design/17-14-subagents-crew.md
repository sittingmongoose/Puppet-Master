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
Subagent entries remain inline thread objects rather than sidebar-only state.

Required visible fields are:
- persona display name
- short task label
- effective model when known
- time or duration state
- worker indicator showing that the entry is a subagent activity block

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

Visual treatment rules:
- subagent blocks stay in the same base card family as assistant/agent activity entries
- subagent blocks use a subtle alternate accent, border, chip, or similar flourish so the user can distinguish them at a glance
- active subagent blocks may use a distinct running animation from the primary active agent animation
- the distinction must remain subtle; this is not a separate radically different layout system
- completed subagent blocks remain in thread history as first-class persisted entries

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md

Multiple-subagent rules:
- each active subagent may render as its own block, or the UI may collapse to a compact grouped state when several are active at once
- whichever presentation is used, the footer active-subagent count and inline blocks must stay consistent
- persisted history keeps the specific subagent entries rather than only the grouped summary count

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/orchestrator-subagent-integration.md
