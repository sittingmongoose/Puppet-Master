## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles. This section documents DRY requirements and violations to avoid.

### DRY Requirements

1. **Platform Data -- ALWAYS use platform_specs:**
   - ❌ **NEVER** hardcode platform CLI commands, binary names, models, auth, or capabilities
   - ✅ **ALWAYS** use `platform_specs::` functions (e.g., `platform_specs::cli_binary_names()`, `platform_specs::get_subagent_invocation_format()`, `platform_specs::supports_effort()`)
   - ✅ **ALWAYS** use `platform_specs::discover_platform_capabilities()` instead of platform match statements

2. **Subagent Names -- ALWAYS use subagent_registry:**
   - ❌ **NEVER** hardcode subagent names in match statements or mappings
   - ✅ **ALWAYS** use `subagent_registry::` functions (e.g., `subagent_registry::get_subagent_for_language()`, `subagent_registry::is_valid_subagent_name()`)
   - ✅ **ALWAYS** reference `DRY:DATA:subagent_registry` as the single source of truth

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

3. **Tag All Reusable Items:**
   - ✅ Tag reusable functions: `// DRY:FN:<name> -- Description`
   - ✅ Tag reusable data structures: `// DRY:DATA:<name> -- Description`
   - ✅ Tag reusable widgets: `// DRY:WIDGET:<name> -- Description`
   - ✅ Tag reusable helpers: `// DRY:HELPER:<name> -- Description`

4. **Widget Reuse:**
   - ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI
   - ✅ **ALWAYS** use existing widgets from `src/widgets/`
   - ✅ If bespoke UI is required, add `// UI-DRY-EXCEPTION: <reason>`

### DRY Violations Fixed in This Plan

- ✅ `build_subagent_invocation`: Now uses `platform_specs::get_subagent_invocation_format()` instead of hardcoded platform match
- ✅ `language_to_subagent` / `framework_to_subagent`: Now use `subagent_registry::` functions instead of hardcoded mappings
- ✅ `platform_agents_dir`: Now uses `platform_specs::get_agents_directory_name()` instead of hardcoded platform match
- ✅ `invoke_subagent`: Now uses `platform_specs::get_subagent_invocation_format()` instead of hardcoded platform match
- ✅ `discover_capabilities`: Now uses `platform_specs::discover_platform_capabilities()` instead of hardcoded platform match
- ✅ Subagent registry: Created `DRY:DATA:subagent_registry` module as single source of truth for all subagent names and mappings

### DRY Method and GUI Widget Catalog

The codebase follows the **DRY method** (reuse-first) and uses a **widget catalog** for UI. When implementing the plan-mode and subagent GUI (Config, Wizard, Doctor), follow these rules so new UI stays consistent and discoverable.

### Widget catalog

- **Before adding any new UI:** Check **`docs/gui-widget-catalog.md`** (the full widget and data-source catalog). Use existing widgets instead of hand-rolling (e.g. `styled_button`, `page_header`, `refresh_button`, `toggler`, `selectable_label`, `help_tooltip`, `themed_panel`, `modal_overlay`).
- **Location:** The catalog is at `docs/gui-widget-catalog.md`; AGENTS.md references it as the place to check before creating new UI. Reusable widgets live in `puppet-master-rs/src/widgets/`.
- **Plan-mode and subagent UI:** For the global plan-mode toggle, one-click button, and Subagents section, prefer existing controls (toggler, styled_button, layout helpers). If no widget fits, add a new one and register it in the catalog (see below).

### DRY tagging

- **Tag all new reusable items** so agents and developers can find them via `grep -r "DRY:" puppet-master-rs/src/`.
- **Conventions (from AGENTS.md):**
  - `// DRY:WIDGET:<name>` -- Reusable UI widget (see `src/widgets/`).
  - `// DRY:DATA:<name>` -- Single source of truth data (e.g. subagent name list, config struct).
  - `// DRY:FN:<name>` -- Reusable helper or query function.
  - `// DRY:HELPER:<name>` -- Shared utility.
- **What to tag in this plan's scope:** New widgets or helpers used by Config/Wizard/Doctor (e.g. a subagent multi-select helper, or a "plan mode global" row widget if factored out). New data sources (e.g. canonical subagent list constant or module) as `DRY:DATA:`. New message handlers or config helpers as `DRY:FN:` where appropriate.
- **Bespoke UI:** If you must implement something that doesn't use an existing widget, add an inline rationale: `// UI-DRY-EXCEPTION: <reason>`.

### After widget or catalog changes

- Run **`scripts/generate-widget-catalog.sh`** to refresh the catalog.
- Run **`scripts/check-widget-reuse.sh`** (warn-only, exit 0) to catch reuse opportunities.

### Checklist

- [ ] **DRY / catalog:** Before implementing plan-mode and subagent GUI, read `docs/gui-widget-catalog.md` and use existing widgets where possible; tag new reusable widgets/helpers/data with `DRY:WIDGET:`, `DRY:FN:`, or `DRY:DATA:`; run `generate-widget-catalog.sh` and `check-widget-reuse.sh` after UI changes.

---

