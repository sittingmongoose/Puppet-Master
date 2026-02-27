## Implementation Phases

### Phase 1: Configuration & Infrastructure
1. Add `SubagentConfig` struct
   - **DRY REQUIREMENT:** Tag with `// DRY:DATA:SubagentConfig` if reusable
2. Extend `InterviewOrchestratorConfig`
   - **DRY REQUIREMENT:** Use `subagent_registry::` functions for any subagent name validation -- DO NOT hardcode subagent names
3. Add subagent configuration to GUI
   - **DRY REQUIREMENT:** Check `docs/gui-widget-catalog.md` FIRST -- use existing widgets (`toggler`, `styled_button`, `selectable_label`, `themed_panel`)
   - **DRY REQUIREMENT:** Subagent name lists MUST come from `subagent_registry::all_subagent_names()` or `subagent_registry::get_subagents_for_tier()` -- DO NOT hardcode names
   - **DRY REQUIREMENT:** Tag any new reusable widgets with `// DRY:WIDGET:<name>`
   - **DRY REQUIREMENT:** Run `scripts/generate-widget-catalog.sh` after widget changes
4. Create subagent mapping utilities
   - **DRY REQUIREMENT:** MUST use `subagent_registry::get_subagent_for_language()` and `subagent_registry::get_subagent_for_framework()` -- DO NOT create duplicate mapping logic
   - **DRY REQUIREMENT:** Tag reusable functions with `// DRY:FN:<name>`
5. **DRY (Puppet Master code):** When adding interview UI or helpers, follow DRY per §5.3 (widget catalog, platform_specs, tagging; run catalog scripts after widget changes)

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### Phase 2: Prompt Integration
1. Modify `prompt_templates.rs` to include subagent instructions
   - **DRY REQUIREMENT:** Use `platform_specs::get_subagent_invocation_format()` when building platform-specific invocation syntax -- DO NOT hardcode formats
2. Add subagent invocation syntax to prompts
   - **DRY REQUIREMENT:** Use `SubagentInvoker::invoke_subagent()` which uses `platform_specs` -- DO NOT duplicate platform-specific logic
3. Update prompt generation to pass subagent config
   - **DRY REQUIREMENT:** Validate subagent names using `subagent_registry::is_valid_subagent_name()` before including in prompts

### Phase 3: Research Integration
1. Enhance `ResearchEngine` to use subagents
2. Update pre-question research to invoke phase-specific subagents
3. Update post-answer research to use validation subagents

### Phase 4: Validation Integration
1. Add answer validation methods to orchestrator
2. Integrate validation subagents (debugger, code-reviewer)
3. Add validation results to interview state

### Phase 5: Document Generation Integration {#phase-5-document-generation}
1. Enhance `DocumentWriter` to use technical-writer subagent
2. Use knowledge-synthesizer for technology matrix
3. Use qa-expert and test-automator for test strategy
4. **AGENTS.md -- Technology & version constraints:** Add a "Technology & version constraints" (or "Stack conventions") section to generated AGENTS.md per §5.1, derived from Architecture phase and optionally technology_matrix; include convention templates for well-known stacks (e.g. Pydantic v2, React 18) when detected.
5. **AGENTS.md DRY section:** Add a DRY Method (reuse-first) section to generated AGENTS.md per §5.1 so target-project agents follow reuse-first and tag reusable items.
6. **AGENTS.md minimality:** Implement critical-first block, size budget (~150-200 lines), and optional linked docs (e.g. docs/architecture.md) per §5.1 "Keep generated AGENTS.md minimal"; add "When updating, keep Critical and Technology & version constraints; prefer links to docs/" in generated file.
7. **PRD crew recommendations:** Extend PRD generator to analyze task complexity and suggest crews for tasks/subtasks that would benefit from multiple subagents. Add `crew_recommendation` field to PRD JSON schema. Include crew recommendations in generated PRD and plan markdown.
8. **Document generation crews:** Use crews for document generation (e.g., technical-writer + knowledge-synthesizer + qa-expert crew) to coordinate document creation and ensure consistency.

### Phase 6: Testing & Refinement
1. Test subagent invocations for each phase
2. Validate research quality improvements
3. Measure document generation quality
4. Refine subagent prompts based on results

