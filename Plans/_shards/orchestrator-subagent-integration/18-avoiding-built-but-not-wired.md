## Avoiding "Built but Not Wired"

To prevent users from hitting settings that exist in the UI and requirements but never affect execution, this plan adopts **two complementary approaches**: (A) **process and explicit wiring steps**, and (B) **tier-level config-wiring validation** at Phase, Task, Subtask, and Iteration.

### Approach A: Process -- explicit wiring steps and checklist

**Rule:** For every new config or feature that **affects execution** (interview limits, tier plan_mode, subagent toggles, etc.), the implementation **must** include explicit wiring steps. This applies to both the orchestrator/subagent work and to other flows (e.g. interview, start-chain, Doctor).

**Wiring checklist (per feature/setting):**

1. **Execution config type:** Add the field to the **runtime config** used by the component that executes (e.g. `InterviewOrchestratorConfig`, or the `PuppetMasterConfig` / tier config used by the main orchestrator). Do not only add it to GUI or file-only config.
2. **Construction / load:** When building that runtime config from GUI or from file (e.g. in `app.rs` when starting the interview, or when the run loads config), **set** the field from the source of truth (e.g. `gui_config.interview.*`, or `config.tiers.phase.*`).
3. **Runtime use:** In the execution path (orchestrator, phase manager, prompt builder, runner), **read** the field and use it to decide behavior (e.g. min/max question checks, plan_mode, subagent list). No "dead" fields in the execution config.

**Where to document:**

- **This plan:** The "Interviewer Enhancements and Config Wiring" and "Avoiding Built but Not Wired" sections are the canonical description. New features that add execution-affecting config should reference this checklist in their implementation notes.
- **AGENTS.md:** Add a short subsection (e.g. under "DO" or "Pre-Completion Verification Checklist") that says: for any new execution-affecting config, follow the three-step wiring checklist (add to execution config, set at construction, use in runtime). Link to this plan or to REQUIREMENTS.md if a more detailed wiring policy is written there.
- **REQUIREMENTS.md (optional):** If the project keeps a requirements doc, add a line under non-functional or process requirements: "All execution-affecting configuration must be wired: present in execution config, set when building from GUI/file, and used in the execution path."

**Who does it:** Implementers and reviewers. Code review should verify that new settings that appear in the Config UI or config file have a corresponding execution-config field and usage in the right module (interview, core/orchestrator, etc.).

**UI wiring enforcement (GUI projects):** For user projects that include a GUI, the wiring matrix (`.puppet-master/project/ui/wiring_matrix.json`) and command catalog (`.puppet-master/project/ui/ui_command_catalog.json`) serve as the mechanical enforcement of "built but not wired" for the UI layer. Every interactive element must appear in the wiring matrix with a bound command and handler; orphan elements and orphan commands are both validation failures. This complements the config-wiring validation (Approach B) by extending "no unwired features" to the UI surface of the user project. The orchestrator's tier-boundary validation (§Start and End Verification) includes a UI wiring check for nodes with UI scope.

### Approach B: Tier-level config-wiring validation (Phase / Task / Subtask / Iteration)

**Rule:** The orchestrator (or a shared validation layer) runs a **config-wiring check at each tier boundary** -- when entering a Phase, when entering a Task, when entering a Subtask, and when entering an Iteration. The check verifies that the config that **should** affect execution at that tier is **present and actually used** (e.g. tier config exists, plan_mode is read from config, interview limits are present in interview config when in interview flow). This catches "built but not wired" even when the checklist is missed.

**Rationale for "at each tier":** A single run-start check can miss tier-specific wiring (e.g. task-tier plan_mode not applied for a task). Checking at Phase, Task, Subtask, and Iteration ensures that the config in effect for that tier is the one the code path uses, and that no tier is accidentally running with defaults or stale values.

**What to validate (by tier):**

- **Phase (start of phase):**
  - Tier config for phase is present (platform, model, plan_mode, etc.).
  - If global plan-mode is used, it is reflected in phase tier config (or explicitly overridden).
  - If this run is an **interview** run: interview execution config (e.g. `InterviewOrchestratorConfig`) includes min/max questions and any other execution-affecting interview fields that the interview flow is supposed to use; if any are missing, validation fails or warns (see below).
- **Task (start of task):**
  - Tier config for task is present and matches config source (e.g. from run config).
  - Subagent config (if subagents enabled) is present and applied (e.g. overrides, disabled, required lists are read from config).
- **Subtask (start of subtask):**
  - Tier config for subtask is present.
  - Subagent list for this subtask is derived from config (selector + overrides) and not hardcoded.
- **Iteration (start of iteration):**
  - Tier config for iteration is present (platform, model, plan_mode).
  - Iteration request (e.g. `ExecutionRequest`) is built using that tier config (plan_mode, platform, model), not defaults.

**How to implement:**

- **Single validation entry point:** Introduce a function or small module, e.g. `validate_config_wiring_for_tier(tier_type, config_snapshot, context) -> Result<(), WiringError>`. It receives the current tier type (Phase/Task/Subtask/Iteration), the config (or the relevant slice: tier config, interview config, subagent config), and optional context (e.g. "interview run" vs "main run"). It checks the items above for that tier and returns Ok or an error listing what is missing or unused.
- **Where to call:** In the main orchestrator, at the point where execution **enters** a new Phase, Task, Subtask, or Iteration (e.g. immediately before building the execution context or spawning the agent for that tier), call this validator. For the **interview** orchestrator, call an interview-specific validator at phase start (and at any sub-tier if the interview has task/subtask-like boundaries) that checks `InterviewOrchestratorConfig` for min/max, require_architecture_confirmation, vision_provider.
- **Fail-fast vs warn:** **Recommendation:** Fail fast (return error, log, and surface to user) when a **required** execution-affecting field is missing from the execution config (e.g. tier config for that tier is absent). **Warn** (log and optionally toast) when a field exists in GUI/file config but is not present in the execution config (classic "built but not wired"). This keeps runs from proceeding with wrong config while highlighting wiring gaps without blocking if the product chooses to allow default behavior for optional fields.
- **Tests:** Add unit tests that build config from `gui_config` (or from a minimal `PuppetMasterConfig`), then call the validator for each tier type; assert that when a known execution-affecting field is missing from the execution config, the validator fails or warns as specified. Integration test: start a run (or interview) and trigger one phase and one task; assert validation ran (e.g. via log or a test double).

**Summary table -- where validation runs:**

| Tier      | When                    | What is checked                                                                 |
|-----------|-------------------------|----------------------------------------------------------------------------------|
| Phase     | Start of phase          | Phase tier config present; plan_mode/orchestrator flags; interview config (if interview run). |
| Task      | Start of task           | Task tier config present; subagent config present and applied.                   |
| Subtask   | Start of subtask        | Subtask tier config present; subagent list from config.                          |
| Iteration | Start of iteration      | Iteration tier config present; request built from tier config.                   |

### Combining A and B

- **Process (A)** reduces wiring omissions by making the checklist mandatory for new features.
- **Validation (B)** at each Phase/Task/Subtask/Iteration catches remaining omissions and ensures that the config in effect at that tier is the one the code uses. Together, they keep "built but not wired" from reaching users.

---

