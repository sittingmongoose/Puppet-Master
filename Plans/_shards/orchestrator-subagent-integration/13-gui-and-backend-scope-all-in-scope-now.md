## GUI and Backend Scope (All In-Scope Now)

All previously "optional" or "later" plan-mode and subagent GUI/backend items are **in scope now**. The following specifies frontend and backend so they work end-to-end.

### 1. Plan Mode -- Backend

- **Defaults:** In `default_config.rs`, set `plan_mode: false` for phase, task, subtask, iteration. In `config_override.rs` and YAML defaults, use `plan_mode: false` unless explicitly overridden. In `gui_config.rs`, keep tier defaults at `false` for migration-safe behavior.
- **Global "use plan mode for all tiers":** Add `use_plan_mode_all_tiers: bool` to `GuiConfig` (canonical storage; no separate `settings.json` key). Optionally add `last_per_tier_plan_mode: Option<HashMap<String, bool>>` to restore per-tier values when turning the global toggle off. When `use_plan_mode_all_tiers == true`, load/sync forces all four tier `plan_mode` values to `true`. When toggled off, restore `last_per_tier_plan_mode` or set all to `false`. Use write-through so tier configs and saved YAML stay in sync.
- **Subagent invocations:** When building `ExecutionRequest` for subagent runs (e.g. in `execute_tier_with_subagents` or the platform adapter), set `request.plan_mode = tier_config.plan_mode` (from `TierConfig` or `IterationContext`). Document in plan and code.
- **Gemini:** In Doctor, add a check: if any tier uses Gemini and `plan_mode == true`, warn that `experimental.plan: true` may be required in `~/.gemini/settings.json`. Optionally probe the file and only warn if the setting is missing. In Config, when platform is Gemini and plan mode is on, show a short tooltip or help: "Gemini plan mode may require `experimental.plan: true` in ~/.gemini/settings.json."

### 2. Plan Mode -- Frontend (Config)

- **DRY:** Use existing widgets from `docs/gui-widget-catalog.md` (e.g. toggler, styled_button); tag any new reusable widget with `// DRY:WIDGET:`.
- **Global toggle:** In Config, above the tier cards, add one toggle: "Use plan mode for all tiers". Message e.g. `Message::ConfigUsePlanModeAllTiersToggled(bool)`. Handler: if `true`, set all four tier configs' `plan_mode` to `true` and persist `use_plan_mode_all_tiers = true`; if `false`, set all to `false` (or restore from `last_per_tier_plan_mode`) and persist. When global is on, tier plan_mode toggles are disabled and show true; when global is off, tier toggles are editable.
- **One-click button:** Next to or under the global toggle, add button "Enable plan mode for all tiers". Message e.g. `Message::ConfigEnablePlanModeAllTiers`. Handler: set phase, task, subtask, iteration `plan_mode` to `true` and set `use_plan_mode_all_tiers = true`; persist.
- **Tooltip:** In `widgets/tooltips.rs`, update `tier.plan_mode` to: "When enabled, the AI creates a detailed plan before writing code. Recommended: enable for all tiers for more reliable, step-by-step behavior. Optional for simple iterations."
- **Persistence:** Ensure `use_plan_mode_all_tiers` (and optional `last_per_tier_plan_mode`) are saved/loaded with the rest of GUI config.

### 3. Plan Mode -- Frontend (Wizard)

- **Default for new runs:** When the Wizard builds initial tier config for a new run, set `plan_mode: false` for all tiers (from `default_config` or explicitly in wizard init). Wizard tier/plan-mode toggles should reflect this.
- **One-click:** If the Wizard has tier-level plan mode toggles, add "Enable plan mode for all tiers" (same semantics as Config) so users can align all tiers in one action.

### 4. Subagent -- Backend

- **Config model:** Add (or extend) a struct for subagent config used at runtime (e.g. in `config/` or `types/config.rs`): `enable_tier_subagents: bool`, `tier_overrides: TierSubagentOverrides` (e.g. map tier → list of subagent names), `disabled_subagents: Vec<String>`, `required_subagents: Vec<String>` (optional). Load from `.puppet-master/config.yaml` under `subagentConfig`; if missing, use defaults: `enable_tier_subagents: true`, empty overrides, empty disabled/required.
- **Orchestrator:** When selecting subagents for a tier, if `enable_tier_subagents` is false, skip subagent invocation (or use a single "general" path). If true, run selection logic then apply overrides: for that tier, if `tier_overrides` has an entry, use it (or merge/filter with selected list). Filter out any in `disabled_subagents`; optionally require any in `required_subagents`.
- **Persistence:** When the GUI changes subagent settings, write back to config (YAML or same store as rest of app config); single save path that includes subagent config.

### 5. Subagent -- Frontend (Config)

- **DRY:** Check `docs/gui-widget-catalog.md` before adding controls; use existing toggler, styled_button, layout helpers; tag new reusable widgets/helpers with `DRY:WIDGET:` or `DRY:FN:`; run `scripts/generate-widget-catalog.sh` after changes.
- **Section:** Add a "Subagents" section on the Config page (below tier cards or in a collapsible block). Controls: (1) **Enable tier subagents:** one toggle bound to `subagentConfig.enableTierSubagents`. Message e.g. `Message::ConfigSubagentEnableTierSubagentsToggled(bool)`. (2) **Tier overrides:** For each tier (phase/task/subtask/iteration), a text field or list editor for override subagent names (comma-separated or multi-select from a fixed list of known subagent names). (3) **Disabled subagents:** one list (comma-separated or tag input) for `disabledSubagents`. (4) **Required subagents:** same for `requiredSubagents`. Messages: e.g. `ConfigSubagentTierOverrideChanged(tier, list)`, `ConfigSubagentDisabledListChanged(Vec<String>)`, `ConfigSubagentRequiredListChanged(Vec<String>)`. Handler: update in-memory config and persist; backend reads from same persisted config.
- **Subagent personas / info setup:** Provide a **place to setup and view subagent personas/info**. (1) **Preload:** Load initial persona list from the project's `.claude/agents` directory (e.g. `puppet-master-rs` or repo root `.claude/agents`); each agent file (e.g. `rust-engineer.md`) supplies name and description/purpose. (2) **User control:** Users can **add their own** personas and **delete any** (including preloaded ones). (3) **Smaller footprint:** Support an optional pass (e.g. AI or batch job) to **trim** persona content to a smaller token footprint while preserving intent. (4) **Persona overrides -- single source:** The only place "overrides" come from is **user edits in the Personas UI**, saved to the same app config as the rest of Config: `SubagentGuiConfig.persona_overrides` (key = subagent name, value = optional custom description and/or instruction snippet). At runtime, for a given subagent name: if the user has saved an override for that name, use it; otherwise use the content from the preloaded/trimmed agent file. No second "source" of personas -- the list is preloaded + user-added (user can delete any); the *content* for a name is either from the agent file or from the user's saved override in config. UI: dedicated "Subagent personas" tab or subsection (Config or Setup); list showing name + description; "Edit" to set custom description/instruction (persisted to `persona_overrides`); "Add" / "Delete" for list management.
- **Discovery:** Subagent names in the override UI come from a constant list (e.g. from this plan's persona list: project-manager, architect-reviewer, product-manager, rust-engineer, python-pro, code-reviewer, test-automator, ...) or from a future subagent registry; document so UI and backend share the same names.

### 6. Doctor -- Gemini Plan Mode Check

- **Check:** In `doctor/` (new check or inside existing config check): if any tier has platform Gemini and `plan_mode == true`, check `~/.gemini/settings.json` for `experimental.plan: true` (or equivalent path); if missing, add Doctor warning: "Gemini plan mode is enabled for a tier but experimental.plan may not be set in ~/.gemini/settings.json." Prefer reading the file and only warning when plan mode is on and setting is missing.

### 7. Implementation Checklist (GUI & Backend -- Add/Expand)

See the updated **Implementation checklist** below; it includes all of the above as concrete tasks.

---

