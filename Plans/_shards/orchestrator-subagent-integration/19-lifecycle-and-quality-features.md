## Lifecycle and Quality Features

This section defines lifecycle hooks, structured handoff contracts, remediation loops, and cross-session persistence that enhance reliability and quality across **all five platforms** (Cursor, Codex, Claude Code, Gemini, Copilot). These features complement the start/end verification above and can be implemented using platform-native hooks where available, or via orchestrator-level middleware for platforms without native hooks.

### 1. Hook-Based Lifecycle Middleware (BeforeTier/AfterTier)

**Concept:** Puppet Master should support **BeforeTier** and **AfterTier** hooks that run automatically at tier boundaries (Phase, Task, Subtask, Iteration). Hooks handle lifecycle concerns (tracking, state management, validation) separately from execution logic.

**Platform-specific hook registration:**

- **Cursor:** Register hooks in `.cursor/hooks.json` or `~/.cursor/hooks.json` for native hooks (`SubagentStart`, `SubagentStop`, `beforeSubmitPrompt`, `afterAgentResponse`). Also implement orchestrator-level hooks in Rust that wrap platform calls. **Note:** CLI subagents have reported issues (Feb 2026); use orchestrator-level hooks as primary, native hooks as enhancement when CLI subagents are fixed.
- **Codex:** Use CLI lifecycle outputs and orchestrator-managed hooks/middleware. Implement orchestrator-level hooks as primary middleware.
- **Claude Code:** Register hooks in `.claude/settings.json` for native hooks (`SubagentStart`, `SubagentStop`, `PreToolUse`, `PostToolUse`, `SessionStart`, `SessionEnd`). Also implement orchestrator-level hooks. Native hooks can block operations (exit code 2) or inject context.
- **Gemini:** Register hooks in `~/.gemini/settings.json` or extension config for native hooks (`BeforeAgent`, `AfterAgent`, `BeforeModel`, `AfterModel`, `BeforeTool`, `AfterTool`). Implement orchestrator-level hooks as fallback. Gemini hooks communicate via JSON stdin/stdout.
- **Copilot:** Use CLI lifecycle outputs and orchestrator-managed hooks/middleware. Implement orchestrator-level hooks as primary.

**Hook trait definition:**

```rust
// src/core/hooks.rs or src/verification/hooks.rs

use crate::types::{Platform, TierType};
use crate::core::state_persistence::TierContext;
use anyhow::Result;

/// Hook context passed to BeforeTier hook
pub struct BeforeTierContext {
    pub tier_id: String,
    pub tier_type: TierType,
    pub platform: Platform,
    pub model: String,
    pub selected_subagents: Vec<String>,
    pub config_snapshot: serde_json::Value, // Serialized tier config + orchestrator config
    pub known_gaps: Vec<String>, // Known gaps/issues that could affect this tier
}

/// Hook context passed to AfterTier hook
pub struct AfterTierContext {
    pub tier_id: String,
    pub tier_type: TierType,
    pub platform: Platform,
    pub subagent_output: String, // Raw stdout from subagent
    pub completion_status: CompletionStatus, // Success, Failure, Warning
    pub iteration_count: u32,
}

pub enum CompletionStatus {
    Success,
    Failure(String),
    Warning(String),
}

/// BeforeTier hook trait
pub trait BeforeTierHook: Send + Sync {
    /// Execute hook before tier starts
    fn execute(&self, ctx: &BeforeTierContext) -> Result<BeforeTierResult>;
    
    /// Hook name for logging/debugging
    fn name(&self) -> &str;
}

/// AfterTier hook trait
pub trait AfterTierHook: Send + Sync {
    /// Execute hook after tier completes
    fn execute(&self, ctx: &AfterTierContext) -> Result<AfterTierResult>;
    
    /// Hook name for logging/debugging
    fn name(&self) -> &str;
}

pub struct BeforeTierResult {
    /// Active subagent to track (from selection or override)
    pub active_subagent: Option<String>,
    /// Additional context to inject into subagent prompt
    pub injected_context: Option<String>,
    /// Whether to block tier start (hook can prevent execution)
    pub block: bool,
    /// Block reason if blocking
    pub block_reason: Option<String>,
}

pub struct AfterTierResult {
    /// Whether handoff validation passed
    pub validation_passed: bool,
    /// Validation error if failed
    pub validation_error: Option<String>,
    /// Whether to request retry (one chance)
    pub request_retry: bool,
    /// Retry reason
    pub retry_reason: Option<String>,
}

/// Hook registry that manages all hooks
pub struct HookRegistry {
    before_tier_hooks: Vec<Box<dyn BeforeTierHook>>,
    after_tier_hooks: Vec<Box<dyn AfterTierHook>>,
}

impl HookRegistry {
    pub fn new() -> Self {
        Self {
            before_tier_hooks: Vec::new(),
            after_tier_hooks: Vec::new(),
        }
    }
    
    pub fn register_before_tier(&mut self, hook: Box<dyn BeforeTierHook>) {
        self.before_tier_hooks.push(hook);
    }
    
    pub fn register_after_tier(&mut self, hook: Box<dyn AfterTierHook>) {
        self.after_tier_hooks.push(hook);
    }
    
    /// Execute all BeforeTier hooks (safe wrapper)
    pub fn execute_before_tier(&self, ctx: &BeforeTierContext) -> Result<BeforeTierResult> {
        let mut active_subagent = None;
        let mut injected_contexts = Vec::new();
        let mut block = false;
        let mut block_reason = None;
        
        for hook in &self.before_tier_hooks {
            match safe_hook_main(|| hook.execute(ctx)) {
                Ok(result) => {
                    if result.block {
                        block = true;
                        block_reason = Some(result.block_reason.unwrap_or_else(|| format!("Hook {} blocked", hook.name())));
                        break; // Stop on first block
                    }
                    if let Some(subagent) = result.active_subagent {
                        active_subagent = Some(subagent);
                    }
                    if let Some(ctx) = result.injected_context {
                        injected_contexts.push(ctx);
                    }
                }
                Err(e) => {
                    log::warn!("BeforeTier hook {} failed: {}", hook.name(), e);
                    // Continue with other hooks (fail-safe)
                }
            }
        }
        
        Ok(BeforeTierResult {
            active_subagent,
            injected_context: if injected_contexts.is_empty() {
                None
            } else {
                Some(injected_contexts.join("\n\n"))
            },
            block,
            block_reason,
        })
    }
    
    /// Execute all AfterTier hooks (safe wrapper)
    pub fn execute_after_tier(&self, ctx: &AfterTierContext) -> Result<AfterTierResult> {
        let mut validation_passed = true;
        let mut validation_error = None;
        let mut request_retry = false;
        let mut retry_reason = None;
        
        for hook in &self.after_tier_hooks {
            match safe_hook_main(|| hook.execute(ctx)) {
                Ok(result) => {
                    if !result.validation_passed {
                        validation_passed = false;
                        validation_error = result.validation_error;
                        request_retry = result.request_retry;
                        retry_reason = result.retry_reason;
                        break; // Stop on first validation failure
                    }
                }
                Err(e) => {
                    log::warn!("AfterTier hook {} failed: {}", hook.name(), e);
                    // Continue with other hooks (fail-safe)
                }
            }
        }
        
        Ok(AfterTierResult {
            validation_passed,
            validation_error,
            request_retry,
            retry_reason,
        })
    }
}

/// Safe hook wrapper that guarantees structured output
fn safe_hook_main<F, T>(hook_fn: F) -> Result<T>
where
    F: FnOnce() -> Result<T>,
{
    hook_fn()
}
```

**Built-in hooks (implement in `src/core/hooks/builtin.rs`):**

1. **ActiveSubagentTrackerHook** (BeforeTier): Sets `active_subagent` in `TierContext`; persists to `.puppet-master/state/active-subagents.json`.
2. **TierContextInjectorHook** (BeforeTier): Injects current phase/task/subtask status, config snapshot, known gaps into subagent prompt.
3. **StaleStatePrunerHook** (BeforeTier): Prunes verification state older than 2 hours; creates state directories on first write.
4. **HandoffValidatorHook** (AfterTier): Validates subagent output format (calls `validate_subagent_output`); requests retry on malformed output.

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, modify `execute_tier`:

```rust
async fn execute_tier(&self, tier_id: &str) -> Result<()> {
    // ... existing state transition logic ...
    
    // BEFORE TIER: Execute BeforeTier hooks
    let before_ctx = BeforeTierContext {
        tier_id: tier_id.to_string(),
        tier_type,
        platform: tier_config.platform,
        model: tier_config.model.clone(),
        selected_subagents: self.get_selected_subagents(tier_id)?,
        config_snapshot: serde_json::to_value(&tier_config)?,
        known_gaps: self.get_known_gaps_for_tier(tier_type)?,
    };
    
    let before_result = self.hook_registry.execute_before_tier(&before_ctx)?;
    
    if before_result.block {
        return Err(anyhow!("Tier {} blocked by hook: {}", tier_id, before_result.block_reason.unwrap_or_default()));
    }
    
    // Update TierContext with active subagent
    if let Some(subagent) = before_result.active_subagent {
        self.update_tier_context(tier_id, |ctx| {
            ctx.active_subagent = Some(subagent);
        })?;
    }
    
    // Inject context into prompt if provided
    let prompt = if let Some(injected) = before_result.injected_context {
        format!("{}\n\n{}", prompt, injected)
    } else {
        prompt
    };
    
    // ... existing iteration execution ...
    
    // AFTER TIER: Execute AfterTier hooks
    let after_ctx = AfterTierContext {
        tier_id: tier_id.to_string(),
        tier_type,
        platform: tier_config.platform,
        subagent_output: iteration_result.output.clone(),
        completion_status: if gate_report.passed {
            CompletionStatus::Success
        } else {
            CompletionStatus::Failure(gate_report.report.unwrap_or_default())
        },
        iteration_count: attempt,
    };
    
    let after_result = self.hook_registry.execute_after_tier(&after_ctx)?;
    
    if !after_result.validation_passed {
        if after_result.request_retry && attempt < max_iterations {
            // Retry with format instruction
            let retry_prompt = format!("{}\n\nIMPORTANT: Format your output as structured JSON with task_report, downstream_context, and findings fields.", prompt);
            previous_feedback = Some(after_result.retry_reason.unwrap_or_else(|| "Output format validation failed".to_string()));
            continue; // Retry iteration
        } else {
            // Fail-safe: proceed with warnings
            log::warn!("Tier {} output validation failed but proceeding: {}", tier_id, after_result.validation_error.unwrap_or_default());
            // Mark tier as complete with warnings
        }
    }
    
    // ... rest of tier completion logic ...
}
```

**BeforeTier hook responsibilities (detailed):**

- **Track active subagent:** Record which subagent is active at this tier (e.g., `active_subagent: Option<String>` in `TierContext`). Persist to `.puppet-master/state/active-subagents.json` with format: `{ "tier_id": "1.1.1", "active_subagent": "rust-engineer", "timestamp": "2026-02-18T10:30:00Z" }`.
- **Inject tier context:** Add current phase/task/subtask status, config snapshot, and known gaps to subagent prompt or context. Format: "Current tier: {tier_id}, Type: {tier_type}, Platform: {platform}, Model: {model}. Known gaps: {gaps}. Config: {config_summary}."
- **Prune stale state:** Clean up verification state older than threshold (e.g., 2 hours). Check modification time of files in `.puppet-master/verification/<session-id>/`; delete if `mtime < now - 2 hours`.
- **Lazy state creation:** Create verification state directories on first write (no explicit setup commands). Create `.puppet-master/verification/<session-id>/` if it doesn't exist when first hook writes state.

**AfterTier hook responsibilities (detailed):**

- **Validate subagent output format:** Check that output matches structured handoff contract (see #2 below). Call `validate_subagent_output(output, platform)`; return `validation_passed: false` if malformed.
- **Track completion:** Update active subagent tracking (clear `active_subagent` in `TierContext`), mark tier completion state in `.puppet-master/state/active-subagents.json`.
- **Safe error handling:** Guarantee structured output even on hook failure. Wrap hook execution in `safe_hook_main`; on panic or error, return `{ "status": "error", "message": "...", "details": {...} }` instead of crashing.

**Platform-native hook integration:**

For platforms with native hooks, create adapter hooks that delegate:

```rust
// src/core/hooks/platform_adapters.rs

/// Cursor native hook adapter
pub struct CursorNativeHookAdapter {
    hook_script_path: PathBuf, // Path to .cursor/hooks.json registered script
}

impl BeforeTierHook for CursorNativeHookAdapter {
    fn execute(&self, ctx: &BeforeTierContext) -> Result<BeforeTierResult> {
        // Call Cursor hook script via subprocess
        // Pass context as JSON stdin
        // Parse JSON stdout
        // Return BeforeTierResult
    }
}

// Similar adapters for Claude Code, Gemini
```

**Implementation:** Create `src/core/hooks.rs` or `src/verification/hooks.rs` with `BeforeTierHook` and `AfterTierHook` traits. Register hooks per tier type in `HookRegistry`. Call hooks automatically at tier boundaries (before `verify_tier_start`, after `verify_tier_end`) in `orchestrator.rs::execute_tier`. For platforms with native hooks, register Puppet Master hooks that delegate to platform hooks where possible. **Default hooks:** Always register built-in hooks (ActiveSubagentTrackerHook, TierContextInjectorHook, StaleStatePrunerHook, HandoffValidatorHook) even if platform-native hooks are also registered.

### 2. Structured Handoff Report Validation

**Concept:** Enforce a standardized output format for subagent invocations. Every subagent must produce a structured handoff report with required fields. If output is malformed, block and request one retry (fail-safe after retry).

**BeforeHandoffValidation responsibilities:**

- **Detect output format:** Detect if subagent output is structured (JSON) or unstructured (text)
- **Load validation schema:** Load validation schema for `SubagentOutput` format
- **Prepare validation context:** Build validation context with expected fields and format requirements

**DuringHandoffValidation responsibilities:**

- **Parse structured output:** Attempt to parse output as structured `SubagentOutput` JSON
- **Validate required fields:** Validate that all required fields are present (`task_report` is required)
- **Validate field types:** Validate that field types match schema (string, array, enum, etc.)
- **Validate findings format:** Validate that findings array contains valid `Finding` objects with required fields
- **Extract from text (fallback):** If JSON parsing fails, attempt to extract structured data from text output
- **Request retry if malformed:** If output is malformed and retry not yet attempted, request one retry with format instruction

**AfterHandoffValidation responsibilities:**

- **Persist validation results:** Save validation results to `.puppet-master/state/handoff-validation-{tier_id}.json`
- **Update tier context:** Update tier context with validated `SubagentOutput` (task_report, downstream_context, findings)
- **Handle validation failures:** If validation fails after retry, proceed with partial output but mark tier as "complete with warnings"

**Required output format:**

```rust
// src/types/subagent_output.rs (new file)

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
// DRY:DATA:SubagentOutput — Structured subagent output format
pub struct SubagentOutput {
    /// Task report: what the subagent did
    pub task_report: String,
    /// Downstream context: information for next tier/subagent
    #[serde(skip_serializing_if = "Option::is_none")]
    pub downstream_context: Option<String>,
    /// Findings: quality issues, blockers, recommendations
    #[serde(default)]
    pub findings: Vec<Finding>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Finding {
    pub severity: Severity,
    pub category: String,   // e.g., "security", "performance", "maintainability"
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file: Option<PathBuf>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub suggestion: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Critical,
    Major,
    Minor,
    Info,
}

#[derive(Debug, thiserror::Error)]
pub enum ValidationError {
    #[error("JSON parse error: {0}")]
    JsonParse(#[from] serde_json::Error),
    #[error("Missing required field: {0}")]
    MissingField(String),
    #[error("Invalid severity: {0}")]
    InvalidSeverity(String),
    #[error("Text extraction failed: {0}")]
    TextExtraction(String),
    #[error("Validation failed after retry: {0}")]
    ValidationFailedAfterRetry(String),
}
```

**Platform-specific parser implementation:**

Extend `src/platforms/output_parser.rs` with new parser methods:

```rust
// Add to ParsedOutput struct:
pub struct ParsedOutput {
    // ... existing fields ...
    /// Parsed subagent output if structured format detected
    pub subagent_output: Option<SubagentOutput>,
}

// Add to OutputParser trait:
pub trait OutputParser: Send + Sync {
    // ... existing methods ...
    
    /// Parse structured subagent output (platform-specific)
    fn parse_subagent_output(&self, stdout: &str, stderr: &str) -> Result<SubagentOutput, ValidationError>;
    
    /// Extract structured output from text (fallback)
    fn extract_subagent_output_from_text(&self, stdout: &str, stderr: &str) -> Result<SubagentOutput, ValidationError>;
}

// Implementation for each platform parser:

impl OutputParser for CursorOutputParser {
    // DRY REQUIREMENT: Tag with // DRY:FN:parse_subagent_output_cursor
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY REQUIREMENT: Output format detection MUST use platform_specs — DO NOT hardcode "--output-format json"
        // Cursor outputs JSON with --output-format json (from platform_specs)
        // Implementation note: Use platform_specs to determine expected output format for this platform
        let json: serde_json::Value = serde_json::from_str(stdout)
            .map_err(|e| ValidationError::JsonParse(e))?;
        
        // Extract structured fields
        let task_report = json.get("task_report")
            .and_then(|v| v.as_str())
            .ok_or_else(|| ValidationError::MissingField("task_report".to_string()))?
            .to_string();
        
        let downstream_context = json.get("downstream_context")
            .and_then(|v| v.as_str())
            .map(String::from);
        
        let findings = json.get("findings")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|item| {
                        serde_json::from_value::<Finding>(item.clone()).ok()
                    })
                    .collect()
            })
            .unwrap_or_default();
        
        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
    
    fn extract_subagent_output_from_text(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // Fallback: extract from text output
        // Look for structured markers (e.g., "Task Report:", "Findings:", etc.)
        // Or use LLM to extract structured data from text
        // Implementation depends on platform output format
        
        // Simple text extraction (can be enhanced with LLM)
        let task_report = if let Some(start) = stdout.find("Task Report:") {
            let end = stdout[start..].find("\n\n").unwrap_or(stdout.len() - start);
            stdout[start + 12..start + end].trim().to_string()
        } else {
            stdout.to_string() // Fallback: use entire output as task report
        };
        
        Ok(SubagentOutput {
            task_report,
            downstream_context: None,
            findings: Vec::new(), // Cannot extract findings from text reliably
        })
    }
}

// Similar implementations for other platform parsers...
```

**Validation workflow:**

```rust
// src/core/handoff_validation.rs

use crate::types::subagent_output::{SubagentOutput, ValidationError};
use crate::platforms::{PlatformRunner, OutputParser};

// DRY:DATA:HandoffValidator — Structured handoff validation system
pub struct HandoffValidator {
    parser: Box<dyn OutputParser>,
    max_retries: u32,
}

impl HandoffValidator {
    // DRY:FN:validate_subagent_output — Validate subagent output format
    // DRY REQUIREMENT: MUST use platform_specs to determine parser type — NEVER hardcode parser selection by platform
    pub async fn validate_subagent_output(
        &self,
        stdout: &str,
        stderr: &str,
        platform: Platform,
        retry_count: u32,
    ) -> Result<SubagentOutput, ValidationError> {
        // DRY: Parser selection MUST use platform_specs to determine output format — DO NOT use match platform statements
        // Try structured parsing first
        match self.parser.parse_subagent_output(stdout, stderr) {
            Ok(output) => {
                // Validate required fields
                self.validate_required_fields(&output)?;
                Ok(output)
            }
            Err(ValidationError::JsonParse(_)) => {
                // JSON parse failed, try text extraction
                if retry_count < self.max_retries {
                    // Request retry with format instruction
                    return Err(ValidationError::ValidationFailedAfterRetry(
                        "Output is not valid JSON. Please output structured JSON format.".to_string()
                    ));
                }
                
                // Max retries reached, try text extraction as fallback
                self.parser.extract_subagent_output_from_text(stdout, stderr)
                    .map_err(|e| ValidationError::TextExtraction(format!("Failed to extract from text: {}", e)))
            }
            Err(e) => {
                // Other validation error
                if retry_count < self.max_retries {
                    return Err(ValidationError::ValidationFailedAfterRetry(
                        format!("Validation failed: {}", e)
                    ));
                }
                Err(e)
            }
        }
    }
    
    fn validate_required_fields(&self, output: &SubagentOutput) -> Result<(), ValidationError> {
        // Validate task_report is not empty
        if output.task_report.trim().is_empty() {
            return Err(ValidationError::MissingField("task_report".to_string()));
        }
        
        // Validate findings have required fields
        for finding in &output.findings {
            if finding.description.trim().is_empty() {
                return Err(ValidationError::MissingField("finding.description".to_string()));
            }
            
            // Validate severity is valid
            match finding.severity {
                Severity::Critical | Severity::Major | Severity::Minor | Severity::Info => {}
            }
        }
        
        Ok(())
    }
}
```

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, extend subagent execution:

```rust
use crate::core::handoff_validation::HandoffValidator;

impl Orchestrator {
    async fn execute_with_subagent(
        &self,
        platform: Platform,
        model: &str,
        subagent_name: &str,
        prompt: &str,
        context: &TierContext,
    ) -> Result<SubagentOutput> {
        let runner = self.get_platform_runner(platform)?;
        let mut retry_count = 0;
        
        loop {
            // Execute subagent
            let output = runner.execute_with_subagent(
                subagent_name,
                prompt,
                &context.workspace,
            ).await?;
            
            // Validate handoff output
            let validator = HandoffValidator::new(platform)?;
            match validator.validate_subagent_output(
                &output.stdout,
                &output.stderr,
                platform,
                retry_count,
            ).await {
                Ok(validated_output) => {
                    // Validation passed
                    return Ok(validated_output);
                }
                Err(ValidationError::ValidationFailedAfterRetry(msg)) => {
                    // Request retry with format instruction
                    retry_count += 1;
                    if retry_count >= validator.max_retries() {
                        // Max retries reached, proceed with partial output
                        tracing::warn!("Handoff validation failed after {} retries: {}", retry_count, msg);
                        return Ok(validator.extract_partial_output(&output.stdout, &output.stderr)?);
                    }
                    
                    // Update prompt with format instruction
                    let updated_prompt = format!(
                        "{}\n\n**IMPORTANT:** Output must be valid JSON matching this format:\n{}\n\nCurrent output was not valid JSON. Please retry with structured JSON output.",
                        prompt,
                        serde_json::to_string_pretty(&SubagentOutput::example())?
                    );
                    
                    // Continue loop with updated prompt
                    continue;
                }
                Err(e) => {
                    return Err(anyhow!("Handoff validation error: {}", e));
                }
            }
        }
    }
}
```

**Error handling:**

- **JSON parse failure:** If JSON parsing fails, attempt text extraction; if that fails and retry not attempted, request retry with format instruction
- **Missing field failure:** If required field is missing, request retry with field requirement instruction
- **Invalid severity failure:** If severity is invalid, request retry with valid severity values
- **Max retries reached:** If max retries reached, proceed with partial output but mark tier as "complete with warnings"
                    .filter_map(|v| serde_json::from_value(v.clone()).ok())
                    .collect()
            })
            .unwrap_or_default();
        
        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
}

impl OutputParser for CodexOutputParser {
    // DRY:FN:parse_subagent_output_codex -- Parse Codex subagent output
    // DRY REQUIREMENT: Output format detection MUST use platform_specs -- DO NOT hardcode "JSONL" or output format
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY: Use platform_specs to determine expected output format -- DO NOT hardcode "Codex outputs JSONL"
        // Codex outputs JSONL (one JSON object per line) -- format from platform_specs
        let mut task_report = String::new();
        let mut downstream_context = None;
        let mut findings = Vec::new();
        
        for line in stdout.lines() {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
                // Look for Turn event with structured output
                if let Some(event_type) = json.get("type").and_then(|v| v.as_str()) {
                    if event_type == "Turn" || event_type == "turn" {
                        if let Some(content) = json.get("content") {
                            // Try to parse content as SubagentOutput
                            if let Ok(output) = serde_json::from_value::<SubagentOutput>(content.clone()) {
                                return Ok(output);
                            }
                            // Fallback: extract text content
                            if let Some(text) = content.as_str() {
                                task_report.push_str(text);
                            }
                        }
                    }
                }
                
                // Aggregate findings from multiple events
                if let Some(f) = json.get("findings").and_then(|v| v.as_array()) {
                    for finding_val in f {
                        if let Ok(finding) = serde_json::from_value::<Finding>(finding_val.clone()) {
                            findings.push(finding);
                        }
                    }
                }
            }
        }
        
        // If no structured output found, try to extract from text
        if task_report.is_empty() {
            return Err(ValidationError::TextExtraction("No structured output found in JSONL".to_string()));
        }
        
        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
}

impl OutputParser for ClaudeOutputParser {
    // DRY:FN:parse_subagent_output_claude -- Parse Claude Code subagent output
    // DRY REQUIREMENT: Output format detection MUST use platform_specs -- DO NOT hardcode "--output-format json"
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY: Use platform_specs to determine expected output format -- DO NOT hardcode "Claude outputs JSON"
        // Claude outputs JSON with --output-format json -- format from platform_specs
        let json: serde_json::Value = serde_json::from_str(stdout)?;
        
        // Claude wraps output in "result" -> "content" or direct fields
        let content = json.get("result")
            .and_then(|r| r.get("content"))
            .or_else(|| Some(&json))
            .ok_or_else(|| ValidationError::MissingField("result.content".to_string()))?;
        
        // Try direct parse
        if let Ok(output) = serde_json::from_value::<SubagentOutput>(content.clone()) {
            return Ok(output);
        }
        
        // Fallback: extract fields manually
        let task_report = content.get("task_report")
            .and_then(|v| v.as_str())
            .or_else(|| content.as_str())
            .ok_or_else(|| ValidationError::MissingField("task_report".to_string()))?
            .to_string();
        
        let downstream_context = content.get("downstream_context")
            .and_then(|v| v.as_str())
            .map(String::from);
        
        let findings = content.get("findings")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| serde_json::from_value(v.clone()).ok())
                    .collect()
            })
            .unwrap_or_default();
        
        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
}

impl OutputParser for GeminiOutputParser {
    // DRY:FN:parse_subagent_output_gemini -- Parse Gemini subagent output
    // DRY REQUIREMENT: Output format detection MUST use platform_specs -- DO NOT hardcode "--output-format json"
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY: Use platform_specs to determine expected output format -- DO NOT hardcode "Gemini outputs JSON"
        // Gemini outputs JSON with --output-format json -- format from platform_specs
        let json: serde_json::Value = serde_json::from_str(stdout)?;
        
        // Gemini wraps in "candidates" -> [0] -> "content" -> "parts" -> [0] -> "text"
        let text = json.get("candidates")
            .and_then(|c| c.as_array())
            .and_then(|arr| arr.get(0))
            .and_then(|c| c.get("content"))
            .and_then(|c| c.get("parts"))
            .and_then(|p| p.as_array())
            .and_then(|arr| arr.get(0))
            .and_then(|p| p.get("text"))
            .and_then(|t| t.as_str())
            .ok_or_else(|| ValidationError::MissingField("candidates[0].content.parts[0].text".to_string()))?;
        
        // Try to parse text as JSON (Gemini may output JSON as text)
        if let Ok(output) = serde_json::from_str::<SubagentOutput>(text) {
            return Ok(output);
        }
        
        // Fallback: extract from text patterns
        Err(ValidationError::TextExtraction("Gemini text output requires pattern extraction".to_string()))
    }
}

impl OutputParser for CopilotOutputParser {
    // DRY:FN:parse_subagent_output_copilot -- Parse Copilot subagent output
    // DRY REQUIREMENT: Output format detection MUST use platform_specs -- DO NOT hardcode "Copilot outputs text"
    fn parse_subagent_output(&self, stdout: &str, _stderr: &str) -> Result<SubagentOutput, ValidationError> {
        // DRY: Use platform_specs to determine expected output format -- DO NOT hardcode "Copilot outputs text"
        // Copilot outputs text (no JSON) -- format from platform_specs
        // Extract structured sections via regex/pattern matching
        
        let combined = format!("{stdout}\n{stderr}");
        
        // Pattern: ## Task Report\n\n...content...
        let task_report_re = Regex::new(r"(?s)##\s*Task\s*Report\s*\n\n(.*?)(?=\n##|\z)").unwrap();
        let task_report = task_report_re.captures(&combined)
            .and_then(|cap| cap.get(1))
            .map(|m| m.as_str().trim().to_string())
            .ok_or_else(|| ValidationError::MissingField("Task Report section".to_string()))?;
        
        // Pattern: ## Downstream Context\n\n...content... (optional)
        let downstream_re = Regex::new(r"(?s)##\s*Downstream\s*Context\s*\n\n(.*?)(?=\n##|\z)").unwrap();
        let downstream_context = downstream_re.captures(&combined)
            .and_then(|cap| cap.get(1))
            .map(|m| m.as_str().trim().to_string());
        
        // Pattern: ## Findings\n\n- [Severity] Category: Description (file:line) Suggestion
        let findings_re = Regex::new(r"(?m)^-\s*\[(Critical|Major|Minor|Info)\]\s*(\w+):\s*(.*?)(?:\s*\(([^:]+):(\d+)\))?(?:\s*Suggestion:\s*(.*))?$").unwrap();
        let mut findings = Vec::new();
        
        if let Some(findings_section) = Regex::new(r"(?s)##\s*Findings\s*\n\n(.*?)(?=\n##|\z)").unwrap().captures(&combined) {
            for cap in findings_re.captures_iter(findings_section.get(1).unwrap().as_str()) {
                let severity = match cap.get(1).unwrap().as_str() {
                    "Critical" => Severity::Critical,
                    "Major" => Severity::Major,
                    "Minor" => Severity::Minor,
                    "Info" => Severity::Info,
                    _ => continue,
                };
                
                findings.push(Finding {
                    severity,
                    category: cap.get(2).unwrap().as_str().to_string(),
                    description: cap.get(3).unwrap().as_str().to_string(),
                    file: cap.get(4).map(|m| PathBuf::from(m.as_str())),
                    line: cap.get(5).and_then(|m| m.as_str().parse().ok()),
                    suggestion: cap.get(6).map(|m| m.as_str().to_string()),
                });
            }
        }
        
        Ok(SubagentOutput {
            task_report,
            downstream_context,
            findings,
        })
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Validation function:**

```rust
// src/core/hooks/handoff_validator.rs

use crate::platforms::output_parser::{OutputParser, create_parser};
use crate::types::{Platform, SubagentOutput};
use crate::core::hooks::ValidationError;

pub fn validate_subagent_output(
    output: &str,
    stderr: &str,
    platform: Platform,
) -> Result<SubagentOutput, ValidationError> {
    let parser = create_parser(platform);
    parser.parse_subagent_output(output, stderr)
}
```

**Validation logic in AfterTier hook:** AfterTier hook calls `validate_subagent_output(output: &str, stderr: &str, platform: Platform) -> Result<SubagentOutput, ValidationError>`. If validation fails:
1. Log error with details (platform, error type, partial output snippet).
2. Request one retry (re-run subagent with "format your output as structured JSON" instruction appended to prompt).
3. If retry also fails, proceed with partial output (fail-safe) but mark tier as "complete with warnings" in `TierContext`.

**Integration with existing ParsedOutput:**

Modify `src/platforms/output_parser.rs` to populate `subagent_output` field:

```rust
impl OutputParser for CursorOutputParser {
    fn parse(&self, stdout: &str, stderr: &str) -> ParsedOutput {
        let mut output = ParsedOutput::new(stdout.to_string());
        // ... existing parsing ...
        
        // Try to parse structured subagent output
        output.subagent_output = self.parse_subagent_output(stdout, stderr).ok();
        
        output
    }
}
```

**Benefits:** Ensures Phase/Task/Subtask reliably know what their subagents produced; enables automated remediation loops; supports cross-tier context passing; provides structured error reporting for debugging.

### 3. Remediation Loop for Critical/Major Findings

**Concept:** When quality verification finds Critical or Major issues, block tier completion and enter a remediation loop. Re-run reviewer subagent until Critical/Major findings are resolved or escalated. Minor/Info findings log and proceed.

**Severity levels:**

- **Critical:** Security vulnerabilities, data loss risks, breaking changes -- **block completion**.
- **Major:** Performance issues, maintainability problems, test failures -- **block completion**.
- **Minor:** Code style, minor optimizations, suggestions -- **log and proceed**.
- **Info:** Documentation, comments, non-blocking recommendations -- **log and proceed**.

**Remediation loop implementation:**

```rust
// src/core/remediation.rs (new file)

use crate::types::SubagentOutput;
use crate::core::hooks::Severity;
use crate::core::orchestrator::Orchestrator;

// DRY:DATA:RemediationLoop — Remediation loop for Critical/Major findings
pub struct RemediationLoop {
    max_retries: u32,
    orchestrator: Arc<Orchestrator>,
}

impl RemediationLoop {
    // DRY:FN:new — Create remediation loop
    pub fn new(max_retries: u32, orchestrator: Arc<Orchestrator>) -> Self {
        Self { max_retries, orchestrator }
    }
    
    // DRY:FN:run — Run remediation loop for a tier
    // DRY REQUIREMENT: Reviewer subagent name MUST come from subagent_registry — NEVER hardcode "code-reviewer"
    /// Run remediation loop for a tier
    pub async fn run(
        &self,
        tier_id: &str,
        reviewer_output: SubagentOutput,
    ) -> Result<RemediationResult> {
        // DRY: Severity filtering logic is reusable — consider extracting to DRY:FN:filter_critical_major_findings
        let critical_major: Vec<_> = reviewer_output.findings
            .iter()
            .filter(|f| matches!(f.severity, Severity::Critical | Severity::Major))
            .collect();
        
        if critical_major.is_empty() {
            // Only Minor/Info findings: log and proceed
            self.log_findings(&reviewer_output.findings);
            return Ok(RemediationResult::Complete);
        }
        
        // Critical/Major findings: enter remediation loop
        let mut retry_count = 0;
        let mut current_findings = critical_major.clone();
        
        while retry_count < self.max_retries {
            // Mark tier as incomplete
            self.orchestrator.mark_tier_incomplete(tier_id, &current_findings).await?;
            
            // Build remediation prompt
            let remediation_prompt = self.build_remediation_prompt(&current_findings);
            
            // DRY REQUIREMENT: Overseer and reviewer subagent names MUST come from subagent_registry — NEVER hardcode names
            // Re-run overseer subagent with remediation prompt
            // Implementation note: re_run_overseer_with_prompt MUST use subagent_registry to get overseer subagent name
            let overseer_result = self.orchestrator
                .re_run_overseer_with_prompt(tier_id, &remediation_prompt)
                .await?;
            
            // DRY REQUIREMENT: Reviewer subagent name MUST come from subagent_registry::get_reviewer_subagent_for_tier()
            // Re-run reviewer subagent
            // Implementation note: re_run_reviewer MUST use subagent_registry to get reviewer subagent name
            let reviewer_result = self.orchestrator
                .re_run_reviewer(tier_id)
                .await?;
            
            // Parse new findings
            let new_critical_major: Vec<_> = reviewer_result.findings
                .iter()
                .filter(|f| matches!(f.severity, Severity::Critical | Severity::Major))
                .collect();
            
            if new_critical_major.is_empty() {
                // All Critical/Major resolved
                return Ok(RemediationResult::Resolved);
            }
            
            // Check if findings changed (progress made)
            if self.findings_unchanged(&current_findings, &new_critical_major) {
                retry_count += 1;
                if retry_count >= self.max_retries {
                    // Escalate to parent-tier orchestrator
                    return Ok(RemediationResult::Escalate(new_critical_major));
                }
            } else {
                // Progress made, reset retry count
                retry_count = 0;
            }
            
            current_findings = new_critical_major;
        }
        
        Ok(RemediationResult::Escalate(current_findings))
    }
    
    fn build_remediation_prompt(&self, findings: &[&Finding]) -> String {
        let mut prompt = "CRITICAL/Major findings must be fixed before tier completion:\n\n".to_string();
        for finding in findings {
            prompt.push_str(&format!(
                "- [{}] {}: {}\n",
                format!("{:?}", finding.severity),
                finding.category,
                finding.description
            ));
            if let Some(file) = &finding.file {
                prompt.push_str(&format!("  File: {}\n", file.display()));
            }
            if let Some(line) = finding.line {
                prompt.push_str(&format!("  Line: {}\n", line));
            }
            if let Some(suggestion) = &finding.suggestion {
                prompt.push_str(&format!("  Suggestion: {}\n", suggestion));
            }
            prompt.push('\n');
        }
        prompt.push_str("\nPlease fix these issues and re-run verification.");
        prompt
    }
    
    fn findings_unchanged(&self, old: &[&Finding], new: &[&Finding]) -> bool {
        // Compare finding descriptions and locations
        old.len() == new.len() && old.iter().all(|o| {
            new.iter().any(|n| {
                o.description == n.description
                    && o.file == n.file
                    && o.line == n.line
            })
        })
    }
    
    fn log_findings(&self, findings: &[Finding]) {
        for finding in findings {
            log::info!(
                "[{}] {}: {}",
                format!("{:?}", finding.severity),
                finding.category,
                finding.description
            );
        }
    }
}

pub enum RemediationResult {
    Complete, // No Critical/Major findings
    Resolved, // Critical/Major findings resolved
    Escalate(Vec<Finding>), // Escalate to parent-tier orchestrator
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

**Integration with orchestrator:**

In `src/core/orchestrator.rs`, after gate passes and reviewer subagent runs:

```rust
// After reviewer subagent completes
let reviewer_output = parse_reviewer_output(&iteration_result.output)?;

// Run remediation loop
let remediation_result = self.remediation_loop
    .run(tier_id, reviewer_output)
    .await?;

match remediation_result {
    RemediationResult::Complete => {
        // Proceed with tier completion
    }
    RemediationResult::Resolved => {
        // Re-run gate to verify fixes
        // Then proceed with tier completion
    }
    RemediationResult::Escalate(findings) => {
        // Escalate to parent-tier orchestrator
        self.escalate_to_parent(tier_id, findings).await?;
        return Err(anyhow!("Tier {} escalated due to unresolved Critical/Major findings", tier_id));
    }
}
```

**Platform-specific implementation:** Works identically across all platforms -- remediation loop is orchestrator-level logic, not platform-specific. All platforms receive remediation prompts and re-run subagents the same way. The overseer and reviewer subagents are re-run using the same platform/model as the original tier execution.

**Integration with existing quality verification:** This extends the existing "required reviewer subagent" requirement. The reviewer must output structured findings with severity; the orchestrator enforces the remediation loop. The remediation loop runs **after** the gate passes but **before** tier completion, ensuring Critical/Major issues are addressed before advancing.

### 4. Cross-Session Knowledge Persistence (`save_memory`)

**Concept:** Persist architectural decisions, established patterns, tech choices, and lessons learned across runs. When a new run starts, load prior context to maintain continuity.

**What to persist:**

- **Architectural decisions:** Tech stack choices, design patterns, framework selections.
- **Established patterns:** Code organization, naming conventions, testing strategies.
- **Tech choices:** Dependency versions, tool configurations, environment setup.
- **Pitfalls encountered:** Known issues, workarounds, anti-patterns to avoid.

**Storage structure:**

```rust
// src/core/memory.rs (new file)

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchitectureMemory {
    pub decisions: Vec<ArchitecturalDecision>,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchitecturalDecision {
    pub category: String, // e.g., "tech_stack", "design_pattern", "framework"
    pub decision: String, // e.g., "Rust + Actix Web"
    pub rationale: Option<String>,
    pub alternatives_considered: Vec<String>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternsMemory {
    pub patterns: Vec<EstablishedPattern>,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EstablishedPattern {
    pub name: String, // e.g., "TDD", "Code organization", "Naming conventions"
    pub description: String,
    pub examples: Vec<String>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechChoicesMemory {
    pub choices: Vec<TechChoice>,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechChoice {
    pub category: String, // e.g., "dependency", "tool", "environment"
    pub name: String, // e.g., "clippy", "rustfmt"
    pub version: Option<String>,
    pub config: Option<serde_json::Value>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PitfallsMemory {
    pub pitfalls: Vec<Pitfall>,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pitfall {
    pub issue: String, // Description of the issue
    pub workaround: Option<String>,
    pub anti_pattern: Option<String>, // What to avoid
    pub context: Option<String>, // When this applies
    pub timestamp: DateTime<Utc>,
}

pub struct MemoryManager {
    memory_dir: PathBuf,
}

// DRY:DATA:MemoryManager — Cross-session memory management
impl MemoryManager {
    // DRY:FN:new — Create memory manager
    pub fn new(memory_dir: Option<PathBuf>) -> Self {
        let memory_dir = memory_dir.unwrap_or_else(|| {
            PathBuf::from(".puppet-master").join("memory")
        });
        Self { memory_dir }
    }
    
    // DRY:FN:save_architecture — Save architectural decision
    /// Save architectural decision
    pub async fn save_architecture(&self, decision: ArchitecturalDecision) -> Result<()> {
        let mut arch = self.load_architecture().await?;
        arch.decisions.push(decision);
        arch.last_updated = Utc::now();
        self.save_file("architecture.json", &arch).await
    }
    
    /// Load architectural decisions
    pub async fn load_architecture(&self) -> Result<ArchitectureMemory> {
        self.load_file("architecture.json").await
            .unwrap_or_else(|_| ArchitectureMemory {
                decisions: Vec::new(),
                last_updated: Utc::now(),
            })
    }
    
    /// Save pattern
    pub async fn save_pattern(&self, pattern: EstablishedPattern) -> Result<()> {
        let mut patterns = self.load_patterns().await?;
        patterns.patterns.push(pattern);
        patterns.last_updated = Utc::now();
        self.save_file("patterns.json", &patterns).await
    }
    
    /// Load patterns
    pub async fn load_patterns(&self) -> Result<PatternsMemory> {
        self.load_file("patterns.json").await
            .unwrap_or_else(|_| PatternsMemory {
                patterns: Vec::new(),
                last_updated: Utc::now(),
            })
    }
    
    /// Save tech choice
    pub async fn save_tech_choice(&self, choice: TechChoice) -> Result<()> {
        let mut tech = self.load_tech_choices().await?;
        tech.choices.push(choice);
        tech.last_updated = Utc::now();
        self.save_file("tech-choices.json", &tech).await
    }
    
    /// Load tech choices
    pub async fn load_tech_choices(&self) -> Result<TechChoicesMemory> {
        self.load_file("tech-choices.json").await
            .unwrap_or_else(|_| TechChoicesMemory {
                choices: Vec::new(),
                last_updated: Utc::now(),
            })
    }
    
    /// Save pitfall
    pub async fn save_pitfall(&self, pitfall: Pitfall) -> Result<()> {
        let mut pitfalls = self.load_pitfalls().await?;
        pitfalls.pitfalls.push(pitfall);
        pitfalls.last_updated = Utc::now();
        self.save_file("pitfalls.json", &pitfalls).await
    }
    
    /// Load pitfalls
    pub async fn load_pitfalls(&self) -> Result<PitfallsMemory> {
        self.load_file("pitfalls.json").await
            .unwrap_or_else(|_| PitfallsMemory {
                pitfalls: Vec::new(),
                last_updated: Utc::now(),
            })
    }
    
    /// Load all memory and format for prompt injection
    pub async fn load_all_for_prompt(&self) -> Result<String> {
        let arch = self.load_architecture().await?;
        let patterns = self.load_patterns().await?;
        let tech = self.load_tech_choices().await?;
        let pitfalls = self.load_pitfalls().await?;
        
        let mut prompt = String::new();
        
        if !arch.decisions.is_empty() {
            prompt.push_str("## Previous Architectural Decisions\n\n");
            for decision in &arch.decisions {
                prompt.push_str(&format!("- **{}**: {}\n", decision.category, decision.decision));
                if let Some(rationale) = &decision.rationale {
                    prompt.push_str(&format!("  Rationale: {}\n", rationale));
                }
            }
            prompt.push('\n');
        }
        
        if !patterns.patterns.is_empty() {
            prompt.push_str("## Established Patterns\n\n");
            for pattern in &patterns.patterns {
                prompt.push_str(&format!("- **{}**: {}\n", pattern.name, pattern.description));
            }
            prompt.push('\n');
        }
        
        if !tech.choices.is_empty() {
            prompt.push_str("## Tech Choices\n\n");
            for choice in &tech.choices {
                prompt.push_str(&format!("- **{}**: {}", choice.category, choice.name));
                if let Some(version) = &choice.version {
                    prompt.push_str(&format!(" ({})", version));
                }
                prompt.push('\n');
            }
            prompt.push('\n');
        }
        
        if !pitfalls.pitfalls.is_empty() {
            prompt.push_str("## Known Pitfalls to Avoid\n\n");
            for pitfall in &pitfalls.pitfalls {
                prompt.push_str(&format!("- {}\n", pitfall.issue));
                if let Some(workaround) = &pitfall.workaround {
                    prompt.push_str(&format!("  Workaround: {}\n", workaround));
                }
            }
        }
        
        Ok(prompt)
    }
    
    async fn save_file<T: Serialize>(&self, filename: &str, data: &T) -> Result<()> {
        std::fs::create_dir_all(&self.memory_dir)?;
        let path = self.memory_dir.join(filename);
        let json = serde_json::to_string_pretty(data)?;
        std::fs::write(path, json)?;
        Ok(())
    }
    
    async fn load_file<T: for<'de> Deserialize<'de>>(&self, filename: &str) -> Result<T> {
        let path = self.memory_dir.join(filename);
        let json = std::fs::read_to_string(path)?;
        let data: T = serde_json::from_str(&json)?;
        Ok(data)
    }
}
```

**When to persist:** At Phase completion (especially Phase 1: Planning/Architecture). Use `memory_manager.save_architecture()`, `save_pattern()`, `save_tech_choice()`, `save_pitfall()` functions. Extract decisions/patterns from Phase 1 output (e.g., parse "We chose Rust + Actix" → save as architectural decision).

**When to load:** At run start, before Phase 1 begins. Call `memory_manager.load_all_for_prompt()` and inject into Phase 1 context. Also use for subagent selection (e.g., "project uses Rust" → prefer `rust-engineer`; "established TDD pattern" → include `test-automator`).

**Platform-specific implementation:** Platform-agnostic -- memory persistence is orchestrator-level. All platforms benefit from loaded context injected into prompts. Memory files are stored in `.puppet-master/memory/` as JSON files, readable by all platforms.

### 5. Active Agent Tracking

**Concept:** Track which subagent is currently active at each tier. Store in tier context and expose for logging, debugging, and audit trails.

**Tracking:**

- **Per tier:** `active_subagent: Option<String>` in `TierContext`.
- **Per run:** `active_subagents: HashMap<TierId, String>` in orchestrator state.
- **Persistence:** Write to `.puppet-master/state/active-subagents.json` (updated on each tier start).

**BeforeTier hook:** Sets `active_subagent` when tier starts (from subagent selection or override).

**AfterTier hook:** Clears `active_subagent` when tier completes.

**Use cases:**

- **Logging:** "Phase X: active subagent = architect-reviewer"
- **Debugging:** "Why did this tier fail? Check active subagent logs."
- **Audit trails:** "Which subagents ran in this run? See active-subagents.json."
- **GUI display:** Show active subagent in tier status UI.

**Platform-specific implementation:** Platform-agnostic -- tracking is orchestrator-level. All platforms benefit from the same tracking mechanism.

### 6. Safe Error Handling (Guaranteed Structured Output)

**Concept:** Hooks and verification functions must never crash the session. Use wrappers that guarantee structured output (JSON or Result) even on failure.

**Wrapper pattern:**

```rust
pub fn safe_hook_main<F>(hook_fn: F) -> String
where
    F: FnOnce() -> Result<HookOutput, HookError>,
{
    match hook_fn() {
        Ok(output) => serde_json::to_string(&output).unwrap_or_else(|_| r#"{"status":"ok"}"#.to_string()),
        Err(e) => serde_json::to_string(&HookErrorOutput {
            status: "error",
            message: e.to_string(),
            details: None,
        }).unwrap_or_else(|_| r#"{"status":"error","message":"unknown"}"#.to_string()),
    }
}
```

**Application:**

- **BeforeTier/AfterTier hooks:** Wrap hook execution in `safe_hook_main` so hooks never crash.
- **Verification functions:** Return `Result<(), VerificationError>` with structured error types.
- **Subagent output parsing:** On parse failure, return `SubagentOutput { task_report: raw_output, downstream_context: None, findings: vec![] }` (partial output) rather than crashing.

**Platform-specific implementation:** Platform-agnostic -- safe error handling is Rust-level. All platforms benefit from the same wrappers.

### 7. Lazy Lifecycle (State Created on First Write)

**Concept:** Verification state directories are created lazily (on first write) and pruned after inactivity. No explicit setup/teardown commands required.

**Lazy creation:**

- **BeforeTier hook:** On first tier start, create `.puppet-master/verification/<session-id>/` if it doesn't exist.
- **State files:** Create on first write (e.g., `active-subagents.json`, `handoff-reports.json`).
- **No setup command:** Users don't need to run "puppet-master setup" -- state is created automatically.

**Stale pruning:**

- **BeforeTier hook:** Prune verification state older than threshold (e.g., 2 hours of inactivity).
- **Pruning logic:** Check modification time of state files; delete if older than threshold.
- **No teardown command:** Cleanup happens automatically during normal operation.

**Platform-specific implementation:** Platform-agnostic -- lazy lifecycle is orchestrator-level file system management. All platforms benefit from the same behavior.

### 8. Structured Handoff Contract Enforcement at Runtime

**Concept:** Enforce the structured handoff format (Task Report + Downstream Context + Findings) at runtime via AfterTier hook validation, not just in prompts. This ensures reliability even if prompts are modified.

**Enforcement:**

- **AfterTier hook:** Calls `validate_subagent_output()` (see #2 above).
- **On validation failure:** Block response, request one retry with format instruction.
- **After retry:** If still malformed, proceed with partial output (fail-safe) but mark tier as "complete with warnings."

**Documentation:** Document the contract in AGENTS.md and in subagent prompt templates. State that subagents **must** produce structured output; runtime validation enforces it.

**Platform-specific implementation:**

- **Cursor/Codex/Claude/Gemini:** Parse JSON output; validate required fields (`task_report`, `downstream_context`, `findings`).
- **Copilot:** Parse text output; extract structured sections via regex or pattern matching; validate presence.

**Integration with existing plan:** This complements the existing "required reviewer subagent" requirement. The reviewer must produce structured output; runtime validation ensures it.

### Platform-Specific Implementation Summary

| Feature | Cursor | Codex | Claude | Gemini | Copilot | Implementation Level |
|---------|--------|-------|--------|--------|---------|---------------------|
| **BeforeTier/AfterTier hooks** | Native hooks + orchestrator | CLI/provider bridge hooks + orchestrator | Native hooks + orchestrator | Native hooks + orchestrator | Orchestrator only | Orchestrator + platform hooks |
| **Handoff validation** | JSON parse | JSONL parse | JSON parse | JSON parse | Text parse | Platform-specific parser |
| **Remediation loop** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Cross-session memory** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Active agent tracking** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Safe error handling** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Lazy lifecycle** | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator | Orchestrator (platform-agnostic) |
| **Contract enforcement** | JSON validation | JSONL validation | JSON validation | JSON validation | Text validation | Platform-specific validator |

**Key insight:** Most features are **orchestrator-level** (platform-agnostic). Only handoff validation and contract enforcement need platform-specific parsers (JSON vs JSONL vs text). Hooks can leverage platform-native hooks where available (Cursor, Claude, Gemini) but also work via orchestrator-level middleware for all platforms.

### Integration with Start/End Verification

These lifecycle and quality features **complement** the existing start/end verification:

- **BeforeTier hook** runs **before** `verify_tier_start` (tracks active subagent, injects context, prunes state).
- **AfterTier hook** runs **after** `verify_tier_end` (validates handoff format, tracks completion, safe error handling).
- **Remediation loop** extends the existing "required reviewer subagent" -- reviewer outputs structured findings; orchestrator enforces remediation.
- **Cross-session memory** enhances Phase 1 context (loads prior decisions before planning).
- **Active agent tracking** enhances logging and debugging (shows which subagent ran at each tier).

### Additional Gaps and Potential Issues for Lifecycle and Quality Features

**Gap #14: Platform-native hook registration and discovery**

**Issue:** How do we discover and register platform-native hooks (Cursor `.cursor/hooks.json`, Claude `.claude/settings.json`, Gemini `~/.gemini/settings.json`)? Should Puppet Master auto-discover hooks or require explicit configuration?

**Mitigation:**
- **Auto-discovery:** Scan for hook config files in project root and home directory on startup. Register discovered hooks as adapters.
- **Explicit config:** Add `platform_hooks` section to `PuppetMasterConfig`:
  ```yaml
  platform_hooks:
    cursor:
      enabled: true
      config_path: ".cursor/hooks.json"
    claude:
      enabled: true
      config_path: ".claude/settings.json"
    gemini:
      enabled: true
      config_path: "~/.gemini/settings.json"
  ```
- **Fallback:** If platform-native hooks fail or are unavailable, fall back to orchestrator-level hooks (always available).

**Gap #15: Hook execution order and dependencies**

**Issue:** When multiple hooks are registered (built-in + platform-native), what is the execution order? Can hooks depend on each other? What if one hook blocks execution?

**Mitigation:**
- **Execution order:** Built-in hooks run first (ActiveSubagentTrackerHook, TierContextInjectorHook, StaleStatePrunerHook), then platform-native hooks, then custom hooks.
- **Dependencies:** Hooks should be independent. If a hook needs data from another hook, use shared context (`BeforeTierContext`/`AfterTierContext`).
- **Blocking:** First hook that blocks stops execution. Log which hook blocked and why.

**Gap #16: Structured output parsing reliability**

**Issue:** Platform output formats may vary (JSON vs JSONL vs text). Parsers may fail on edge cases (malformed JSON, partial output, streaming output). How do we handle parsing failures gracefully?

**Mitigation:**
- **Multi-pass parsing:** Try JSON parse first, then JSONL, then text extraction. Use best-effort parsing with fallbacks.
- **Partial output handling:** If parsing fails, extract what we can (e.g., `task_report` from text even if `findings` missing). Mark tier as "complete with warnings."
- **Parser testing:** Comprehensive test suite for each platform parser with edge cases (malformed JSON, unicode, large outputs, streaming).
- **Parser versioning:** Track parser version and platform CLI version. Update parsers when platform CLI changes.

**Gap #17: Remediation loop infinite retry risk**

**Issue:** Remediation loop could retry indefinitely if findings never resolve (e.g., false positives, unrelated failures). How do we detect and break infinite loops?

**Mitigation:**
- **Max retries:** Hard limit (default: 3) on remediation retries per tier.
- **Progress detection:** Compare findings between retries. If findings unchanged after 2 retries, escalate (don't retry again).
- **Escalation threshold:** After max retries, escalate to parent-tier orchestrator. Parent-tier can decide to skip, fix manually, or re-plan.
- **Timeout:** Remediation loop has overall timeout (e.g., 30 minutes). If timeout exceeded, escalate.

**Gap #18: Memory persistence conflicts and staleness**

**Issue:** Memory files may become stale (outdated decisions), conflict between runs (different decisions), or grow unbounded. How do we manage memory lifecycle?

**Mitigation:**
- **Versioning:** Each memory entry has timestamp. Load only recent entries (e.g., last 30 days) unless explicitly requested.
- **Conflict resolution:** When loading memory, detect conflicts (e.g., "Rust + Actix" vs "Python + FastAPI"). Prompt user or use most recent decision.
- **Pruning:** Prune old memory entries (older than threshold, e.g., 90 days) unless marked as "persistent."
- **Size limits:** Limit memory file sizes (e.g., max 10MB per file). Rotate or archive old entries.

**Gap #19: Active subagent tracking accuracy**

**Issue:** Active subagent tracking may be inaccurate if subagent selection changes mid-tier, or if platform-native hooks override selection. How do we ensure tracking reflects reality?

**Mitigation:**
- **Single source of truth:** `TierContext.active_subagent` is set by BeforeTier hook (built-in ActiveSubagentTrackerHook). Platform-native hooks can override but must update `TierContext`.
- **Validation:** AfterTier hook validates that tracked subagent matches actual execution (check platform logs or output for subagent name).
- **Fallback:** If tracking fails, infer subagent from output patterns (e.g., "rust-engineer" if output mentions Rust-specific patterns).

**Gap #20: Safe error handling performance overhead**

**Issue:** Wrapping every hook/verification function in `safe_hook_main` adds overhead. Could impact performance for high-frequency operations.

**Mitigation:**
- **Selective wrapping:** Only wrap hooks and verification functions that could panic or fail unpredictably. Trusted functions (e.g., simple getters) don't need wrapping.
- **Lazy evaluation:** Use `Result` types instead of panics where possible. Only wrap functions that could panic.
- **Performance testing:** Benchmark wrapped vs unwrapped functions. If overhead > 5%, optimize or remove wrapping for hot paths.

**Gap #21: Lazy lifecycle state directory permissions**

**Issue:** Lazy creation of state directories may fail due to permissions (e.g., `.puppet-master/verification/` not writable). How do we handle permission errors gracefully?

**Mitigation:**
- **Permission check:** Before creating directories, check write permissions. If not writable, log error and continue (state won't be persisted but execution continues).
- **Fallback location:** If default location not writable, try fallback (e.g., `/tmp/puppet-master-<user>/`).
- **User notification:** Log clear error message with instructions (e.g., "Cannot create state directory. Run: chmod 755 .puppet-master").

**Gap #22: Structured handoff contract enforcement prompt injection**

**Issue:** Subagents may ignore structured output format instructions in prompts. Runtime validation catches this, but retry may also fail if subagent doesn't understand format requirement.

**Mitigation:**
- **Explicit format examples:** Include JSON schema example in prompt:
  ```
  Required output format:
  {
    "task_report": "What I did...",
    "downstream_context": "Info for next tier...",
    "findings": [{"severity": "critical", "category": "security", ...}]
  }
  ```
- **Platform-specific instructions:** For Copilot (text-only), provide markdown format example instead of JSON.
- **Validation feedback:** If retry fails, include validation error in retry prompt: "Your output was missing 'task_report' field. Please include it."
- **Fail-safe:** After retry fails, extract partial output (best-effort) and proceed with warnings.

**Gap #23: Cross-platform hook adapter complexity**

**Issue:** Platform-native hook adapters (CursorNativeHookAdapter, ClaudeNativeHookAdapter, GeminiNativeHookAdapter) must handle different hook formats, communication protocols (JSON stdin/stdout, exit codes), and error handling. This adds complexity.

**Mitigation:**
- **Unified adapter trait:** Define `PlatformHookAdapter` trait with common interface:
  ```rust
  trait PlatformHookAdapter: Send + Sync {
      fn execute_before_tier(&self, ctx: &BeforeTierContext) -> Result<BeforeTierResult>;
      fn execute_after_tier(&self, ctx: &AfterTierContext) -> Result<AfterTierResult>;
      fn platform(&self) -> Platform;
  }
  ```
- **Platform-specific implementations:** Each platform adapter handles its own format/protocol internally.
- **Testing:** Test each adapter with mock hook scripts. Verify JSON parsing, exit code handling, error cases.
- **Documentation:** Document hook format for each platform in `docs/platform-hooks.md`.

**Gap #24: Memory extraction from Phase 1 output**

**Issue:** How do we extract architectural decisions, patterns, tech choices, and pitfalls from Phase 1 (Planning/Architecture) output? Phase 1 output is unstructured text, not structured JSON.

**Mitigation:**
- **Pattern matching:** Use regex/pattern matching to extract decisions (e.g., "We chose Rust + Actix" → save as architectural decision).
- **LLM extraction:** Run a lightweight extraction subagent (e.g., `project-manager`) on Phase 1 output to extract structured memory entries.
- **Manual tagging:** Allow Phase 1 subagent to explicitly tag decisions (e.g., `<memory:architecture>Rust + Actix</memory:architecture>`).
- **Best-effort:** Extract what we can. Missing extractions don't block execution; memory is enhancement, not requirement.

**Gap #25: Remediation loop subagent re-execution context**

**Issue:** When remediation loop re-runs overseer/reviewer subagents, do they get the same context (prompt, files, state) as original execution, or modified context (remediation prompt, updated files)?

**Mitigation:**
- **Modified context:** Re-run with remediation prompt appended, but include original context (files, state) so subagent has full picture.
- **Incremental fixes:** Each retry builds on previous fixes. Include previous iteration's output in context.
- **State preservation:** Don't reset tier state between remediation retries. Preserve progress (e.g., files modified, tests run).

**Gap #26: Hook performance impact on tier execution time**

**Issue:** Hooks add overhead to tier execution (BeforeTier hooks run before every tier start, AfterTier hooks run after every tier completion). Could slow down fast tiers significantly.

**Mitigation:**
- **Async hooks:** Run hooks asynchronously where possible (e.g., StaleStatePrunerHook can run in background).
- **Selective execution:** Skip hooks for Iteration tier (too frequent) or only run critical hooks (ActiveSubagentTrackerHook, HandoffValidatorHook).
- **Caching:** Cache hook results when inputs unchanged (e.g., TierContextInjectorHook can cache injected context for same tier type).
- **Performance monitoring:** Track hook execution time. If hooks > 10% of tier time, optimize or skip non-critical hooks.

**Gap #27: Structured output validation false positives**

**Issue:** Validation may incorrectly reject valid output (false positive) if parser is too strict, or accept invalid output (false negative) if parser is too lenient.

**Mitigation:**
- **Lenient validation:** Accept partial output (e.g., missing `downstream_context` is OK, missing `task_report` is not). Only reject if critical fields missing.
- **Parser testing:** Test with real platform outputs to tune validation strictness. Aim for < 1% false positive rate.
- **User feedback:** If validation fails, log raw output for debugging. Allow users to report false positives.
- **Parser updates:** Update parsers based on user feedback and platform CLI changes.

### Implementation Notes

- **Where:** New module `src/core/hooks.rs` or `src/verification/hooks.rs` for hook system; `src/core/memory.rs` for cross-session persistence; extend `SubagentOutput` in `src/types/` for structured handoff.
- **What:** Implement `BeforeTierHook` and `AfterTierHook` traits; `save_memory()` and `load_memory()` functions; `validate_subagent_output()` with platform-specific parsers; remediation loop in orchestrator completion logic.
- **When:** Hooks run automatically at tier boundaries; memory persists at Phase completion and loads at run start; remediation loop runs when Critical/Major findings detected.

---

