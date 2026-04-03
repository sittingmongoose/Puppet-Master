# FileSafe -- Implementation Plan

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


**Date:** 2026-02-19  
**Priority:** CRITICAL  
**Status:** Plan Document Only

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

- ✅ **ALWAYS** tag reusable functions: `// DRY:FN:<name> -- Description`
- ✅ **ALWAYS** tag reusable data structures: `// DRY:DATA:<name> -- Description`
- ✅ **ALWAYS** tag reusable helpers: `// DRY:HELPER:<name> -- Description`
- ✅ **ALWAYS** use `platform_specs::` functions for platform data (never hardcode)
- ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI widgets

---

## Rewrite alignment (2026-02-21)

This plan remains authoritative for **FileSafe safety policy only**. As the rewrite lands, FileSafe is implemented primarily through:
- the **central tool registry + policy engine** for permissions, validation, and normalized tool outcomes
- the **patch/apply/verify/rollback pipeline** rather than ad-hoc guardrails in UI code
- emitting guard decisions, violations, and remediation into the canonical seglog event stream

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Context compilation, delta-context selection, cache heuristics, marker files, skill bundling, and compaction strategy are owned by `Plans/Prompt_Pipeline.md`. FileSafe may reference those flows only to define where safety checks run against compiled output.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md

Any UI or storage examples in this plan are illustrative unless they describe guard behavior, fail-closed execution, canonical logging, or explicit FileSafe-owned payload contracts.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Decision_Policy.md

## Executive Summary

FileSafe is the canonical guardrail layer that blocks destructive commands before execution, constrains write scope, filters sensitive file access, validates compiled prompt content, and records guard outcomes in the canonical event stream.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Prompt/context compilation is adjacent but separately owned. `Plans/Prompt_Pipeline.md` owns role-specific context selection, delta compilation, cache heuristics, skill bundling, and compaction behavior. FileSafe consumes compiled output as an input to safety checks; it does not own those algorithms.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md

### Part A -- FileSafe

1. **FileSafe: Command blocklist** -- Blocks destructive CLI commands before they run.
2. **FileSafe: Write scope** -- Restricts writes to the canonical allowed-file scope for the execution.
3. **FileSafe: Security filter** -- Blocks access to sensitive files and secrets.
4. **Compiled prompt checking** -- Scans the fully assembled prompt before provider dispatch.
5. **Verification and override integration** -- Allows only explicitly authorized override paths and records them canonically.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md

### Part B -- Compiled-context safety boundary

- FileSafe checks the fully compiled prompt **after** Prompt Pipeline assembly and **before** provider dispatch.
- FileSafe validates structured attachments, forwarded document selections, and file references against security and write-scope policy.
- FileSafe emits structured allow/block outcomes for these checks into seglog.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

---

## Table of Contents

**Part A -- FileSafe**  
1. Architecture Overview - 2. Implementation Details (guards) - 3. Integration with Platform Runner - 4. Pattern File - 5. Configuration - 6. Event Logging - 7. Error Messages - 8. Testing - 9. Implementation Checklist - 10. Relationship to Other Plans - 10a. FileSafe and Assistant YOLO mode - 11. Additional FileSafe Features (Write scope, Security filter, Prompt checking, Verification gates) - 12. Gaps and Potential Issues - 13. Enhancements

**Part B -- Historical note on moved context-compilation canon**  
14. Historical note on moved context-compilation canon

**Integration & References**  
15. System Integration Analysis - 16. References - **17. Implementation Order and Dependencies**

---

## 1. Architecture Overview

### 1.1 Three-Layer Defense

| Layer | Type | When It Fires | Reliability |
|-------|------|---------------|-------------|
| **Pre-execution guard** | Rust module | Before every Bash/command call | Deterministic (regex match) |
| **Agent prompt rules** | Behavioral guidance | When agent reads instructions | Probabilistic (model compliance) |
| **Post-execution audit** | Event log check | After command execution | Deterministic but reactive |

**Layer 1 is the fix.** It blocks destructive commands before they execute, regardless of what the model decides to do.

### 1.2 Integration Point

The guard integrates into `BaseRunner::execute_command()` in `puppet-master-rs/src/platforms/runner.rs`:

ContractRef: CodePath:puppet-master-rs/src/platforms/runner.rs#BaseRunner::execute_command

```rust
// Before spawning the process (line ~266)
// Add guard check here
if let Err(e) = self.bash_guard.check_command(&full_command_string) {
    return Err(anyhow!("Destructive command blocked: {}", e));
}
```

---

## 2. Implementation Details

### 2.0 Initialization Flow

**Complete initialization sequence:**

1. **At application startup:**
   - load `GuiConfig` (or defaults)
   - extract `FileSafeConfig`
   - validate fail-closed guard prerequisites and store the validated config in app state

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md

2. **When orchestrator starts:**
   - build runtime config from the validated GUI config
   - resolve FileSafe guard inputs and canonical roots
   - pass the resulting FileSafe config into runner construction

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md

3. **When `BaseRunner` is created:**
   - initialize `BashGuard` with canonical destructive-pattern sources
   - initialize `FileGuard` with an empty allowed-file set until request scope is known
   - initialize `SecurityFilter` with canonical sensitive-path rules
   - store guards as shared runtime objects only after initialization succeeds

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md

4. **Per `ExecutionRequest`:**
   - bind the request's canonical allowed-file scope
   - resolve the canonical root and path mode needed for scope/security checks
   - run FileSafe checks before provider process spawn or tool dispatch
   - emit structured allow/block outcomes to the canonical event stream

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/Runtime_Artifacts_Panel.md

**Fail-closed error handling:**
- if a guard cannot initialize, PM surfaces a structured startup/runtime error and blocks the affected execution path rather than creating a disabled guard
- if a configured external pattern source is unreadable, PM may continue only with a bundled canonical baseline; if no trustworthy baseline exists, destructive-command execution remains blocked
- if canonical-root or scope resolution fails for a request, that request fails closed rather than guessing a case mode or write scope
- invalid config may normalize only to a stricter safe default; it MUST NOT silently widen authority

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Permissions_System.md

### 2.1 Module Structure

Create the FileSafe module under `src-tauri/src/filesafe/`.

```
src-tauri/src/filesafe/
├── mod.rs        # Module declaration + re-exports
├── types.rs      # Shared FileSafe data types
├── scope.rs      # Scope and canonical-path enforcement
├── bash_guard.rs # Command-pattern guard logic
├── snapshot.rs   # Snapshot and optimistic-concurrency helpers
└── validator.rs  # Shared validation helpers
```

**Pattern File Location:**
- **Bundled:** packaged FileSafe baseline patterns (source-controlled)
- **Runtime:** Bundled with binary or located relative to executable
- **Project-specific:** `.puppet-master/destructive-commands.local.txt` (optional override)
- **Resolution order:** Custom path → Project-specific → Bundled baseline; if no trustworthy baseline exists, fail closed

**Module Declaration (`src-tauri/src/filesafe/mod.rs`):**
```rust
//! FileSafe — guards for preventing destructive operations
//!
//! This module provides guards that block destructive commands, file writes,
//! and sensitive file access before execution.

pub mod bash_guard;
pub mod scope;
pub mod snapshot;
pub mod types;
pub mod validator;

pub use bash_guard::{BashGuard, GuardError};
```

### 2.2 Core Types

```rust
// src-tauri/src/filesafe/bash_guard.rs

use regex::Regex;
use std::path::PathBuf;
use anyhow::{Result, Context};

// DRY:DATA:BashGuard — FileSafe command blocklist: blocks destructive CLI commands
/// FileSafe command blocklist: blocks destructive CLI commands
pub struct BashGuard {
    patterns: Vec<Regex>,
    allow_destructive: bool,
    enabled: bool,
    approved_commands: Vec<String>,  // Whitelist from settings (Assistant chat approvals)
}

#[derive(Debug, Clone)]
pub enum GuardError {
    DestructiveCommand {
        command: String,
        pattern: String,
    },
    FileNotInPlan {
        file: PathBuf,
    },
    SensitiveFileAccess {
        file: PathBuf,
        pattern: String,
    },
    ParseError {
        message: String,
    },
}

impl BashGuard {
    // DRY:FN:new — Create a new guard instance
    /// Create a new guard instance
    ///
    /// # Arguments
    ///
    /// * `config_path` - Optional path to custom patterns file. If None, uses default bundled patterns.
    ///
    /// # Pattern File Resolution
    ///
    /// 1. If `config_path` provided and exists: use it
    /// 2. Check project-specific: `.puppet-master/destructive-commands.local.txt`
    /// 3. Check bundled: `puppet-master-rs/config/destructive-commands.txt` (relative to binary/exe)
    /// 4. If no trustworthy baseline exists: return initialization error (fail closed)
    pub fn new(config_path: Option<PathBuf>) -> Result<Self> {
        // 1. Check environment variable override
        let allow_destructive = std::env::var("PUPPET_MASTER_ALLOW_DESTRUCTIVE")
            .map(|v| v == "1")
            .unwrap_or(false);
        
        // 2. Determine pattern file path
        let pattern_file = if let Some(custom_path) = config_path {
            if custom_path.exists() {
                custom_path
            } else {
                // Try project-specific local patterns
                let local_path = PathBuf::from(".puppet-master/destructive-commands.local.txt");
                if local_path.exists() {
                    local_path
                } else {
                    // Fall back to bundled patterns
                    Self::find_bundled_patterns_file()?
                }
            }
        } else {
            // Try project-specific first, then bundled
            let local_path = PathBuf::from(".puppet-master/destructive-commands.local.txt");
            if local_path.exists() {
                local_path
            } else {
                Self::find_bundled_patterns_file()?
            }
        };
        
        // 3. Load patterns
        let patterns = if pattern_file.exists() {
            load_patterns(&pattern_file)
                .context(format!("Failed to load patterns from {}", pattern_file.display()))?
        } else {
            return Err(anyhow!(
                "Pattern file not found: {}. Fail closed until a trustworthy baseline is available.",
                pattern_file.display()
            ));
        };
        
        // 4. Check config file for bash_guard setting (if config available)
        // This will be wired when config system is integrated
        let enabled = true; // Default: enabled
        
        Ok(Self {
            patterns,
            allow_destructive,
            enabled,
            approved_commands: Vec::new(),  // Populated from FileSafeConfig
        })
    }
    
    // DRY:FN:find_bundled_patterns_file — Locate bundled pattern file
    /// Find the bundled destructive-commands.txt file
    ///
    /// Searches in order:
    /// 1. `puppet-master-rs/config/destructive-commands.txt` (dev/build)
    /// 2. `../config/destructive-commands.txt` (relative to binary)
    /// 3. `config/destructive-commands.txt` (relative to binary)
    fn find_bundled_patterns_file() -> Result<PathBuf> {
        // Try multiple locations
        let candidates = vec![
            PathBuf::from("puppet-master-rs/config/destructive-commands.txt"),
            PathBuf::from("../config/destructive-commands.txt"),
            PathBuf::from("config/destructive-commands.txt"),
            // For installed binary, try relative to executable
            std::env::current_exe()
                .ok()
                .and_then(|exe| exe.parent().map(|p| p.join("config/destructive-commands.txt"))),
        ];
        
        for candidate in candidates.into_iter().flatten() {
            if candidate.exists() {
                return Ok(candidate);
            }
        }
        
        // Return a path even if not found (caller will handle missing file)
        Ok(PathBuf::from("config/destructive-commands.txt"))
    }
    
    // DRY:FN:disabled — Create a disabled guard instance
    /// Create an explicitly disabled guard instance for deliberate config-off states, not init-failure fallback
    pub fn disabled() -> Self {
        Self {
            patterns: Vec::new(),
            allow_destructive: false,
            enabled: false,
            approved_commands: Vec::new(),
        }
    }
    
    /// Check if a command should be blocked
    pub fn check_command(&self, command: &str) -> Result<(), GuardError> {
        if !self.enabled || self.allow_destructive {
            return Ok(());
        }
        // If command is in approved list (from settings / Assistant chat), allow it
        if self.approved_commands.iter().any(|c| commands_match(c, command)) {
            return Ok(());
        }
        // Match against blocklist patterns
        for pattern in &self.patterns {
            if pattern.is_match(command) {
                return Err(GuardError::DestructiveCommand {
                    command: command.to_string(),
                    pattern: pattern.as_str().to_string(),
                });
            }
        }
        
        Ok(())
    }
}

// DRY:HELPER:commands_match — Compare approved (whitelist) entry to actual command
/// Returns true if the approved pattern matches the command (normalized comparison).
/// Handles: exact match, prefix match (approved is prefix of command), and normalized
/// whitespace (collapse multiple spaces, trim).
fn commands_match(approved: &str, command: &str) -> bool {
    let norm = |s: &str| s.trim().split_whitespace().collect::<Vec<_>>().join(" ");
    let a = norm(approved);
    let c = norm(command);
    c == a || c.starts_with(a.as_str())
}
```

### 2.3 Pattern Loading

```rust
// FileSafe pattern-loading helper example

use regex::Regex;
use std::fs;
use std::path::Path;
use anyhow::{Context, Result};

// DRY:FN:load_patterns — Load destructive command patterns from file
/// Load destructive command patterns from file
///
/// # File Format
///
/// - One regex pattern per line
/// - Lines starting with `#` are comments (ignored)
/// - Empty lines are ignored
/// - Patterns are case-insensitive (automatically prefixed with `(?i)`)
/// - Patterns match against the full command string
///
/// # Examples
///
/// ```
/// # PHP / Laravel
/// artisan\s+migrate:(fresh|reset|refresh)
/// artisan\s+db:(wipe|seed\s+--force)
/// ```
///
/// # Errors
///
/// - Returns error if file cannot be read
/// - Returns error if any pattern is invalid regex
/// - Invalid patterns stop loading (fail-fast)
pub fn load_patterns(pattern_file: &Path) -> Result<Vec<Regex>> {
    let content = fs::read_to_string(pattern_file)
        .with_context(|| format!("Failed to read pattern file: {}", pattern_file.display()))?;
    
    let mut patterns = Vec::new();
    let mut line_number = 0;
    
    for line in content.lines() {
        line_number += 1;
        let line = line.trim();
        
        // Skip comments and empty lines
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        
        // Compile regex (case-insensitive)
        // Note: Some patterns may already include (?i), but adding it again is safe (no-op)
        let pattern = if line.starts_with("(?i)") {
            line.to_string()
        } else {
            format!("(?i){}", line)
        };
        
        match Regex::new(&pattern) {
            Ok(regex) => patterns.push(regex),
            Err(e) => {
                return Err(anyhow!(
                    "Invalid regex pattern at line {} in {}: {}\nPattern: {}",
                    line_number,
                    pattern_file.display(),
                    e,
                    line
                ));
            }
        }
    }
    
    if patterns.is_empty() {
        warn!("No patterns loaded from {}", pattern_file.display());
    } else {
        info!("Loaded {} patterns from {}", patterns.len(), pattern_file.display());
    }
    
    Ok(patterns)
}

// DRY:FN:load_patterns_with_merge — Load patterns from multiple files and merge
/// Load patterns from multiple files and merge them
///
/// # Arguments
///
/// * `default_file` - Default/bundled pattern file (required)
/// * `local_file` - Project-specific pattern file (optional)
///
/// # Behavior
///
/// - Loads default patterns first
/// - If local file exists, loads and appends local patterns
/// - Duplicate patterns are kept (no deduplication)
/// - Returns combined vector
pub fn load_patterns_with_merge(
    default_file: &Path,
    local_file: Option<&Path>,
) -> Result<Vec<Regex>> {
    let mut patterns = load_patterns(default_file)?;
    
    if let Some(local) = local_file {
        if local.exists() {
            let local_patterns = load_patterns(local)
                .context("Failed to load local patterns")?;
            patterns.extend(local_patterns);
            info!("Merged {} local patterns", local_patterns.len());
        }
    }
    
    Ok(patterns)
}
```

### 2.4 Configuration Integration

**Add to `puppet-master-rs/src/config/gui_config.rs`:**

Config keys remain `bash_guard` / `file_guard` for backward compatibility; GUI labels: "Command blocklist", "Write scope", "Security filter".

```rust
// Add to GuiConfig struct:
pub struct GuiConfig {
    // ... existing fields ...
    pub filesafe: FileSafeConfig,
}

// New FileSafeConfig (internal keys: bash_guard, file_guard; GUI labels: Command blocklist, Write scope)
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FileSafeConfig {
    pub bash_guard: BashGuardConfig,
    pub file_guard: FileGuardConfig,
    pub security_filter: SecurityFilterConfig,
    #[serde(default)]
    pub approved_commands: Vec<String>,  // Whitelist: commands from Assistant chat approved by user
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BashGuardConfig {
    #[serde(default = "default_true")]
    pub enabled: bool,
    #[serde(default)]
    pub allow_destructive: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_patterns_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileGuardConfig {
    #[serde(default = "default_true")]
    pub enabled: bool,
    #[serde(default)]
    pub strict_mode: bool,  // Block vs warn-only
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityFilterConfig {
    #[serde(default = "default_true")]
    pub enabled: bool,
    #[serde(default)]
    pub allow_during_interview: bool,
}

fn default_true() -> bool {
    true
}

impl Default for BashGuardConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            allow_destructive: false,
            custom_patterns_path: None,
        }
    }
}

impl Default for FileGuardConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            strict_mode: true,  // Default: block, not warn
        }
    }
}

impl Default for SecurityFilterConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            allow_during_interview: false,  // Default: strict even during interview
        }
    }
}
```

**Wire to Orchestrator Config (`PuppetMasterConfig`):**

The orchestrator reads from `PuppetMasterConfig` (YAML), not `GuiConfig`. Follow Option B pattern from `Plans/WorktreeGitImprovement.md` §5.2 (Chosen approach: Option B -- Build run config from GUI):

1. Add `FileSafeConfig` to `PuppetMasterConfig` type (in `src/types/config.rs`)
2. When orchestrator starts, build run config from `GuiConfig::filesafe` → `PuppetMasterConfig::filesafe`
3. Pass FileSafe config to `BaseRunner::new()` via orchestrator context

ContractRef: CodePath:puppet-master-rs/src/config/gui_config.rs, CodePath:puppet-master-rs/src/types/config.rs

**Config File Format (`puppet-master.yaml`):**  
Keys: `bashGuard` (Command blocklist), `fileGuard` (Write scope), `securityFilter`, `approvedCommands`.

ContractRef: ConfigKey:filesafe.bashGuard.enabled, ConfigKey:filesafe.bashGuard.allowDestructive, ConfigKey:filesafe.bashGuard.customPatternsPath, ConfigKey:filesafe.fileGuard.enabled, ConfigKey:filesafe.fileGuard.strictMode, ConfigKey:filesafe.securityFilter.enabled, ConfigKey:filesafe.securityFilter.allowDuringInterview, ConfigKey:filesafe.approvedCommands

```yaml
filesafe:
  bashGuard:    # Command blocklist
    enabled: true
    allowDestructive: false
    customPatternsPath: ".puppet-master/destructive-commands.local.txt"  # Optional (additive-only; see AutoDecision below)
  fileGuard:    # Write scope
    enabled: true
    strictMode: true
  securityFilter:
    enabled: true
    allowDuringInterview: false
  approvedCommands: []   # Commands approved from Assistant chat; user can add/remove in settings
```

AutoDecision: `filesafe.bashGuard.customPatternsPath` is additive-only. If unset or the file is missing/unreadable, ignore it and proceed with bundled patterns (do not disable FileSafe). (ContractRef: PolicyRule:Plans/Decision_Policy.md§2)

---

## 3. Integration with Platform Runner

### 3.1 Modify BaseRunner

Update `puppet-master-rs/src/platforms/runner.rs`:

```rust
use crate::filesafe::BashGuard;

pub struct BaseRunner {
    // ... existing fields ...
    bash_guard: Arc<BashGuard>,
}

impl BaseRunner {
    pub fn new(command: String, platform: Platform) -> Self {
        // ... existing initialization ...
        
        // Initialize FileSafe guards
        // Pattern file resolution: try project-specific, then bundled
        let pattern_file = std::env::current_dir()
            .ok()
            .and_then(|cwd| {
                let local = cwd.join(".puppet-master/destructive-commands.local.txt");
                if local.exists() {
                    Some(local)
                } else {
                    None
                }
            });
        
        let bash_guard = Arc::new(
            BashGuard::new(pattern_file)
                .unwrap_or_else(|e| {
                    warn!("Failed to initialize bash guard: {}. Guard disabled.", e);
                    BashGuard::disabled()
                })
        );
        
        // Initialize write scope (needs plan metadata, will be populated per-request)
        let file_guard = Arc::new(FileGuard::new(HashSet::new(), true));
        
        // Initialize security filter
        let security_filter = Arc::new(
            SecurityFilter::new()
                .unwrap_or_else(|e| {
                    warn!("Failed to initialize security filter: {}. Filter disabled.", e);
                    SecurityFilter::disabled()
                })
        );
        
        Self {
            // ... existing fields ...
            bash_guard,
        }
    }
    
    pub async fn execute_command(
        &self,
        request: &ExecutionRequest,
        args: Vec<String>,
        stdin_input: Option<String>,
    ) -> Result<ExecutionResult> {
        // ... existing checks ...
        
        // Build full command string for guard check
        let full_command = format!("{} {}", self.command, args.join(" "));
        
        // Check bash guard BEFORE spawning
        if let Err(e) = self.bash_guard.check_command(&full_command) {
            // Log blocked command
            warn!("Blocked destructive command: {}", e);
            
            // Log to event log if available
            self.log_blocked_command(&full_command, &e).await;
            
            return Err(anyhow!(
                "Destructive command blocked: {}. \
                Set PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 to override, \
                or run the command manually outside Puppet Master.",
                e
            ));
        }
        
        // ... continue with existing spawn logic ...
    }
}
```

### 3.2 Platform Runner Integration Example

**Complete Integration Flow (Cursor Example):**

```rust
// In CursorRunner::execute() (src/platforms/cursor.rs)
async fn execute(&self, request: &ExecutionRequest) -> Result<ExecutionResult> {
    // 1. Compile context files into prompt
    let mut effective_request = request.clone();
    effective_request.prompt = append_prompt_attachments(
        &request.prompt,
        &request.context_files,
        "",  // Cursor uses empty prefix
    );
    
    // 2. CHECK COMPILED PROMPT (after context compilation)
    if let Err(e) = self.base.bash_guard.check_prompt(&effective_request.prompt) {
        // Check if verification gate operation (allow destructive during QA)
        if self.base.is_verification_gate_operation(request) {
            warn!("Destructive command in compiled prompt allowed during verification gate: {}", e);
        } else {
            // Log blocked command
            self.base.log_blocked_command(
                &effective_request.prompt,
                &e,
                request,
            ).await?;
            
            return Err(anyhow!(
                "Destructive command in prompt blocked: {}. \
                Set PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 to override.",
                e
            ));
        }
    }
    
    // 3. CHECK CONTEXT FILES (security filter)
    for context_file in &request.context_files {
        if let Err(e) = self.base.security_filter.check_file_access(context_file) {
            // Allow during interview if configured
            if self.base.is_interview_operation(request) 
                && self.base.security_filter.allow_during_interview {
                warn!("Sensitive context file allowed during interview: {}", e);
            } else {
                return Err(anyhow!(
                    "Sensitive context file blocked: {}. \
                    File: {}",
                    e,
                    context_file.display()
                ));
            }
        }
    }
    
    // 4. Build CLI args (now safe to proceed)
    let args = self.build_args(&effective_request);
    
    // 5. Continue with execution via BaseRunner
    // (BaseRunner will check command string again before spawning)
    self.base.execute_command(&effective_request, args, stdin_input).await
}
```

**Key Points:**
- Check **compiled prompt** (after `append_prompt_attachments()`)
- Check **context files** separately (security filter)
- Check **before** building CLI args (early failure)
- Respect verification gate and interview operation type (`PUPPET_MASTER_OPERATION_TYPE`)
- Log all blocked operations to event log

### 3.3 BaseRunner Integration
`BaseRunner::execute_command()` performs FileSafe validation after request expansion but before spawn. FileSafe-managed path checks are fail-closed: candidate paths are resolved relative to `working_directory`, canonicalized, and denied if canonicalization fails.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/WorktreeGitImprovement.md

```rust
let candidate_path = if file_path.is_absolute() {
    file_path.clone()
} else {
    request.working_directory.join(&file_path)
};

let normalized_path = candidate_path
    .canonicalize()
    .map_err(|e| anyhow!(
        "File write blocked: canonical path required for FileSafe scope checks ({}): {}",
        candidate_path.display(),
        e
    ))?;

self.file_guard
    .check_file_write(&normalized_path, &request.working_directory, &allowed_files)?;
self.security_filter.check_file_access(&normalized_path)?;
```

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

The fallback pattern `canonicalize().unwrap_or_else(|_| resolved_path)` is prohibited in FileSafe-managed write-scope code paths. If PM cannot compute the canonical real path, it denies access instead of comparing against a symlink alias or unresolved relative path.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/WorktreeGitImprovement.md
### 3.4 Multi-Provider Support

The guard must work across all providers:

- **Cursor:** `agent -p "..."` -- check compiled prompt content
- **Codex:** `codex exec "..."` -- check compiled prompt content
- **Claude Code:** `claude -p "..."` -- check compiled prompt content
- **Gemini:** Gemini is a Direct API provider; check compiled prompt content via API request inspection.
- **GitHub Copilot:** `copilot -p "..."` -- check compiled prompt content (with `@path` tokens)
- **OpenCode (server-bridged):** enforce the guard inside Puppet Master before sending requests to the OpenCode server.

**Strategy:** 
1. Check **compiled prompt** (after context compilation) at platform runner level
2. Check **command string** (final CLI command) at BaseRunner level
3. Check **context files** (security filter) at platform runner level
4. Check **file paths** (write scope + security filter) at BaseRunner level

This provides defense-in-depth: multiple checks at different stages of execution.

---

## 4. Pattern File

Create `puppet-master-rs/config/destructive-commands.txt`:

```
# Puppet Master Destructive Command Blocklist
# One regex pattern per line. Case-insensitive matching.
# Lines starting with # are comments. Empty lines ignored.

# === PHP / Laravel ===
artisan\s+migrate:(fresh|reset|refresh)
artisan\s+db:(wipe|seed\s+--force)

# === Ruby / Rails ===
(rails|rake)\s+db:(drop|reset|schema:load)
bundle\s+exec\s+rake\s+db:(drop|reset)

# === Python / Django ===
manage\.py\s+(flush|sqlflush)
django-admin\s+flush

# === Node.js / Prisma ===
prisma\s+migrate\s+reset
prisma\s+db\s+push\s+--force-reset
npx\s+prisma\s+migrate\s+reset

# === Node.js / Knex ===
knex\s+migrate:rollback\s+--all

# === Node.js / Sequelize ===
sequelize(-cli)?\s+db:drop
npx\s+sequelize(-cli)?\s+db:drop

# === Node.js / TypeORM ===
typeorm\s+schema:drop

# === Node.js / Drizzle ===
drizzle-kit\s+push\s+--force

# === Go ===
migrate\s+.*-database\s+.*drop

# === Rust / Diesel ===
diesel\s+database\s+reset
diesel\s+migration\s+revert\s+--all

# === Rust / SQLx ===
sqlx\s+database\s+drop

# === Elixir / Phoenix / Ecto ===
mix\s+ecto\.(drop|reset)
mix\s+ecto\.rollback\s+--all

# === Raw SQL via CLI clients ===
(mysql|psql|sqlite3)\s+.*DROP\s+(DATABASE|TABLE)
(mysql|psql|sqlite3)\s+.*TRUNCATE
mongosh?\s+.*DROP\s+(DATABASE|TABLE)

# === MongoDB shell ===
mongosh?\s+.*dropDatabase
mongosh?\s+.*\.drop\s*\(

# === Redis ===
redis-cli\s+FLUSH(ALL|DB)

# === Docker (volume destruction) ===
docker-compose\s+down\s+.*-v
docker\s+compose\s+down\s+.*-v
docker\s+volume\s+(rm|prune)
docker\s+system\s+prune.*--volumes

# === File system (database files) ===
rm\s+(-rf?\s+)?\S*\.sqlite3?\b
rm\s+(-rf?\s+)?\S*\.db\b
rm\s+(-rf?\s+)?/var/lib/(mysql|postgresql|mongodb)
```

---

## 5. Configuration Options

### 5.1 Environment Variable Override

```rust
// Check environment variable
let allow_destructive = std::env::var("PUPPET_MASTER_ALLOW_DESTRUCTIVE")
    .map(|v| v == "1")
    .unwrap_or(false);
```

### 5.2 Config File Toggle

Add to `puppet-master.yaml`. All FileSafe toggles (Command blocklist, Write scope, Security filter) must be configurable from the GUI and easy to turn on or off in one place (see §13.4 and §15.5).

```yaml
filesafe:
  bashGuard:   # Command blocklist
    enabled: true  # Default: true
    allowDestructive: false  # Default: false
    customPatternsPath: ".puppet-master/destructive-commands.local.txt"  # Optional
  fileGuard:   # Write scope
    enabled: true
    strictMode: true
  securityFilter:
    enabled: true
    allowDuringInterview: false
  approvedCommands: []
```

### 5.3 Project-Specific Patterns

Allow projects to extend patterns via `.puppet-master/destructive-commands.local.txt`:

```rust
// Load default patterns
let mut patterns = load_patterns(&default_patterns_path)?;

// Load project-specific patterns if exists
if let Some(local_path) = &config.custom_patterns_path {
    if local_path.exists() {
        let local_patterns = load_patterns(local_path)?;
        patterns.extend(local_patterns);
    }
}
```

---

## 6. Event Logging
**Contract:** FileSafe emits a structured event for every block or approved override (command blocklist, write scope, security filter, or compiled-prompt safety check) into the canonical event stream.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Authoritative logging path:
- FileSafe events are written to seglog as canonical `EventRecord` entries.
- Any `filesafe-events.jsonl` surface is a derived projector or diagnostic mirror rebuilt from seglog.
- PM MUST NOT maintain a second authoritative FileSafe append log alongside seglog, and recovery logic MUST NOT prefer a FileSafe-only mirror over the canonical event stream.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Runtime_Artifacts_Panel.md

**FileSafeEvent payload (minimum canonical fields):**

```rust
pub struct FileSafeEvent {
    pub event_type: String,
    pub guard_type: String,
    pub pattern_matched: String,
    pub command_preview: String,
    pub agent: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub allowed: bool,
}
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md

Logging call semantics:
- guard blocks and approved overrides are emitted on the main execution path before the user-facing result is returned
- event-write failure MUST surface as a structured diagnostic; it is not silently ignored
- analytics, dashboards, and gate reports read FileSafe history from the canonical event stream or its derived projections

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Decision_Policy.md
## 7. Error Messages

User-friendly error messages:

```rust
match error {
    GuardError::DestructiveCommand { command, pattern } => {
        format!(
            "Blocked: destructive command detected ({})\n\
             Command: {}\n\
             Hint: Set PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 to override, \
             or run the command manually outside Puppet Master.\n\
             See: config/destructive-commands.txt for the full blocklist.",
            pattern,
            command.chars().take(100).collect::<String>()
        )
    }
    GuardError::ParseError { message } => {
        format!("Blocked: cannot validate command ({})", message)
    }
}
```

---

## 8. Testing

### 8.1 Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_blocks_migrate_fresh() {
        let guard = BashGuard::new(None).unwrap();
        let cmd = "php artisan migrate:fresh --seed";
        assert!(guard.check_command(cmd).is_err());
    }
    
    #[test]
    fn test_allows_safe_migrate() {
        let guard = BashGuard::new(None).unwrap();
        let cmd = "php artisan migrate";
        assert!(guard.check_command(cmd).is_ok());
    }
    
    #[test]
    fn test_respects_override() {
        std::env::set_var("PUPPET_MASTER_ALLOW_DESTRUCTIVE", "1");
        let guard = BashGuard::new(None).unwrap();
        let cmd = "php artisan migrate:fresh";
        assert!(guard.check_command(cmd).is_ok());
        std::env::remove_var("PUPPET_MASTER_ALLOW_DESTRUCTIVE");
    }
    
    #[test]
    fn test_allows_safe_commands() {
        let guard = BashGuard::new(None).unwrap();
        let safe_commands = vec![
            "php artisan migrate",
            "npm install",
            "cargo build",
            "git status",
            "ls -la",
        ];
        for cmd in safe_commands {
            assert!(guard.check_command(cmd).is_ok(), "Safe command blocked: {}", cmd);
        }
    }
    
    #[test]
    fn test_blocks_various_destructive_patterns() {
        let guard = BashGuard::new(None).unwrap();
        let destructive_commands = vec![
            "php artisan migrate:fresh",
            "rails db:drop",
            "django-admin flush",
            "prisma migrate reset",
            "diesel database reset",
            "mix ecto.drop",
        ];
        for cmd in destructive_commands {
            assert!(guard.check_command(cmd).is_err(), "Destructive command allowed: {}", cmd);
        }
    }
    
    #[test]
    fn test_prompt_extraction() {
        let guard = BashGuard::new(None).unwrap();
        let prompt = r#"
        Please run this command:
        ```bash
        php artisan migrate:fresh --seed
        ```
        "#;
        assert!(guard.check_prompt(prompt).is_err());
    }
    
    #[test]
    fn test_disabled_guard_allows_all() {
        let guard = BashGuard::disabled();
        assert!(guard.check_command("php artisan migrate:fresh").is_ok());
    }
}
```

### 8.2 Integration Tests

Test with actual platform runners:

```rust
#[tokio::test]
async fn test_runner_blocks_destructive() {
    let runner = BaseRunner::new("php".to_string(), Platform::Cursor);
    let request = ExecutionRequest {
        prompt: "Run php artisan migrate:fresh".to_string(),
        // ...
    };
    
    let result = runner.execute(&request).await;
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("Blocked"));
}
```

---

## 9. Implementation Checklist
This checklist tracks implementation work for the already-locked FileSafe canon. Checklist items must implement the owner rules in Sections 11.1.1-11.1.2a and MUST NOT reopen those rules as design questions.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md

- [ ] **Create FileSafe module structure**
  - [ ] Create `src-tauri/src/filesafe/mod.rs`
  - [ ] Create `src-tauri/src/filesafe/types.rs`
  - [ ] Create `src-tauri/src/filesafe/scope.rs`
  - [ ] Create `src-tauri/src/filesafe/bash_guard.rs`
  - [ ] Create `src-tauri/src/filesafe/snapshot.rs`
  - [ ] Create `src-tauri/src/filesafe/validator.rs`
- [ ] **Port pattern file**
  - [ ] Copy destructive command patterns from OpenCode `backend/src/security/bash.ts`
  - [ ] Convert JS regex patterns to Rust `regex::Regex`
  - [ ] Port scope checking logic from OpenCode `backend/src/security/bash.ts`
  - [ ] Adapt to PM project model and remote-mode path handling
- [ ] **Implement BashGuard**
  - [ ] Port `buildScopeRegex()` logic from OpenCode
  - [ ] Port `bashCommandBlocks` array from OpenCode
  - [ ] Port `fileEditBlocks` array from OpenCode
  - [ ] Implement `check_bash_command()` for shell execution
  - [ ] Implement `check_file_edit()` for edit operations
  - [ ] Add PM-specific safe zones and allowlisted temp patterns
- [ ] **Integrate with BaseRunner**
  - [ ] Add `filesafe: Arc<FileSafe>` field to `BaseRunner`
  - [ ] Initialize FileSafe in runner construction
  - [ ] Add guard checks in platform runners after context compilation:
    - [ ] Compile context files into a prompt view and run compiled-output validation
    - [ ] Validate referenced context files against scope and safety policy
    - [ ] Check whether the request is verification-gate exempt before blocking
  - [ ] Add guard checks in `BaseRunner::execute_command()` before spawn:
    - [ ] Build the command string and check destructive patterns
    - [ ] Extract file paths from the request
    - [ ] Implement the locked realpath-before-scope-check invariant from Section 11.1.1: resolve relative paths against `working_directory`, canonicalize with fail-closed behavior, compare scope/security rules against the canonical real path, and reject unresolved or non-canonical worktree aliases instead of falling back to unresolved paths
    - [ ] Implement the locked optimistic-concurrency and snapshot-integrity contract from Section 11.1.2a, including hard-error handling for `git add`, `git commit`, `git stash`, and `git checkout`, plus post-`git add` verification via `git status --porcelain`
  - [ ] Implement helper methods:
    - [ ] `FileSafe::check_command(context_files, prompt, command, working_directory)`
    - [ ] `FileSafe::check_edit(file_path, old_content, new_content, working_directory)`
    - [ ] `FileSafe::should_exempt_verification_gate(task)`
  - [ ] Integrate with verification gates and plan-apply paths
  - [ ] Return clear, actionable guard errors to the caller

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md

- [ ] **Add configuration**
  - [ ] Add `filesafe.enabled` to settings
  - [ ] Add `filesafe.verification_gate_exemptions` for readonly verification tools
  - [ ] Add `filesafe.project_scope_overrides` if needed
  - [ ] Add remote-mode aware scope roots derived from mounted project identity
- [ ] **Event logging**
  - [ ] Emit structured `filesafe.blocked` events with reason codes, matched rule ids, and resolved path context
  - [ ] Emit `filesafe.snapshot_created`, `filesafe.snapshot_conflict`, and `filesafe.snapshot_restore` events with stable identifiers
  - [ ] Ensure logs distinguish dry-run validation from hard blocking

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md

- [ ] **Testing**
  - [ ] Unit tests for destructive command detection
  - [ ] Unit tests for scope validation
  - [ ] Unit tests for verification-gate exemptions
  - [ ] Unit tests for optimistic concurrency conflict detection
  - [ ] Unit tests for git snapshot error handling and post-stage verification
  - [ ] Integration tests with real shell commands
  - [ ] Integration tests for plan apply and rewrite paths
  - [ ] Remote-mode tests covering mounted project paths and canonicalization failures

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md
## 10. Relationship to Other Plans

### 10.1 Orchestrator Plan

The guard integrates into `BaseRunner::execute_command()` which is called by platform runners during orchestrator execution. No changes needed to orchestrator logic itself.

### 10.2 Interview Plan

The guard protects all agent-executed commands, including those run during interview phases. No interview-specific changes needed.

### 10.3 Worktree Plan

The guard applies to commands executed in worktrees. No worktree-specific changes needed.

### 10.4 MiscPlan

The guard complements cleanup policies by preventing destructive operations before they occur.

### 10.5 newfeatures (Hooks and FileSafe)

**Plans/newfeatures.md §9** (Hook system) defines a **user/plugin extension point**: events (e.g. PreToolUse), scripts that return continue/block/modify. Dangerous-command blocking is part of **FileSafe**: the Command blocklist and PreToolUse integration use the same blocklist and extension point. FileSafe is the **core pre-execution guard** in the runner; hooks can call into FileSafe (e.g. PreToolUse invokes FileSafe blocklist checks) or provide optional user-defined rules. Use one blocklist and one integration point; see newfeatures §17.4 "FileSafe first."

### 10.6 Tools.md (tool permissions and OpenCode alignment)

**Plans/Tools.md** defines the central tool registry and permission model (allow/deny/ask) and aligns with [OpenCode Permissions](https://opencode.ai/docs/permissions/). FileSafe and tool permissions are **complementary**: tool permission = "may the agent call this tool?"; FileSafe = "may this specific invocation proceed?" (e.g. bash allowed but command blocked). Tools.md §2.5 maps FileSafe to OpenCode-style granular rules: **command blocklist** ≈ bash deny patterns; **write scope** ≈ edit path allowlist; **security filter** ≈ read path deny (e.g. .env). Implement via a single **central policy engine**; see Tools.md §2.4 and §8.2.

---

## 10a. FileSafe and Assistant YOLO mode

**Context:** In Assistant chat (see **Plans/assistant-chat-design.md** §3), **YOLO mode** means the agent runs with maximum permissions: no permission prompts. The user accepts full automation for that session; the agent can execute, edit, and run tools without asking.

**Implication for FileSafe:** When YOLO is on, there is **no human approval step** before tool execution. FileSafe is therefore the **primary protection layer** for Assistant chat in YOLO mode. If FileSafe is disabled or relaxed while YOLO is on, destructive commands and out-of-scope writes can run with no further gate.

**Requirements:**

1. **Same FileSafe config for Assistant:** Assistant chat (and thus YOLO runs) must use the same FileSafe settings as the rest of the app (Command blocklist, Write scope, Security filter). No separate "Assistant-only" bypass unless explicitly configured.
2. **Recommend FileSafe on when YOLO is on:** When the user enables YOLO for a chat, the GUI should recommend (or warn) that FileSafe remain enabled. Options: show a one-time hint ("FileSafe protects you when YOLO is on"), or a small indicator that FileSafe is active when YOLO is selected.
3. **Configurable and visible:** FileSafe toggles must be easy to find and turn on/off (see §13.4 and §15.5). A user who turns on YOLO should be able to confirm FileSafe state without digging through multiple screens.
4. **Optional: per-context override:** If product requirements later allow "relax FileSafe for this chat only" (e.g. power users), that must be an explicit, clearly labeled setting--not the default when YOLO is on.

**Summary:** YOLO mode and FileSafe are complementary: YOLO removes approval prompts; FileSafe enforces hard limits (destructive commands, write scope, sensitive files). FileSafe settings must be configurable in the GUI and easy to turn on or off, and when Assistant runs in YOLO mode, FileSafe should be the main line of defense.

---

## 11. Additional FileSafe Features

### 11.1 FileSafe: Write scope (CRITICAL)

#### 11.1.1 Realpath-before-scope-check invariant

All file paths submitted to FileSafe write-scope or security-filter checks MUST be resolved through `realpath()` before any scope comparison.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md

Required behavior:
- normalize relative paths against `working_directory`
- resolve symlinks through `realpath()`
- if resolution fails for any reason, deny access (fail-closed)
- never fall back to comparing the unresolved path against `allowed_files`

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Executor_Protocol.md

The fallback pattern `canonicalize().unwrap_or_else(|_| original_path)` is prohibited for FileSafe-managed write-scope checks.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Tools.md

#### 11.1.2 Atomic write contract

All FileSafe-managed file mutations MUST use the atomic write pattern `temp -> fsync -> rename` in the target directory. Direct `os.WriteFile`-style writes are not allowed for managed mutations.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

Managed overwrite safety:
- if the target already exists and the mutation is not append-only, PM creates a recoverable pre-write backup or safe point before the atomic rename
- backup lineage is keyed by session/run/turn and target path so undo and recovery never share snapshot state across unrelated sessions
- if backup creation or backup-metadata persistence fails, the mutation fails closed before the target path is modified

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Contracts_V0.md

Temp-file lifecycle rules:
- replacement writes MUST use same-directory temp files only: `<target>.tmp.<random>` in the target directory, `fsync(temp)`, then atomic rename over the target; per-session temp directories are valid for scratch artifacts and janitor-managed temp state, but MUST NOT be used for replacement writes that rely on same-filesystem atomic rename
- boot/startup janitor sweeps stale `.tmp.*` artifacts from incomplete writes
- stale-temp cleanup emits a structured recovery event when artifacts are removed
- janitor cleanup MUST NOT delete live session backups or safe-point records that are still referenced by an active session lineage

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md



#### 11.1.2a Optimistic concurrency for mutable rewrites

All mutable FileSafe rewrite paths (plan apply, patch apply, safe auto-fix, context file rewrite, and verification-driven rewrite) MUST follow the same optimistic-concurrency contract.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md

Required behavior:
- Before any mutable rewrite, the runner captures `read_revision={mtime_ns, content_sha256}` for the target file and records the current head state when a git worktree exists.
- Immediately before rename/promote, the rewrite attempt re-reads the target state and compares it to the captured `read_revision`.
- If the current target state no longer matches the captured `read_revision`, the rewrite aborts with `error.concurrent_edit_conflict` rather than silently overwriting newer content.
- Conflict handling must surface a structured result to the caller so the run can request reconciliation, retry from fresh state, or escalate to the user according to mode/approval policy.
- Successful rewrites update the tracked post-write state that later verification, undo, and follow-up actions consume.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md

FileSafe uses optimistic concurrency here rather than mandatory file locking for ordinary mutable rewrites. Append-only seglog/event writers remain outside this rewrite path and do not use `error.concurrent_edit_conflict` for ordinary append durability.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md

Snapshot and undo isolation:
- Snapshot indexes and safe points are scoped to the active run/session lineage. Restoring one safe point must never invalidate or delete other snapshots that were preserved for different sessions or legal-hold reasons.
- Snapshot identifiers must be unique across the retained set; no restore path may assume a single global scratch snapshot directory.
- Any git or shell subprocess used to materialize a reversible checkpoint must record enough metadata to tell whether a checkpoint was actually created.

Git subprocess integrity for snapshot materialization:
- Non-zero exits from `git add`, `git commit`, `git stash`, `git checkout`, or equivalent mutation-sensitive commands are hard errors.
- After `git add`, PM MUST verify staged state with `git status --porcelain` before snapshot metadata is accepted as durable.
- The `nothing to commit` case may remain informational for commit-only flows, but it MUST NOT downgrade real staging, stash, or checkout failures into success-shaped state.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/FileSafe.md

This contract applies to both local and remote-mode project mutations. Read-only operations and evidence capture do not require snapshot creation, but any path that claims reversibility MUST satisfy the full contract above.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md

#### 11.1.3 Case folding and file-record lifecycle

FileSafe and permission matching MUST use the same filesystem-awareness for case sensitivity.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Executor_Protocol.md

Case-sensitivity detection contract:
- At project/worktree root initialization, PM probes case sensitivity by creating a temporary probe file (e.g., `.pm_case_probe`) and checking whether the filesystem distinguishes it from `.PM_CASE_PROBE`.
- If the probe succeeds (both names resolve to the same inode), the filesystem is case-insensitive.
- If the probe cannot be created (read-only filesystem, permission error, or other I/O failure), PM defaults to case-sensitive mode (the stricter assumption).
- The detected case-sensitivity flag is cached per project root and reused for all FileSafe and permission path comparisons within that project session.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

Normalization rules:
- On case-insensitive filesystems: apply Unicode NFC normalization followed by locale-independent lowercasing before path comparison.
- On case-sensitive filesystems: compare paths byte-for-byte after NFC normalization only.
- The normalization method MUST be identical in FileSafe write-scope checks and Permissions_System path-pattern matching. Divergence between the two is a security defect.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md

In-memory file records are bounded by an LRU cap of 10,000 entries. Eviction rebuilds from canonical event state on next access; it does not silently lose guard correctness.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

### 11.2 Security Filter (CRITICAL)

**Problem:** Agents may access sensitive files (`.env`, credentials, keys) during execution.

**Solution:** Block read/write access to sensitive file patterns.

```rust
// DRY:DATA:SecurityFilter — Blocks access to sensitive files
pub struct SecurityFilter {
    sensitive_patterns: Vec<Regex>,
    enabled: bool,
}

impl SecurityFilter {
    // DRY:FN:check_file_access — Check if file access is allowed
    pub fn check_file_access(&self, file_path: &Path) -> Result<(), GuardError> {
        if !self.enabled {
            return Ok(());
        }
        
        let path_str = file_path.to_string_lossy();
        for pattern in &self.sensitive_patterns {
            if pattern.is_match(&path_str) {
                return Err(GuardError::SensitiveFileAccess {
                    file: file_path.to_path_buf(),
                    pattern: pattern.as_str().to_string(),
                });
            }
        }
        
        Ok(())
    }
}
```

**Sensitive patterns (default set):** Implement as a fixed list of regex patterns, compiled once in `SecurityFilter::new()`. Use case-insensitive path matching. Suggested default patterns (one per line, converted to regex; escape literal dots):

- `\.env` (and common variants: `.env.local`, `.env.*`) -- pattern: `\.env(\..*)?$` or `\.env`
- `.*secret.*`, `.*key.*`, `.*credential.*` (path contains segment)
- `\.(pem|key|p12|pfx)$` (key/cert files)
- `id_rsa`, `id_ed25519`, `\.pub$` (SSH keys)
- `config/secrets\.`, `secrets/` (secrets dir or config secrets files)

**Implementation:** In the FileSafe validation layer, define `fn default_sensitive_patterns() -> Vec<Regex>` that returns the compiled list; allow optional project override file (e.g. `.puppet-master/security-filter.local.txt`) for additive patterns only. Document in AGENTS.md.

### 11.3 Prompt Content Checking & Context Compilation

**Problem:** Agents may include destructive commands in their prompts, not just CLI args. Additionally, context files may contain destructive commands that get compiled into the final prompt.

**Context Compilation Flow:**

1. **Initial Prompt:** `ExecutionRequest.prompt` contains the base instruction
2. **Context Files:** `ExecutionRequest.context_files` contains file paths to include
3. **Context Compilation:** Platform runners call `append_prompt_attachments()` to merge context files into prompt
4. **Final Prompt:** The compiled prompt (with context) is sent to platform CLI

**Current Implementation (`src/platforms/context_files.rs`):**
```rust
// DRY:FN:append_prompt_attachments — Compile context files into prompt
pub fn append_prompt_attachments(
    prompt: &str,
    context_files: &[PathBuf],
    token_prefix: &str,  // "" for Cursor, "@" for Gemini/Copilot
) -> String {
    let attachments = format_prompt_attachments(context_files, token_prefix);
    if attachments.is_empty() {
        prompt.to_string()
    } else {
        format!("{}{}", prompt, attachments)
    }
}

// Example output for Gemini/Copilot:
// "Original prompt\n\nReference attachments:\n- @/path/to/file1.rs\n- @/path/to/file2.md"
```

**Platform-Specific Context Compilation:**

| Platform | Token Prefix | Context Format | Example |
|----------|--------------|----------------|---------|
| **Cursor** | `""` (empty) | File paths appended as text | `"\n\nReference attachments:\n- /path/to/file.rs"` |
| **Gemini** | `"@"` | `@path` tokens (CLI interprets as attachments) | `"\n\nReference attachments:\n- @/path/to/file.rs"` |
| **Copilot** | `"@"` | `@path` tokens | `"\n\nReference attachments:\n- @/path/to/file.rs"` |
| **Codex** | `""` (empty) | File paths appended as text (do not rely on `--add-dir` for prompt attachment semantics) | `"\n\nReference attachments:\n- /path/to/file.rs"` |
| **Claude** | `""` (empty) | File paths appended as text (use `--append-system-prompt-file` only as an implementation detail when needed) | `"\n\nReference attachments:\n- /path/to/file.rs"` |

**FileSafe integration point:**

FileSafe must check the **compiled prompt** (after context compilation), not just the original prompt. This ensures:
- Destructive commands in context files are caught
- File paths in context attachments are validated
- The final prompt sent to the platform is safe

**Solution:** Check prompt content for destructive patterns **after** context compilation, before sending to platform CLI.

```rust
impl BashGuard {
    // DRY:FN:check_prompt — Check prompt content for destructive commands
    pub fn check_prompt(&self, prompt: &str) -> Result<(), GuardError> {
        // Extract potential commands from prompt
        // Common patterns: code blocks, shell commands, SQL statements
        let command_patterns = extract_commands_from_prompt(prompt);

        for cmd in command_patterns {
            self.check_command(&cmd)?;
        }
        
        Ok(())
    }
    
    // DRY:HELPER:extract_commands_from_prompt — Extract shell commands from prompt text
    /// Extract potential shell commands from prompt content
    ///
    /// Looks for:
    /// 1. Code blocks with bash/shell language tags: ```bash ... ``` or ```sh ... ```
    /// 2. Shell prompt lines: lines starting with `$ ` or `> ` (common in documentation)
    /// 3. SQL statements: DROP, TRUNCATE, DELETE without WHERE, etc.
    /// 4. Direct command mentions in text (less reliable, may have false positives)
    ///
    /// Returns vector of command strings to check against patterns.
    fn extract_commands_from_prompt(prompt: &str) -> Vec<String> {
        use regex::Regex;
        let mut commands = Vec::new();
        
        // 1. Extract code blocks with bash/shell language tags
        let code_block_re = Regex::new(r"(?s)```(?:bash|sh|shell|sql)\s*\n(.*?)```").unwrap();
        for cap in code_block_re.captures_iter(prompt) {
            let code_content = &cap[1];
            // Extract individual lines that look like commands
            for line in code_content.lines() {
                let line = line.trim();
                // Skip comments and empty lines
                if line.is_empty() || line.starts_with('#') {
                    continue;
                }
                // Skip variable assignments (e.g., VAR=value)
                if line.contains('=') && !line.contains("==") && !line.contains("!=") {
                    continue;
                }
                commands.push(line.to_string());
            }
        }
        
        // 2. Extract shell prompt lines ($ command or > command)
        let shell_prompt_re = Regex::new(r"(?m)^\s*[$>]\s+(.+)$").unwrap();
        for cap in shell_prompt_re.captures_iter(prompt) {
            let cmd = cap[1].trim();
            if !cmd.is_empty() && !cmd.starts_with('#') {
                commands.push(cmd.to_string());
            }
        }
        
        // 3. Extract SQL statements (DROP, TRUNCATE, DELETE without WHERE)
        let sql_re = Regex::new(r"(?i)\b(DROP\s+(?:DATABASE|TABLE|SCHEMA)\s+\w+|TRUNCATE\s+TABLE\s+\w+|DELETE\s+FROM\s+\w+(?:\s+WHERE\s+.+)?)").unwrap();
        for cap in sql_re.captures_iter(prompt) {
            commands.push(cap[1].trim().to_string());
        }
        
        // 4. Extract common destructive command patterns in text
        // This is less reliable but catches commands mentioned in prose
        let destructive_mentions = vec![
            r"(?i)\bmigrate[:.]fresh\b",
            r"(?i)\bdb[:.]drop\b",
            r"(?i)\breset\s+--hard\b",
        ];
        
        for pattern_str in destructive_mentions {
            if let Ok(pattern_re) = Regex::new(pattern_str) {
                for cap in pattern_re.captures_iter(prompt) {
                    // Extract surrounding context (up to 50 chars before/after)
                    let start = cap.get(0).unwrap().start().saturating_sub(50);
                    let end = (cap.get(0).unwrap().end() + 50).min(prompt.len());
                    let context = &prompt[start..end];
                    // Try to extract the full command
                    if let Some(cmd_match) = Regex::new(r"(\S+(?:\s+\S+)*)").unwrap().find(context) {
                        commands.push(cmd_match.as_str().to_string());
                    }
                }
            }
        }
        
        // Deduplicate and return
        commands.sort();
        commands.dedup();
        commands
    }
}
```

**Integration with Context Compilation:**

FileSafe must check the **compiled prompt** (after context files are merged), not the original prompt. This requires checking at the right point in the execution flow:

```rust
// In platform runner (e.g., CursorRunner::execute()):
async fn execute(&self, request: &ExecutionRequest) -> Result<ExecutionResult> {
    // 1. Compile context files into prompt
    let mut effective_request = request.clone();
    effective_request.prompt = append_prompt_attachments(
        &request.prompt,
        &request.context_files,
        "",  // Token prefix (platform-specific)
    );
    
    // 2. CHECK COMPILED PROMPT HERE (before building args)
    if let Err(e) = self.base.bash_guard.check_prompt(&effective_request.prompt) {
        // Check if verification gate operation (allow destructive during QA)
        if self.base.is_verification_gate_operation(request) {
            warn!("Destructive command in compiled prompt allowed during verification gate: {}", e);
        } else {
            return Err(anyhow!("Destructive command in prompt blocked: {}", e));
        }
    }
    
    // 3. Check context files themselves (security filter)
    for context_file in &request.context_files {
        if let Err(e) = self.base.security_filter.check_file_access(context_file) {
            // Allow during interview if configured
            if self.base.is_interview_operation(request) 
                && self.base.security_filter.allow_during_interview {
                warn!("Sensitive context file allowed during interview: {}", e);
            } else {
                return Err(anyhow!("Sensitive context file blocked: {}", e));
            }
        }
    }
    
    // 4. Build args and continue with execution
    let args = self.build_args(&effective_request);
    // ... rest of execution
}
```

**Key Points:**
- Check **compiled prompt** (after `append_prompt_attachments()`)
- Check **context files** separately (security filter)
- Check **before** building CLI args (early failure)
- Respect verification gate and interview operation type (`PUPPET_MASTER_OPERATION_TYPE`)

### 11.3A Structured chat attachments and forwarded document selections

FileSafe applies to structured chat attachments, not just freeform prompt text and context-file paths.

Rules:
- FileSafe must inspect the compiled prompt plus structured attachments together before platform send.
- `document_selection_context` attachments must pass the same mandatory secret-scrub pipeline before seglog/redb/index/blob persistence.
- Path-based sensitive sources such as `.env`, key/cert paths, credential files, and equivalent secret-bearing locations are not eligible for selection forwarding.
- If attachment forwarding is blocked, the runtime must emit an explicit block result and visible reason code; it must not pretend the context was sent successfully.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, PolicyRule:no_secrets_in_storage

Default handling:
- Heuristic secret-ish redaction remains off by default.
- Mandatory secret scrubbing remains on for all structured attachments before persistence.
- Search/indexing stores bounded summaries and provenance only, not unbounded raw selected text.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Prompt_Pipeline.md

### 11.4 Integration with Verification Gates

**Problem:** FileSafe operates independently of verification gates, potentially blocking valid operations.

**Solution:** Coordinate guards with verification gates to allow legitimate operations.

```rust
// In BaseRunner::execute_command()
// Check guards BEFORE verification gates
if let Err(e) = self.bash_guard.check_command(&full_command) {
    // Check if this is a verification gate operation
    if self.is_verification_gate_operation(&request) {
        // Allow destructive commands during verification gates
        // (e.g., test database resets during QA)
        warn!("Destructive command allowed during verification gate: {}", e);
    } else {
        return Err(anyhow!("Destructive command blocked: {}", e));
    }
}
```

**Verification gate detection:** Check request operation type via `PUPPET_MASTER_OPERATION_TYPE == "verification_gate"`. (ContractRef: EnvVar:PUPPET_MASTER_OPERATION_TYPE)

### 11.5 Event Logging Integration

**Problem:** Blocked commands are logged separately from other events, making debugging difficult.

**Solution:** Integrate with existing event logging system.

```rust
// Use existing event logging infrastructure
use crate::logging::EventLogger;

impl BashGuard {
    async fn log_blocked_command(
        &self,
        command: &str,
        error: &GuardError,
        event_logger: &EventLogger,
    ) {
        let event = FileSafeEvent {
            event_type: "bash_guard_block".to_string(),
            command_preview: command.chars().take(40).collect(),
            pattern_matched: match error {
                GuardError::DestructiveCommand { pattern, .. } => pattern.clone(),
                _ => "unknown".to_string(),
            },
            agent: None, // Will be populated from ExecutionRequest if available
            timestamp: Utc::now(),
        };
        
        event_logger.log_filesafe_event(event).await;
    }
}
```

---

## 12. Gaps and Potential Issues

### 12.1 Pattern Matching Accuracy

**Issue:** Regex patterns may be too broad (blocking safe commands) or too narrow (missing variants).

**Mitigation:**
- Test all patterns against real-world command variations
- Use word boundaries (`\b`) where appropriate
- Document pattern rationale in comments
- Allow project-specific overrides via local patterns file

### 12.2 False Positives

**Issue:** Legitimate commands may match destructive patterns (e.g., `migrate:fresh` in documentation).

**Mitigation:**
- Check prompt context (code block vs documentation)
- Allow override via environment variable
- Log all blocks for review
- Provide clear error messages with override instructions

### 12.3 Performance Impact

**Issue:** Pattern matching on every command may add latency.

**Mitigation:**
- Compile regex patterns once at initialization
- Use efficient regex engine (Rust's `regex` crate is fast)
- Cache pattern compilation results
- Benchmark and optimize hot paths

### 12.4 Multi-Platform Prompt Checking

**Issue:** Different platforms format prompts differently, making extraction difficult.

**Mitigation:**
- Platform-specific prompt parsers
- Fallback to simple pattern matching
- Document platform-specific behavior
- Test across all providers

### 12.5 Write-scope plan integration

**Issue:** Plans may not always specify exact file paths, making write-scope enforcement too restrictive.

**Mitigation:**
- Prefer directory-level permissions in the allowed list; wildcard patterns are a future enhancement (not MVP)
- Allow directory-level permissions
- Provide clear error messages when writes are blocked
- Allow override for exploratory phases

### 12.6 Implementation-Ready Clarifications (resolved)

AutoDecision: Request metadata uses `ExecutionRequest.env_vars` only; do not add a `tags` field.  
ContractRef: CodePath:puppet-master-rs/src/types/execution.rs, EnvVar:PUPPET_MASTER_OPERATION_TYPE, EnvVar:PUPPET_MASTER_ALLOWED_FILES

AutoDecision: `PUPPET_MASTER_OPERATION_TYPE` values are fixed: `normal` (default), `verification_gate`, `interview`. Guards MAY loosen only for `verification_gate` (never for `normal`).  
ContractRef: EnvVar:PUPPET_MASTER_OPERATION_TYPE

AutoDecision: Allowed write scope is supplied via `PUPPET_MASTER_ALLOWED_FILES` (JSON array of repo-relative paths and/or explicit directories). If missing or empty and `file_guard.enabled == true`: treat as empty allowlist (fail closed); enforcement is `strict_mode`-dependent (block vs warn-only).  
ContractRef: EnvVar:PUPPET_MASTER_ALLOWED_FILES, ConfigKey:filesafe.fileGuard.strictMode

AutoDecision: Owner for allowed-files derivation is `puppet-master-rs/src/core/orchestrator.rs`; orchestrator builds `PUPPET_MASTER_ALLOWED_FILES` when constructing each `ExecutionRequest` (primary source: current subtask's declared file list; context files are implicitly allowed via `request.context_files`).  
ContractRef: CodePath:puppet-master-rs/src/core/orchestrator.rs, CodePath:puppet-master-rs/src/platforms/context_files.rs

AutoDecision: Missing/unreadable custom pattern file is ignored (bundled patterns still apply). If bundled patterns are unavailable at runtime, fall back to an embedded minimal default list and log a warning; do not disable FileSafe.  
ContractRef: ConfigKey:filesafe.bashGuard.customPatternsPath

AutoDecision: `approved_commands` matching is **exact** after normalization (`trim` + collapse whitespace). Do not use prefix/substring matching.  
ContractRef: ConfigKey:filesafe.approvedCommands

AutoDecision: For multi-line or chained commands (`\n`, `&&`, `;`, `||`, `|`), check each segment independently; if any segment is blocked, block the whole invocation.  
ContractRef: CodePath:puppet-master-rs/src/platforms/runner.rs#BaseRunner::execute_command

---

## 13. Enhancements

### 13.1 Git Destructive Commands Guard

Extend bash guard to block destructive git commands:

```rust
// Add to destructive-commands.txt
git\s+reset\s+--hard
git\s+push\s+.*--force
git\s+push\s+.*-f
git\s+branch\s+-D
git\s+clean\s+-fd
```

### 13.2 SQL Injection Pattern Detection

Detect SQL injection attempts in prompts:

```rust
// DRY:FN:check_sql_injection — Detect SQL injection patterns
pub fn check_sql_injection(prompt: &str) -> Result<(), GuardError> {
    // Check for common SQL injection patterns
    // UNION SELECT, DROP TABLE, etc.
}
```

### 13.3 Rate Limiting for Blocked Commands

**Enhancement:** If an agent repeatedly tries destructive commands, temporarily increase guard strictness or block the agent.

```rust
// DRY:DATA:GuardRateLimiter — Rate limit guard violations
pub struct GuardRateLimiter {
    violations: HashMap<String, Vec<DateTime<Utc>>>,
    max_violations: usize,
    window_seconds: i64,
}
```

### 13.4 GUI Integration (configurable, easy on/off)

FileSafe settings must be **configurable in the GUI** and **easy to turn on or off**. All FileSafe controls live in one place (dedicated FileSafe tab or clearly grouped section).

**Required:**
- **Single entry point:** One FileSafe section or tab in Config. User can open it and see all FileSafe toggles at a glance.
- **Granular controls:** Separate on/off per feature so the user can enable only what they need:
  - **Command blocklist** -- "Block destructive commands" (on/off). When off, destructive CLI commands are not blocked.
  - **Write scope** -- "Restrict writes to plan" (on/off). When off, writes are not restricted to plan-declared files.
  - **Security filter** -- "Block sensitive files" (on/off). When off, access to `.env`/credentials is not blocked.
  Each feature can be toggled independently; optional sub-options (e.g. strict mode for Write scope, allow-during-interview for Security filter) stay under that feature's subsection.
- **Override:** "Allow destructive commands" (with prominent warning) for Command blocklist.
- **Optional:** Pattern path override, "Allow sensitive files during interview" for Security filter.
- **Optional:** Pattern management (view/edit), event log viewer (browse blocked commands).

**Approved-commands list (Assistant chat):**
- When a command is blocked by the Command blocklist in Assistant chat, the user can **approve this run** and optionally **add to approved list**. Approved commands are stored in settings and are then allowed by the command blocklist (whitelist overrides blocklist for matching commands).
- In Config (FileSafe section), the user can **view** the list of approved commands, **remove** entries, and (optionally) **add** entries manually. List is persisted (e.g. in `puppet-master.yaml` under `filesafe.approvedCommands` or a dedicated file).
- Implementation: Command blocklist checks the approved list before blocking; exact match or normalized match (e.g. strip extra whitespace) counts as approved. UX: In chat, show "Blocked: &lt;command&gt;" with actions "Approve once" and "Approve and add to list"; in settings, show scrollable list with remove button per row.

**Widget reuse:** Use existing widgets from `src/widgets/` per DRY Method.

---

## 14. Historical note on moved context-compilation canon

The context-compilation and token-efficiency material that previously lived in this section is no longer canonical here.

`Plans/Prompt_Pipeline.md` is now the canonical owner for:
- context compilation algorithms
- delta context selection
- cache heuristics
- marker-file / compaction-aware reread behavior
- skill bundling and prompt-compaction policy

FileSafe remains responsible only for safety checks over the fully compiled prompt and related attachments after Prompt Pipeline assembly and before provider dispatch.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md

---

## 15. System Integration Analysis

### 15.1 Integration with BaseRunner

**Current Architecture:**
- `BaseRunner::execute_command()` spawns platform CLI processes
- Already has circuit breaker, quota manager, rate limiter, permission audit
- Guards fit naturally into the pre-execution check sequence

**Integration Points:**
```rust
// In BaseRunner::execute_command(), add guards BEFORE existing checks:
pub async fn execute_command(...) -> Result<ExecutionResult> {
    // 1. Circuit breaker check (existing)
    if self.circuit_breaker.is_open() { ... }

    // 2. QUOTA CHECK (existing)
    if let Err(e) = self.quota_manager.enforce_quota(...) { ... }

    // 3. RATE LIMIT (existing)
    self.rate_limiter.acquire(...).await?;

    // 4. NEW: FileSafe (add here)
    // Note: Prompt content is checked at platform runner level (after context compilation).
    // Here we check only the final command string and file paths.
    let full_command = format!("{} {}", self.command, args.join(" "));

    // Check command string (blocklist + approved whitelist)
    if let Err(e) = self.bash_guard.check_command(&full_command) {
        if self.is_verification_gate_operation(&request) {
            warn!("Destructive command allowed during verification gate: {}", e);
        } else {
            return Err(anyhow!("Destructive command blocked: {}", e));
        }
    }

    // Check file writes (if write scope enabled)
    let allowed_files = FileGuard::load_allowed_files_from_request(&request)?;
    for file_path in self.extract_file_paths_from_request(&request)? {
        let resolved_path = if file_path.is_absolute() {
            file_path
        } else {
            request.working_directory.join(&file_path)
        };

        // §11.1.1 realpath-before-scope-check: fail-closed on resolution error
        let normalized_path = resolved_path.canonicalize()
            .map_err(|e| GuardError::SymlinkResolution {
                original: resolved_path.clone(),
                reason: e.to_string(),
            })?;

        if let Err(e) = self.file_guard.check_file_write(
            &normalized_path, &request.working_directory, &allowed_files
        ) {
            return Err(anyhow!("File write blocked: {}", e));
        }
        if let Err(e) = self.security_filter.check_file_access(&normalized_path) {
            return Err(anyhow!("Sensitive file access blocked: {}", e));
        }
    }

    // 5. PERMISSION AUDIT (existing)
    if let Some(ref audit) = self.permission_audit { ... }

    // 6. Continue with spawn logic...
}
```

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md

**Key integration rules:**
- Guards are initialized in `BaseRunner::new()` alongside other components
- All guards use `Arc<>` for thread-safe sharing
- Guard errors are logged via existing logging infrastructure
- Guard violations are logged to the canonical event stream; any `filesafe-events.jsonl` output is a derived mirror only
- Path resolution follows §11.1.1: `canonicalize()` failure produces `GuardError::SymlinkResolution`, never a silent fallback to the unresolved path
- The fallback pattern `canonicalize().unwrap_or_else(|_| original_path)` is prohibited in all FileSafe-managed code paths

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Executor_Protocol.md

### 15.2 Integration with Orchestrator

**Current Architecture:**
- Orchestrator calls `BaseRunner::execute_command()` for each iteration
- Verification gates run AFTER iteration completion
- Gates check evidence, tests, acceptance criteria

**Integration Points:**

1. **Verification Gate Detection:**
    - Need to tag `ExecutionRequest` when it's a verification gate operation
    - AutoDecision: use `ExecutionRequest.env_vars["PUPPET_MASTER_OPERATION_TYPE"] = "verification_gate"` (no `tags` field)
    - Orchestrator sets this env var when calling runner for gate verification

```rust
// In orchestrator.rs, when running verification gate:
let mut request = ExecutionRequest::new(...);
request = request.with_env("PUPPET_MASTER_OPERATION_TYPE", "verification_gate");
```

2. **Gate Operation Detection:**
```rust
impl BaseRunner {
    // DRY:FN:is_verification_gate_operation — Check if request is a verification gate operation
    /// Check if this is a verification gate operation
    ///
    /// Verification gates may legitimately need destructive commands:
    /// - QA operations may reset test databases (`migrate:fresh`)
    /// - Security audits may need to read sensitive files
    /// - Performance tests may need to drop caches
    ///
    /// Returns true if request is tagged as verification gate operation.
    fn is_verification_gate_operation(&self, request: &ExecutionRequest) -> bool {
        // Check env var tag
        request.env_vars.get("PUPPET_MASTER_OPERATION_TYPE")
            .map(|v| v == "verification_gate")
            .unwrap_or(false)
    }
    
    // DRY:FN:is_interview_operation — Check if request is an interview operation
    /// Check if this is an interview operation
    ///
    /// Interview operations may need relaxed security:
    /// - Research may need to read `.env` to understand config
    /// - Architecture phase may analyze sensitive file structures
    ///
    /// Returns true if request is tagged as interview operation.
    fn is_interview_operation(&self, request: &ExecutionRequest) -> bool {
        request.env_vars.get("PUPPET_MASTER_OPERATION_TYPE")
            .map(|v| v == "interview")
            .unwrap_or(false)
    }
    
    // DRY:FN:extract_file_paths_from_request — Extract file paths from ExecutionRequest
    /// Extract file paths that might be written from ExecutionRequest
    ///
    /// Looks for:
    /// 1. File paths mentioned in prompt (e.g., "create src/auth.rs", "write to config.yaml")
    /// 2. Context files (already allowed, but check for security filter)
    /// 3. Files mentioned in extra_args
    /// 4. Common file operation patterns in prompt text
    ///
    /// Returns vector of potential file paths to check.
    fn extract_file_paths_from_request(&self, request: &ExecutionRequest) -> Result<Vec<PathBuf>> {
        use regex::Regex;
        let mut paths = Vec::new();
        
        // 1. Add context files (agents may read/write these)
        paths.extend(request.context_files.iter().cloned());
        
        // 2. Extract file paths from prompt text
        // Patterns: "create FILE", "write to FILE", "edit FILE", "FILE:", etc.
        let file_patterns = vec![
            r"(?i)(?:create|write|edit|update|modify|save|add)\s+(?:to\s+)?([^\s]+\.(?:rs|ts|js|py|go|java|cs|php|rb|md|yaml|yml|json|toml|txt|sql|sh|bash))",
            r"(?i)(?:file|path|location)[:\s]+([^\s]+\.(?:rs|ts|js|py|go|java|cs|php|rb|md|yaml|yml|json|toml|txt|sql|sh|bash))",
            r"`([^\s`]+\.(?:rs|ts|js|py|go|java|cs|php|rb|md|yaml|yml|json|toml|txt|sql|sh|bash))`",
            r#"["']([^\s"']+\.(?:rs|ts|js|py|go|java|cs|php|rb|md|yaml|yml|json|toml|txt|sql|sh|bash))["']"#,
        ];
        
        for pattern_str in file_patterns {
            if let Ok(pattern_re) = Regex::new(pattern_str) {
                for cap in pattern_re.captures_iter(&request.prompt) {
                    let file_str = &cap[1];
                    // Skip URLs and absolute paths that are clearly not file operations
                    if !file_str.starts_with("http://") && !file_str.starts_with("https://") {
                        paths.push(PathBuf::from(file_str));
                    }
                }
            }
        }
        
        // 3. Extract from extra_args (may contain file paths)
        for arg in &request.extra_args {
            // Check if arg looks like a file path
            if arg.contains('/') || arg.contains('\\') || arg.ends_with(".rs") || arg.ends_with(".ts") {
                paths.push(PathBuf::from(arg));
            }
        }
        
        // Deduplicate
        paths.sort();
        paths.dedup();
        
        Ok(paths)
    }
}
```

3. **Write-scope plan integration:**
   - Write scope needs access to current task/subtask plan to know allowed files
   - Orchestrator should pass plan metadata to `ExecutionRequest`
   - AutoDecision: do not add an `allowed_files` field; pass allowed files via `ExecutionRequest.env_vars["PUPPET_MASTER_ALLOWED_FILES"]`

```rust
// In orchestrator.rs, when building ExecutionRequest:
let mut request = ExecutionRequest::new(...);
if let Some(allowed_files) = get_allowed_files_for_current_subtask(&tier_state) {
    // Pass to write scope via request metadata
    request = request.with_env("PUPPET_MASTER_ALLOWED_FILES", 
        serde_json::to_string(&allowed_files).unwrap_or_default());
}
```

### 15.3 Integration with Interview Flow

**Current Architecture:**
- Interview orchestrator spawns agents for research, validation, document generation
- Uses same `BaseRunner` infrastructure
- No special FileSafe considerations currently

**Integration Points:**

1. **Interview-Specific Guards:**
   - Research operations may need to read sensitive files (e.g., `.env` for understanding config)
   - Security filter should be more permissive during interview phases
   - Add interview phase detection:

```rust
impl BaseRunner {
    fn is_interview_operation(&self, request: &ExecutionRequest) -> bool {
        request.env_vars.get("PUPPET_MASTER_OPERATION_TYPE")
            .map(|v| v.starts_with("interview_"))
            .unwrap_or(false)
    }
}
```

2. **Interview Config:**
   - Add FileSafe settings to `InterviewGuiConfig`:
   ```rust
   pub struct InterviewGuiConfig {
       // ... existing fields ...
       pub filesafe: InterviewFileSafeConfig,
   }
   
   pub struct InterviewFileSafeConfig {
       pub allow_sensitive_file_read: bool,  // Default: true for research
       pub strict_file_guard: bool,          // Default: false (no plan yet)
   }
   ```

### 15.4 Integration with Worktrees

**Current Architecture:**
- Worktrees are created per subtask for parallel execution
- `BaseRunner` receives `working_directory` which may be a worktree path
- Guards must operate in the correct working directory context

**Integration Points:**

1. **Worktree-aware write scope:**
   - File paths in plans are relative to project root
   - Guards must resolve paths relative to `working_directory` (which may be a worktree)
   - Write-scope checks must account for worktree structure

```rust
impl FileGuard {
    pub fn check_file_write(&self, file_path: &Path, working_dir: &Path, allowed_files: &HashSet<PathBuf>) -> Result<(), GuardError> {
        // Resolve path relative to working directory
        let resolved_path = if file_path.is_absolute() {
            file_path.to_path_buf()
        } else {
            working_dir.join(file_path)
        };
        
        // §11.1.1 realpath-before-scope-check: fail-closed on resolution error
        let normalized = resolved_path.canonicalize()
            .map_err(|e| GuardError::SymlinkResolution {
                original: resolved_path.clone(),
                reason: e.to_string(),
            })?;
        
        // Check against allowed files (also normalized)
        // AutoDecision: match only against `allowed_files` computed from request metadata; FileGuard does not store request-scoped allowlists.
        // ...
    }
}
```

2. **Worktree Cleanup Coordination:**
   - Write-scope violations should not prevent worktree cleanup
   - MiscPlan cleanup should respect write-scope allowed files (don't delete allowed files)
   - Coordinate with `cleanup_after_execution` in runner contract

### 15.5 GUI Integration

**Authority:** **Plans/FinalGUISpec.md §7.4 (Advanced tab)** and **§7.16 (Assistant Chat)** are the canonical GUI spec. This section aligns FileSafe.md with that spec.

**Current Architecture:**
- Config view has 8 tabs: Tiers, Branching, Verification, Memory, Budgets, Advanced, Interview, YAML
- Settings are stored in `GuiConfig` and saved to YAML
- Config is loaded by orchestrator via `ConfigManager`

**Required GUI Placement (FinalGUISpec §7.4):**
- FileSafe is **not** a separate tab. It lives under **Settings > Advanced** as a **collapsible card** titled **"FileSafe Guards"**.
- Same Advanced tab contains MCP Configuration, Tool permissions, and Other (experimental, cleanup, etc.). FileSafe is one collapsible card among these.

**1. FileSafe collapsible card (Advanced tab)**

- **Three independent toggles** (product labels; internal keys remain `bash_guard` / `file_guard` / `security_filter`):
  - **"Block destructive commands"** (on/off) -- Command blocklist; when off, destructive CLI commands are not blocked.
  - **"Restrict writes to plan"** (on/off) -- Write scope; when off, writes are not restricted to plan-declared files.
  - **"Block sensitive files"** (on/off) -- Security filter; when off, access to `.env`/credentials is not blocked.
- **Override:** "Allow destructive commands" toggle with **prominent warning styling** (e.g. danger/warning variant per widget catalog).
- **Approved commands:** Scrollable list; per-row **Remove** button; optional **"Add command manually"**; persisted in `filesafe.approvedCommands` (e.g. `puppet-master.yaml`).
- **Optional:** Custom pattern path, "Allow sensitive files during interview" (Security filter), pattern management (view/edit), **Event log viewer** (browse recent blocked commands; link to FileSafe event log).
- **Widget reuse:** Use existing widgets from `src/widgets/` per DRY Method (e.g. `toggler`, `help_tooltip(tooltip_key, tooltip_variant, theme, scaled)`, `styled_button`). See `docs/gui-widget-catalog.md`. **Tooltip keys** (for localization and help system): `filesafe.bash_guard`, `filesafe.file_guard`, `filesafe.security_filter` (three toggles); optionally `filesafe.override`, `filesafe.approved_commands` for override toggle and approved list. Document in widget catalog or central tooltip doc.

**Config struct (unchanged):** `GuiConfig.filesafe: FileSafeConfig` with `BashGuardConfig`, `FileGuardConfig`, `SecurityFilterConfig`, `approved_commands: Vec<String>` as in §2.4 and §5.2.

**2. Assistant Chat and YOLO (FinalGUISpec §7.16)**

- **YOLO + FileSafe:** When YOLO is enabled and FileSafe guards are active, show a **persistent warning chip** in the input toolbar: **"[!] YOLO active -- FileSafe guards still apply."**
- **In-chat approval when blocked:** When FileSafe blocks a command during YOLO (or when a blocked command is shown in chat), display an **inline card** in the chat stream:
  - **Style:** Orange left border; command text in monospace; guard name that triggered (e.g. "Command blocklist").
  - **Actions:** **"Approve once"** (runs the command this time only) and **"Approve & add to list"** (adds to `filesafe.approvedCommands` in Settings > Advanced).
  - **Timeout:** Card auto-dismisses after **60 seconds** with message "Timed out -- command skipped."
  - **Logging:** Blocked commands are logged to the FileSafe event log; accessible from Settings > Advanced (event log viewer or link).
- **Terminal (FinalGUISpec §7.16):** When a command is blocked by FileSafe, terminal output uses **RED** with prefix **"[BLOCKED] Blocked by FileSafe"**.

**3. Dashboard / status (FinalGUISpec §7.2)**

- **FileSafe status (optional):** Compact card showing guard count (e.g. "FileSafe: 3/3 guards active") with link to **Settings > Advanced > FileSafe**.

**4. Message enum and update flow**

- Add FileSafe-related messages (e.g. `FileSafeBashGuardToggled(bool)`, `FileSafeAllowDestructiveToggled(bool)`, `FileSafeFileGuardToggled(bool)`, `FileSafeFileGuardStrictToggled(bool)`, `FileSafeSecurityFilterToggled(bool)`, `FileSafeAllowSensitiveDuringInterviewToggled(bool)`, `FileSafeRemoveApprovedCommand(usize)`, `FileSafeAddApprovedCommandClicked`, `FileSafeAddApprovedCommand(String)`, `FileSafeViewEventLog`).
- Config save: FileSafe changes persist with the rest of Advanced tab (Save Changes per tab or global).

**5. Config Wiring (Critical):**
- FileSafe config must be wired to `PuppetMasterConfig` (orchestrator config).
- Follow Option B pattern from `Plans/WorktreeGitImprovement.md` §5.2 (Chosen approach: Option B -- Build run config from GUI): build run config from GUI config at orchestrator start.
- Ensure FileSafe settings (and `approved_commands`) are available to `BaseRunner` initialization so the command blocklist whitelist is applied at runtime.

### 15.6 Integration with Verification Gates

**Current Architecture:**
- Verification gates run AFTER iteration completion
- Gates check evidence, run tests, verify acceptance criteria
- Gate operations may legitimately need destructive commands (e.g., test database resets)

**Integration Points:**

1. **Gate Operation Tagging:**
   - When orchestrator calls `run_verification_gate()`, tag the operation
   - Pass tag to `BaseRunner` via `ExecutionRequest`
   - Guards check tag before blocking

2. **Gate-Specific Allowances:**
   - QA operations may need `migrate:fresh` for test database setup
   - Security audits may need to read `.env` files
   - Add gate-specific override list:

```rust
pub struct FileSafeConfig {
    // ... existing fields ...
    pub gate_overrides: GateOverrideConfig,
}

pub struct GateOverrideConfig {
    pub allow_destructive_during_qa: bool,      // Default: true
    pub allow_sensitive_during_security_audit: bool,  // Default: true
}
```

3. **Gate Evidence Integration:**
   - Blocked commands should be logged as gate evidence
   - Add to `GateReport` if guard blocks occur during gate execution
   - Helps track FileSafe violations during verification

### 15.7 Integration with State Management
**Current Architecture:**
- State is managed via `prd.json`, `progress.txt`, `AGENTS.md`, and rewrite-owned runtime stores.
- Orchestrator tracks tier state, iterations, gate results, and child lineage.
- State persists across sessions.

**Integration Points:**

1. **FileSafe event state**
   - FileSafe history is canonical in seglog.
   - State snapshots, dashboards, or diagnostic mirrors derive from seglog or its projector state.
   - A standalone `filesafe-events.jsonl` file may exist only as a rebuildable mirror, not as an owner store.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

2. **Guard configuration state**
   - Guard config is part of `GuiConfig` -> `puppet-master.yaml`.
   - Guard settings persist across sessions.
   - Default values remain safe (guards enabled by default).

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md

3. **Plan metadata for write scope**
   - Write scope needs the current plan's allowed-files list.
   - Plan metadata must be accessible to `BaseRunner` through canonical request context.
   - Scope checks compare only canonical real paths rooted in the active worktree or project root.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/WorktreeGitImprovement.md
### 15.8 Integration with Cleanup (MiscPlan)

**Current Architecture:**
- Cleanup runs `prepare_working_directory` and `cleanup_after_execution`
- Uses git clean with allowlist
- Write scope should coordinate with cleanup

**Integration Points:**

1. **Cleanup vs write scope:**
   - Cleanup removes untracked files (except allowlist)
   - Write scope blocks writes to files not in plan
   - These are complementary but need coordination:
     - Write scope blocks DURING execution
     - Cleanup removes files AFTER execution
     - Write-scope allowed files should be in cleanup allowlist

2. **Security Filter vs Cleanup:**
   - Cleanup should NEVER delete sensitive files (even if untracked)
   - Security filter patterns should be added to cleanup allowlist
   - Prevents accidental deletion of credentials

### 15.9 Gaps Identified

#### Gap 1: ExecutionRequest Metadata
**Issue:** No way to tag operations as verification gates, interview phases, etc.
**Impact:** Guards can't distinguish legitimate destructive operations
**Fix:** AutoDecision: use `ExecutionRequest.env_vars["PUPPET_MASTER_OPERATION_TYPE"]` (fixed values: `normal`, `verification_gate`, `interview`). (ContractRef: EnvVar:PUPPET_MASTER_OPERATION_TYPE)

#### Gap 2: Plan Metadata Access
**Issue:** Write scope needs current plan's allowed files list, but plans aren't accessible to `BaseRunner`
**Impact:** Write scope can't enforce plan boundaries
**Fix:** Pass plan metadata via `ExecutionRequest` or context files

#### Gap 3: Config Wiring
**Issue:** FileSafe config in GUI may not be wired to orchestrator config (same issue as WorktreeGitImprovement)
**Impact:** FileSafe settings from GUI won't be applied at runtime
**Fix:** Implement Option B config wiring (build run config from GUI at orchestrator start)

#### Gap 4: Worktree Path Resolution

**Issue:** Write-scope checks must resolve relative paths correctly in worktree context without trusting symlink aliases.

**Impact:** Inconsistent normalization can either block legitimate writes or allow writes outside the intended worktree scope.

**Resolved contract:** Normalize candidate paths relative to `working_directory`, then resolve `realpath()` before any scope check. If canonicalization fails, deny access. The real worktree root, not a symlink alias, is the base path for guard comparison.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/WorktreeGitImprovement.md

#### Gap 5: Interview Phase Detection
**Issue:** No way to detect interview operations for relaxed security filter
**Impact:** Security filter may block legitimate research operations
**Fix:** Tag interview operations in `ExecutionRequest`, check tag in guards

#### Gap 6: Event Log Integration
**Issue:** FileSafe events logged separately from other events
**Impact:** Difficult to correlate FileSafe violations with execution context
**Fix:** Integrate with existing event logging system or add FileSafe events to gate reports

### 15.10 Potential Issues

#### Issue 1: False Positives in Documentation
**Problem:** Agents may include destructive commands in documentation or comments
**Risk:** Guards block legitimate documentation work
**Mitigation:** 
- Check prompt context (code block vs markdown)
- Allow override via environment variable
- Log all blocks for review and pattern refinement

#### Issue 2: Performance Impact
**Problem:** Pattern matching on every command adds latency
**Risk:** Slows down iteration execution
**Mitigation:**
- Compile regex patterns once at initialization
- Use efficient regex engine (Rust's `regex` crate)
- Benchmark and optimize hot paths
- Consider async guard checks if needed

#### Issue 3: Plan File List Completeness
**Problem:** Plans may not list all files that need to be written
**Risk:** Write scope too restrictive, blocks legitimate operations
**Mitigation:**
- Support wildcard patterns in plan file lists
- Allow directory-level permissions
- Provide clear error messages with override instructions
- Warn-only mode option (log but don't block)

#### Issue 4: Multi-Platform Prompt Parsing
**Problem:** Different platforms format prompts differently
**Risk:** Prompt content checking misses destructive commands
**Mitigation:**
- Platform-specific prompt parsers
- Fallback to simple pattern matching
- Test across all providers
- Document platform-specific behavior

#### Issue 5: Guard Initialization Failure
**Problem:** If guard initialization fails, execution may be blocked entirely
**Risk:** System unusable if pattern file corrupted or missing
**Mitigation:**
- Graceful degradation: disable guard on init failure, log warning
- Provide `BashGuard::disabled()` fallback
- Doctor check validates guard initialization

### 15.11 Enhancements for Existing Systems

#### Enhancement 1: Doctor check for FileSafe
**Add to `src/doctor/checks/`:**
```rust
// DRY:FN:check_filesafe — Verify FileSafe guards are initialized correctly
pub fn check_filesafe() -> DoctorCheck {
    // Check pattern file exists and is readable
    // Check patterns compile as valid regex
    // Check guards initialize without errors
    // Check config is valid
}
```

#### Enhancement 2: FileSafe events in gate reports
**Enhance `GateReport` to include FileSafe violations:**
```rust
pub struct GateReport {
    // ... existing fields ...
    pub filesafe_violations: Vec<FileSafeViolation>,  // New field
}

pub struct FileSafeViolation {
    pub guard_type: String,  // "bash_guard", "file_guard", "security_filter"
    pub violation_type: String,  // "destructive_command", "file_not_in_plan", etc.
    pub details: String,
    pub timestamp: DateTime<Utc>,
    pub allowed: bool,  // Was override applied?
}
```

#### Enhancement 3: FileSafe metrics dashboard
**Add to GUI status/overview:**
- Count of blocked commands (total, by guard type)
- Most common violations
- Override usage statistics
- FileSafe event timeline

#### Enhancement 4: Plan File List Validation
**Enhance plan generation to include file lists:**
- Interview/planning phases should generate file lists for write scope
- Validate file lists are complete before execution
- Doctor check validates plan file lists

#### Enhancement 5: Guard Configuration Profiles
Allow different guard strictness by **runtime profile**, not by deprecated tier names.

```rust
pub struct FileSafeProfileSet {
    pub plan_read_only: FileSafeConfig,
    pub standard_execution: FileSafeConfig,
    pub debug_investigation: FileSafeConfig,
    pub delegated_child: FileSafeConfig,
    pub maintenance_recovery: FileSafeConfig,
}
```

Profile rules:
- `plan_read_only` is the strictest profile and denies mutation-capable execution except explicitly allowed read-only planning tools.
- `standard_execution` is the default for normal agent execution.
- `debug_investigation` allows bounded temporary instrumentation and cleanup-sensitive operations under stronger disclosure/logging rules.
- `delegated_child` may be narrower than its parent run based on the delegated work package.
- `maintenance_recovery` is reserved for restore/cleanup/recovery flows and must not silently broaden into general execution.

Profile selection derives from effective run mode, operation class, and target capabilities. It MUST NOT depend on legacy Phase/Task/Subtask/Iteration naming.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Executor_Protocol.md

### 15.12 Integration Checklist
This section is a resolved integration map for implementers. It does not reopen design questions; the owner sections above define the canonical FileSafe behavior.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md

**ExecutionRequest integration**
- operation metadata continues to travel through `env_vars`, using `PUPPET_MASTER_OPERATION_TYPE` for operation classification and `PUPPET_MASTER_ALLOWED_FILES` for write-scope declarations
- FileSafe does not require new `ExecutionRequest` fields; every launch path that constructs an `ExecutionRequest` MUST populate those canonical env vars before BaseRunner executes the request

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/storage-plan.md

**BaseRunner integration**
- `BaseRunner` owns guard initialization, full rendered-command validation, write-scope checks, and security-filter checks before any managed spawn path executes
- helper functions such as `is_verification_gate_operation`, `is_interview_operation`, and `extract_file_paths_from_request` remain implementation obligations, not open design questions
- any FileSafe denial in BaseRunner surfaces a canonical blocked outcome and does not silently downgrade to a best-effort retry path

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

**Orchestrator and interview integration**
- orchestrator-owned verification-gate operations tag their operation type, pass allowed-file metadata, and integrate FileSafe violations into gate reporting rather than inventing a parallel error channel
- interview-owned operations tag interview context explicitly; any security-filter relaxation during interview phases requires explicit configuration and remains scoped to the interview flow that requested it

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Permissions_System.md

**Worktree integration**
- canonical path/worktree guard behavior is already locked by this owner doc and `Plans/WorktreeGitImprovement.md`; implementers consume that canon rather than reopening it as checklist uncertainty
- candidate paths are normalized relative to `working_directory`, canonicalized with fail-closed behavior, compared against the real worktree root rather than a symlink alias, and rejected when unresolved aliases remain

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

**GUI and derived projections**
- `GuiConfig` carries FileSafe configuration, the Config surface owns FileSafe controls, and orchestrator startup consumes that config without inventing a second configuration path
- FileSafe-related UI messages remain projections over canonical runtime/FileSafe state
- any FileSafe event-log viewer is a derived projection only; seglog remains the canonical event source

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md
## 16. References

- **AGENTS.md:** DRY Method, platform_specs, Pre-Completion Verification Checklist
- **Plans/FinalGUISpec.md:** §7.4 (Settings > Advanced, FileSafe Guards card), §7.16 (Assistant Chat, YOLO + FileSafe, in-chat approval)
- **Plans/orchestrator-subagent-integration.md:** BaseRunner execution flow, verification gates, tier execution
- **Plans/interview-subagent-integration.md:** Interview execution flow, research operations
- **Plans/WorktreeGitImprovement.md:** Worktree execution context, path resolution, Option B config wiring
- **Plans/MiscPlan.md:** Cleanup policies, runner contract, file management
- **Plans/storage-plan.md:** Seglog, redb, analytics scan (for FileSafe event emission post-rewrite)
- **Plans/rewrite-tie-in-memo.md:** Central tool registry, patch pipeline, event stream alignment
- **puppet-master-rs/src/platforms/runner.rs:** BaseRunner implementation
- **puppet-master-rs/src/platforms/context_files.rs:** Context file handling, append_prompt_attachments
- **puppet-master-rs/src/config/gui_config.rs:** GUI config structure
- **puppet-master-rs/src/types/execution.rs:** ExecutionRequest structure
- **puppet-master-rs/src/core/orchestrator.rs:** Orchestrator execution flow
- **docs/gui-widget-catalog.md:** Widget reuse for FileSafe UI

---

## 17. Implementation Order and Dependencies

Use this section to derive a phased implementation plan. Dependencies are stated so an agent can order tasks and avoid gaps.

**Phase 1 -- Core guards (no GUI, no Assistant)**  
1. Create the `src-tauri/src/filesafe/` module files listed in §9 Implementation Checklist.  
2. Implement pattern loading (§2.3), bundled + project-local resolution (§2.2).  
3. Implement `BashGuard` (new, disabled, check_command, **commands_match** §2.2, approved_commands from config).  
4. Implement **check_prompt** and **extract_commands_from_prompt** (§11.3).  
5. Implement write-scope enforcement (**per-request update** §11.1, check-file-write behavior).  
6. Implement sensitive-file filtering (**default_sensitive_patterns** §11.2, check-file-access behavior).  
7. Add `FileSafeConfig` to `GuiConfig` and YAML (§2.4, §5.2); config load/save only (no UI yet).  
8. Integrate into **BaseRunner**: add guard fields, init in `new()` (with config from orchestrator when wired), in **execute_command()** call check_command (after building full command string), then compute `allowed_files` from request (§11.1), then check_file_write and check_file_access for extracted file paths.  
9. **ExecutionRequest:** ensure allowed files and operation type are passed via env_vars (`PUPPET_MASTER_ALLOWED_FILES`, `PUPPET_MASTER_OPERATION_TYPE`).  
10. Implement **extract_file_paths_from_request** (§15.2), **is_verification_gate_operation**, **is_interview_operation** (§15.2).  
11. In **platform runners** (e.g. Cursor): after **append_prompt_attachments**, call **check_prompt** on compiled prompt and **security_filter** on context files; respect `PUPPET_MASTER_OPERATION_TYPE` (`verification_gate`/`interview`).  
12. Event logging: **FileSafeEvent** struct (§6), write to seglog; any `filesafe-events.jsonl` surface is rebuildable mirror output only.  
13. Pattern file: create `config/destructive-commands.txt` (§4); verify regexes.  
14. Unit tests: pattern match, commands_match, check_prompt extraction, FileGuard allowed/blocked, SecurityFilter, disabled/override behavior.

**Phase 2 -- Config wiring and GUI**  
15. Wire **GuiConfig::filesafe** → **PuppetMasterConfig::filesafe** at orchestrator start (Option B per `Plans/WorktreeGitImprovement.md` §5.2).  
16. Pass FileSafe config (and approved_commands) into BaseRunner construction.  
17. **Advanced tab:** Add **FileSafe Guards** collapsible card (§15.5, FinalGUISpec §7.4): three toggles, override with warning, approved commands list (scrollable, remove, optional add), optional event log link. Use existing widgets and help_tooltip keys.  
18. Message enum and update handlers for all FileSafe toggles and list actions.  
19. Persist approved_commands; ensure runtime blocklist checks whitelist from config.

**Phase 3 -- Assistant Chat and YOLO**  
20. When YOLO is on and FileSafe enabled: show **warning chip** "YOLO active -- FileSafe guards still apply" (§15.5, FinalGUISpec §7.16).  
21. **In-chat approval UI:** On block, show inline card (orange border, command in mono, guard name, "Approve once" / "Approve & add to list"), 60s timeout, log to event log.  
22. Terminal: on block, output RED with "[BLOCKED] Blocked by FileSafe".  
23. Optional: Dashboard FileSafe status card with link to Settings > Advanced.

**Phase 4 -- Prompt Pipeline-owned context compilation follow-up**  
24. Implement context compiler, delta context, cache, handoff schemas, compaction marker, and skill bundling from `Plans/Prompt_Pipeline.md`; FileSafe participates only through compiled-prompt safety checks and event logging integration.

**Risks and mitigations:**  
- **Gap -- plan metadata:** Orchestrator must set allowed files on each ExecutionRequest for write scope; implement **get_allowed_files_for_current_subtask** and pass via env or request field (§15.9 Gap 2).  
- **Worktree paths (resolved):** Path normalization and symlink handling are specified by §11.1.1 (realpath-before-scope-check invariant) and §11.1.3 (case-folding and probe-file detection contract).  
- **False positives:** Log all blocks; allow override and approved list; tune patterns from feedback (§12.2).

---

**End of Implementation Plan**

## Runtime Blocked-State Integration Addendum (2026-03-08)

### 1. FileSafe outcomes are first-class blocked outcomes

FileSafe decisions must integrate with the shared runtime blocked taxonomy.

Required rule:
- a FileSafe block becomes `blocked_reason_code = filesafe_blocked`
- it is not an execution failure and is not auto-retryable

### 2. Recovery options

When FileSafe allows user recovery, runtime/UI surfaces must expose exact options.

Allowed examples:
- `Approve once`
- `Approve & add to list`
- `Cancel`

If recovery is not allowed for the specific guard, the runtime must say so explicitly.

### 3. Event and analytics requirements

FileSafe event payloads must remain rich enough for both analytics and runtime recovery surfaces.

Minimum fields:
- `guard_type`
- `pattern_id` or pattern name
- `timestamp`
- `command_or_path_summary`
- `recovery_allowed`
- `allowed_action_ids[]`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md
### 4. Safe-point interaction

A FileSafe block that occurs before execution does not consume a mutation safe point and does not require rollback.

### 5. Acceptance criteria

- FileSafe blocks appear as blocked outcomes with explicit reason codes.
- FileSafe blocks are not auto-retried.
- Recovery-capable FileSafe blocks present exact allowed actions.
- FileSafe analytics data remains usable after runtime integration.
## FileSafe Blocked Outcome Alignment Addendum (2026-03-09)

FileSafe denials that stop execution are blocked outcomes, not generic execution failures.

### Required behavior
- classify as `blocked_reason_code = filesafe_blocked`
- preserve completed local work when safe to do so
- emit allowed recovery actions such as inspect denial, change policy, or rerun
- require safe-point restore before retry when policy says the workspace must be rolled back to a known baseline

FileSafe must not silently convert a denial into a retryable transient error.
## FileSafe Runtime Blocked and Restore Override Consolidation Addendum (2026-03-09)

This section defines fileSafe Action Mapping and Persistence.

### Shared runtime fields
FileSafe blocked payloads MUST use the canonical blocked payload:
- `blocked_reason_code = filesafe_blocked`
- `allowed_action_ids[]`
- `preserved_local_work`
- `requires_safe_point_restore?`
- `detail_ref?`

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### Shared vs local actions
Shared runtime action IDs remain the canonical recovery families. Labels such as `Approve and add to allowlist` and `Edit and retry` are FileSafe-local affordances layered on top of shared actions and metadata. They are not new shared runtime action IDs unless the global action enum explicitly adopts them.

Required rules:
- runtime-facing FileSafe blocks use canonical `blocked_reason_code` plus ordered `allowed_action_ids[]`
- `recovery_options[]` and `allowed_actions[]` are not canonical shared runtime fields
- child runs blocked by FileSafe remain child runs with canonical lineage and status history
- rerun and restore behavior must preserve canonical child/run/worktree identities

### Restore override
`filesafe_blocked` is not retryable by default.

If a mutation-capable attempt performed local changes before the FileSafe block was finalized, the blocked projection MUST expose:
- `preserved_local_work = true`
- `requires_safe_point_restore = true`

When `requires_safe_point_restore = true`, the only legal rerun path is `restore_safe_point_then_retry`.

### Persistence
A FileSafe block is a persistent blocked runtime episode until resolved or superseded.

Context-shaping and handoff rule:
- FileSafe does not define alternate child continuity or alternate memory behavior.
- any rerun or restore after FileSafe denial uses canonical handoff reconstruction.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md
