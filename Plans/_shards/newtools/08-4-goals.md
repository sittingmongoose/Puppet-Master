## 4. Goals

- **Discover existing tools:** Interviewer consults a single source of truth (e.g. a catalog or module) mapping GUI frameworks to existing tools (official or community: hot reload, web preview, headless runners, test harnesses).  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7
- **Offer options to the user:** Present: use existing tools only, plan/build custom headless tool only, or both. User choice is stored and drives what gets written into execution plans and test strategy.  
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation
- **Custom headless tool option:** When chosen, execution plans MUST include: build (or adopt) a project-specific tool that supports headless GUI navigation and emits a **full debug log** after runs so agents can verify behavior and debug failures.  
  ContractRef: SchemaID:evidence.schema.json, ContractName:AGENTS.md#automation
- **Integrate into testing:** Selected tools (existing and/or custom) MUST be reflected in test strategy (e.g. test-strategy.md, test-strategy.json) and in PRD/execution plan language so **agents use the tools** during iterations for smoke and deeper GUI tests.  
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading
- **DRY:** One place for framework→tool data; reuse existing interview phase flow, test strategy generator, and prompt/context loading.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/interview-subagent-integration.md#dry-compliance

---

