## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.
ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### DRY Requirements

1. **Platform Data -- ALWAYS use platform_specs:**
   - ❌ **NEVER** hardcode platform CLI commands, binary names, models, auth, or capabilities
   - ✅ **ALWAYS** use `platform_specs::` functions (e.g., `platform_specs::cli_binary_names()`, `platform_specs::supports_effort()`)
   ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

2. **Subagent Names -- ALWAYS use subagent_registry:**
   - ❌ **NEVER** hardcode subagent names in match statements or mappings
   - ✅ **ALWAYS** use `subagent_registry::` functions (e.g., `subagent_registry::is_valid_subagent_name()`)
   - ✅ **ALWAYS** reference `DRY:DATA:subagent_registry` from orchestrator plan as the single source of truth
   ContractRef: Primitive:DRYRules, ContractName:Plans/orchestrator-subagent-integration.md

3. **Tool/Framework Data -- Single Source of Truth:**
   - ✅ **ALWAYS** use `DRY:DATA:gui_tool_catalog` as the single source of truth for tool/framework data
   - ❌ **NEVER** hardcode tool names, installation paths, or framework-specific behavior
   ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

4. **Tag All Reusable Items:**
   - ✅ Tag reusable functions: `// DRY:FN:<name> -- Description`
   - ✅ Tag reusable data structures: `// DRY:DATA:<name> -- Description`
   - ✅ Tag reusable widgets: `// DRY:WIDGET:<name> -- Description`
   - ✅ Tag reusable helpers: `// DRY:HELPER:<name> -- Description`

5. **Widget Reuse:**
   - ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI
   - ✅ **ALWAYS** use existing widgets from `src/widgets/`
   - ✅ If bespoke UI is required, add `// UI-DRY-EXCEPTION: <reason>`

---

