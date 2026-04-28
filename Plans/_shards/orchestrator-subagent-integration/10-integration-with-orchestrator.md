## Integration with Orchestrator

### Overseer (controlling role)

The controlling AI role within the Orchestrator is the **Overseer**. Canonical definition and responsibilities are in **Plans/Glossary.md**.

### Orchestrator Modifications

```rust
// src/core/orchestrator.rs (additions)

pub struct Orchestrator {
    // ... existing fields ...
    subagent_selector: Arc<SubagentSelector>,
    subagent_manager: Arc<SubagentManager>,
}

impl Orchestrator {
    pub fn new(config: OrchestratorConfig) -> Result<Self> {
        // ... existing initialization ...

        // Initialize subagent selector
        let project_context = Self::detect_project_context(&config.paths.workspace)?;
        let subagent_selector = Arc::new(SubagentSelector::new(project_context)?);

        // Initialize subagent manager (from interview plan)
        let subagent_manager = Arc::new(SubagentManager::new(&config.paths.workspace)?);

        Ok(Self {
            // ... existing fields ...
            subagent_selector,
            subagent_manager,
        })
    }

    /// Select and invoke subagents for tier execution
    async fn execute_tier_with_subagents(
        &self,
        tier_node: &TierNode,
        context: &OrchestratorContext,
    ) -> Result<()> {
        // Build tier context
        let tier_context = self.build_tier_context(tier_node, context)?;
        // build_tier_context MUST populate workspace/worktree/runtime snapshot fields
        // from the same frozen tier-start config snapshot used by validation/persistence.

        // Select subagents
        // DRY REQUIREMENT: SubagentSelector MUST use subagent_registry:: functions — NEVER hardcode subagent names
        let mut subagent_names = self.subagent_selector.select_for_tier(
            tier_node.tier_type,
            &tier_context,
        );

        // Apply tier overrides (replace if non-empty, else use selected list)
        // DRY REQUIREMENT: Validate override names using subagent_registry::is_valid_subagent_name()
        if let Some(overrides) = self.get_tier_overrides(tier_node.tier_type) {
            if !overrides.is_empty() {
                // Validate all override names against canonical list
                for name in &overrides {
                    if !subagent_registry::is_valid_subagent_name(name) {
                        return Err(anyhow!("Invalid subagent name in override: {}", name));
                    }
                }
                subagent_names = overrides;
            }
        }

        // Filter disabled subagents
        // DRY REQUIREMENT: Validate disabled names using subagent_registry::is_valid_subagent_name()
        subagent_names.retain(|name| {
            if !subagent_registry::is_valid_subagent_name(name) {
                log::warn!("Invalid subagent name in disabled list: {}", name);
                false
            } else {
                !self.is_subagent_disabled(name)
            }
        });

        // Add required subagents
        // DRY REQUIREMENT: Validate required names using subagent_registry::is_valid_subagent_name()
        if let Some(required) = self.get_required_subagents(tier_node.tier_type) {
            for req in required {
                if !subagent_registry::is_valid_subagent_name(&req) {
                    return Err(anyhow!("Invalid subagent name in required list: {}", req));
                }
                if !subagent_names.contains(&req) {
                    subagent_names.push(req);
                }
            }
        }

        // Get platform and model for this tier
        let platform = self.get_platform_for_tier(tier_node.tier_type)?;
        let model = self.get_model_for_tier(tier_node.tier_type)?;

        // Get coordination context
        let coordination_context = self.coordinator.get_coordination_context(&tier_context.workspace).await?;

        // Register agents in coordination state before execution
        for subagent_name in &subagent_names {
            let agent_id = format!("{}-{}", subagent_name, tier_node.id);
            self.coordinator.register_agent(ActiveAgent {
                agent_id: agent_id.clone(),
                platform,
                node_id: tier_node.id.clone(),
                worktree_path: context.worktree_path.clone(),
                files_being_edited: Vec::new(), // Updated during execution
                current_operation: format!("Executing {} tier", tier_node.tier_type),
                started_at: Utc::now(),
                last_update: Utc::now(),
            }).await?;
        }

        // Execute subagents (sequential or parallel based on config)
        if self.config.enable_parallel_subagents {
            // Execute subagents in parallel
            let mut tasks = Vec::new();
            for subagent_name in &subagent_names {
                let task = self.execute_subagent_async(
                    platform,
                    &model,
                    subagent_name,
                    tier_node,
                    &tier_context,
                    &coordination_context,
                );
                tasks.push(task);
            }

            // Wait for all subagents to complete
            let results = futures::future::join_all(tasks).await;

            // Check for failures
            for result in results {
                result??; // Propagate errors
            }
        } else {
            // Execute subagents sequentially
            for subagent_name in &subagent_names {
                self.execute_subagent(
                    platform,
                    &model,
                    subagent_name,
                    tier_node,
                    &tier_context,
                    &coordination_context,
                ).await?;
            }
        }

        // Unregister agents from coordination state after execution
        for subagent_name in &subagent_names {
            let agent_id = format!("{}-{}", subagent_name, tier_node.id);
            self.coordinator.unregister_agent(&agent_id).await?;
        }

        Ok(())
    }

    // DRY:FN:execute_subagent — Execute a single subagent for a tier
    async fn execute_subagent(
        &self,
        platform: Platform,
        model: &str,
        subagent_name: &str,
        tier_node: &TierNode,
        tier_context: &ExecutionUnitContext,
        coordination_context: &str,
    ) -> Result<SubagentOutput> {
        let agent_id = format!("{}-{}", subagent_name, tier_node.id);

        // Build subagent invocation prompt with coordination context
        let invocation = self.build_subagent_invocation(
            subagent_name,
            &tier_node.description,
            tier_context,
            coordination_context,
        )?;

        // Update coordination state: mark agent as active
        self.coordinator.update_agent_operation(
            &agent_id,
            format!("Executing {}: {}", subagent_name, tier_node.title),
        ).await?;

        // Execute via platform runner with subagent
        let output = self.execute_with_subagent(
            platform,
            model,
            subagent_name,
            &invocation,
            tier_context,
        ).await?;

        // Update coordination state: extract file operations from output
        let file_operations = self.extract_file_operations_from_output(&output)?;
        self.coordinator.update_agent_files(&agent_id, &file_operations).await?;

        Ok(output)
    }

    // DRY:FN:build_subagent_invocation — Build platform-specific subagent invocation prompt
    // DRY REQUIREMENT: MUST use platform_specs::get_subagent_invocation_format() — NEVER hardcode platform-specific formats
    fn build_subagent_invocation(
        &self,
        subagent_name: &str,
        task_description: &str,
        tier_context: &ExecutionUnitContext,
        coordination_context: &str,
    ) -> Result<String> {
        // Build platform-specific subagent invocation using platform_specs
        let platform = self.get_platform_for_tier(tier_context.tier_type)?;

        // DRY: Use platform_specs to get subagent invocation format (DRY:DATA:platform_specs)
        // DO NOT hardcode match statements for Platform::Cursor, Platform::Codex, etc.
        // DO NOT duplicate platform-specific format strings here
        let invocation_format = platform_specs::get_subagent_invocation_format(platform)?;

        // Format invocation using platform-specific format from platform_specs
        let invocation = invocation_format
            .replace("{subagent}", subagent_name)
            .replace("{task}", task_description)
            .replace("{context}", &format_tier_context(tier_context))
            .replace("{coordination}", coordination_context);

        Ok(invocation)
    }

    // DRY:FN:extract_file_operations_from_output — Extract file paths from subagent output
    fn extract_file_operations_from_output(
        &self,
        output: &SubagentOutput,
    ) -> Result<Vec<PathBuf>> {
        // Extract file paths from subagent output
        // Can parse from task_report, downstream_context, or findings
        let mut files = Vec::new();

        // Extract from findings (file field)
        for finding in &output.findings {
            if let Some(file) = &finding.file {
                files.push(file.clone());
            }
        }

        // Extract from task_report (parse file mentions)
        // Implementation: regex or text parsing to find file paths

        Ok(files)
    }
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Error handling:**

- **Subagent selection failure:** If subagent selection fails, log warning and fall back to default subagent or skip subagents
- **Coordination registration failure:** If coordination registration fails, log warning and continue (coordination is best-effort)
- **Subagent execution failure:** If subagent execution fails, log error and continue with next subagent (or fail tier if critical)
- **Coordination update failure:** If coordination update fails, log warning and continue (coordination updates are best-effort)

    // DRY:FN:build_tier_context -- Build tier context for subagent selection
    fn build_tier_context(
        &self,
        tier_node: &TierNode,
        context: &OrchestratorContext,
    ) -> Result<ExecutionUnitContext> {
        // Detect language if not already cached
        let primary_language = self.subagent_selector
            .detect_language(&context.workspace)?
            .first()
            .map(|l| l.name.clone());

        // Determine domain from task type or description
        let domain = self.infer_domain(tier_node);

        // Detect framework
        let framework = self.detect_framework(&context.workspace)?;

        // Build context
        Ok(ExecutionUnitContext {
            tier_type: tier_node.tier_type,
            node_id: tier_node.id.clone(),
            title: tier_node.title.clone(),
            description: tier_node.description.clone(),
            primary_language,
            domain,
            framework,
            needs_architecture_review: tier_node.tier_type == TierType::Phase,
            needs_product_planning: false, // Can be inferred from phase content
            subtask_focus: self.infer_subtask_focus(tier_node),
            has_errors: false, // Updated from iteration results
            needs_code_review: false,
            needs_testing: false,
            error_patterns: Vec::new(),
            parent_subagents: None, // Set from parent tier
        })
    }
}
```

## Configuration

### Subagent Configuration
```yaml
## Execution unit context and worktree allocation strategy

### Canonical runtime context

- Introduce execution_unit_context as canonical runtime-facing context object.
- Demote TierContext to a derived or compatibility-only selection/decomposition helper.
- Anchor worker spawn, recovery, remediation, coordination, and UI inspection to execution_unit_context.
- Any remaining `TierContext` or `tier_id` mention in this subsection is compatibility-only and never canonical runtime state.

### Worktree allocation strategy

- Define concrete worktree allocation strategy: each `execution_unit_context` receives a lane-managed worktree lease; package or seam reuse is allowed only when lineage matches the lane assignment and no contamination guard is active.
- Define contamination, reuse, and cleanup rules for that strategy: contaminated worktrees are quarantined until recovery clears the blocker, reuse requires clean lineage plus no dirty/conflict state, and cleanup waits for archive, receipt, and recovery checks instead of age alone.
- This subsection stays separate from runtime-context canon language and separate from stale-token retirement language.

### Compatibility retirement

- Retire TierContext/tier_id/TierType/Tiers/Phase-Task-Subtask runtime canon.
- Retire allowed_actions[] / reason_code / recovery_options[] survivors from live blocked/HITL contracts.
- Retirement targets are exactly: `TierContext`, `tier_id`, `TierType`, `Tiers`, `allowed_actions[]`, `reason_code`, `recovery_options[]`, `approve_continue`.
- This subsection is retirement-only; canonical runtime-context rules and worktree-allocation rules remain in sibling subsections.

## Benefits

1. **Dynamic Adaptation:** Automatically selects appropriate subagents based on project context
2. **Language Awareness:** Never uses Rust engineer for Swift projects
3. **Domain Expertise:** Matches subagents to task domains (backend/frontend/etc.)
4. **Error Handling:** Automatically invokes debugger when errors occur
5. **Specialization:** Uses specialized subagents for focused tasks
6. **Inheritance:** Subagents flow down the tier hierarchy appropriately

## Implementation Phases

### Implementation note: Phase 1 - Project Context Detection
- [ ] Implement `ProjectContext` detection
- [ ] Language detection from codebase files
- [ ] Framework detection
- [ ] Domain inference from task descriptions

### Implementation note: Phase 2 - Subagent Selector
- [ ] Implement `SubagentSelector` with tier-level selection logic
- [ ] Language-to-subagent mapping
- [ ] Framework-to-subagent mapping
- [ ] Domain-to-subagent mapping

### Implementation note: Phase 3 - Orchestrator Integration
- [ ] Add subagent selection to orchestrator
- [ ] Build tier context from tier nodes
- [ ] Invoke subagents via platform runners
- [ ] Handle subagent responses

### Implementation note: Phase 4 - Error Pattern Detection
- [ ] Detect error patterns from iteration outputs
- [ ] Automatically invoke debugger/security-auditor/etc.
- [ ] Pattern-based subagent selection

### Phase 5: Testing & Refinement
- [ ] Test with different project types (Rust, Python, JavaScript, Swift)
- [ ] Verify subagent selection accuracy
- [ ] Refine selection logic based on results
- [ ] **Provider connectivity smoke tests**: Run transport-specific smoke checks with minimal subagent-style prompts; CLI smoke for CLI-bridged providers (Cursor, Claude Code), direct API smoke for Direct-provider Gemini, and server-endpoint/tool-handshake smoke for Server-bridged OpenCode; assert success and expected output/response shape; environment-gated or manual where CI has no auth/connectivity.
- [ ] **Subagent-invocation integration tests**: Build and execute the actual orchestrator CLI command per platform for a given tier + subagent; verify invocation path and run completion.
- [ ] **Plan mode CLI verification (CLI-bridged only)**: Run real CLIs for CLI-bridged providers (Cursor, Claude Code) with plan mode enabled (e.g. `--mode=plan`, `--permission-mode plan`); assert exit success and that plan-mode flags are applied and honored; environment-gated like other CLI tests.

## Provider Connectivity Smoke Tests & Subagent Invocation Testing

### 1. Provider Connectivity Smoke Tests

**Purpose:** Confirm that each provider's invocation path (CLI for CLI-bridged providers, server endpoint/tool handshake for Server-bridged OpenCode, and API for Direct providers) can be exercised with a subagent-style prompt and returns a successful run with usable output. These tests validate the **invocation path** (binary/server/API, args, env) and **basic behavior**, not full orchestrator logic.

**Scope:** One smoke test per provider (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini). CLI-bridged providers (Cursor, Claude Code) run their real CLIs; Server-bridged OpenCode is validated via server endpoint/tool handshake (no CLI requirement); Direct providers (Codex, GitHub Copilot, Gemini) use minimal API calls. Each test issues a minimal, non-destructive prompt that triggers subagent behavior (or equivalent) and asserts process/response success and output shape.

**Environment gating:** Tests are transport-specific and require corresponding prerequisites (CLI installed for CLI-bridged providers, reachable/authenticated OpenCode server for Server-bridged, API key/auth for Direct providers). They MUST be gated so they do not fail CI when prerequisites are missing.

ContractRef: PolicyRule:Decision_Policy.md§2

**Implementation:**

- **Gate:** Only run provider connectivity smoke tests when the appropriate env var is set and required transport prerequisites are available. If not set or prerequisite missing, skip with a clear message (for example, "skipped: Cursor CLI not available", "skipped: OpenCode endpoint not configured", or "skipped: Gemini API key missing").
- **Per-platform commands and assertions:**
  - **Cursor:** Run `agent -p "/code-reviewer Review the last commit." --output-format json` (or current equivalent from platform_specs). Assert exit code 0 (or documented non-zero for "no changes"). Assert stdout is non-empty and, if JSON, parseable; optionally assert presence of expected top-level keys.
  - **Claude:** Run `claude -p "As code-reviewer, respond with only: READY" --no-session-persistence --output-format text`. Assert exit code 0 and stdout contains expected token (e.g. READY) or is non-empty.
  - **OpenCode:** Validate ServerBridge connectivity by performing a minimal server endpoint/tool handshake (for example, list tools or execute a no-op tool call). Assert successful handshake/response and expected response shape.
  - **Codex:** Codex is a Direct API provider; verify API connectivity with a minimal request. Assert successful response and non-empty, parseable JSON.
  - **GitHub Copilot:** Copilot is a Direct API provider; verify API connectivity with a minimal request. Assert successful response and non-empty, parseable JSON.
  - **Gemini:** Gemini is a Direct API provider; verify API connectivity by sending a minimal generation request via the Gemini API. Assert a successful response with non-empty, parseable JSON.
- **Artifacts:** Optionally capture stdout/stderr to `.puppet-master/evidence/cli-smoke-<platform>.log` for debugging; do not assert on exact text, only on success and shape.
- **Documentation:** In the plan and in code comments, document that these tests are optional/manual in CI and list required env vars (e.g. `RUN_CURSOR_CLI_SMOKE=1`, `RUN_OPENCODE_SERVER_SMOKE=1`, `RUN_GEMINI_API_SMOKE=1`) and that auth/connectivity must be configured for the corresponding provider.

**Test location and naming:**

- **File:** `puppet-master-rs/tests/provider_connectivity_smoke.rs` (or under `puppet-master-rs/tests/integration/`).
- **Tests:** `cursor_cli_smoke`, `claude_cli_smoke`, `opencode_server_smoke`, `codex_api_smoke`, `copilot_api_smoke`, `gemini_api_smoke`.
- **Runner:** Use `#[ignore]` by default with a clear reason ("requires provider auth/connectivity prerequisites"); run with `cargo test --ignored` or a dedicated `cargo test provider_connectivity_smoke` when env is set.

**Fleshed-out example (Cursor):**

```rust
// puppet-master-rs/tests/provider_connectivity_smoke.rs

#[test]
#[ignore = "Requires Cursor CLI (agent) installed and authenticated; set RUN_CURSOR_CLI_SMOKE=1"]
fn cursor_cli_smoke() {
    if std::env::var("RUN_CURSOR_CLI_SMOKE").is_err() {
        return;
    }
    let binary = which_binary("agent").or_else(|| which_binary("cursor-agent"))
        .expect("Cursor CLI not on PATH");
    let output = std::process::Command::new(binary)
        .args(["-p", "/code-reviewer Reply with only: SMOKE_OK", "--output-format", "json"])
        .output()
        .expect("Failed to run Cursor CLI");
    assert!(output.status.success(), "Cursor CLI failed: stderr = {:?}", String::from_utf8_lossy(&output.stderr));
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(!stdout.trim().is_empty(), "Cursor CLI produced empty stdout");
    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&stdout) {
        assert!(json.is_object() || json.is_array(), "Expected JSON object or array");
    }
}
```

Other providers follow the same transport-specific pattern: check env gate, run the minimal connectivity probe for that provider transport (CLI, server handshake, or API), and assert success with non-empty/parseable output.

---

### 2. Subagent-Invocation Integration Tests

**Purpose:** Verify that the **exact** command line the orchestrator would use for a given tier and subagent is built correctly and that executing it completes without unexpected failure. This catches regressions in argument construction, subagent naming, and platform-specific flags.

**Scope:** At least one integration test per platform that (1) builds the invocation (command + args + env) as the orchestrator would, (2) runs it against the real CLI (or a script that mimics it), and (3) asserts that the run completes successfully and, where possible, that the invocation path (e.g. subagent name in the prompt) is correct.

**Implementation:**

- **Orchestrator invocation builder:** Use the same code path the orchestrator uses to build the CLI command (e.g. a function that takes `platform`, `tier_type`, `subagent_name`, `prompt`, `model` and returns `Command`). Do not duplicate logic in tests.
- **Per-platform integration test:**
  - Build the invocation for a fixed scenario (e.g. tier = Task, subagent = `code-reviewer`, minimal prompt).
  - Execute it (real CLI or, if documented, a script that echoes the command and returns success for CI without auth).
  - Assert: process success; optionally that stdout/stderr contain the subagent name or expected token; and that no "unknown subagent" or "invalid flag" style errors appear in stderr.
- **Environment gating:** Same as smoke tests: skip when CLI is not available or auth is not configured; use env vars (e.g. `RUN_SUBAGENT_INVOCATION_TESTS=1`) and optional `#[ignore]` so CI without CLIs still passes.
- **Artifacts:** Log the exact command and, if possible, a short excerpt of stdout/stderr to `.puppet-master/evidence/subagent-invocation-<platform>.log` for debugging.

**Test location and naming:**

- **File:** `puppet-master-rs/tests/subagent_invocation_integration.rs` (or under `puppet-master-rs/tests/integration/`).
- **Tests:** `cursor_subagent_invocation`, `codex_subagent_invocation`, `claude_subagent_invocation`, `gemini_subagent_invocation`, `copilot_subagent_invocation`.
- **Runner:** Same as smoke tests; run with env set or `cargo test --ignored` / `cargo test subagent_invocation`.

**Fleshed-out example (invocation builder + one platform):**

```rust
// puppet-master-rs/tests/subagent_invocation_integration.rs

/// Builds the exact Command the orchestrator would use for Cursor + subagent.
// DRY requirement: must use platform_specs::cli_binary_names() — never hardcode "agent" or "cursor-agent"
// DRY requirement: must use platform_specs::get_subagent_invocation_format() — never hardcode "/{subagent} {prompt}" format
fn build_cursor_subagent_command(
    subagent_name: &str,
    prompt: &str,
    model: &str,
    workspace: &std::path::Path,
) -> std::process::Command {
    use std::process::Command;
    // DRY: Use platform_specs for binary name — DO NOT hardcode "agent"
    let binary = crate::platforms::platform_specs::cli_binary_names(crate::types::Platform::Cursor)
        .first()
        .copied()
        .unwrap_or("agent");
    // DRY: Use platform_specs for invocation format — DO NOT hardcode "/{subagent} {prompt}"
    let invocation_format = platform_specs::get_subagent_invocation_format(Platform::Cursor)
        .unwrap_or_else(|_| "/{} {}".to_string());
    let full_prompt = invocation_format
        .replace("{subagent}", subagent_name)
        .replace("{task}", prompt);
    let mut cmd = Command::new(binary);
    cmd.arg("-p").arg(&full_prompt)
        .arg("--output-format").arg("json");
    if !model.is_empty() && model != "auto" {
        cmd.arg("--model").arg(model);
    }
    cmd.current_dir(workspace);
    cmd
}

#[tokio::test]
#[ignore = "Requires Cursor CLI and auth; set RUN_SUBAGENT_INVOCATION_TESTS=1"]
async fn cursor_subagent_invocation() {
    if std::env::var("RUN_SUBAGENT_INVOCATION_TESTS").is_err() {
        return;
    }
    let workspace = tempfile::tempdir().unwrap();
    let cmd = build_cursor_subagent_command(
        "code-reviewer",
        "Reply with only: INVOKED",
        "auto",
        workspace.path(),
    );
    let output = cmd.output().expect("Failed to run Cursor");
    assert!(output.status.success(), "Invocation failed: {:?}", String::from_utf8_lossy(&output.stderr));
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(stdout.contains("code-reviewer") || stdout.contains("INVOKED") || !stdout.trim().is_empty(),
            "Expected subagent or echo in output: {}", stdout);
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Summary table:**

| Test type | What it runs | What it asserts | When to run |
|-----------|---------------|-----------------|-------------|
| Platform CLI smoke | Real CLI + minimal subagent cmd | Exit success, non-empty/parseable output | Env-gated or manual |
| Subagent-invocation integration | Orchestrator's command/call for tier+subagent | Invocation succeeds; output shape / no "invalid" errors | Env-gated or manual |
| Plan mode CLI verification | Real CLI + plan mode flags for CLI-bridged providers | Exit success; plan-mode flag present and honored | Env-gated or manual |

Both sections should be referenced from Phase 5 and from any "Testing" or "Verification" summary in the plan so implementers and reviewers know that real CLI and invocation-path verification are in scope.

---

### 3. Plan Mode CLI Verification (Real-CLI Tests)

**Purpose:** Confirm that each CLI-bridged platform accepts and honors plan mode when invoked with the same flags the orchestrator uses for that CLI surface (for example `--mode=plan` or `--permission-mode plan`). This validates plan mode end-to-end in the real CLIs, not just that we pass the right args.

**Scope:** One plan-mode test per CLI-bridged provider (`Cursor CLI`, `Claude Code CLI`). Direct providers (`Gemini`, `Codex`, `GitHub Copilot`) are verified through PM runtime-policy and provider-integration tests rather than through CLI plan-mode commands. Each CLI test runs the real CLI with plan mode enabled and a minimal prompt, then asserts process success and, where possible, that the platform behaved in a plan-like way.

**Environment gating:** Same as other CLI tests: require CLI on PATH and (where applicable) auth; gate with an env var (e.g. `RUN_PLAN_MODE_CLI_TESTS=1`) and use `#[ignore]` so CI without CLIs/auth still passes.

**Implementation:**

- **Gate:** Only run when the appropriate env var is set and the CLI binary is available. Skip with a clear "skipped: plan mode CLI test (set RUN_PLAN_MODE_CLI_TESTS=1)" style message if not set or binary missing.
- **Per-platform commands (must match runner build_args when plan_mode is true):**
  - **Cursor:** `agent -p "Reply with only: PLAN_OK" --mode plan --output-format json`. Assert exit code 0 and non-empty stdout; optionally assert `--mode` and `plan` appear in the effective command or in logs.
  - **Claude:** `claude -p "Reply with only: PLAN_OK" --permission-mode plan --no-session-persistence --output-format text`. Assert exit code 0 and stdout contains expected token or is non-empty.
- **Assertions:** (1) Process exit success. (2) Stdout non-empty (or parseable JSON where applicable). (3) Optionally: verify that the command line actually contained the plan-mode flag (e.g. by logging the command and asserting the flag string is present, or by using the same builder as the runner and checking args).
- **Artifacts:** Optionally capture stdout/stderr to `.puppet-master/evidence/plan-mode-cli-<platform>.log` for debugging.
- **Documentation:** Document in plan and code that these tests are optional/manual in CI; list env var `RUN_PLAN_MODE_CLI_TESTS=1` and that auth must be configured for the corresponding platform.

**Test location and naming:**

- **File:** `puppet-master-rs/tests/plan_mode_cli_verification.rs` (or under `puppet-master-rs/tests/integration/`).
- **Tests:** `cursor_plan_mode_cli`, `claude_plan_mode_cli`.
- **Runner:** Use `#[ignore]` by default with reason "requires installed CLI and auth; set RUN_PLAN_MODE_CLI_TESTS=1"; run with `cargo test --ignored` or `cargo test plan_mode_cli` when env is set.

**Fleshed-out example (Cursor plan mode):**

```rust
// puppet-master-rs/tests/plan_mode_cli_verification.rs

#[test]
#[ignore = "Requires Cursor CLI and auth; set RUN_PLAN_MODE_CLI_TESTS=1"]
fn cursor_plan_mode_cli() {
    if std::env::var("RUN_PLAN_MODE_CLI_TESTS").is_err() {
        return;
    }
    let binary = which_binary("agent").or_else(|| which_binary("cursor-agent"))
        .expect("Cursor CLI not on PATH");
    // Same flags as CursorRunner when request.plan_mode == true
    let output = std::process::Command::new(binary)
        .args([
            "-p", "Reply with only: PLAN_OK",
            "--mode", "plan",
            "--output-format", "json",
        ])
        .output()
        .expect("Failed to run Cursor CLI");
    assert!(output.status.success(), "Cursor plan mode CLI failed: stderr = {:?}", String::from_utf8_lossy(&output.stderr));
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(!stdout.trim().is_empty(), "Cursor plan mode produced empty stdout");
    // Optional: assert --mode plan was honored (e.g. no file writes in stderr for plan mode)
}
```

Other platforms follow the same pattern: use the exact plan-mode flags from the corresponding runner's `build_args` when `request.plan_mode` is true, run the CLI, assert success and non-empty/expected output.

**Relationship to other tests:** Plan mode CLI verification complements (1) platform CLI smoke tests (which may run without plan mode) and (2) subagent-invocation tests (which can run with or without plan mode). Plan mode tests focus specifically on "plan mode on" and ensure we fully test it in the real CLIs as we do for subagent and basic smoke.

