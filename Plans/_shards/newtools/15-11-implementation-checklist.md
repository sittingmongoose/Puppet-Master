## 11. Implementation Checklist

- [ ] **6.1** Add `gui_tool_catalog` module (or equivalent) as single source of truth; implement lookup by framework, list tools, "custom headless default" per framework; tag tools that require MCP. Tag `// DRY:DATA:GuiToolCatalog` and helpers `// DRY:FN:...`.
- [ ] **6.2** Define research as input-only: catalog population and/or build-plan input; no research-only user outcome.
- [ ] **6.3** MCP and tool invocation: ensure MCP is configurable and verifiable for all five platforms; document or implement how MCP config (enablement) and secrets (env/credential store) are applied at run start; tag catalog tools that require MCP; wire MCP config into runner/agent so selected tools are callable.
- [ ] **7.1** Add GUI stack detection (from Architecture/UX or feature_detector); store `detected_gui_frameworks` in interview state.
- [ ] **7.2** In Testing phase, call catalog (and optional research to populate catalog); build options (Playwright, framework tools, custom headless); persist user choices in interview config/state and wire into `InterviewOrchestratorConfig`.
- [ ] **7.3** Add UI for tool selection using existing widgets; tag new widgets; run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after changes.
- [ ] **8.1** MCP settings in GUI: add Config → MCP (or Advanced → MCP); Context7 enabled by default; manage key via OS credential store; toggle to turn Context7 off; wire to GuiConfig and Option B run-config.
- [ ] **8.2** Per-platform MCP: implement central MCP registry + derived adapter config for `CliBridge` providers; `DirectApi` providers use the central tool registry (no provider-side MCP config files). Context7 key is resolved via env/credential store and injected in-memory. See §8.2 and provider transport/auth taxonomy (§8.3).
- [ ] **9** Document custom headless tool as **full-featured** (headless runner, action catalog, full evidence per §9.1); document how plans reference existing automation (e.g. Iced headless runner) vs building new.
- [ ] **10.1** Extend test strategy generator and schema for framework tools and custom headless; add test types and verification commands as needed.
- [ ] **10.2** Ensure PRD/plan generation includes tasks for get existing tools and plan/build custom tool when selected.
- [ ] **10.3** Ensure prompt builder includes new test strategy content (paths, instructions) so agents use the tools.
- [ ] **Doctor** Add a Doctor check that verifies the headless tool exists and runs when `plan_custom_headless_tool` was true (in scope for this plan). Resolve how Doctor discovers that the project planned a custom headless tool (§12.6).
- [ ] **Doctor (platform versions)** Add a Doctor check or small platform config report that records the CLI version per platform (e.g. `agent --version`, `codex --version`) when Doctor runs, so support and debugging can correlate behavior with specific versions.
- [ ] **Doctor (MCP)** Add a Doctor check that verifies configured MCP servers (e.g. Context7) are reachable or can list tools, per selected platform; complements the headless-tool check.
- [ ] **Catalog version / last-updated** Expose base catalog version + overlay `last_updated` so agents or docs can reference "catalog as of date X" when debugging tool availability.
- [ ] **DRY** All framework/tool data from catalog only; no hardcoded tool lists in views or prompts. Pre-completion: run AGENTS.md Pre-Completion Verification Checklist.
- [ ] **Gaps §12.6** Address additional gaps before or during implementation: Doctor input, test strategy schema duplication, MCP injection timing/cwd, Context7 key storage, catalog detection hints (e.g. Iced), Playwright/test-strategy wiring, verification command convention.

---

