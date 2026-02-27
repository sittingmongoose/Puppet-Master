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
| Plan mode CLI verification | Real CLI + plan mode flags | Exit success; plan-mode flag present and honored | Env-gated or manual |

Both sections should be referenced from Phase 5 and from any "Testing" or "Verification" summary in the plan so implementers and reviewers know that real CLI and invocation-path verification are in scope.

---

### 3. Plan Mode CLI Verification (Real-CLI Tests)

**Purpose:** Confirm that each platform's CLI accepts and honors plan mode when invoked with the same flags the orchestrator uses (e.g. `--mode=plan`, `--permission-mode plan`, `--sandbox read-only`). This validates plan mode end-to-end in the real CLIs, not just that we pass the right args.

**Scope:** One plan-mode test per CLI-bridged provider (Cursor, Claude Code). For Direct-provider backends (e.g., Gemini), verify plan-mode behavior via API-based calls (plan mode is internal to Puppet Master, not provider CLI flags). Each test runs the real CLI with plan mode enabled and a minimal prompt, then asserts process success and (where possible) that the platform behaved in a plan-like way (e.g. read-only, or plan output present).

**Environment gating:** Same as other CLI tests: require CLI on PATH and (where applicable) auth; gate with an env var (e.g. `RUN_PLAN_MODE_CLI_TESTS=1`) and use `#[ignore]` so CI without CLIs/auth still passes.

**Implementation:**

- **Gate:** Only run when the appropriate env var is set and the CLI binary is available. Skip with a clear "skipped: plan mode CLI test (set RUN_PLAN_MODE_CLI_TESTS=1)" style message if not set or binary missing.
- **Per-platform commands (must match runner build_args when plan_mode is true):**
  - **Cursor:** `agent -p "Reply with only: PLAN_OK" --mode plan --output-format json`. Assert exit code 0 and non-empty stdout; optionally assert `--mode` and `plan` appear in the effective command or in logs.
  - **Claude:** `claude -p "Reply with only: PLAN_OK" --permission-mode plan --no-session-persistence --output-format text`. Assert exit code 0 and stdout contains expected token or is non-empty.
  - **Codex:** `codex exec "Reply with only: PLAN_OK" --sandbox read-only --json --color never --cd <workspace>`. Assert exit code 0 and non-empty stdout (read-only sandbox implies plan-like behavior).
  - **Gemini:** Gemini is a Direct API provider; verify plan-mode API call by sending a plan-constrained request via the Gemini API. Assert a successful response with non-empty output.
  - **Copilot:** Run with the same flags the Copilot runner uses when `plan_mode` is true (omit `--allow-all-paths` / `--allow-all-urls`), e.g. `copilot -p "Reply with only: PLAN_OK" --allow-all-tools --stream off -s`. Assert exit code 0 and non-empty stdout.
- **Assertions:** (1) Process exit success. (2) Stdout non-empty (or parseable JSON where applicable). (3) Optionally: verify that the command line actually contained the plan-mode flag (e.g. by logging the command and asserting the flag string is present, or by using the same builder as the runner and checking args).
- **Artifacts:** Optionally capture stdout/stderr to `.puppet-master/evidence/plan-mode-cli-<platform>.log` for debugging.
- **Documentation:** Document in plan and code that these tests are optional/manual in CI; list env var `RUN_PLAN_MODE_CLI_TESTS=1` and that auth must be configured for the corresponding platform.

**Test location and naming:**

- **File:** `puppet-master-rs/tests/plan_mode_cli_verification.rs` (or under `puppet-master-rs/tests/integration/`).
- **Tests:** `cursor_plan_mode_cli`, `codex_plan_mode_cli`, `claude_plan_mode_cli`, `gemini_plan_mode_cli`, `copilot_plan_mode_cli`.
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

