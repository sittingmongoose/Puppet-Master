## 10. Integration with Test Strategy & Plans

### 10.1 Test strategy (test-strategy.md, test-strategy.json)

- **Extend** test strategy outputs (`test-strategy.md` + `.puppet-master/interview/test-strategy.json`, schema `Plans/test_strategy.schema.json`) to include:
  - **Framework tools:** List of selected framework tool IDs and how they are used (e.g. "Run Dioxus devtools for live preview; use for manual smoke checks" or "Run Iced headless runner with action set X").
  - **Custom headless tool:** When selected, a dedicated section or items that state: "Use the project's headless GUI tool for smoke tests; read evidence at `.puppet-master/evidence/gui-automation/<run_id>/` (timeline, summary, manifest, artifacts) after each run."
  ContractRef: SchemaID:pm.test_strategy.schema.v1, PolicyRule:Decision_Policy.md§2
- **Test types:** Add or reuse test types (e.g. `headless_gui`, `framework_tool`) in addition to `playwright`, so that verification commands and criteria can reference "run headless tool" or "run framework tool X".
- **DRY:** Extend `test_strategy_generator` and `TestItem` (or equivalent) so that new options are generated from the **same** interview state (selected_framework_tools, plan_custom_headless_tool); no duplicate logic in views vs generator.

### 10.2 PRD / execution plans

- **Tasks in the PRD (or execution plan):**
  - "Obtain/set up &lt;existing tool&gt;" when the user selected that tool.
  - "Plan and implement custom headless GUI tool (headless navigation + full debug log)" when the user selected custom tool.  
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, SchemaID:evidence.schema.json
- **Acceptance criteria** for testing tiers MUST reference: run Playwright (if web), run selected framework tools, run custom headless tool and check debug log. Prompt builder already loads test strategy; implementation MUST ensure new instructions and paths are included in context so **agents use the tools** during iterations.  
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading, SchemaID:evidence.schema.json

### 10.3 Prompt and context

- **Prompt builder** already includes test strategy (§5.2 in interview plan, `load_interview_outputs`). Implementation MUST ensure new content (framework tools, custom headless, debug log path) is present in the excerpt so agents see when and how to use each tool and where to find the debug log.  
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading, ContractName:Plans/interview-subagent-integration.md#dry-compliance

---

