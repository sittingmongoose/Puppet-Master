## DRY Method Compliance {#dry-compliance}

**CRITICAL:** All code in this plan MUST follow DRY principles.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### DRY Requirements

1. **Platform Data -- ALWAYS use platform_specs:**
   - ❌ **NEVER** hardcode platform CLI commands, binary names, models, auth, or capabilities
   - ✅ **ALWAYS** use `platform_specs::` functions (e.g., `platform_specs::cli_binary_names()`, `platform_specs::get_subagent_invocation_format()`, `platform_specs::get_agents_directory_name()`)
   - ✅ **ALWAYS** use `platform_specs::discover_platform_capabilities()` instead of platform match statements

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

2. **Subagent Names -- ALWAYS use subagent_registry:**
   - ❌ **NEVER** hardcode subagent names in match statements or mappings
   - ✅ **ALWAYS** use `subagent_registry::` functions (e.g., `subagent_registry::get_subagent_for_language()`, `subagent_registry::is_valid_subagent_name()`)
   - ✅ **ALWAYS** reference `DRY:DATA:subagent_registry` from orchestrator plan as the single source of truth

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

- ✅ `platform_agents_dir`: Now uses `platform_specs::get_agents_directory_name()` instead of hardcoded platform match
- ✅ `invoke_subagent`: Now uses `platform_specs::get_subagent_invocation_format()` instead of hardcoded platform match
- **Tagging:** Tag new reusable items with `// DRY:WIDGET:`, `// DRY:FN:`, `// DRY:DATA:`, or `// DRY:HELPER:` so they appear in grep and the catalog. If a widget does not fit, add `// UI-DRY-EXCEPTION: <reason>`.
- **After widget/catalog changes:** Run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` (warn-only).

**Cross-reference:** The orchestrator plan (**Plans/orchestrator-subagent-integration.md**) has a full **"DRY Method and GUI Widget Catalog"** section; AGENTS.md is the project-wide source for DRY rules. This subsection ensures the interview plan explicitly applies those rules to interview implementation.

