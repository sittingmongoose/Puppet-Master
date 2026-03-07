## Interviewer Enhancements and Config Wiring

This section addresses **interview-specific** config that is built in the GUI and/or config types but not yet wired into the interview execution path, and defines **min/max questions per phase** behavior plus process and validation to avoid "built but not wired" across the app.

### Current state: interview config wiring gap

The Config tab (Interview tab) and `InterviewGuiConfig` / `PuppetMasterConfig.interview` (`InterviewConfig`) define several settings. The **interview orchestrator** is built with `InterviewOrchestratorConfig` in `app.rs` (from `gui_config.interview`). Only a subset of GUI/config fields are passed into `InterviewOrchestratorConfig` and used in `interview/` (orchestrator, phase_manager, prompt_templates, completion_validator).

**Audit result -- interview settings:**

| Field | In GUI / InterviewConfig | In InterviewOrchestratorConfig | Used in interview/ | Status |
|-------|--------------------------|--------------------------------|-------------------|--------|
| `platform`, `model`, `backup_platforms` | Yes | Yes (primary_platform, backup_platforms) | Yes | Wired |
| `output_dir` | Yes | Yes (output_dir) | Yes | Wired |
| `reasoning_level` | Yes | Via request.reasoning_effort | Yes | Wired |
| `first_principles` | Yes | Yes | Yes | Wired |
| `generate_playwright_requirements`, `generate_initial_agents_md` | Yes | Yes | Yes | Wired |
| **`max_questions_per_phase`** | Yes | **No** | **No** (PhaseManager uses hardcoded 3/8) | **Not wired** |
| **`require_architecture_confirmation`** | Yes | **No** | **No** | **Not wired** |
| **`vision_provider`** | Yes | **No** | **No** | **Not wired** |

So three interview settings are currently **built but not wired**. Users who change them in Config see no effect on interview behavior.

### Interview question limits (min / max per phase)

**Planned change:**

1. **Replace** the single "Max questions per phase" with:
   - **Minimum questions per phase** (e.g. `min_questions_per_phase: u32`, default 3).
   - **Max questions per phase** with an **Unlimited** option (e.g. `max_questions_per_phase: Option<u32>`; `None` = unlimited).

2. **Dynamic behavior:** The interview agent may signal phase completion (e.g. `<<<PM_PHASE_COMPLETE>>>`). The orchestrator should:
   - **Accept** phase complete only when the current phase's question count is **≥** `min_questions_per_phase`.
   - If `max_questions_per_phase` is `None` (unlimited), no upper bound check.

**Max Questions Per Phase — Soft Cap (Resolved):**
When `max_questions_per_phase` is configured:
- **Soft cap with grace:** Accept phase completion when the agent signals complete and question count ≤ `max + 1` (one grace question for wrap-up).
- **Force-complete:** If question count exceeds `max + 1` without the agent signaling complete, force-complete the phase:
  - Emit a `phase.force_completed` seglog event with `reason: "max_questions_exceeded"`.
  - Use the answers collected so far as the phase output.
  - Log a warning: "Phase [X] force-completed after [N] questions (max: [max])."
- **No reject:** Never reject a phase that has already collected valid answers. The cap prevents runaway agent loops, not data loss.
- Config: `interview.phases.{phase_name}.max_questions` (per-phase), `interview.max_questions_per_phase` (global default).

3. **Wiring (full path):**
   - **Types:** Add to `InterviewGuiConfig` and `InterviewConfig`: `min_questions_per_phase: u32`, `max_questions_per_phase: Option<u32>` (and remove or repurpose the old single `max_questions_per_phase`).
   - **Execution config:** Add the same two fields to `InterviewOrchestratorConfig` (`interview/orchestrator.rs`).
   - **Construction:** In `app.rs`, when building `InterviewOrchestratorConfig` from `gui_config.interview`, set `min_questions_per_phase` and `max_questions_per_phase` from `gui_config.interview`.
   - **Phase manager:** Pass these into phase definitions or into `PhaseManager` (e.g. in `default_phases()` / `add_dynamic_phase()`), so each phase has min/max available.
   - **Orchestrator logic:** In `process_ai_turn` (or equivalent), when `parsed.is_phase_complete`, compute current phase question count; if count < min, reject (e.g. send back "Ask at least N questions"); if max is `Some(m)` and count > m, either reject or accept depending on product rule; otherwise accept.
   - **Prompts:** In `prompt_templates.rs` (or equivalent), inject the configured min (and max if set) into the instructions, e.g. "Ask at least {min} questions..." and "Do not exceed {max} questions..." when max is set.
   - **GUI:** Interview tab: replace single max control with Min (number input) and Max (number input + "Unlimited" option). Use existing DRY widgets and tooltips.
   - **Docs:** AGENTS.md or interview doc: document min/max and Unlimited; tooltips in Config.
   - **Tests:** Unit tests for min/max logic (accept/reject at boundaries); integration test that builds config from `gui_config` and runs one phase; env-gated smoke if needed.

### Other unwired interview settings -- resolution

- **`require_architecture_confirmation`**
  **Intended behavior:** Before leaving certain phases (e.g. architecture/tech stack), the interview requires explicit user or agent confirmation of architecture/tech choices.
  **Wiring:** Add `require_architecture_confirmation: bool` to `InterviewOrchestratorConfig`; set from `gui_config.interview` in `app.rs`. In the interview flow, add a step or phase gate that, when this is true, waits for or prompts for explicit confirmation (e.g. a dedicated phase or a prompt line) before allowing phase complete. Document in interview prompts and in AGENTS.md.

- **`vision_provider`**
  **Intended behavior:** When the interview or follow-up uses image/vision (e.g. screenshots, diagrams), this setting selects the preferred platform for vision-capable requests.
  **Wiring:** Add `vision_provider: String` to `InterviewOrchestratorConfig`; set from `gui_config.interview` in `app.rs`. When building requests that include images, use this platform (filtered by platform_specs vision capability). If no image flow exists yet, wire the field and leave the behavior as "use when implementing image/vision flows"; document that in the plan or code.

### Main-run config source note

The **main orchestrator** (run loop) gets config via `ConfigManager::discover()` and `get_config()` (i.e. from disk as `PuppetMasterConfig`). The Config tab saves `GuiConfig` to the same path. Ensure the saved YAML shape is compatible with `PuppetMasterConfig` for all execution-affecting fields (tiers, orchestrator, interview, etc.) so that saving from the Config tab does not drop or default values that the run expects. If the run uses a project hint (e.g. current project path), prefer `ConfigManager::discover_with_hint(project_path)` so the run uses the same file the user edited.

---

