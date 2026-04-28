## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

### DRY Requirements

1. **Platform Data -- ALWAYS use platform_specs:**
   - ❌ **NEVER** hardcode platform CLI commands, binary names, models, auth, or capabilities
   - ✅ **ALWAYS** use `platform_specs::` functions

2. **Subagent Names -- ALWAYS use subagent_registry:**
   - ❌ **NEVER** hardcode subagent names
   - ✅ **ALWAYS** use `subagent_registry::` functions
   - ✅ **ALWAYS** reference `DRY:DATA:subagent_registry` from orchestrator plan as the single source of truth

3. **Git Binary Resolution -- Single Source of Truth:**
   - ✅ **ALWAYS** use shared git binary resolution functions (DRY:FN:resolve_git_binary)
   - ❌ **NEVER** duplicate git binary detection logic

4. **Tag All Reusable Items:**
   - ✅ Tag reusable functions: `// DRY:FN:<name> -- Description`
   - ✅ Tag reusable data structures: `// DRY:DATA:<name> -- Description`
   - ✅ Tag reusable widgets: `// DRY:WIDGET:<name> -- Description`
   - ✅ Tag reusable helpers: `// DRY:HELPER:<name> -- Description`

5. **Widget Reuse:**
   - ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI
   - ✅ **ALWAYS** use existing widgets from `src/widgets/`
   - ✅ If bespoke UI is required, add `// UI-DRY-EXCEPTION: <reason>`

### 7.11 DRY and AGENTS.md conventions

This plan must be implemented in line with **AGENTS.md** (reuse-first DRY method):

- **Widgets and UI:** Before adding any new Git/worktree UI (Branching tab controls, worktree list/recover, toggles), check `docs/gui-widget-catalog.md` and `src/widgets/`. Use existing widgets (e.g. `styled_button`, `page_header`, `selectable_label`, toggles, dropdowns) and tag any new reusable widget with `// DRY:WIDGET:<name>`. After GUI changes, run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh`.
- **Platform/tool resolution:** Do not hardcode paths. Use shared helpers: `path_utils::find_tool_executable`, `path_utils::resolve_app_local_executable` (or a new `resolve_git_executable()` that both GitManager and Doctor use). Tag new shared helpers with `// DRY:FN:<name>`.
- **Single source of truth:** Git/branch behavior should use existing modules: `platform_specs` only for platform-related data (this plan is mostly git/worktree); branch naming from one place (e.g. `BranchStrategyManager` or shared function); config shape from the chosen Option B build-from-GUI flow.
- **Pre-completion:** Before marking any task done, run the AGENTS.md "Pre-Completion Verification Checklist" (cargo check/test, DRY checks, no hardcoded platform data, scope, gitignore rules).

---

