## 12. Gaps, Risks, and DRY Notes

### 12.1 Catalog maintenance

- The catalog will need periodic updates as frameworks and tools evolve. Prefer a single file or module so maintainers know where to add entries. For unknown frameworks, the user still gets the option to plan/build the **full-featured** custom headless tool (§9); research may populate the catalog or inform that build plan, but there is no research-only outcome.

### 12.2 Custom tool scope

- Building a custom headless GUI tool is a substantial task. The plan frames it as **full-featured** from the start (headless runner, action catalog, full evidence: timeline, summary, artifacts), using Puppet Master's automation as the reference. Prefer adopting or wrapping an existing runner (e.g. Iced headless_runner from Puppet Master) when the project uses that stack; for other frameworks, the plan describes building or adopting an analogous **full-featured** system with the same contract. Do not frame the deliverable as a minimal smoke harness -- the goal is a tool that matches the capability and evidence depth of Puppet Master's automation.  
ContractRef: ContractName:AGENTS.md#automation, SchemaID:evidence.schema.json

### 12.3 DRY and AGENTS.md

- **Widgets:** Use `docs/gui-widget-catalog.md` and `src/widgets/` for any new interview UI; tag with `// DRY:WIDGET:...`.
- **Data:** All "framework → tools" and "should suggest custom headless" data lives in `GuiToolCatalog` (or equivalent); no duplication in phase prompts or views.
- **Test strategy:** Extend existing `test_strategy_generator` and types; do not duplicate "what tools to use" in multiple places.
- **Pre-completion:** Before marking tasks done: `cargo check`, `cargo test`, DRY checks, no hardcoded tool lists, scope respected.

### 12.4 Consistency with other plans

- **Interview plan** (`Plans/interview-subagent-integration.md`): Testing phase already uses qa-expert and test-automator; add "tool discovery and selection" as part of that phase; config wiring for new options follows "Interviewer Enhancements and Config Wiring" in orchestrator plan.  
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-8-testing, ContractName:Plans/orchestrator-subagent-integration.md#config-wiring
- **Orchestrator plan** (`Plans/orchestrator-subagent-integration.md`): Test strategy is already loaded and merged into tier criteria; ensure new tool instructions and debug log paths are part of that merged context.  
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading

### 12.5 Gaps, issues, and improvements (implementation notes)

The following gaps, ambiguities, and improvements should be resolved during implementation or in a follow-up plan update.

**GUI stack detection vs existing modules**

- The plan says "Use existing feature_detector / technology_matrix if available." In the codebase, `feature_detector` detects **features** (e.g. auth, API, payment) from interview text, not GUI frameworks. `technology_matrix` extracts technology entries (Language, Framework, etc.) from Architecture phase decisions and Q&A. GUI framework detection (web, iced, dioxus, etc.) is **not** currently provided. Implementation MUST add a dedicated **GUI framework detection** step: scan Architecture/UX output and/or project files using catalog detection hints (§6.1), OR extend `TechnologyExtractor` with GUI-framework patterns and derive `detected_gui_frameworks` from the technology matrix. The chosen approach MUST be documented in implementation evidence.  
  ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, PolicyRule:Decision_Policy.md§2

**Where do "get existing tools" and "plan/build custom tool" tasks live?**

- The plan says "Tasks in the PRD" for obtaining tools and building the custom headless tool. The PRD is produced by the **start_chain** (from requirements), not directly by the interview. Implementation MUST inject these tasks via one of: (1) acceptance criteria or new subtasks in the Testing phase when the PRD is generated (preferred: amend PRD generator to read `selected_framework_tools` and `plan_custom_headless_tool` from interview config and emit corresponding tasks), (2) as content in the requirements document the interview writes so the PRD generator includes them (fallback if PRD generator cannot read interview config), or (3) as a separate execution plan file (e.g. `.puppet-master/interview/gui-testing-plan.md`) that the orchestrator or agents MUST read (only if PRD cannot be amended). The chosen approach MUST be documented in implementation evidence and MUST NOT leave tasks unwired.  
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, SchemaID:evidence.schema.json, Gate:GATE-005, PolicyRule:Decision_Policy.md§4

**Interview state and config persistence**

- `InterviewState` (in `interview/state.rs`) has no `detected_gui_frameworks` field. `InterviewGuiConfig` / `InterviewOrchestratorConfig` do not yet have the new fields. Implementation MUST add `detected_gui_frameworks: Vec<String>` to `InterviewState`, add `selected_framework_tools: Vec<FrameworkToolChoice>` and `plan_custom_headless_tool: bool` to `InterviewGuiConfig` and `InterviewOrchestratorConfig`; wire them in `app.rs` (set from GUI config when building run config) and in the interview completion path (read when generating test strategy and PRD/execution plans).  
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, SchemaID:evidence.schema.json, Gate:GATE-005

**Test strategy JSON schema and backward compatibility**

- The consumer of test-strategy.json is `TierTree::load_test_strategy` in `core/tier_node.rs` (schema: `Plans/test_strategy.schema.json`). Implementation MUST extend additively: allow new `testType` values (e.g. `headless_gui`, `framework_tool`) and, if structured tool metadata is needed, add optional fields to `TestItem` and to the loader. Backward compatibility is REQUIRED: the loader MUST tolerate missing `headless_gui`/`framework_tool` items and optional tool metadata in existing test-strategy.json files (no migration of old files required; new fields are additive only).  
  ContractRef: SchemaID:pm.test_strategy.schema.v1, Gate:GATE-001, PolicyRule:Decision_Policy.md§2

**Verification command for custom headless tool**

- Test items have a literal `verification_command`. For "run headless tool" the exact command is project-specific. The test strategy generator MUST emit a **deterministic convention-based command** when the project follows the documented naming convention (e.g. `cargo run --bin headless_runner` for Rust projects with a `headless_runner` binary; `npm run test:headless` when `package.json` defines it), OR mark the item as **EXAMPLE-only** with an explicit criterion-based instruction (e.g. criterion: "Run the project's headless GUI tool per test-strategy.md; verify evidence exists at `.puppet-master/evidence/gui-automation/timeline.jsonl`", verification_command: "# EXAMPLE: cargo run --bin custom_headless_tool -- --scenario=smoke"). The EXAMPLE marker signals to agents that the command is not executable as-is and must be adapted per project structure.  
  ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, PolicyRule:Decision_Policy.md§4

**GuiToolCatalog persistence (Resolved — runtime-mutable overlay):**
- Base catalog is code-shipped defaults.
- Overlay catalog is stored in app settings (non-secret) and is editable + import/exportable.
- Overlay overrides base entries by stable IDs; overlay entries carry `source` + `last_updated`.
- All catalog update operations must pass structured validation (no duplicates, stable IDs, required fields present).
ContractRef: Primitive:DRYRules, Gate:GATE-009, PolicyRule:Decision_Policy.md§2

**Catalog location**

- Catalog MUST live in **interview** module (`src/interview/gui_tool_catalog.rs`) per PolicyRule:Decision_Policy.md§2 (no scope expansion). Automation stays focused on running tests; interview owns "what tools to offer." If automation later needs to branch by framework, it MUST depend on interview or a shared config layer (no duplication).  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**Evidence path and STATE_FILES**

- Implementation MUST document the standard evidence path `.puppet-master/evidence/gui-automation/` in STATE_FILES.md when implementing so the target project's agents and the prompt builder have a single reference. The path MUST be added to the cleanup allowlist so evidence is never removed by prepare/cleanup.  
  ContractRef: ContractName:STATE_FILES.md, ContractName:Plans/MiscPlan.md#cleanup, SchemaID:evidence.schema.json

**Doctor check**

- Implementation MUST add a Doctor check that verifies the headless tool exists and runs when `plan_custom_headless_tool` was true (in scope for this plan; see checklist item **Doctor** in §11). The check MUST be conditional: run only when the project planned a custom headless tool (see "Doctor check input" for detection contract).  
  ContractRef: ContractName:Plans/MiscPlan.md#doctor, SchemaID:evidence.schema.json, Gate:GATE-005

**YAML and config field names**

- Implementation MUST use consistent names for new interview fields in GUI config, YAML config, and `InterviewOrchestratorConfig`: `detected_gui_frameworks`, `selected_framework_tools`, `plan_custom_headless_tool`. These MUST be serialized in the same config shape used by Option B run-config build so GUI, YAML, and runtime see identical values.  
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, ContractName:Plans/WorktreeGitImprovement.md#option-b-run-config

### 12.6 Additional gaps, issues, and improvements

**Doctor check input (how Doctor knows "plan_custom_headless_tool" was true)**

- Doctor runs with `CheckRegistry` and receives working directory and selected platforms; it has no direct access to `gui_config.interview` or interview state.

**Custom Headless Tool Detection Contract (Resolved):**

Detection is deterministic and has explicit ownership:
1. **Writer (interview completion path):** After Testing phase choices are finalized, the interview completion pipeline writes `.puppet-master/config.json`:
   - If `plan_custom_headless_tool == true`, write `tools.custom_headless` as either a string path or object `{ "path": "...", "args": [...] }`.
   - If `plan_custom_headless_tool == false`, remove `tools.custom_headless`.
2. **Reader (Doctor):** Doctor checks for `tools.custom_headless` key in the project's `.puppet-master/config.json`.
3. If key exists:
   - Value must be a string (path to executable) or an object `{ "path": "...", "args": [...] }`.
   - Validate: file exists and is executable (`fs::metadata` + permission check).
   - If valid: register the tool in the tool registry with ToolID `CustomHeadlessTool`.
   - If invalid (file missing, not executable): log warning `tool.custom_headless.invalid`, skip registration, continue.
4. If key does not exist: skip (not an error). Emit `tool.custom_headless.skipped` seglog event on first Doctor run.
5. **Evidence:** Doctor check emits a seglog event (`doctor.custom_headless.checked`) recording the detection outcome. This event serves as the implementation evidence.

  ContractRef: ContractName:Plans/MiscPlan.md#doctor, ContractName:STATE_FILES.md, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2

**Test strategy schema duplication**

**Test strategy artifact schema (Resolved):**
- The machine-readable artifact is `.puppet-master/interview/test-strategy.json` with top-level fields `project`, `generatedAt`, `coverageLevel`, `items[]`.
- Canonical JSON Schema lives in `Plans/test_strategy.schema.json` (`SchemaID:pm.test_strategy.schema.v1`).
- Interview writes it; Orchestrator reads it; newtools extends it additively (new `testType` values + optional tool metadata fields).
  ContractRef: SchemaID:pm.test_strategy.schema.v1, Gate:GATE-001, PolicyRule:Decision_Policy.md§2

**MCP config injection timing and cwd**

- `CliBridge` platform CLIs (Cursor/Claude Code) are spawned with a working directory (project or worktree). Derived MCP adapter config (no secrets) MUST be present in the actual spawn cwd (preferred) or a user-level location before the CLI starts. Implementation MUST document: (1) whether adapter generation happens once at run-config build time (project root) OR at spawn time (actual cwd used by platform runner), AND (2) how worktrees are handled so adapters are visible to the agent when running in a worktree. Preferred per PolicyRule:Decision_Policy.md§2 and Plans/WorktreeGitImprovement.md: generate adapters at spawn time into the actual run directory (cwd) so worktree runs get correct MCP config. `DirectApi` providers do not use provider-side MCP config files.  
  ContractRef: ContractName:Plans/WorktreeGitImprovement.md, PolicyRule:Decision_Policy.md§2, SchemaID:evidence.schema.json

**API Key Storage (Resolved — credential-store-only):**
- Secrets (tokens/passwords/API keys) MUST NOT be written to:
  - seglog, redb, Tantivy, YAML config, `.puppet-master/config.json`, logs, evidence bundles, or state files.
- Allowed persistence: OS credential store only.
- Resolution precedence:
  1. Environment variables (CI/headless)
  2. OS credential store SecretId (interactive desktop)
- Config stores only non-secret enablement + preference fields; UI shows “Key stored/missing”, never the value.
ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

**Catalog detection hints and Iced**

- The catalog table suggests "detection hints (e.g. Cargo.toml crate name, package.json deps)." For Iced, Puppet Master's in-repo headless runner lives in `src/automation/` and is not a crate name; detection may need to scan for `headless_runner` or automation modules, or for a known path. Implementation MUST define detection rules per framework in the catalog so the interviewer reliably sets `detected_gui_frameworks`. For Iced, preferred detection: check `Cargo.toml` for `iced` dependency OR scan for `src/automation/headless_runner` or `src/automation/action_catalog.rs` (Puppet Master's pattern). The detection rules MUST be documented in the catalog module and MUST NOT miss Iced when the project uses Puppet Master's automation pattern.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:AGENTS.md#automation, PolicyRule:Decision_Policy.md§2

**Playwright vs "web" and test strategy generator**

- Today `write_test_strategy` is gated by `generate_playwright_requirements` in the orchestrator; `TestStrategyConfig` has `include_playwright` but no `include_framework_tools` or `plan_custom_headless_tool`. Extending test strategy for newtools requires: (1) pass the new interview flags (`selected_framework_tools`, `plan_custom_headless_tool`) into the completion path so `write_test_strategy` receives them, AND (2) extend `TestStrategyConfig` and the generator so markdown and JSON include framework tools and custom headless sections/items. Implementation MUST add these fields to `InterviewOrchestratorConfig` and wire from `gui_config.interview` in `app.rs` (see §2 table, same three-step checklist as other interview config).  
  ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, SchemaID:evidence.schema.json, Gate:GATE-005

**Verification command and headless tool binary name**

- The plan specifies (§12.5 "Verification command for custom headless tool") that the test strategy generator MUST emit a deterministic convention-based command when the project follows the documented naming convention, OR mark the item as EXAMPLE-only. Implementation MUST document the convention (e.g. `cargo run --bin headless_runner` for Rust projects; `npm run test:headless` for Node projects) in AGENTS.md or STATE_FILES.md so both the generator and agents agree. When the convention is followed, the generator emits the stable command; when it is not, the generator emits an EXAMPLE marker plus a criterion-based instruction.  
  ContractRef: ContractName:AGENTS.md, ContractName:STATE_FILES.md, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§4

**Version compatibility and platform churn**

- §8.2 notes that platforms change rapidly. Implementation MUST add a Doctor check or a small "platform config" report that records the CLI version per platform (e.g. `agent --version`, `codex --version`) when Doctor runs, so support and debugging can correlate behavior with specific versions. **In scope:** implement per checklist item **Doctor (platform versions)** in §11.  
  ContractRef: ContractName:Plans/MiscPlan.md#doctor, SchemaID:evidence.schema.json, Gate:GATE-005

**Backward compatibility for existing projects**

- Existing projects with test-strategy.md / test-strategy.json generated before newtools MUST continue to work: the loader in `tier_node` and the prompt builder MUST tolerate missing `headless_gui` / `framework_tool` items and optional tool metadata. No migration of old files is required; new fields are additive only. Implementation MUST verify backward compatibility via test cases or manual verification with a pre-newtools test-strategy.json file.  
  ContractRef: SchemaID:evidence.schema.json, Gate:GATE-001, PolicyRule:Decision_Policy.md§2

**MCP Doctor check (in scope)**

- Implementation MUST add a dedicated Doctor check that verifies configured MCP servers (e.g. Context7) are reachable or can list tools, per selected platform; complements the headless-tool check. See checklist item **Doctor (MCP)** in §11.  
  ContractRef: ContractName:Plans/MiscPlan.md#doctor, SchemaID:evidence.schema.json, Gate:GATE-005

**Catalog version or last-updated (in scope)**

- Implementation MUST provide a base catalog version and overlay last-updated metadata (e.g. `CATALOG_VERSION` const for the base + per-entry `last_updated` in overlay) so agents or docs can reference "catalog as of date X" when debugging tool availability. See checklist item **Catalog version / last-updated** in §11.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, SchemaID:evidence.schema.json

---

