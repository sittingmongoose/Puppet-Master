# Shard 017: GUI and Backend Scope (All In-Scope Now)

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L869-L933

Source SHA256: `5fe8943c3c799a6ad0638813af2527938453cc4f716bb44dff99a52b10a54841`

---

## GUI and Backend Scope (All In-Scope Now)


All previously "optional" or "later" plan-mode and subagent GUI/backend items are **in scope now**. The following specifies frontend and backend so they work end-to-end.

### 1. Plan Mode -- Backend

- **Defaults:** In `default_config.rs`, set `plan_mode: false` for phase, task, subtask, iteration. In `config_override.rs` and YAML defaults, use `plan_mode: false` unless explicitly overridden. In `gui_config.rs`, keep tier defaults at `false` for migration-safe behavior.
- **Global "use plan mode for all tiers":** Add `use_plan_mode_all_tiers: bool` to `GuiConfig` (canonical storage; no separate `settings.json` key). Optionally add `last_per_tier_plan_mode: Option<HashMap<String, bool>>` to restore per-tier values when turning the global toggle off. When `use_plan_mode_all_tiers == true`, load/sync forces all four tier `plan_mode` values to `true`. When toggled off, restore `last_per_tier_plan_mode` or set all to `false`. Use write-through so tier configs and saved YAML stay in sync.
- **Subagent invocations:** When building `ExecutionRequest` for subagent runs (e.g. in `execute_tier_with_subagents` or the platform adapter), set `request.plan_mode = tier_config.plan_mode` (from `TierConfig` or `IterationContext`). Document in plan and code.
- **Gemini:** Gemini is a Direct API provider; plan-mode constraints are applied via API parameters. In Doctor, validate Gemini API key presence when any tier uses Gemini. No CLI settings file interaction is needed.

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

The orchestrator launches PM child runs, not provider-native ad hoc agent processes.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Personas.md, ContractName:Plans/storage-plan.md

Backend requirements:
- every delegated launch creates a canonical child-run record.
- each child is marked `required` or `optional`.
- child routing resolves requested versus effective Persona, runtime surface, model, and effort.
- capability narrowing is applied before launch.
- child lifecycle actions remain distinct: retry, reroute, replacement, resume, cancellation.
- parent orchestration state is a projected child-orchestration facet over canonical child records/events, not a separate ad hoc child-state store.

Parent orchestration responsibilities:
- maintain child rollups by batch and subgroup.
- consolidate overlapping child escalations before asking the user.
- summarize required child outcomes before optional findings.
- keep unresolved required children from being treated as complete.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md
### 5. Subagent -- Frontend (Config)

- **DRY:** Check `docs/gui-widget-catalog.md` before adding controls; use existing toggler, styled_button, layout helpers; tag new reusable widgets/helpers with `DRY:WIDGET:` or `DRY:FN:`; run `scripts/generate-widget-catalog.sh` after changes.
- **Section:** Add a "Subagents" section on the Config page (below tier cards or in a collapsible block). Controls: (1) **Enable tier subagents:** one toggle bound to `subagentConfig.enableTierSubagents`. Message e.g. `Message::ConfigSubagentEnableTierSubagentsToggled(bool)`. (2) **Tier overrides:** For each tier (phase/task/subtask/iteration), a text field or list editor for override subagent names (comma-separated or multi-select from a fixed list of known subagent names). (3) **Disabled subagents:** one list (comma-separated or tag input) for `disabledSubagents`. (4) **Required subagents:** same for `requiredSubagents`. Messages: e.g. `ConfigSubagentTierOverrideChanged(tier, list)`, `ConfigSubagentDisabledListChanged(Vec<String>)`, `ConfigSubagentRequiredListChanged(Vec<String>)`. Handler: update in-memory config and persist; backend reads from same persisted config.
- **Subagent personas / info setup:** Provide a **place to setup and view subagent personas/info** through Agent Config > Personas. (1) **Seed/import:** Discover provider-native definitions (for example the project's `.claude/agents` directory) and import them into Puppet Master Persona storage as starter content; imported files may supply the initial name and description/purpose, but they are not canonical runtime storage. (2) **User control:** Users can **add their own** Personas and **delete any** imported or user-created Persona from Puppet Master storage; protected core built-ins from `Plans/Personas.md` are read-only and not deletable. (3) **Smaller footprint:** Support an optional pass (e.g. AI or batch job) to **trim** persona content to a smaller token footprint while preserving intent; the normalized result is saved back into Puppet Master Persona storage with provenance to the imported source. (4) **Canonical Persona content -- single source:** User edits happen in the Personas UI and persist to Puppet Master Persona storage defined in `Plans/Personas.md`, not to provider-native directories and not as a second runtime source in `SubagentGuiConfig`. At runtime, resolve the subagent name to the canonical Persona stored by Puppet Master; provider-native files remain import/refresh sources only. UI: Agent Config > Personas list showing name, ID, description, scope, chat/subagent eligibility, and prompt preview; "Edit" changes canonical Persona content where the Persona is mutable, while protected built-ins may only be duplicated to a non-reserved ID.
- **Discovery:** Subagent names in the override UI come from `subagent_registry` and Persona names from `persona_registry`; document so UI and backend share the same names. Removed catalog names such as `project-manager`, `product-manager`, and `context-manager` are source-lineage/import-seed vocabulary only unless a future owner decision promotes a replacement.

### 6. Doctor -- Gemini Access and Plan Mode Check

- **Check:** In `doctor/` (new check or inside existing config check): if any tier selects the Gemini family, validate the resolved Gemini provider entry and auth mode rather than assuming a Gemini API key is the primary `/only` settings surface. Gemini Direct requires an API-key-backed account; Gemini CLI may resolve OAuth, API-key, or Google/Vertex credential account rows according to `Plans/Multi-Account.md` and `Plans/Contracts_V0.md`.
- **Project-context UX:** Gemini OAuth checks expose explicit `project-context` fields/UX: optional configured Google Cloud project id, effective resolved project id, and `validation-required` / `onboarding-needed` states before onboarding or plan-mode execution continues. These values are account readiness evidence, not Orchestrator-owned project artifacts.
- **GUI/spec copy:** Config, Wizard, and Doctor GUI text must say "Configure Gemini access" or name the resolved auth mode; it MUST NOT frame "Gemini API key" as the primary or `/only` settings path when OAuth or Google/Vertex credential modes are valid for the selected provider entry.

### 7. Implementation Checklist (GUI & Backend -- Add/Expand)


See the updated **Implementation checklist** below; it includes all of the above as concrete tasks.

---
