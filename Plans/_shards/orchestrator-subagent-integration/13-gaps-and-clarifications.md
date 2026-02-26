## Gaps and Clarifications

These items are underspecified or inconsistent in the plan. Resolve them during implementation so frontend and backend work end-to-end.

### 1. Where to persist `use_plan_mode_all_tiers`

- **Gap:** The plan says add to "GuiConfig or app settings that save to `.puppet-master/settings.json`".
- **Clarify:**

**Plan Mode Global State (Resolved — Option A: GuiConfig):**
- Add `use_plan_mode_all_tiers: bool` to `GuiConfig`.
- Default: `false` (migration-safe; users opt in).
- Persisted in redb (`config:gui.use_plan_mode_all_tiers`).
- SSOT: this field in GuiConfig. `settings.json` is NOT used for this setting.
- GUI: toggle in Settings → Orchestration → "Use plan mode for all tiers" checkbox.
- Per-tier overrides still available (stored separately in tier config).

### 2. Subagent config in GuiConfig

- **Gap:** Plan says load subagent config from `.puppet-master/config.yaml` under `subagentConfig`, and "single save path that includes subagent config," but **GuiConfig** (in `config/gui_config.rs`) has no `subagentConfig` field.
- **Clarify:** Add a top-level field to **GuiConfig**, e.g. `subagent: SubagentGuiConfig`, with `enable_tier_subagents`, `tier_overrides`, `disabled_subagents`, `required_subagents`. Serialize as `subagentConfig` in YAML (or `subagent` with serde rename) so load/save use the same file as the rest of Config. Ensure default in GuiConfig matches plan defaults (enable_tier_subagents: true, empty overrides/lists). **Persona overrides:** For the "Subagent personas / info setup" feature, add `persona_overrides: HashMap<String, PersonaOverride>` to `SubagentGuiConfig`. **Persona overrides come from exactly one place:** the user's edits in the Subagent Personas UI; when the user clicks Save, those edits are written to the same config file as the rest of Config (e.g. `subagentConfig.personaOverrides` in YAML). Key = subagent name, value = optional custom description and/or instruction snippet. At runtime: if an override exists for that name, use it; else use content from the preloaded agent (e.g. from `.claude/agents` or trimmed copy). Orchestrator and interview both read the same config.

### 3. Doctor Gemini plan-mode check: source of tier config

- **Gap:** The check must know "any tier has platform Gemini and plan_mode == true." Doctor checks currently have `async fn run(&self) -> CheckResult` with no parameters.
- **Clarify:** The Gemini plan-mode check should **discover and load the project config** inside `run()`: use `config_discovery::discover_config_path(None)` then `gui_config::load_config(path)` (or the same loader the Config page uses). If the file is not GuiConfig-shaped, fall back to "skip check" or "warn: could not read tier config." This keeps the DoctorCheck trait unchanged and uses the same config file as the app.

### 4. Canonical list of subagent names

- **Gap:** The plan scatters subagent names across Tier-Level Subagent Strategy (project-manager, rust-engineer, code-reviewer, ...). The GUI and backend need a **single shared list** for validation and multi-select.
- **Clarify:** Add a **"Known subagent names"** section or table in this plan (or a constant in code, e.g. in `platform_specs` or a new `subagent_registry` module) listing all allowed names: phase (project-manager, architect-reviewer, product-manager), task (rust-engineer, python-pro, ..., backend-developer, ...), subtask (code-reviewer, test-automator, ...), iteration (debugger, qa-expert, ...). Use this for UI multi-select and for validating override/disabled/required lists.

**Known subagent names (canonical list for UI and validation):**

**DRY:DATA:subagent_registry** -- Single source of truth for all subagent names. This list must be implemented as a constant or module (`src/core/subagent_registry.rs`) and used for:
- UI multi-select/autocomplete
- Validation of override/disabled/required lists
- Language/framework → subagent mapping
- Platform availability checks
- **Task tool** (`Plans/Tools.md`): `subagent_type` must be one of these names; validate with `subagent_registry::is_valid_subagent_name()`

**Full set: 41 subagents.** Persona definitions (SKILL.md) live in `.github/agents/` and `.claude/agents/` (41 files). The orchestrator and interview use subsets by tier/phase; the **task** tool accepts any valid name from this list.

| Category | Names |
|----------|--------|
| Phase | `project-manager`, `architect-reviewer`, `product-manager` |
| Task (language) | `rust-engineer`, `python-pro`, `javascript-pro`, `typescript-pro`, `swift-expert`, `java-architect`, `csharp-developer`, `php-pro`, `golang-pro` |
| Task (domain) | `backend-developer`, `frontend-developer`, `fullstack-developer`, `mobile-developer`, `devops-engineer`, `database-administrator`, `security-auditor`, `performance-engineer` |
| Task (framework) | `react-specialist`, `vue-expert`, `nextjs-developer`, `laravel-specialist` |
| Subtask | `code-reviewer`, `test-automator`, `technical-writer`, `api-designer`, `ui-designer`, `security-engineer`, `accessibility-tester`, `compliance-auditor` |
| Iteration | `debugger`, `qa-expert` |
| Cross-phase / Interview | `ux-researcher`, `sql-pro`, `prompt-engineer`, `knowledge-synthesizer`, `deployment-engineer`, `context-manager`, `explore` |

**Implementation:** Create `src/core/subagent_registry.rs` with:

**DRY REQUIREMENT:** This module is the SINGLE SOURCE OF TRUTH for all subagent names. DO NOT hardcode subagent names anywhere else in the codebase. All code that needs subagent names MUST use functions from this module.

```rust
// DRY:DATA:subagent_registry — Canonical list of all subagent names
// DRY REQUIREMENT: This is the ONLY place subagent names should be defined. All other code MUST use functions from this module.
pub mod subagent_registry {
    use std::collections::HashMap;
    
    // DRY:DATA:subagent_names_by_category — Subagents grouped by tier/category
    pub const PHASE_SUBAGENTS: &[&str] = &[
        "project-manager",
        "architect-reviewer",
        "product-manager",
    ];
    
    pub const TASK_LANGUAGE_SUBAGENTS: &[&str] = &[
        "rust-engineer",
        "python-pro",
        "javascript-pro",
        "typescript-pro",
        "swift-expert",
        "java-architect",
        "csharp-developer",
        "php-pro",
        "golang-pro",
    ];
    
    pub const TASK_DOMAIN_SUBAGENTS: &[&str] = &[
        "backend-developer",
        "frontend-developer",
        "fullstack-developer",
        "mobile-developer",
        "devops-engineer",
        "database-administrator",
        "security-auditor",
        "performance-engineer",
    ];
    
    pub const TASK_FRAMEWORK_SUBAGENTS: &[&str] = &[
        "react-specialist",
        "vue-expert",
        "nextjs-developer",
        "laravel-specialist",
    ];
    
    pub const SUBTASK_SUBAGENTS: &[&str] = &[
        "code-reviewer",
        "test-automator",
        "technical-writer",
        "api-designer",
        "ui-designer",
        "security-engineer",
        "accessibility-tester",
        "compliance-auditor",
    ];
    
    pub const ITERATION_SUBAGENTS: &[&str] = &[
        "debugger",
        "qa-expert",
    ];
    
    // Cross-phase / Interview (used by interview-subagent-integration.md and task tool)
    pub const CROSS_PHASE_SUBAGENTS: &[&str] = &[
        "ux-researcher",
        "sql-pro",
        "prompt-engineer",
        "knowledge-synthesizer",
        "deployment-engineer",
        "context-manager",
        "explore",
    ];
    
    // DRY:DATA:all_subagent_names — Union of all subagent names (41 total)
    pub fn all_subagent_names() -> Vec<String> {
        let mut all = Vec::new();
        all.extend(PHASE_SUBAGENTS.iter().map(|s| s.to_string()));
        all.extend(TASK_LANGUAGE_SUBAGENTS.iter().map(|s| s.to_string()));
        all.extend(TASK_DOMAIN_SUBAGENTS.iter().map(|s| s.to_string()));
        all.extend(TASK_FRAMEWORK_SUBAGENTS.iter().map(|s| s.to_string()));
        all.extend(SUBTASK_SUBAGENTS.iter().map(|s| s.to_string()));
        all.extend(ITERATION_SUBAGENTS.iter().map(|s| s.to_string()));
        all.extend(CROSS_PHASE_SUBAGENTS.iter().map(|s| s.to_string()));
        all
    }
    
    // DRY:DATA:language_to_subagent_mapping — Language → subagent mapping
    pub fn get_subagent_for_language(lang: &str) -> Option<String> {
        let mapping: HashMap<&str, &str> = HashMap::from([
            ("rust", "rust-engineer"),
            ("python", "python-pro"),
            ("javascript", "javascript-pro"),
            ("typescript", "typescript-pro"),
            ("swift", "swift-expert"),
            ("java", "java-architect"),
            ("csharp", "csharp-developer"),
            ("php", "php-pro"),
            ("go", "golang-pro"),
        ]);
        
        mapping.get(lang).map(|s| s.to_string())
    }
    
    // DRY:DATA:framework_to_subagent_mapping — Framework → subagent mapping
    pub fn get_subagent_for_framework(framework: &str) -> Option<String> {
        let framework_lower = framework.to_lowercase();
        let mapping: HashMap<&str, &str> = HashMap::from([
            ("react", "react-specialist"),
            ("vue", "vue-expert"),
            ("nextjs", "nextjs-developer"),
            ("next.js", "nextjs-developer"),
            ("laravel", "laravel-specialist"),
        ]);
        
        mapping.get(framework_lower.as_str()).map(|s| s.to_string())
    }
    
    // DRY:FN:is_valid_subagent_name — Validate subagent name against canonical list
    pub fn is_valid_subagent_name(name: &str) -> bool {
        all_subagent_names().contains(&name.to_string())
    }
    
    // DRY:FN:get_subagents_for_tier — Get subagents available for a tier type
    pub fn get_subagents_for_tier(tier_type: TierType) -> Vec<String> {
        match tier_type {
            TierType::Phase => PHASE_SUBAGENTS.iter().map(|s| s.to_string()).collect(),
            TierType::Task => {
                let mut all = Vec::new();
                all.extend(TASK_LANGUAGE_SUBAGENTS.iter().map(|s| s.to_string()));
                all.extend(TASK_DOMAIN_SUBAGENTS.iter().map(|s| s.to_string()));
                all.extend(TASK_FRAMEWORK_SUBAGENTS.iter().map(|s| s.to_string()));
                all
            }
            TierType::Subtask => SUBTASK_SUBAGENTS.iter().map(|s| s.to_string()).collect(),
            TierType::Iteration => ITERATION_SUBAGENTS.iter().map(|s| s.to_string()).collect(),
        }
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

Use the union of all names for override/disabled/required lists; optionally restrict multi-select by tier in the UI.


### 5. Tier overrides: one list per tier vs contextual keys

- **Gap:** YAML shows `tierOverrides.phase.default`, `.phase.architecture`, `.phase.product`, `.task.rust`, `.task.python`, etc. The GUI section says "for each tier (phase/task/subtask/iteration), a text field or list editor for override subagent names."
- **Clarify:** Decide (a) **Simple:** one list per tier (phase, task, subtask, iteration) so `tier_overrides` is e.g. `HashMap<TierName, Vec<String>>` and YAML is `phase: [project-manager]`, `task: [rust-engineer]`, or (b) **Full:** keep contextual keys (phase.default, phase.architecture, task.rust, ...) and add UI for them (e.g. phase: "default" / "architecture" / "product" with a list each). For first implementation, (a) is enough; document that contextual overrides can be added later if needed.

### 6. Orchestrator and subagent code not yet present

- **Gap:** The plan references `execute_tier_with_subagents`, `build_subagent_invocation`, `execute_with_subagent`, and `SubagentSelector`. These do not exist in the codebase yet; they are specified in the plan's "Integration with Orchestrator" and Phase 3.
- **Clarify:** Phase 3 (and any subagent execution path) must: (1) Read `enable_tier_subagents` from config; if false, skip subagent invocation (or use a single non-subagent path). (2) When building the list of subagents for a tier, apply `tier_overrides` (replace or merge with selected list), then filter by `disabled_subagents` and ensure `required_subagents` are included. (3) When building `ExecutionRequest` for each subagent run, set `request.plan_mode = tier_config.plan_mode`. Ensure the checklist item "Ensure subagent/invocation path receives tier plan_mode" is done in that code path.

### 7. Message enum and app.rs handlers

- **Gap:** The plan names messages (e.g. `ConfigUsePlanModeAllTiersToggled`, `ConfigEnablePlanModeAllTiers`, `ConfigSubagentEnableTierSubagentsToggled`, ...) but does not list all new `Message` variants or where each is handled in `app.rs`.
- **Clarify:** During implementation, add every new variant to the `Message` enum and a corresponding branch in `App::update`. Document in the plan or in code: "Plan mode global: ConfigUsePlanModeAllTiersToggled, ConfigEnablePlanModeAllTiers; Subagent: ConfigSubagentEnableTierSubagentsToggled, ConfigSubagentTierOverrideChanged, ConfigSubagentDisabledListChanged, ConfigSubagentRequiredListChanged."

### 8. Tier id type for `last_per_tier_plan_mode`

- **Gap:** Plan says `last_per_tier_plan_mode: Option<HashMap<TierId, bool>>`. The codebase uses tier names as strings (e.g. `"phase"`, `"task"`).
- **Clarify:** Use `HashMap<String, bool>` keyed by tier name (`"phase"`, `"task"`, `"subtask"`, `"iteration"`) unless a dedicated `TierId` type already exists; then use that consistently.

### 9. Interview config wiring and execution config

- **Gap:** Several interview settings exist in `InterviewGuiConfig` and `InterviewConfig` but are not in `InterviewOrchestratorConfig` and are never used in `interview/` (orchestrator, phase_manager, prompt_templates). See **"Interviewer Enhancements and Config Wiring"** and **"Avoiding Built but Not Wired"** in this plan.
- **Clarify:** (1) **Min/max questions:** Add `min_questions_per_phase` and `max_questions_per_phase` (Option for unlimited) to `InterviewOrchestratorConfig`; set from `gui_config.interview` in `app.rs`; pass into PhaseManager and use in phase-complete logic and prompts. (2) **require_architecture_confirmation** and **vision_provider:** Add to `InterviewOrchestratorConfig`, set at construction, and use in interview flow (architecture gate and vision platform selection). (3) For any future execution-affecting interview setting, follow the three-step wiring checklist: add to execution config, set at construction, use in runtime.

### 10. Platform-specific subagent output parsers

- **Gap:** Structured handoff validation (`validate_subagent_output`) needs platform-specific parsers: JSON for Cursor/Claude/Gemini, JSONL for Codex, text parsing for Copilot. The plan does not yet specify parser implementation details or fallback behavior when parsing fails.
- **Clarify:** (1) **JSON parsers:** For Cursor/Claude/Gemini, use `serde_json` to parse `--output-format json` output into `SubagentOutput`. Handle missing fields gracefully (e.g., `downstream_context: None` if field absent). (2) **JSONL parser:** For Codex, parse `--json` or `--experimental-json` JSONL stream; aggregate events into single `SubagentOutput` (last event wins for fields, accumulate findings). (3) **Text parser:** For Copilot, use regex or pattern matching to extract "Task Report:", "Downstream Context:", "Findings:" sections from text output. If sections missing, treat as malformed and retry. (4) **Fallback:** If parsing fails after retry, create partial `SubagentOutput { task_report: raw_output, downstream_context: None, findings: vec![] }` and mark tier as "complete with warnings" rather than failing the run.

**Subagent Output Parser Fallback (Resolved):**

Platform-specific parsers handle output from each Provider:
- **Cursor/Claude/Gemini:** JSON parser (stream-json NDJSON events)
- **Codex:** JSONL parser (newline-delimited JSON events)
- **Copilot:** Text parser (plain text output, regex-based signal extraction)

When a platform-specific parser fails:
1. **Log:** Record parse error in seglog (`parser.error` event) with the first 500 characters of raw output for diagnostics.
2. **Generic fallback:** Attempt generic text extraction — scan for completion signals (including legacy naming variants), error patterns (stack traces, "error:", "fatal:"), and file modification markers.
3. **If generic succeeds:** Use extracted data; flag the turn as `parser_fallback_used` in seglog metadata.
4. **If generic also fails:** Treat as a Provider error. Retry once with the same Provider. If retry also fails, surface error to user: "Could not parse output from [Provider]. [Retry] [Skip] [View raw output]."
5. **Never silently drop output.** All raw output is preserved in the seglog event regardless of parse success.

### 11. Subagent persona info: preload, overrides (config only), and injection

- **Gap:** The "Subagent personas / info setup" (Section 5) requires (a) initial persona list and content, (b) user overrides persisted somewhere, and (c) persona text injected when a subagent is invoked. The plan now specifies preloading from `.claude/agents`, user add/delete, and optional AI trim; `SubagentGuiConfig` (Gap §2) holds `persona_overrides`; the injection point must be explicit.
- **Clarify:** (1) **Preload and list:** Load personas from the project's `.claude/agents` (e.g. repo root or `puppet-master-rs`); each `.md` file gives name and content. User can add custom personas and delete any (including preloaded). Optionally run an AI/batch trim step to produce smaller-footprint descriptions. (2) **Persona overrides -- single source:** Overrides come **only** from the user's edits in the Personas UI; we persist them to `SubagentGuiConfig.persona_overrides` in the same config file as the rest of Config. No other "source" of overrides. At runtime: for a given subagent name, if `persona_overrides.get(name)` is present, use it; else use the content from the preloaded/trimmed agent. (3) **Injection:** When building the prompt or CLI args for a subagent run, resolve persona text (override if present, else preloaded content) and prepend or append to the system prompt or first user message. Document the injection point so orchestrator and interview use the same logic. (4) **Interview:** Interview uses **multiple** personas **dynamically** by phase and tech stack (phase_subagents, research/validation subagents, etc.). For whichever subagent(s) are selected for that phase/context, resolve that subagent's persona content (override from config if present, else preloaded); inject into the phase prompt. Persona_overrides do not change *which* subagents the interview uses -- they only supply the custom description/instruction for those selected subagents.

---

