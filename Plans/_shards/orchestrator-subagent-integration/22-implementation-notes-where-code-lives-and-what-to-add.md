## Implementation Notes (Where Code Lives and What to Add)

Short notes so implementers know where to put code and what the orchestrator already provides.

### Phase 1: Project Context Detection

- **Where:** New module e.g. `src/core/subagent_selector.rs` or `src/core/project_context.rs`; language/framework detection can live there or in a small `src/core/detection/` (e.g. `language.rs`, `framework.rs`).
- **What:** Implement `ProjectContext`, `DetectedLanguage`, and detection that scans workspace paths (Cargo.toml, package.json, etc.). Cache results per workspace path (or in-memory for the run) so Phase 2 and the orchestrator do not recompute every time. Expose a function like `detect_project_context(workspace: &Path) -> Result<ProjectContext>`.

### Phase 2: Subagent Selector

- **Where:** Same module as Phase 1 or `src/core/subagent_selector.rs`; use the **Known subagent names** table (Gaps §4) as the canonical list; consider `DRY:DATA:subagent_names` in a shared constant or `subagent_registry` module.
- **What:** `SubagentSelector::new(project_context)`, `select_for_tier(tier_type, tier_context) -> Vec<String>`, and the language/framework/domain mappings from the Tier-Level Subagent Strategy. No platform calls yet; pure logic. If SubagentManager is used, it may come from another plan (e.g. interview); otherwise treat it as optional for v1 (or a thin wrapper that just holds workspace path).

### Phase 3: Orchestrator Integration

- **Where:** `src/core/orchestrator.rs`. The orchestrator already has `tier_config_for(tier_type) -> &TierConfig` (platform, model, plan_mode, etc.); use it for subagent runs.
- **What to add:** (1) Read `enable_tier_subagents` and subagent config from the same config source as tier config (e.g. from run config or GuiConfig). (2) When executing a tier, if subagents enabled: call `SubagentSelector::select_for_tier`, apply `tier_overrides` (replace if non-empty, else use selected list), filter `disabled_subagents`, add `required_subagents`. (3) **Register agent in coordination state** before execution (see "Agent Coordination and Communication"). (4) **Get coordination context** and inject into prompt (warns agent about active files/operations). (5) For each subagent name, build an `ExecutionRequest` (prompt with coordination context, model, **plan_mode from tier_config**, etc.) and run via the existing platform runner (same path as non-subagent iterations). (6) **Update coordination state** during execution (files being edited, current operation). (7) **Unregister agent** after execution completes. (8) `build_subagent_invocation` and `execute_with_subagent` can be methods that take `tier_config` (for plan_mode and platform/model) and call the runner. Platform/model: use `tier_config_for(tier_node.tier_type).platform` and `.model` (no separate get_platform_for_tier needed if you use tier_config_for).

### Phase 4: Error Pattern Detection

- **Where:** In the orchestrator or in a small helper that parses iteration output (e.g. stderr/stdout). Update `TierContext.has_errors` or `error_patterns` from the result of the last iteration so the next selection can add debugger/security-auditor etc.
- **What:** Define how to detect "compilation error," "test failure," "security issue" (e.g. regex on stderr or exit codes). Keep it simple for v1 (e.g. non-zero exit + keyword in stderr).

### SubagentManager

- The plan references `SubagentManager` "from interview plan." If that module exists, use it for whatever it provides (e.g. loading agent definitions from disk). If it does not exist, implement only what Phase 3 needs: subagent selection and invocation via the existing runner; no separate "manager" is strictly required for v1.

### Config-wiring validation (Phase / Task / Subtask / Iteration)

- **Where:** New module e.g. `src/core/config_wiring.rs` or `src/verification/config_wiring.rs` (or split: `config_wiring/orchestrator.rs` and `config_wiring/interview.rs`). The main orchestrator calls the validator from `src/core/orchestrator.rs` at each tier boundary; the interview orchestrator calls an interview-specific validator from `src/interview/orchestrator.rs` at phase (and any sub-tier) start.
- **What:** Implement `validate_config_wiring_for_tier(tier_type, config_snapshot, context) -> Result<(), WiringError>` (or equivalent) that checks: for **Phase** -- phase tier config present, plan_mode/orchestrator flags applied, interview config fields present when in interview run; for **Task** -- task tier config present, subagent config present and applied; for **Subtask** -- subtask tier config present, subagent list from config; for **Iteration** -- iteration tier config present, request built from tier config. See the **"Config-Wiring Validation: Required vs Optional Fields (Resolved)"** table in the Build Queue checklist above for the fail vs warn policy per field.
- **When called:** Immediately before the orchestrator builds execution context or spawns the agent for that tier (i.e. at Phase start, Task start, Subtask start, Iteration start). Do not skip validation for "fast path" or tests unless explicitly gated (e.g. env var to disable for a specific test).

### Start and end verification (wiring + readiness + quality)

- **Where:** Same verification module as config-wiring (e.g. `src/verification/` or `src/core/`) or a dedicated `tier_verification.rs`. The main orchestrator calls `verify_tier_start` when entering a Phase/Task/Subtask (after or as part of config-wiring) and `verify_tier_end` when completing a Phase/Task/Subtask (after acceptance gate; quality step can be part of gate or separate).
- **What:** Start: config-wiring (existing) + wiring/readiness checklist (GUI updated? backend updated? steps make sense? known gaps?). End: wiring re-check + existing acceptance gate + quality verification. Quality verification is **both** (1) required reviewer subagent (code-reviewer) at end-of-tier, on retry, and when gate fails; (2) gate criteria (clippy, tests, etc.). Parent-tier orchestrator addresses unrelated failures. See **"Start and End Verification at Phase, Task, and Subtask"** for the table and gaps. Define per-tier quality checklist (e.g. Phase: docs; Task: design; Subtask: code + tests + clippy) in code or config.
- **When called:** Start at Phase/Task/Subtask entry; end at Phase/Task/Subtask completion (before marking tier complete). Iteration can use tier-level checks only (no separate iteration start/end verification unless needed).
- **Integration with hooks:** BeforeTier hook runs **before** `verify_tier_start` (tracks active subagent, injects context, prunes stale state). AfterTier hook runs **after** `verify_tier_end` (validates handoff format, tracks completion). See **"Lifecycle and Quality Features"** for hook implementation.

### Agent coordination

- **Where:** New module `src/core/agent_coordination.rs` for file-based coordination (cross-platform). Platform runners read/write the shared state and consume injected coordination context.
- **What:** (1) **File-based coordination (cross-platform):** Implement `AgentCoordinator` that manages `active-agents.json` state file. Register agents before execution (including platform field), update status during execution (files being edited, current operation), unregister after execution. Get coordination context for prompt injection. **This enables cross-platform coordination** -- Codex agents can see Claude agents' status, and vice versa. All platforms read/write to the same JSON file. (2) **Prompt injection:** Inject coordination context into each agent's prompt (active agents with platform info, files being modified, warnings about conflicts). Include platform identifier so agents know which platform other agents are using. (3) **Status updates:** Extract file operations from agent output (parse file paths, use platform hooks/provider events) and update coordination state periodically. (4) **Conflict prevention:** Check coordination state before execution to detect file conflicts; warn agents or delay execution if conflicts detected. Works across platforms via file-based coordination.
- **When called:** Register agent before tier execution (include platform from tier_config); update status during execution (periodically or on file operations); unregister after execution. Use file-based coordination for all platforms. See **"Agent Coordination and Communication"** for full details and cross-platform examples.

### Lifecycle hooks and quality features

- **Where:** New module `src/core/hooks.rs` or `src/verification/hooks.rs` for hook system; `src/core/memory.rs` for cross-session persistence (`save_memory`, `load_memory`); extend `SubagentOutput` in `src/types/` for structured handoff format; remediation loop in orchestrator completion logic (`src/core/orchestrator.rs`).
- **What:** (1) **BeforeTier/AfterTier hooks:** Implement hook traits, register hooks per tier type, call automatically at tier boundaries. For platforms with native hooks (Cursor, Claude, Gemini), register Puppet Master hooks that delegate where possible; for Codex/Copilot, use orchestrator-level middleware and file-based coordination. (2) **Structured handoff validation:** `validate_subagent_output()` with platform-specific parsers (JSON for Cursor/Claude/Gemini, JSONL for Codex, text parsing for Copilot). (3) **Remediation loop:** Parse findings from reviewer subagent output; filter Critical/Major; block completion and re-run until resolved or max retries; escalate to parent-tier on max retries. (4) **Cross-session memory:** Save architectural decisions/patterns/tech choices at Phase completion; load at run start; inject into Phase 1 context. (5) **Active agent tracking:** `active_subagent: Option<String>` in `TierContext`; update in BeforeTier/AfterTier hooks; persist to `.puppet-master/state/active-subagents.json`. (6) **Safe error handling:** Wrap hooks and verification in `safe_hook_main()` that guarantees structured output even on failure. (7) **Lazy lifecycle:** Create verification state on first write; prune stale state (>2 hours) in BeforeTier hook. (8) **Contract enforcement:** AfterTier hook validates handoff format; retry on malformed output; fail-safe after retry.
- **When called:** Hooks run automatically at tier boundaries (before `verify_tier_start`, after `verify_tier_end`). Memory persists at Phase completion; loads at run start. Remediation loop runs when Critical/Major findings detected. See **"Lifecycle and Quality Features"** for full details and platform-specific implementation notes.

### Considerations #6 (Subagent availability / files)

- "Check if subagent files exist before selection" is optional for v1. Cursor and other platforms may resolve subagent names internally (e.g. built-in or workspace config). If we later support custom agent files (e.g. under `.cursor/agents/` or similar), add a check then; for now, treat the canonical list as valid and let the platform CLI fail if a name is unsupported.

---

