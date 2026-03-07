## 3. GUI Updates

### 3.1 Intent Selection at Flow Start

- **Placement:** When the user starts the flow (e.g. "Start new project" or "Open project" from Dashboard, or a dedicated "Start flow" entry), present **intent selection** before or as the first step of the wizard.
- **UI:** Four options (cards, list, or radio group) with short descriptions and optional "Learn more":
  - **New project** -- Greenfield; we'll create or use a new directory and optional GitHub repo.
  - **Fork & evolve** -- You'll work from a fork of an existing repo; we can create the fork or you can use your own.
  - **Enhance/rewrite/add** -- You have an existing project (new to Puppet Master); we'll scope changes and plan.
  - **Contribute (PR)** -- You want to add a feature or fix and open a Pull Request; we'll guide fork, branch, and PR.
- **Persistence:** Selected intent is stored in wizard/app state and passed to Interview and start chain. If the user goes back and changes intent, downstream state (e.g. requirements, interview phase) may need to be invalidated or confirmed.
- **OpenCode provider:** OpenCode is a first-class provider in tier configuration. Availability is controlled by the Settings enable toggle (see `Plans/Provider_OpenCode.md`). No wizard flow changes are required.

### 3.1.1 OpenCode Provider Settings Surface (GUI contract)

OpenCode is a **first-class provider backend** configured in Settings, not a wizard-specific special case.

- **Enable/disable:** Settings MUST expose a single OpenCode enable toggle.
- **Connection method selection:** Settings MUST expose OpenCode connection method:
  - **Direct server**: user supplies server host/port (or URL equivalent).
  - **CLI launcher/discovery fallback**: user-configurable `opencode` path used only for local launch/discovery fallback, not for primary HTTP runtime transport.
- **Auth/sign-in options:** Settings MUST expose server auth inputs and sign-in actions for OpenCode provider auth flows (see `Plans/Provider_OpenCode.md`).
- **Model selection:** Tier model pickers MUST source OpenCode models through the shared Provider model contract (no OpenCode-only picker behavior).

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/CLI_Bridged_Providers.md

### 3.2 Requirements Step Redesign

- **Single prompt:** "Provide your Requirements Document(s)."
- **Options (at least two):**
  1. **Upload your own** -- Single or **multiple** files (see §4). Supported formats per REQUIREMENTS.md (md, pdf, txt, docx); store under `.puppet-master/requirements/`.
  2. **Requirements Doc Builder** -- Button that opens Builder chat (section 5). The first Assistant message is context-sensitive per §5.1 ("What are you building?" / "What are you adding or changing?" / "What are you adding or changing in this fork?"). User describes the project (or delta, or feature); Assistant generates a requirements document after explicit user confirmation and hands it off to the flow. No re-upload required.
- **Framing by intent:** The exact label or helper text can vary by intent (e.g. "Describe the product" vs "Describe what you're adding or changing" vs "Describe the feature and acceptance criteria").
- **After requirements:** Proceed to Interview (or skip to PRD if we add "Skip interview" for advanced users later). Interview receives the canonical requirements (merged multi-doc or Builder output).

### 3.3 Project Setup Step (including GitHub)

- **When:** At the start of Project setup (wizard step 0 or equivalent), show:
  - **Project path** (new directory or existing path).
  - **Intent-specific fields:**
    - **New project:** Optional "Create GitHub repo" with **repo name** (required if creating) and any other fields needed to **actually create** the repo (visibility, description, .gitignore template, license, default branch). See §7.1.
    - **Fork & evolve / Contribute (PR):** **Upstream repo** (URL or `owner/repo`). Then: **"Create fork for me"** (we create the fork via GitHub HTTPS API) or **"I'll create the fork myself"** (user supplies fork path or clone URL after they fork). See §7.2.
  - **Existing GitHub repo (link only):** If the user already has a repo (e.g. created elsewhere or fork already exists), allow "Use existing repo" with URL or path.
- **GitHub create-repo:** The GUI must "punch in" the repo name and all fields required by the GitHub create-repo API so we can create the repo without a second manual step. See §7.1.
- **Provider readiness strip (Setup):** Show real-time provider auth status (`LoggedOut`, `LoggingIn`, `LoggedIn`, `LoggingOut`, `AuthExpired`, `AuthFailed`) and multi-account summary (active account + account count) for configured providers, with direct links to Authentication and Health/Doctor.
- **Tool readiness strip (Setup):** Show Cursor CLI, Claude CLI, and Playwright runtime install state (`Not Installed`, `Installing`, `Installed`, `Uninstalling`, `Failed`) with explicit Install/Uninstall actions. Codex/Copilot/Gemini are direct-provider integrations and do not show install buttons in this strip. Cursor/Claude rows include `Use manual path` checkbox + file picker; no manual path controls for Playwright.
- **Command contract source:** Setup actions for Cursor/Claude install/uninstall/PATH/verify MUST follow `Plans/FinalGUISpec.md` §7.15 command contract verbatim.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/chain-wizard-flexibility.md

### 3.4 Navigation and Recovery

- **Back/forward:** User can go back and change intent or project setup; document behavior when intent changes mid-flow (e.g. clear requirements and interview state, or prompt "Changing intent will reset requirements and interview; continue?").
- **Recovery:** Per newfeatures.md §4, recovery snapshot includes current view and wizard step; intent and project path should be in the snapshot so we restore to the right step and intent.

### 3.5 Agent activity and progress visibility

When the **Requirements Doc Builder** or **Multi-Pass Review** is running, the user should **see the agents working** (similar to Assistant chat), not just a spinner or "Working..." label.

**Agent activity view (embedded, non-interactive):**

- **Concept:** A **chat-like window** embedded in the page (wizard step or Interview view) that shows **streaming agent output** -- prompts, model responses, subagent reports -- so the user can see progress in real time.
- **Non-interactive:** This view is **read-only** during the run: no user input, no slash commands. Minimal chrome (no full Assistant toolbar/settings); it is an embedded "agent log" or "agent activity" pane.
- **Where used:**
  - **Requirements Doc Builder:** When the Assistant is generating the requirements doc, show the Builder conversation/stream in this pane.
  - **Multi-Pass Review (requirements doc):** When the review agent and subagents are running, stream their activity (e.g. "Review agent spawning subagents...", "Subagent 1 reviewing...", "Subagent 1 reported back.") into this pane.
- **Implementation:** Reuse the same Provider event-stream pipeline as Assistant chat (assistant-chat-design.md); for Multi-Pass Review, feed review-agent and subagent events into the same stream and render in the embedded pane. DRY: one "agent activity view" widget or component, used by Builder, Interview document creation, and Multi-Pass Review.
- **Pane separation:** Agent activity pane is streaming/progress only. Document review/editing is handled by a separate embedded document pane (see section 5 and `Plans/FinalGUISpec.md`).

**Progress indicator:**

- **Concept:** A **progress bar or status strip** that shows **which documents (or steps) are in progress** and **how many remain**.
- **Requirements Doc Builder:** Simple case -- e.g. "Generating requirements document..." with optional step (e.g. "Reviewing (pass 2 of 3)" when Multi-Pass Review is running).
- **Multi-Pass Review (requirements):** E.g. "Review pass 1 of 2 -- 2 subagents active" or "Review complete; producing revised doc."
- **Interview document creation and Multi-Pass Review (interview):** See interview-subagent-integration.md "Agent activity and progress visibility": show which document is being written or reviewed, and how many documents remain (e.g. "Writing phase 4 document -- 5 of 8 remaining"; "Reviewing document 7 of 15 -- 9 subagents active").

**Placement:** The agent activity pane sits **on the same page where the action is triggered**. That means: (1) **requirements/wizard page** when Builder or Multi-Pass Review (requirements) is triggered there; (2) **Interview page** when document creation or Multi-Pass Review (interview) runs. On the Interview page the pane is shown **in addition to** interviewer chat (same event stream, redundant display).

**Pause, cancel, resume:** Provide **pause**, **cancel**, and **resume** as user options during Multi-Pass Review and during document generation (Builder, Interview). **Pause:** Takes effect at **next handoff boundary** (no new subagents spawned; in-flight subagents complete and report; review agent is not started or is paused before consuming the next report). Do not kill in-flight subagents on pause. Persist state so resume can continue from that boundary. **Resume state:** Persist at least: run phase (spawning / reviewing / producing), number of completed review tasks (and which doc/pass if applicable), any partial reports already received, and review agent input state if in producing. Resume = continue spawning or producing from that point without re-running completed tasks. **Cancel:** On cancel, **stop spawning** new subagents immediately. **Do not kill** in-flight subagents; let them complete and discard their reports. Then set state to cancelled and surface "Review cancelled; no changes applied." If the review agent is already producing, cancel after it finishes the current revision (do not truncate mid-write); then discard and set `cancelled`. **Recovery after crash:** Support **resume after crash** for Multi-Pass Review when recovery state is available: on restore, if state is "in progress," show "Run was interrupted" with options **Resume** (continue from persisted state) or **Start over** (clear state and re-run from step 1). If state is missing or corrupted, show only "Start over." Recovery persistence must support this restoration path.

---

**Run states (canonical):** The progress indicator and pane must support exactly these states: `idle`, `generating`, `reviewing` (include pass index and subagents active when available), `paused`, `cancelling`, `cancelled`, `interrupted`, `complete`, `error`. All user-facing text (status strip, empty state, toasts) must key off these states.

**Pause/cancel/resume UI:** Place **Pause**, **Cancel**, and **Resume** in a single control row (toolbar or footer of the agent activity pane). Order: Pause | Resume | Cancel. When running: show Pause and Cancel (Resume disabled). When paused: show Resume and Cancel (Pause disabled). **Cancel** must open a confirmation modal: "Stop this run? No changes will be applied." with "Stop run" and "Keep running." On confirm, transition to `cancelling` then `cancelled`; show toast: "Run cancelled -- no changes applied." **Resume** continues from the exact checkpoint; show toast "Resuming..." then "Run resumed."

**Builder surface (decision):** Use the **embedded agent activity pane** for the Requirements Doc Builder (same as Multi-Pass Review). Builder progress is shown in the embedded pane on the requirements/wizard page.

**Stale progress:** If no progress event is received for **30 seconds** during an active run, show a warning in the progress indicator: "Progress stalled -- last update 30s ago" (amber). Do not auto-cancel; user may still pause or cancel.

**Recovery payload for in-progress runs:** Persist an optional **run checkpoint** when a doc-generation or Multi-Pass Review run is in progress. Schema: `run_type` (builder | multi_pass_review_requirements | document_creation | multi_pass_review_interview), `run_id`, `phase`, `step_index`, `document_index`, `total_documents`, `subagent_tasks_done`, `checkpoint_version`. On restore, show "Run was interrupted" with "Resume from checkpoint" and "Start over." If checkpoint is missing or invalid version, show "Cannot resume -- start over" and do not offer Resume.

---

