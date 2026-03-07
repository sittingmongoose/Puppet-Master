## GUI gaps: Interview tab

The Config view has an **Interview** tab (tab index 6) bound to `InterviewGuiConfig`. The following gaps must be closed so interview behavior is controllable from the UI and correctly wired to the run.

### Agent activity and progress visibility (document creation and Multi-Pass Review)

During **interview document creation** (phase documents, AGENTS.md, PRD, etc.) and during **Multi-Pass Review** (§5.4), the user should **see the agents working** (like in Assistant chat), not just a spinner.

**Where to show it -- two places (redundant):**

- We are already in the **interviewer chat** window when document creation or Multi-Pass Review runs.
  1. **In the interviewer chat:** Stream agent output (e.g. "Writing Scope document...", "Reviewing document 3 of 15...", subagent activity) into the chat so the user sees it there.
  2. **Agent activity pane on the same page:** Also show the same (or equivalent) activity in an **agent activity pane** on the Interview page, redundant with the chat. That's acceptable because the user isn't using the pane for anything else during that flow. So the Interview view shows the process in **both** the chat and the pane.

**Progress indicator:**

- **Progress bar or status strip** (on the same page) showing **which documents are in progress** and **how many remain**.
- **Document creation:** E.g. "Writing phase 4 document -- 5 of 8 remaining" or "Writing AGENTS.md..."
- **Multi-Pass Review:** E.g. "Reviewing document 7 of 15 -- 9 subagents active" or "Whole-set review pass 2 of 3."

**Pause, cancel, resume:**

- Provide **pause**, **cancel**, and **resume** as user options during document creation and during Multi-Pass Review. Pause suspends the run; cancel stops and does not apply changes; resume continues from where paused. **Recovery** (newfeatures §4) should persist "in progress" state so after cancel or crash the user sees "run was interrupted" and can resume or start over.

**Agent activity pane -- same placement rule everywhere:**

- The agent activity pane sits **on the same page where the action is triggered**. That includes the **Interview** page: show the pane there too (redundant with the chat, as above). For **Requirements Doc Builder** and **Multi-Pass Review** when triggered from the wizard/requirements step, the pane is on that page (chain-wizard section 3.5). So the pane appears in **two places** -- requirements/wizard page and Interview page -- and in Interview we show it in both the chat and the pane.

**Implementation:** Feed normalized Provider events from document generation and Multi-Pass Review into (1) interviewer chat when in Interview, and (2) the agent activity pane on the same page (Interview page or wizard/requirements page where triggered). In Interview, chat and pane are redundant. Progress state (current document, remaining count, subagents active) comes from the orchestrator or review coordinator and drives the progress UI. Align with chain-wizard section 3.5 and assistant-chat-design for streaming/events.

**Primary surface on Interview page:** When on the Interview page, the **interviewer chat** is the primary surface for streaming agent output during document creation and Multi-Pass Review. The **agent activity pane** on the same page shows the same stream (synchronized from the same event source). If the pane is collapsed or hidden, chat still shows full stream.

**Agent Activity Pane Sync (Resolved):**
Agent activity pane and interviewer chat **share the same event source** (seglog event projection). They stay in sync in **real time** — both subscribe to the same seglog projection stream. Redundant display is intentional and acceptable: the activity pane shows structured event cards (icon, label, timestamp), while the chat shows conversational rendering of the same events. Neither can diverge because they read from the same source.

**Runtime identity visibility (required):**
- For each Interview run stage (questioning, research, validation, drafting, review), the UI must display `requested_persona_id`, `effective_persona_id`, `selection_reason`, `provider`, and `model`.
- When a requested control is unavailable after capability/provider filtering, show it as skipped/disabled with reason rather than silently omitting it.
- Interview-specific displays must follow the same visibility contract as Builder and Assistant surfaces; no Interview-only hidden runtime substitutions are allowed.

**Preview section and document pane (required):**
- Interview page preview section must show the Multi-Pass findings summary and the final approval gate (`Accept | Reject | Edit`).
- Interview page also includes a separate embedded document pane (not the agent activity pane) for reviewing/editing human-readable interview artifacts.
- Document pane includes `Plan graph` as a read-only rendered view and shows notice: `Talk to Assistant to edit plan graph.`

**Final approval recovery state (required):**
- Recovery persistence must include whether the run is `awaiting_final_approval`.
- On restore, show the same findings summary and final approval UI for the interrupted run.
- Restore selected document/document-pane view where possible so the user returns to the same approval context.

**Progress indicator format:** Use a **status strip** (single line) above or below the pane: left = current step text (e.g. "Writing phase 4 document -- 5 of 8 remaining"); right = optional determinate progress bar (e.g. 5/8) when total is known. When total is unknown, show indeterminate progress bar.

**Progress Stale Rule (Resolved — SSOT):**
This is the **single source of truth** for the stale progress threshold:
- Threshold: **30 seconds** since last progress event.
- Display: "Progress stalled — last update [N]s ago" shown in the progress indicator.
- Config: `ui.progress.stale_threshold_s`, default `30`.
- Applies to: interview phases, orchestrator tiers, and chain-wizard steps. All consumers reference this definition.
- Cross-references: chain-wizard-flexibility.md §3.5 references this SSOT (does not redefine the value).

**Pause/cancel/resume and feedback:**

**Pause/Cancel/Resume Button Order (Resolved):**
Button order (left to right): **[Resume]** **[Pause]** **[Cancel]**
- Labels are exactly these words. No "or equivalent" — these are the canonical labels.
- Same order and labels everywhere: chain-wizard, interview, orchestrator progress view.
- [Resume] is disabled when running (grayed out). [Pause] is disabled when paused. [Cancel] is always enabled during a run.

States: idle, generating, reviewing, paused, cancelling, cancelled, interrupted, complete, error.

**Already in GUI (gui_config.rs)**

- `platform`, `model`, `reasoning_level`, `backup_platforms`, `max_questions_per_phase`, `first_principles`, `output_dir`, `require_architecture_confirmation`, `generate_playwright_requirements`, `generate_initial_agents_md`, `vision_provider`.

**Gaps (add or wire)**

| Item | Current state | Action |
|------|----------------|--------|
| **min_questions_per_phase** | Not in `InterviewGuiConfig` | Add field (default e.g. 1); add number input in Interview tab; wire into `InterviewOrchestratorConfig` and use in phase-complete logic. |
| **max_questions_per_phase** | Present; single number | Add **"Unlimited"** option (e.g. checkbox or special value 0 = unlimited) so users can allow unbounded questions per phase; wire to orchestrator (phase stops when min met and either max reached or unlimited). |
| **Wiring to InterviewOrchestratorConfig** | Several GUI fields are not passed to the interview orchestrator at runtime | Per orchestrator plan Gaps: add `min_questions_per_phase`, `max_questions_per_phase` (with unlimited), `require_architecture_confirmation`, `vision_provider` to `InterviewOrchestratorConfig`; set from `gui_config.interview` in `app.rs` when starting the interview; use in phase_manager and prompt/research flows. |
| **generate_initial_agents_md** | In GUI; default in code is `true` | Ensure default and tooltip reflect §5.1: when true, generated AGENTS.md includes DRY and Technology & version constraints. Tooltip: "Generate AGENTS.md at project root with DRY method and technology/version rules from the interview." |
| **Multi-Pass Review (section 5.4)** | Not in GUI | Add: on/off, number of reviews (default 2, min 1, max 5), max subagents spawn (default 3, min 1, max 10) **with warning** "This will go through token usage quickly," use different models (y/n), model/provider list, findings summary preview, and one final approval gate (`Accept | Reject | Edit`). Wire into interview run config. |
| **Agent activity view and progress** | Not in GUI | **(1) Pane:** Add an **agent activity pane** on the Interview view and on the wizard/requirements page when Builder or Multi-Pass Review is triggered there. Pane: read-only, chat-like, min height 120px, max 500 lines, monospace; same event source as interviewer chat when on Interview page (redundant display). **(2) Progress:** Add a **status strip** with current step text and optional determinate/indeterminate progress bar; canonical states: idle, generating, reviewing, paused, cancelling, cancelled, interrupted, complete, error. **(3) Controls:** Pause | Resume | Cancel in one row; Cancel with confirmation modal; toasts for cancel/resume. **(4) Recovery:** Persist run checkpoint (run_type, run_id, step_index, document_index, etc.) per chain-wizard §3.5; on restore show "Run was interrupted" with "Resume from checkpoint" / "Start over." **(5) Settings (optional):** In Interview tab, add "Show agent activity pane by default" (default true) and persist pane visible/collapsed and split ratio in redb per project. |

**Config and storage for Multi-Pass Review and Agent activity**

- **Multi-Pass Review (Interview, section 5.4):** Store under **redb** namespace `settings`, key pattern `project.{project_id}.interview.multi_pass_review` (or app-level if not project-scoped). Fields: `enabled` (bool, default false), `number_of_reviews` (u32, default 2, min 1, max 5), `max_subagents_spawn` (u32, default 3, min 1, max 10), `use_different_models` (bool, default true), `model_provider_list` (array of { model, provider }, default from platform_specs). Validation: on save, clamp to min/max; invalid model/provider entries dropped with a toast. UI: Interview tab, collapsible card "Multi-Pass Review" with toggles and number inputs; warning next to max_subagents_spawn: "This will go through token usage quickly." Final approval state is persisted so interrupted runs restore to findings + approval.
- **Multi-Pass Review (Requirements Doc Builder, chain-wizard section 5.6):** Store under `project.{project_id}.wizard.multi_pass_review`.

**Multi-Pass Review Defaults (Resolved):**

| Setting | Requirements Multi-Pass | Interview Multi-Pass |
|---------|------------------------|---------------------|
| Reviewer count | 3 | 3 |
| `model_provider_list` | From tier config (Phase tier) | From tier config (Phase tier) |
| redb key | `multi_pass:requirements:config` | `multi_pass:interview:config` |
| Min doc size | 100 chars (see chain-wizard §5.6) | 100 chars (same threshold) |
| Merge strategy | Sequential (reviewers run in order) | Sequential |

Config: `interview.multi_pass.reviewer_count` (default `3`), `requirements.multi_pass.reviewer_count` (default `3`). Both use the same `model_provider_list` from the active tier config.
- **Agent activity pane preferences:** redb: `project.{project_id}.ui.agent_activity_pane_visible` (bool, default true), `project.{project_id}.ui.agent_activity_pane_height_ratio` (f32, 0.1..0.9, default 0.35). Optional: Show agent activity pane toggle and splitter persistence.

**Placement in Interview tab**

- Use existing widgets (e.g. `responsive_form_row`, `styled_text_input`, toggler, help_tooltip). Add a row "Min questions per phase" and "Max questions per phase" (with "Unlimited" checkbox or 0 = unlimited). Keep layout consistent with other Interview tab controls. Run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after UI changes (DRY, per AGENTS.md).

**Cross-reference**

- MiscPlan §7.5: Cleanup/evidence UI lives in Config → Advanced; Interview tab is separate. No overlap.
- Orchestrator plan Gaps: "Interviewer Enhancements and Config Wiring" -- same wiring requirement for interview config.

**Unwired interview config (implementation status)**

As of the final sweep, the following are **not** wired in code:

- **InterviewOrchestratorConfig** does not have: `min_questions_per_phase`, `max_questions_per_phase` (or unlimited), `require_architecture_confirmation`, `vision_provider`. Phase definitions in `phase_manager.rs` use hardcoded `min_questions: 3`, `max_questions: 8`.
- **app.rs** (where interview config is built for the orchestrator) passes only: `generate_initial_agents_md`, `generate_playwright_requirements`, plus project/platform/output/feature fields. It does **not** pass the four items above.
- **InterviewGuiConfig** does not have `min_questions_per_phase`; the Interview tab has no "Unlimited" for max.

When implementing, add the fields to `InterviewOrchestratorConfig` and `InterviewGuiConfig`, set them from `gui_config.interview` in app.rs when starting the interview, and use them in phase_manager and research flows. See also **MiscPlan §9.1.18** for the consolidated unwired/GUI sweep.

