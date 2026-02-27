## Potential Issues

Risks, edge cases, and failure modes to watch during implementation and testing.

### 1. Default for `use_plan_mode_all_tiers` and existing configs

- **Issue:** If we default `use_plan_mode_all_tiers` to `true`, the first time an existing project loads (with no such key), we might force all tiers to plan mode and overwrite user's previous per-tier choices.
- **Mitigation:** Default `use_plan_mode_all_tiers` to `false` so existing configs are unchanged. Only users who turn the global toggle on get "all tiers plan mode." Optionally, when the key is missing, do not force tier values on load.

### 2. Invalid subagent names in overrides

- **Issue:** User can type or paste invalid names in tier overrides or disabled/required lists. Orchestrator or platform CLI may then receive unknown names and fail or misbehave.
**Subagent Name Validation (Resolved):**

**In UI (GUI config):**
- Use **autocomplete/multi-select** populated from the canonical subagent name registry. Invalid names cannot be entered.
- If a name is typed that doesn't match any registered subagent, show inline error: "Unknown subagent: [name]. Check spelling or register the subagent first."

**On save/apply:**
- **Reject** invalid entries with a clear error message. Do not save config with invalid subagent names.

**In backend (execution):**
- **Fail fast** with a clear error: "Unknown subagent '[name]' in tier config. Available: [list]." Do not silently filter.
- Emit `config.validation.failed` seglog event.

**Canonical subagent name registry:** Maintained in `platform_specs` or a dedicated `subagent_registry` module. Names are stable strings (kebab-case, e.g., `architect-reviewer`, `security-auditor`).

### 3. Gemini API key validation

- **Issue:** Gemini is a Direct API provider. The Doctor check must validate that a Google Gemini API key is present and valid when any tier uses Gemini.
- **Mitigation:** (1) **Key:** Check for the configured Gemini API key in app settings. (2) **Validation:** Optionally send a lightweight API probe to verify the key is active. (3) **Errors:** If no key is configured and a tier uses Gemini, Doctor should warn "Gemini API key is not configured; Gemini tiers will fail."

### 4. Doctor check when config is not GuiConfig

- **Issue:** Some projects may use a different config format (e.g. legacy or alternate YAML shape). `gui_config::load_config` might fail or return a partial struct.
- **Mitigation:** In the Gemini plan-mode check, if load fails or tiers are missing, skip the check or emit a neutral warning ("could not load tier config; ensure config file is valid") so Doctor doesn't fail hard.

### 5. Wizard vs Config and global plan mode

- **Issue:** Wizard has its own `wizard_tier_configs`; even with default plan mode set to false, we must ensure that when the user finishes the wizard and a run is created, we don't overwrite or ignore the global `use_plan_mode_all_tiers` from Config (or vice versa).
- **Mitigation:** **Decision:** When the user completes the Wizard and creates a run, use Wizard tier config as the source of truth for that run (platform, model, plan_mode per tier). When Wizard persists to the config file (e.g. on Save or Apply), merge with existing Config: apply "global plan mode on ⇒ set all tier plan_mode true" and write subagent config from Config if present, so the saved file stays consistent. Wizard UI does not need the global plan-mode toggle; per-tier plan mode toggles (and optional "Enable plan mode for all tiers" button) are enough.

### 6. Tier overrides are per tier type, not per node

- **Issue:** Overrides are keyed by tier type (phase, task, subtask, iteration). All parallel subtasks share the same "subtask" override list, so we can't say "Subtask A: rust-engineer, Subtask B: react-specialist" via overrides.
- **Mitigation:** Accept for v1 that overrides are per tier type. Document that per-node overrides (or context-aware overrides) are out of scope for the first version. Dynamic selection (language/framework) still differentiates parallel subtasks when overrides are not set.

### 7. Subagent personas and non-Cursor platforms

- **Issue:** Plan describes "Cursor subagent personas." Codex, Claude, Gemini, Copilot may not recognize the same names or syntax (e.g. `/code-reviewer` vs prompt preamble).
- **Mitigation:** In platform runners, when building the prompt or args for a subagent, use platform_specs or a small adapter (e.g. `subagent_prompt_prefix(platform, subagent_name) -> String`) so that: Cursor => `/subagent_name ` + user prompt; Codex/Claude/Gemini/Copilot => "As <subagent_name>, " + user prompt in system or first message, or omit if platform has no convention. Document in AGENTS.md which platforms support which subagent semantics. Implement the adapter so adding a new platform is a single match arm or config entry.

### 8. Caching of project context / language detection

- **Issue:** Subagent selection runs language/framework detection (e.g. filesystem reads). If run on every tier or every iteration, it could be slow or redundant.
- **Mitigation:** Cache detection per workspace path (cache key: canonical workspace path). Invalidate when the config is reloaded or the workspace path for the run changes. Expose a single entry point (e.g. `get_project_context(workspace) -> Result<ProjectContext>`) that returns cached value if valid. Phase 1/2 implement this; the orchestrator calls that entry point instead of running detection on every tier. Consider a TTL or "cache for the duration of the run" so long sessions don't hold stale data if the user edits the repo.

### 9. Required vs disabled subagents conflict

- **Issue:** User could add the same name to both "required" and "disabled." Backend behavior could be ambiguous.
- **Mitigation:** **Rule: required wins.** When building the final subagent list: (1) Start from selected list or override list. (2) Add all names in `required_subagents`. (3) Remove any name in `disabled_subagents` unless it is in `required_subagents`. Document this in code and in the Config UI tooltip. In the UI, optionally grey out or hide in the disabled list any name that appears in required.

### 10. Meaning of empty override list

- **Issue:** If `tier_overrides.phase = []`, does that mean "no subagents for phase" or "no override; use auto-selected list"?
- **Mitigation:** **Rule: missing or empty override = use auto-selection.** Only a non-empty override list for a tier replaces the selector output. To force no subagents for a tier, the user sets `enable_tier_subagents` false (global) or we add a per-tier "use no subagents" option in a later version. **Implement:** In the orchestrator, if `tier_overrides.get(tier)` is `None` or `Some([])`, use the list from `SubagentSelector::select_for_tier`; otherwise use the override list. Document in code and in the Config tooltip for tier overrides.

### 11. Persistence and dirty state

- **Issue:** User toggles global plan mode or subagent settings and switches tab or closes before save. Changes could be lost or only partially written.
- **Mitigation:** Follow existing Config save behavior: save on explicit Save action and/or mark dirty and prompt on leave. Ensure `use_plan_mode_all_tiers`, `last_per_tier_plan_mode` (if used), and the full `subagent` block (SubagentGuiConfig) are part of the same `GuiConfig` struct and are written in the same `gui_config::save_config()` call from the Config view so we never persist only tier config without plan-mode global or subagent settings. When the user clicks Save on any Config tab, the entire `gui_config` (including these fields) is serialized to the same YAML file.

### 12. Start/end verification overhead and quality definition

- **Issue:** Start and end verification at every Phase/Task/Subtask (wiring, readiness, acceptance, quality) adds latency and requires a clear definition of "quality" and who addresses unrelated failures.
- **Mitigation:** (1) Quality over performance: run full checks; do not skip or weaken for speed. Scope quality checks to changed files or this tier's artifacts to stay practical. (2) Define a small canonical quality checklist per tier (e.g. in this plan or verification config): reviewer subagent (required) plus gate criteria (clippy, tests, etc.). (3) Reviewer subagent runs in all three cases: always at end-of-tier, on retry, and when quality gate fails. (4) Unrelated failures (e.g. pre-existing tech debt) are addressed by the parent-tier orchestrator (retry, different subagent, escalate). Reuse existing gates where possible; end verification should call into current gate logic rather than duplicate it.

### 13. Platform-specific hook integration and parser reliability

- **Issue:** Lifecycle hooks and structured handoff validation require platform-specific implementations (native hooks vs orchestrator middleware, JSON vs JSONL vs text parsing). Parsers may fail on edge cases (malformed JSON, missing sections in text, JSONL aggregation errors).
- **Mitigation:** (1) **Hooks:** For platforms with native hooks (Cursor, Claude, Gemini), register Puppet Master hooks that delegate to platform hooks where possible; for others (Codex, Copilot), use orchestrator-level middleware. Document which platforms use which approach. (2) **Parsers:** Implement robust parsers with fallback behavior: JSON parsers handle missing fields gracefully; JSONL parser aggregates events safely (last event wins, accumulate findings); text parser uses multiple patterns and validates extracted sections. (3) **Fail-safe:** If parsing fails after retry, create partial `SubagentOutput` and mark tier as "complete with warnings" rather than crashing. (4) **Testing:** Add integration tests for each platform's parser with malformed input, missing fields, and edge cases to ensure reliability.

### 14. Subagent persona overrides (token budget and scope)

- **Issue:** Custom instruction snippets in persona overrides could be long; injecting them into every subagent prompt may consume token budget or conflict with platform limits.
- **Mitigation:** (1) Persona overrides apply to any subagent name that exists in the current list (preloaded from `.claude/agents` or user-added). Keys in `persona_overrides` are names the user has edited in the Personas UI; no separate "second source" -- overrides come only from config (user's saved edits). (2) Optionally cap length of `custom_instruction` / `custom_description` in UI and config (e.g. 500-1000 chars) and document that persona text is prepended to the prompt so users are aware of token impact. (3) Use the same resolution (override if present, else preloaded content) in both orchestrator and interview.

---

