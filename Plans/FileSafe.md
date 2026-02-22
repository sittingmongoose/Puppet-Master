# FileSafe, Context Compilation & Token Efficiency — Implementation Plan

**Date:** 2026-02-19  
**Priority:** CRITICAL  
**Status:** Plan Document Only

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

- ✅ **ALWAYS** tag reusable functions: `// DRY:FN:<name> — Description`
- ✅ **ALWAYS** tag reusable data structures: `// DRY:DATA:<name> — Description`
- ✅ **ALWAYS** tag reusable helpers: `// DRY:HELPER:<name> — Description`
- ✅ **ALWAYS** use `platform_specs::` functions for platform data (never hardcode)
- ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI widgets

---

## Rewrite alignment (2026-02-21)

This plan remains authoritative for safety policy and context-compilation behavior. As the rewrite lands (see `Plans/rewrite-tie-in-memo.md`), FileSafe should be implemented primarily through:

- The **central tool registry + policy engine** (permissions/validation/normalized tool results)
- The **patch/apply/verify/rollback pipeline** (often worktrees/sandboxes) rather than ad-hoc guardrails scattered in UI code
- Emitting guard decisions, violations, and remediation into the **unified event stream** (seglog ledger) for replayability
- **Analytics:** Guard blocks and violations in seglog can be consumed by the **analytics scan** (storage-plan.md): e.g. tool-block rate, error rate by guard type or pattern, and latency of blocked vs allowed commands. Rollups stored in redb support dashboard widgets (e.g. 'FileSafe blocks this week' or 'top blocked patterns'). Ensure FileSafe event payloads include enough structure (guard type, pattern id, timestamp) for analytics scan jobs to aggregate.

Any UI/storage examples in this plan are illustrative; the guard behavior and contracts are the stable requirements.

## Executive Summary

This plan covers **two pillars**: (1) **FileSafe** — guards that block destructive operations before execution — and (2) **context compilation and token efficiency** that reduce coordination overhead by compiling role-specific context and related optimizations.

### Part A — FileSafe

1. **FileSafe: Command blocklist** — Blocks destructive CLI commands (e.g. `migrate:fresh`, `db:drop`, `TRUNCATE TABLE`, `git reset --hard`, Docker volume prune) before they run.
2. **FileSafe: Write scope** — Restricts writes to files declared in the active plan (no writes outside plan scope).
3. **FileSafe: Security filter** — Blocks access to sensitive files (`.env`, credentials, keys).
4. **Prompt content checking** — Scans prompts for destructive commands before sending to the platform CLI.
5. **Verification gate integration** — Allows legitimate destructive operations when tagged as verification-gate or interview operations.

**Why critical:** Agents with shell access can accidentally run destructive commands, touch sensitive files, or write outside scope. FileSafe provides deterministic, platform-level protection regardless of agent behavior.

### Part B — Context Compilation & Token Efficiency

6. **Role-Specific Context Compiler** — Builds `.context-{role}.md` per agent role (Phase/Task/Subtask/Iteration) so each agent gets only the context it needs (e.g. phase goal, filtered requirements, conventions). Cuts coordination overhead by ~40–60% at scale.
7. **Delta Context** — Adds a “Changed Files (Delta)” section with code slices from recently modified files so agents see what just changed.
8. **Context Cache** — Caches the compiled context index so compilation is skipped when project files are unchanged.
9. **Structured Handoff Schemas** — Typed JSON schemas for inter-agent messages (e.g. progress, blockers, QA results) for reliable parsing.
10. **Compaction-Aware Re-Reads** — A deterministic marker indicates when plan/context re-read is needed, avoiding redundant full re-reads every task.
11. **Skill Bundling** — Bundles skills referenced in the plan into the compiled context once per phase instead of per task.

**Why critical:** Context compilation and these features reduce token use and improve reliability where coordination and context size matter most (large projects, many phases).

**DRY compliance:** All reusable code is tagged with `DRY:FN:`, `DRY:DATA:`, `DRY:HELPER:`. Platform data uses `platform_specs::`. Widgets reuse components from `src/widgets/`.

---

## Table of Contents

**Part A — FileSafe**  
1. Architecture Overview · 2. Implementation Details (guards) · 3. Integration with Platform Runner · 4. Pattern File · 5. Configuration · 6. Event Logging · 7. Error Messages · 8. Testing · 9. Implementation Checklist · 10. Relationship to Other Plans · 10a. FileSafe and Assistant YOLO mode · 11. Additional FileSafe Features (Write scope, Security filter, Prompt checking, Verification gates) · 12. Gaps and Potential Issues · 13. Enhancements

**Part B — Context & Token Efficiency**  
14. Context Compilation & Token Efficiency (14.1–14.7)

**Integration & References**  
15. System Integration Analysis · 16. References · **17. Implementation Order and Dependencies**

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
   - Load `GuiConfig` from `puppet-master.yaml` (or defaults)
   - Extract `FileSafeConfig` from `GuiConfig`
   - Store in app state

2. **When orchestrator starts:**
   - Build `PuppetMasterConfig` from `GuiConfig` (Option B pattern)
   - Extract FileSafe config
   - Pass to `BaseRunner::new()` via orchestrator context

3. **When BaseRunner is created:**
   - Initialize command blocklist (`BashGuard`) with pattern file resolution
   - Initialize write scope (`FileGuard`) with empty allowed files initially
   - Initialize `SecurityFilter` with sensitive patterns
   - Store as `Arc<>` for thread-safe sharing

4. **Per ExecutionRequest:**
   - Update write scope allowed files from request metadata
   - Run FileSafe checks before spawning process
   - Log violations to event log

**Error Handling:**
- If guard initialization fails: log warning, create disabled guard, continue execution
- If pattern file missing: log warning, use empty patterns (guard effectively disabled)
- If config invalid: use safe defaults (guards enabled, strict mode)

### 2.1 Module Structure

Create new module: `puppet-master-rs/src/filesafe/`

```
src/filesafe/
├── mod.rs                    # Module declaration + re-exports
├── bash_guard.rs            # Main guard implementation
├── destructive_patterns.rs  # Pattern loading and matching
├── file_guard.rs            # File write guard (Section 11.1)
├── security_filter.rs        # Sensitive file access guard (Section 11.2)
└── config/
    └── destructive-commands.txt  # Default pattern file (bundled with binary)
```

**Pattern File Location:**
- **Bundled:** `puppet-master-rs/config/destructive-commands.txt` (source)
- **Runtime:** Bundled with binary or located relative to executable
- **Project-specific:** `.puppet-master/destructive-commands.local.txt` (optional override)
- **Resolution order:** Custom path → Project-specific → Bundled → Disabled (with warning)

**Module Declaration (`src/filesafe/mod.rs`):**
```rust
//! FileSafe — guards for preventing destructive operations
//!
//! This module provides guards that block destructive commands, file writes,
//! and sensitive file access before execution.

pub mod bash_guard;
pub mod destructive_patterns;
pub mod file_guard;
pub mod security_filter;

pub use bash_guard::{BashGuard, GuardError};
pub use file_guard::FileGuard;
pub use security_filter::SecurityFilter;
```

### 2.2 Core Types

```rust
// src/filesafe/bash_guard.rs

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
    /// 4. Fallback: use empty patterns list (guard disabled) and log warning
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
            warn!("Pattern file not found: {}. Guard will be disabled.", pattern_file.display());
            Vec::new()
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
    /// Create a disabled guard instance (fallback for initialization failures)
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
// src/filesafe/destructive_patterns.rs

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

The orchestrator reads from `PuppetMasterConfig` (YAML), not `GuiConfig`. Follow Option B pattern from WorktreeGitImprovement plan:

1. Add `FileSafeConfig` to `PuppetMasterConfig` type (in `src/types/config.rs`)
2. When orchestrator starts, build run config from `GuiConfig::filesafe` → `PuppetMasterConfig::filesafe`
3. Pass FileSafe config to `BaseRunner::new()` via orchestrator context

**Config File Format (`puppet-master.yaml`):**  
Keys: `bashGuard` (Command blocklist), `fileGuard` (Write scope), `securityFilter`, `approvedCommands`.

```yaml
filesafe:
  bashGuard:    # Command blocklist
    enabled: true
    allowDestructive: false
    customPatternsPath: ".puppet-master/destructive-commands.local.txt"  # Optional
  fileGuard:    # Write scope
    enabled: true
    strictMode: true
  securityFilter:
    enabled: true
    allowDuringInterview: false
  approvedCommands: []   # Commands approved from Assistant chat; user can add/remove in settings
```

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
- Respect verification gate and interview operation tags
- Log all blocked operations to event log

### 3.3 BaseRunner Integration

**Add guard check in `BaseRunner::execute_command()`:**

```rust
// In BaseRunner::execute_command() (src/platforms/runner.rs)
pub async fn execute_command(
    &self,
    request: &ExecutionRequest,
    args: Vec<String>,
    stdin_input: Option<String>,
) -> Result<ExecutionResult> {
    // ... existing checks (circuit breaker, quota, rate limit) ...
    
    // Build full command string for guard check
    let full_command = format!("{} {}", self.command, args.join(" "));
    
    // CHECK COMMAND STRING (before spawning)
    if let Err(e) = self.bash_guard.check_command(&full_command) {
        // Check if verification gate operation
        if self.is_verification_gate_operation(request) {
            warn!("Destructive command allowed during verification gate: {}", e);
        } else {
            // Log blocked command
            self.log_blocked_command(&full_command, &e, request).await?;
            
            return Err(anyhow!(
                "Destructive command blocked: {}. \
                Set PUPPET_MASTER_ALLOW_DESTRUCTIVE=1 to override.",
                e
            ));
        }
    }
    
    // CHECK FILE PATHS (write scope + security filter)
    for file_path in self.extract_file_paths_from_request(request)? {
        // Resolve and normalize path
        let resolved_path = if file_path.is_absolute() {
            file_path
        } else {
            request.working_directory.join(&file_path)
        };
        
        let normalized_path = resolved_path.canonicalize()
            .unwrap_or_else(|_| resolved_path);
        
        // Check write scope
        if let Err(e) = self.file_guard.check_file_write(&normalized_path, &request.working_directory) {
            return Err(anyhow!("File write blocked: {}", e));
        }
        
        // Check security filter
        if let Err(e) = self.security_filter.check_file_access(&normalized_path) {
            if self.is_interview_operation(request) && self.security_filter.allow_during_interview {
                warn!("Sensitive file access allowed during interview: {}", e);
            } else {
                return Err(anyhow!("Sensitive file access blocked: {}", e));
            }
        }
    }
    
    // ... continue with existing spawn logic ...
}
```

### 3.4 Multi-Platform Support

The guard must work for all 5 platforms:

- **Cursor:** `agent -p "..."` — check compiled prompt content
- **Codex:** `codex exec "..."` — check compiled prompt content
- **Claude Code:** `claude -p "..."` — check compiled prompt content
- **Gemini:** `gemini -p "..."` — check compiled prompt content (with `@path` tokens)
- **GitHub Copilot:** `copilot -p "..."` — check compiled prompt content (with `@path` tokens)

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

**Contract:** FileSafe emits a structured event for every block (command blocklist, write scope, security filter). Two phases:

- **Pre-rewrite / current:** Log to `.puppet-master/logs/filesafe-events.jsonl` (append-only, one JSON object per line). Schema below.
- **Post-rewrite (storage-plan.md):** Emit FileSafe events into the **unified event stream (seglog)** so analytics scan jobs can aggregate (e.g. tool-block rate, error rate by guard type, latency of blocked vs allowed). Event payload **must** include: `guard_type`, `pattern_id` (or pattern name), `timestamp`, and enough structure for analytics rollups (see rewrite alignment in header). Rollups stored in redb support dashboard widgets (e.g. "FileSafe blocks this week", "top blocked patterns").

**FileSafeEvent schema (minimum):**

```rust
pub struct FileSafeEvent {
    pub event_type: String,       // "bash_guard_block" | "file_guard_block" | "security_filter_block"
    pub guard_type: String,       // "bash_guard" | "file_guard" | "security_filter" (for analytics)
    pub pattern_matched: String,  // Pattern or rule that triggered (for analytics aggregation)
    pub command_preview: String,  // First 40 chars (or path for file guards)
    pub agent: Option<String>,   // If available from ExecutionRequest
    pub timestamp: DateTime<Utc>,
    pub allowed: bool,            // True if override/approval was applied (e.g. verification gate, "Approve once")
}
```

**Logging call:** From `BaseRunner` (or platform runner when prompt is blocked): on any guard block, build `FileSafeEvent`, then either (a) append to `filesafe-events.jsonl` or (b) emit to seglog writer, depending on which storage path is active. Do not block execution path on log write (fire-and-forget or bounded queue).

---

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

- [ ] **Create FileSafe module structure**
  - [ ] `src/filesafe/mod.rs`
  - [ ] `src/filesafe/bash_guard.rs`
  - [ ] `src/filesafe/destructive_patterns.rs`
  - [ ] `src/filesafe/file_guard.rs` (Section 11.1)
  - [ ] `src/filesafe/security_filter.rs` (Section 11.2)
  - [ ] Add `pub mod filesafe;` to `src/lib.rs`
  - [ ] Tag all reusable items with DRY comments

- [ ] **Port pattern file**
  - [ ] Create `config/destructive-commands.txt`
  - [ ] Verify all 40+ patterns compile as Rust regex
  - [ ] Test pattern matching

- [ ] **Implement BashGuard**
  - [ ] Complete `BashGuard::new()` implementation (pattern file resolution, env var check)
  - [ ] Implement `BashGuard::find_bundled_patterns_file()` helper
  - [ ] Implement `BashGuard::disabled()` fallback
  - [ ] Pattern loading from file (`load_patterns()`)
  - [ ] Command checking logic (`check_command()`)
  - [ ] Prompt content checking (`check_prompt()` + `extract_commands_from_prompt()`)
  - [ ] Environment variable override (`PUPPET_MASTER_ALLOW_DESTRUCTIVE`)
  - [ ] Config file integration (read from `FileSafeConfig`)
  - [ ] Project-specific pattern loading (`.puppet-master/destructive-commands.local.txt`)
  - [ ] Error handling (graceful degradation on init failure)

- [ ] **Integrate with BaseRunner**
  - [ ] Add `bash_guard: Arc<BashGuard>`, `file_guard: Arc<FileGuard>`, `security_filter: Arc<SecurityFilter>` fields to `BaseRunner`
  - [ ] Initialize all guards in `BaseRunner::new()` (with pattern file resolution)
  - [ ] Add guard checks in platform runners (e.g., `CursorRunner::execute()`) **after context compilation**:
    - [ ] Compile context files into prompt (`append_prompt_attachments()`)
    - [ ] Check **compiled prompt** for destructive commands (`check_prompt()` on compiled prompt)
    - [ ] Check context files against security filter (`check_file_access()`)
    - [ ] Check if verification gate/interview operation (allow destructive if tagged)
  - [ ] Add guard checks in `BaseRunner::execute_command()` before spawn (after quota/rate limit, before permission audit):
    - [ ] Build command string and check for destructive patterns (`check_command()`)
    - [ ] Extract file paths from request (`extract_file_paths_from_request()`)
    - [ ] Resolve and normalize file paths (handle worktree symlinks)
    - [ ] Check file writes against write scope (`check_file_write()`)
    - [ ] Check file access against security filter (`check_file_access()`)
  - [ ] Implement `is_verification_gate_operation()` helper
  - [ ] Implement `is_interview_operation()` helper
  - [ ] Implement `extract_file_paths_from_request()` helper
  - [ ] Integrate with verification gates (allow destructive during QA if tagged)
  - [ ] Handle guard errors gracefully (return clear error messages, log to event log)

- [ ] **Add configuration**
  - [ ] Add `FileSafeConfig` to config system
  - [ ] Wire to GUI config (optional, can be CLI-only initially)
  - [ ] Document config options

- [ ] **Event logging**
  - [ ] Create `FileSafeEvent` struct
  - [ ] Integrate with existing event logging system (Section 11.5)
  - [ ] Log blocked commands, file access violations, security filter blocks
  - [ ] Include command preview, pattern matched, timestamp, agent context

- [ ] **Testing**
  - [ ] Unit tests for pattern matching (bash guard)
  - [ ] Unit tests for write scope (allowed/blocked files)
  - [ ] Unit tests for security filter (sensitive file patterns)
  - [ ] Unit tests for prompt content extraction
  - [ ] Unit tests for override mechanisms
  - [ ] Integration tests with platform runners
  - [ ] Test all 40+ destructive command patterns
  - [ ] Test verification gate integration (allow destructive during QA)
  - [ ] Test false positive scenarios (documentation, comments)

- [ ] **Documentation**
  - [ ] Add to AGENTS.md FileSafe section:
    - [ ] FileSafe: Command blocklist
    - [ ] FileSafe: Write scope
    - [ ] FileSafe: Security filter
    - [ ] Override mechanisms
    - [ ] Project-specific patterns
  - [ ] Document integration with verification gates
  - [ ] Document prompt content checking behavior
  - [ ] Add to REQUIREMENTS.md
  - [ ] Update GUI widget catalog if new widgets added

- [ ] **Pre-completion verification**
  - [ ] `cargo check` passes
  - [ ] `cargo test` passes
  - [ ] No hardcoded platform data
  - [ ] DRY compliance (tag reusable items)

- [ ] **Context compilation (Part B)**
  - [ ] Create `src/context/` module: `mod.rs`, `compiler.rs`, `role.rs`, `filters.rs`, `skills.rs`
  - [ ] Implement `compile_context(phase_id, role, plan_path, working_directory)` and role-specific compilers (Phase, Task, Subtask, Iteration)
  - [ ] Requirement filtering (phase-mapped only); convention extraction from AGENTS.md; decision extraction from state/progress
  - [ ] Skill bundling: parse plan frontmatter `skills_used`, resolve paths, append to Task/Iteration context; handle missing skills
  - [ ] Delta context: git diff since last phase, code slices, "Changed Files (Delta)" section; config `context.delta_context`
  - [ ] Context cache: `context-index.json` with key (paths + mtimes/hashes); skip compile when valid; invalidate on change; config `context.context_cache`
  - [ ] Structured handoff schemas: define message types and JSON schemas; `HandoffMessage` enum + validation in orchestrator; reference doc in docs/
  - [ ] Compaction-aware re-reads: `.compaction-marker` lifecycle (clear on session start, set on compaction); consult before including plan in context
  - [ ] Add `ContextConfig` to GuiConfig and `puppet-master.yaml`; wire to orchestrator (Option B); call compiler in platform runner before building prompt; graceful degradation on failure
  - [ ] Unit and integration tests for compiler, cache, handoff parsing; document token savings and config in AGENTS.md

---

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

**Plans/newfeatures.md §9** (Hook system) defines a **user/plugin extension point**: events (e.g. PreToolUse), scripts that return continue/block/modify. Dangerous-command blocking is part of **FileSafe**: the Command blocklist and PreToolUse integration use the same blocklist and extension point. FileSafe is the **core pre-execution guard** in the runner; hooks can call into FileSafe (e.g. PreToolUse invokes FileSafe blocklist checks) or provide optional user-defined rules. Use one blocklist and one integration point; see newfeatures §17.4 “FileSafe first.”

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
4. **Optional: per-context override:** If product requirements later allow "relax FileSafe for this chat only" (e.g. power users), that must be an explicit, clearly labeled setting—not the default when YOLO is on.

**Summary:** YOLO mode and FileSafe are complementary: YOLO removes approval prompts; FileSafe enforces hard limits (destructive commands, write scope, sensitive files). FileSafe settings must be configurable in the GUI and easy to turn on or off, and when Assistant runs in YOLO mode, FileSafe should be the main line of defense.

---

## 11. Additional FileSafe Features

### 11.1 FileSafe: Write scope (CRITICAL)

**Problem:** Agents may write to files not declared in the active plan, causing scope creep and conflicts.

**Solution:** Implement write-scope enforcement that blocks writes to files not explicitly listed in the current task/subtask plan. (Internal module name remains `FileGuard`; product and GUI use **Write scope** only.)

```rust
// DRY:DATA:FileGuard — FileSafe write scope: blocks writes outside active plan
pub struct FileGuard {
    allowed_files: HashSet<PathBuf>,
    enabled: bool,
}

impl FileGuard {
    // DRY:FN:check_file_write — Check if file write is allowed
    /// Check if a file write is allowed based on plan metadata
    ///
    /// # Arguments
    ///
    /// * `file_path` - Normalized absolute path to the file
    /// * `working_directory` - Working directory context (may be worktree)
    ///
    /// # Behavior
    ///
    /// - If guard disabled: always allow
    /// - If file_path matches any allowed file pattern: allow
    /// - If file_path is in allowed_files set: allow
    /// - If file_path is under allowed directory: allow (if directory-level permissions enabled)
    /// - Otherwise: block
    pub fn check_file_write(&self, file_path: &Path, working_directory: &Path) -> Result<(), GuardError> {
        if !self.enabled {
            return Ok(());
        }
        
        // Normalize paths for comparison
        let file_path_normalized = file_path.canonicalize()
            .unwrap_or_else(|_| file_path.to_path_buf());
        
        // Check exact match
        if self.allowed_files.contains(&file_path_normalized) {
            return Ok(());
        }
        
        // Check relative path match (file_path relative to working_directory)
        if let Ok(relative) = file_path_normalized.strip_prefix(working_directory) {
            let relative_path = relative.to_path_buf();
            if self.allowed_files.contains(&relative_path) {
                return Ok(());
            }
        }
        
        // Check directory-level permissions (if enabled)
        // If any parent directory is in allowed_files, allow
        let mut current = file_path_normalized.parent();
        while let Some(dir) = current {
            if self.allowed_files.contains(dir) {
                return Ok(());
            }
            current = dir.parent();
        }
        
        // Check wildcard patterns (if supported)
        // TODO: Implement wildcard pattern matching if needed
        
        Err(GuardError::FileNotInPlan {
            file: file_path_normalized,
        })
    }
    
    // DRY:FN:load_allowed_files_from_request — Load allowed files from ExecutionRequest metadata
    /// Load allowed files list from ExecutionRequest
    ///
    /// Checks:
    /// 1. `request.env_vars.get("PUPPET_MASTER_ALLOWED_FILES")` - JSON array of paths
    /// 2. `request.context_files` - Context files are implicitly allowed
    /// 3. Plan metadata file (if available in context)
    pub fn load_allowed_files_from_request(request: &ExecutionRequest) -> Result<HashSet<PathBuf>> {
        let mut allowed = HashSet::new();
        
        // 1. Check env var for explicit allowed files list
        if let Some(files_json) = request.env_vars.get("PUPPET_MASTER_ALLOWED_FILES") {
            if let Ok(files) = serde_json::from_str::<Vec<String>>(files_json) {
                for file_str in files {
                    allowed.insert(PathBuf::from(file_str));
                }
            }
        }
        
        // 2. Add context files (implicitly allowed)
        for context_file in &request.context_files {
            allowed.insert(context_file.clone());
        }
        
        // 3. Add working directory (agents can write in their working directory)
        allowed.insert(request.working_directory.clone());
        
        Ok(allowed)
    }
}
```

**Per-request update:** The allowed set is **not** static. Before each `execute_command()`, the runner must set the current request's allowed files on the guard so write-scope reflects the active plan. Options: (A) `FileGuard` holds `Arc<RwLock<HashSet<PathBuf>>>` and exposes `set_allowed_files(&self, files: HashSet<PathBuf>)`, called from `BaseRunner::execute_command()` using `FileGuard::load_allowed_files_from_request(request)`; or (B) `check_file_write` takes an optional `allowed: &HashSet<PathBuf>` override and the runner passes the result of `load_allowed_files_from_request(request)` each time. Option A keeps the guard self-contained; Option B avoids interior mutability. Document the chosen contract in the implementation.

**Integration:** Load allowed files from task/subtask plan metadata (or from `ExecutionRequest` env_vars/context_files as in `load_allowed_files_from_request`). Write-scope checks happen in `BaseRunner::execute_command()` before spawn, alongside the command blocklist.

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

- `\.env` (and common variants: `.env.local`, `.env.*`) — pattern: `\.env(\..*)?$` or `\.env`
- `.*secret.*`, `.*key.*`, `.*credential.*` (path contains segment)
- `\.(pem|key|p12|pfx)$` (key/cert files)
- `id_rsa`, `id_ed25519`, `\.pub$` (SSH keys)
- `config/secrets\.`, `secrets/` (secrets dir or config secrets files)

**Implementation:** In `security_filter.rs`, define `fn default_sensitive_patterns() -> Vec<Regex>` that returns the compiled list; allow optional project override file (e.g. `.puppet-master/security-filter.local.txt`) for additive patterns only. Document in AGENTS.md.

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
| **Codex** | TBD | May use `--add-dir` flags instead | N/A |
| **Claude** | TBD | May use `--append-system-prompt-file` | N/A |

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
- Respect verification gate and interview operation tags

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

**Verification gate detection:** Check if request is tagged as verification gate operation (e.g., `request.tags.contains("verification")`).

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
- Test with all 5 platforms

### 12.5 Write-scope plan integration

**Issue:** Plans may not always specify exact file paths, making write-scope enforcement too restrictive.

**Mitigation:**
- Support wildcard patterns in plan file lists
- Allow directory-level permissions
- Provide clear error messages when writes are blocked
- Allow override for exploratory phases

### 12.6 Implementation-Ready Clarifications

Resolve these before or during implementation; cross-reference from §15.12 Integration Checklist.

**ExecutionRequest — tags vs env_vars:** Use one convention and document it. Recommended: keep **env_vars** as canonical. Document exact keys: `PUPPET_MASTER_OPERATION_TYPE` (values e.g. `verification_gate`, `interview_planning`), `PUPPET_MASTER_ALLOWED_FILES` (JSON array of path strings). If `tags: Vec<String>` is added later, define field name and when orchestrator sets tags vs env vars.

**get_allowed_files_for_current_subtask:** Define owner module (e.g. `core/orchestrator.rs` or `state/`), signature (e.g. `fn get_allowed_files_for_current_subtask(tier_state: &TierState, plan_path: Option<&Path>) -> Option<Vec<PathBuf>>`), and data source (prd.json subtask payload, plan file section, or both). Orchestrator calls it when building each `ExecutionRequest` and passes result via `PUPPET_MASTER_ALLOWED_FILES` or `request.allowed_files`.

**BaseRunner::new() and BashGuard approved_commands:** Specify that `BaseRunner::new(..., filesafe_config: &FileSafeConfig)` (or equivalent run config) receives FileSafe config from orchestrator; pass `filesafe_config.approved_commands` into `BashGuard::new(pattern_path, approved_commands)` (or builder). Document full `BashGuard::new(...)` signature including approved list and enabled/allow_destructive from config.

**SecurityFilter allow_during_interview:** `SecurityFilter` struct must hold `allow_during_interview: bool` set at construction from `SecurityFilterConfig`. Expose via `SecurityFilter::from_config(config)` or builder so runner can read it without holding config separately.

**FileGuard strict_mode:** When `strict_mode == true`: on violation return `Err(...)` and block. When `strict_mode == false` (warn-only): on violation log warning and emit FileSafeEvent, then return `Ok(())` and do not block. Warn-only is “log and allow,” not in-chat approval (that is a separate Assistant flow).

**Edge cases:** (1) **Empty allowed_files:** Document policy: e.g. “allow nothing” (block all writes) or “allow working_directory only”; prefer one explicit choice. (2) **Pattern file missing:** Guard disables (empty patterns), log warning, do not fail startup; optional Doctor check. (3) **Approved command substring:** `commands_match` uses prefix; document that approved entries should avoid short substrings (e.g. prefer `php artisan migrate` over `migrate`); optional GUI validation. (4) **Multi-line/piped in prompt:** Document whether each line is checked independently or continued/piped lines are concatenated; add tests for multi-line and piped destructive commands.

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
  - **Command blocklist** — "Block destructive commands" (on/off). When off, destructive CLI commands are not blocked.
  - **Write scope** — "Restrict writes to plan" (on/off). When off, writes are not restricted to plan-declared files.
  - **Security filter** — "Block sensitive files" (on/off). When off, access to `.env`/credentials is not blocked.
  Each feature can be toggled independently; optional sub-options (e.g. strict mode for Write scope, allow-during-interview for Security filter) stay under that feature’s subsection.
- **Override:** "Allow destructive commands" (with prominent warning) for Command blocklist.
- **Optional:** Pattern path override, "Allow sensitive files during interview" for Security filter.
- **Optional:** Pattern management (view/edit), event log viewer (browse blocked commands).

**Approved-commands list (Assistant chat):**
- When a command is blocked by the Command blocklist in Assistant chat, the user can **approve this run** and optionally **add to approved list**. Approved commands are stored in settings and are then allowed by the command blocklist (whitelist overrides blocklist for matching commands).
- In Config (FileSafe section), the user can **view** the list of approved commands, **remove** entries, and (optionally) **add** entries manually. List is persisted (e.g. in `puppet-master.yaml` under `filesafe.approvedCommands` or a dedicated file).
- Implementation: Command blocklist checks the approved list before blocking; exact match or normalized match (e.g. strip extra whitespace) counts as approved. UX: In chat, show "Blocked: &lt;command&gt;" with actions "Approve once" and "Approve and add to list"; in settings, show scrollable list with remove button per row.

**Widget reuse:** Use existing widgets from `src/widgets/` per DRY Method.

---

## 14. Context Compilation & Token Efficiency

### 14.1 Role-Specific Context Compiler

**Problem:** Every agent currently receives the same context files regardless of tier or role. Phase planning loads full REQUIREMENTS; task execution loads STATE and full plans; verification loads full protocol docs. That wastes tokens and dilutes focus.

**Solution:** A **context compiler** produces one compiled context file per role (Phase, Task, Subtask, Iteration). Each file contains only what that role needs. Filtering is deterministic (pattern-based on known file formats), not LLM-based — zero token cost and reliable.

**Module:** `src/context/` (or `src/prompt/context_compiler.rs`).

**Output files:** `.puppet-master/phases/{phase_id}/.context-{role}.md`.

**Compiler contract:**

```rust
// DRY:FN:compile_context — Compile role-specific context for agent
pub fn compile_context(
    phase_id: &str,
    role: AgentRole,
    plan_path: Option<&Path>,
    working_directory: &Path,
) -> Result<PathBuf>;
```

**Role → content mapping:**

| Role     | Contents |
|----------|----------|
| **Phase**  | Phase goal (from roadmap), success criteria, **filtered requirements** (only phase-mapped), active decisions (from state/progress). |
| **Task**   | Phase goal, project conventions (from AGENTS.md), **bundled skills** if plan references them. |
| **Subtask**| Phase goal, conventions, current subtask scope. |
| **Iteration** | Phase goal, conventions, iteration scope; same as Task when no subtask split. |

**Requirement filtering:** Parse REQUIREMENTS (or prd.json) and include only items whose IDs are listed in the current phase's scope. Use grep/sed or structured parse on a known format; no LLM.

**When to run:** Before spawning the agent for that role (e.g. in platform runner or orchestrator): call `compile_context(phase_id, role, plan_path, cwd)`, then add the returned path to `ExecutionRequest.context_files` (or equivalent) so the agent receives the compiled file instead of (or in addition to) raw project files, per config.

**Config:** `context.compiler_enabled` (default true). If false or compilation fails, fall back to existing behavior (direct file reads).

**Example Phase context output (snippet):**

```markdown
## Phase PH-002 Context (Compiled)

### Goal
Implement role-specific context compiler and wire into platform runners.

### Success Criteria
- compile_context() produces .context-{role}.md under .puppet-master/phases/{id}/
- Only phase-mapped requirements appear in Phase context

### Requirements (REQ-06, REQ-07, REQ-08, REQ-09)
- [ ] **REQ-06**: compile_context script extracts phase-relevant requirements...
- [ ] **REQ-07**: Compiler produces .context-phase.md with phase goal...

### Active Decisions
- Deterministic context compilation (pattern-based, no LLM)
- Marker-file approach for compaction detection
```

**Token impact:** Replaces multiple full-file reads with one short file per spawn. Typical savings: ~1.4k–2.8k tokens per Phase spawn; ~0.5k–1.6k per Task/Iteration (e.g. skipping STATE, filtering requirements). Scale-dependent: larger projects see larger absolute savings.

---

### 14.2 Delta Context

**Purpose:** When iterating on existing code, agents benefit more from *what just changed* than from the full codebase. Delta context adds a "Changed Files (Delta)" section to the compiled context.

**Behavior:**

- **Input:** Git diff since last phase (or since last commit / tag — configurable). Optionally restrict to certain dirs (e.g. `src/`).
- **Content:** For each changed file: path, optional short code slices (e.g. first/last N lines or hunks), and a brief summary (e.g. "modified", "added"). Total size capped (e.g. ~225–375 tokens per compiled context).
- **Output:** Appended to the compiled `.context-{role}.md` when `context.delta_context` is true (e.g. only for Task/Iteration roles if desired).

**Implementation sketch:**

- Run `git diff` (or `git log -p` with limits) from a configured ref (e.g. `HEAD~1`, or last phase tag).
- Parse diff; for each file, optionally read file and take slices (e.g. 20 lines before/after changed regions).
- Write a "## Changed Files (Delta)" section with path, summary, and slices; enforce token/line limit.

**Config:** `context.delta_context` (default false). Enable for iterative development.

---

### 14.3 Context Cache

**Purpose:** Avoid recomputing compiled context when project files have not changed (e.g. multiple spawns in the same phase, or re-runs).

**Behavior:**

- **Cache key:** Directory or file set that affects context (e.g. `.puppet-master/`, `REQUIREMENTS.md`, `prd.json`, `AGENTS.md`, phase dirs). Represent as a list of paths + mtimes or content hashes.
- **Cache store:** Single index file, e.g. `.puppet-master/context-index.json`, containing: phase_id, role, list of (path, mtime_or_hash), and path to last compiled output (or hash of its content).
- **Lookup:** Before calling the compiler, compute current key; if it matches cache and cached output path exists and is readable, skip compilation and return cached path.
- **Invalidation:** On any change to the key (e.g. file under `.puppet-master/` or requirements/prd/AGENTS), delete or invalidate the cache entry for that phase/role and recompute on next request.

**Config:** `context.context_cache` (default true for large-repo use cases). When false, always run the compiler.

---

### 14.4 Structured Handoff Schemas

**Purpose:** Make inter-agent communication parseable and type-safe so orchestrator and downstream agents do not rely on free-form markdown.

**Behavior:**

- **Schema registry:** Define a small set of message types, e.g. `phase_progress`, `task_blocker`, `subtask_result`, `qa_result`, `iteration_complete`. Each has a fixed JSON schema (required fields, types).
- **Wire format:** Agents (or the runner wrapping them) send handoff payloads as JSON (e.g. in a well-known field of the execution result or in a side-channel file). Example:

```json
{
  "type": "task_progress",
  "phase_id": "PH-002",
  "task_id": "TK-002-01",
  "status": "complete",
  "files_changed": ["src/context/compiler.rs"],
  "commit": "abc123"
}
```

- **Validation:** Orchestrator (or a small Rust module) parses and validates against the schema; on failure, log and optionally retry or escalate. Unknown `type` can be rejected or treated as legacy plain text per policy.
- **Docs:** Single reference doc (e.g. in `docs/` or `references/`) lists all types and their schemas; agents are instructed to emit one of these shapes.

**Implementation:** Add `HandoffMessage` enum in Rust with serde; implement `TryFrom` from JSON string; use in orchestrator when processing agent output.

---

### 14.5 Compaction-Aware Re-Reads

**Purpose:** Avoid re-reading the full plan (or other large context) before every task when the plan has not been compacted or changed.

**Behavior:**

- **Marker file:** A deterministic marker file (e.g. `.puppet-master/.compaction-marker`) with a timestamp. Written only when a "compaction" or context-reset event occurs (e.g. session compaction, or explicit "context was trimmed" signal from the platform).
- **Protocol:** Before spawning a task, check for the marker. If absent, assume plan/context is still valid from a previous load — skip re-read. If present, re-read plan (and any other context that might have been trimmed), then clear or update the marker so the next task does not re-read unnecessarily.
- **Conservative rule:** On any doubt (e.g. marker present, or read failure), do the re-read. Prefer redundant reads over missing updates.

**Saving:** Typically 1–2 full plan re-reads per phase (~500–1,600 tokens per plan depending on plan size).

**Integration:** Orchestrator or platform runner consults the marker when building `ExecutionRequest.context_files` (or when deciding whether to include plan path again). Lifecycle: clear marker on session start; set marker when compaction is detected or signaled.

---

### 14.6 Skill Bundling

**Purpose:** When a plan references skills (e.g. in frontmatter like `skills_used: [bash-pro, rust-clippy]`), load those skill files once and embed them in the compiled context for Task/Iteration roles instead of loading the same files per task.

**Behavior:**

- **Discovery:** When compiling context for Task or Iteration, if a plan path is provided, parse plan frontmatter for a list of skill names (e.g. `skills_used`).
- **Resolution:** Resolve each name to a file path (e.g. `~/.cursor/skills/{name}/SKILL.md` or project-local `.cursor/skills/{name}/SKILL.md`). If missing, skip that skill and log.
- **Bundling:** Read each skill file (subject to size limit if desired), then append a "## Skills Reference" section to the compiled context with the contents. One concatenation per phase, not per task.
- **Saving:** `(num_tasks - 1) * skill_content_size` per plan (e.g. one skill × 3 tasks → ~2× content size saved).

**Config:** `context.skill_bundling` (default true).

---

### 14.7 Token Savings and Context Configuration

**Projected savings (illustrative):**

| Scale   | Phases | Requirements | Coordination overhead (no compiler) | With compiler | Reduction |
|---------|--------|--------------|-------------------------------------|----------------|-----------|
| Small   | 3      | 10           | ~65k tokens                          | ~32k           | ~51%      |
| Medium  | 5      | 20           | ~150k tokens                         | ~60k           | ~60%      |
| Large   | 8      | 30           | ~300k tokens                         | ~125k          | ~58%      |

**Unified context config (add to `GuiConfig` / `puppet-master.yaml`):**

```yaml
context:
  compiler_enabled: true
  delta_context: false
  context_cache: true
  skill_bundling: true
```

```rust
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ContextConfig {
    #[serde(default = "default_true")]
    pub compiler_enabled: bool,
    #[serde(default)]
    pub delta_context: bool,
    #[serde(default = "default_true")]
    pub context_cache: bool,
    #[serde(default = "default_true")]
    pub skill_bundling: bool,
}
```

**AgentRole enum (for compiler):**

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AgentRole {
    Phase,
    Task,
    Subtask,
    Iteration,
}

impl AgentRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Phase => "phase",
            Self::Task => "task",
            Self::Subtask => "subtask",
            Self::Iteration => "iteration",
        }
    }
}
```

**Integration with platform runner:** Before building the prompt, if `context.compiler_enabled`, call `context_compiler::compile_context(phase_id, role, plan_path, working_directory)`. On success, add the returned path to the request's context files (or replace a subset). On failure, log and proceed with existing behavior (no compiled context).

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
    // Note: Prompt content is checked at platform runner level (after context compilation). Here we check only the final command string and file paths.
    // Build command string
    let full_command = format!("{} {}", self.command, args.join(" "));
    
    // Check command string (blocklist + approved whitelist)
    if let Err(e) = self.bash_guard.check_command(&full_command) {
        // Check if verification gate operation (allow destructive during QA)
        if self.is_verification_gate_operation(&request) {
            warn!("Destructive command allowed during verification gate: {}", e);
        } else {
            return Err(anyhow!("Destructive command blocked: {}", e));
        }
    }
    
    // Check file writes (if write scope enabled)
    // Extract file paths from prompt or context files
    for file_path in self.extract_file_paths_from_request(&request)? {
        // Resolve path relative to working directory
        let resolved_path = if file_path.is_absolute() {
            file_path
        } else {
            request.working_directory.join(&file_path)
        };
        
        // Normalize path (handle worktree symlinks, .., etc.)
        let normalized_path = resolved_path.canonicalize()
            .unwrap_or_else(|_| resolved_path);
        
        if let Err(e) = self.file_guard.check_file_write(&normalized_path, &request.working_directory) {
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

**Key Integration Details:**
- Guards are initialized in `BaseRunner::new()` alongside other components
- All guards use `Arc<>` for thread-safe sharing
- Guard errors are logged via existing logging infrastructure
- Guard violations are logged to event log (if available) or filesafe-events.jsonl

### 15.2 Integration with Orchestrator

**Current Architecture:**
- Orchestrator calls `BaseRunner::execute_command()` for each iteration
- Verification gates run AFTER iteration completion
- Gates check evidence, tests, acceptance criteria

**Integration Points:**

1. **Verification Gate Detection:**
   - Need to tag `ExecutionRequest` when it's a verification gate operation
   - Add `tags: Vec<String>` field to `ExecutionRequest` (or use `env_vars` for metadata)
   - Orchestrator sets tag when calling runner for gate verification

```rust
// In orchestrator.rs, when running verification gate:
let mut request = ExecutionRequest::new(...);
request = request.with_env("PUPPET_MASTER_OPERATION_TYPE", "verification_gate");
// Or add tags field:
// request.tags.push("verification_gate".to_string());
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
            .map(|v| v == "verification_gate" || v.starts_with("verification_"))
            .unwrap_or(false)
        // Future: check tags field if added to ExecutionRequest
        // || request.tags.contains(&"verification_gate".to_string())
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
            .map(|v| v.starts_with("interview_"))
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
   - Add `allowed_files: Option<Vec<PathBuf>>` to `ExecutionRequest`

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
    pub fn check_file_write(&self, file_path: &Path, working_dir: &Path) -> Result<(), GuardError> {
        // Resolve path relative to working directory
        let resolved_path = if file_path.is_absolute() {
            file_path.to_path_buf()
        } else {
            working_dir.join(file_path)
        };
        
        // Normalize path (handle worktree symlinks)
        let normalized = resolved_path.canonicalize()
            .unwrap_or_else(|_| resolved_path);
        
        // Check against allowed files (also normalized)
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
  - **"Block destructive commands"** (on/off) — Command blocklist; when off, destructive CLI commands are not blocked.
  - **"Restrict writes to plan"** (on/off) — Write scope; when off, writes are not restricted to plan-declared files.
  - **"Block sensitive files"** (on/off) — Security filter; when off, access to `.env`/credentials is not blocked.
- **Override:** "Allow destructive commands" toggle with **prominent warning styling** (e.g. danger/warning variant per widget catalog).
- **Approved commands:** Scrollable list; per-row **Remove** button; optional **"Add command manually"**; persisted in `filesafe.approvedCommands` (e.g. `puppet-master.yaml`).
- **Optional:** Custom pattern path, "Allow sensitive files during interview" (Security filter), pattern management (view/edit), **Event log viewer** (browse recent blocked commands; link to FileSafe event log).
- **Widget reuse:** Use existing widgets from `src/widgets/` per DRY Method (e.g. `toggler`, `help_tooltip(tooltip_key, tooltip_variant, theme, scaled)`, `styled_button`). See `docs/gui-widget-catalog.md`. **Tooltip keys** (for localization and help system): `filesafe.bash_guard`, `filesafe.file_guard`, `filesafe.security_filter` (three toggles); optionally `filesafe.override`, `filesafe.approved_commands` for override toggle and approved list. Document in widget catalog or central tooltip doc.

**Config struct (unchanged):** `GuiConfig.filesafe: FileSafeConfig` with `BashGuardConfig`, `FileGuardConfig`, `SecurityFilterConfig`, `approved_commands: Vec<String>` as in §2.4 and §5.2.

**2. Assistant Chat and YOLO (FinalGUISpec §7.16)**

- **YOLO + FileSafe:** When YOLO is enabled and FileSafe guards are active, show a **persistent warning chip** in the input toolbar: **"[!] YOLO active — FileSafe guards still apply."**
- **In-chat approval when blocked:** When FileSafe blocks a command during YOLO (or when a blocked command is shown in chat), display an **inline card** in the chat stream:
  - **Style:** Orange left border; command text in monospace; guard name that triggered (e.g. "Command blocklist").
  - **Actions:** **"Approve once"** (runs the command this time only) and **"Approve & add to list"** (adds to `filesafe.approvedCommands` in Settings > Advanced).
  - **Timeout:** Card auto-dismisses after **60 seconds** with message "Timed out — command skipped."
  - **Logging:** Blocked commands are logged to the FileSafe event log; accessible from Settings > Advanced (event log viewer or link).
- **Terminal (FinalGUISpec §7.16):** When a command is blocked by FileSafe, terminal output uses **RED** with prefix **"[BLOCKED] Blocked by FileSafe"**.

**3. Dashboard / status (FinalGUISpec §7.2)**

- **FileSafe status (optional):** Compact card showing guard count (e.g. "FileSafe: 3/3 guards active") with link to **Settings > Advanced > FileSafe**.

**4. Message enum and update flow**

- Add FileSafe-related messages (e.g. `FileSafeBashGuardToggled(bool)`, `FileSafeAllowDestructiveToggled(bool)`, `FileSafeFileGuardToggled(bool)`, `FileSafeFileGuardStrictToggled(bool)`, `FileSafeSecurityFilterToggled(bool)`, `FileSafeAllowSensitiveDuringInterviewToggled(bool)`, `FileSafeRemoveApprovedCommand(usize)`, `FileSafeAddApprovedCommandClicked`, `FileSafeAddApprovedCommand(String)`, `FileSafeViewEventLog`).
- Config save: FileSafe changes persist with the rest of Advanced tab (Save Changes per tab or global).

**5. Config Wiring (Critical):**
- FileSafe config must be wired to `PuppetMasterConfig` (orchestrator config).
- Follow Option B pattern from WorktreeGitImprovement plan: build run config from GUI config at orchestrator start.
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
- State is managed via `prd.json`, `progress.txt`, `AGENTS.md`
- Orchestrator tracks tier state, iterations, gate results
- State persists across sessions

**Integration Points:**

1. **FileSafe event state:**
   - FileSafe events are logged to `.puppet-master/logs/filesafe-events.jsonl`
   - Should be included in state snapshots for debugging
   - Consider adding to `prd.json` metadata or separate FileSafe state file

2. **Guard Configuration State:**
   - Guard config is part of `GuiConfig` → `puppet-master.yaml`
   - Must persist across sessions
   - Default values should be safe (guards enabled by default)

3. **Plan metadata for write scope:**
   - Write scope needs current plan's allowed files list
   - Plan metadata should be accessible to `BaseRunner`
   - Consider adding to `ExecutionRequest` or passing via context

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
**Fix:** Add `tags: Vec<String>` or use `env_vars` for operation metadata

#### Gap 2: Plan Metadata Access
**Issue:** Write scope needs current plan's allowed files list, but plans aren't accessible to `BaseRunner`
**Impact:** Write scope can't enforce plan boundaries
**Fix:** Pass plan metadata via `ExecutionRequest` or context files

#### Gap 3: Config Wiring
**Issue:** FileSafe config in GUI may not be wired to orchestrator config (same issue as WorktreeGitImprovement)
**Impact:** FileSafe settings from GUI won't be applied at runtime
**Fix:** Implement Option B config wiring (build run config from GUI at orchestrator start)

#### Gap 4: Worktree Path Resolution
**Issue:** Write scope needs to resolve relative paths correctly in worktree context
**Impact:** Write scope may block legitimate operations or allow blocked operations
**Fix:** Normalize paths relative to `working_directory`, handle worktree symlinks

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
- Test with all 5 platforms
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
**Allow different guard strictness per tier:**
```rust
pub struct TierFileSafeConfig {
    pub phase: FileSafeConfig,
    pub task: FileSafeConfig,
    pub subtask: FileSafeConfig,
    pub iteration: FileSafeConfig,
}
```
- Phase/Task tiers: stricter guards (planning phase)
- Subtask/Iteration tiers: more permissive (execution phase)

### 15.12 Integration Checklist

Resolve **§12.6 Implementation-Ready Clarifications** before or during implementation (ExecutionRequest convention, get_allowed_files_for_current_subtask, BaseRunner/BashGuard config, SecurityFilter/FileGuard fields, edge cases).

- [ ] **ExecutionRequest Updates**
  - [ ] Add `tags: Vec<String>` field OR use `env_vars` for operation metadata
  - [ ] Add `allowed_files: Option<Vec<PathBuf>>` for write scope
  - [ ] Update all `ExecutionRequest::new()` call sites

- [ ] **BaseRunner Integration**
  - [ ] Add guard fields to `BaseRunner` struct
  - [ ] Initialize guards in `BaseRunner::new()`
  - [ ] Add guard checks in `execute_command()` before spawn
  - [ ] Add `is_verification_gate_operation()` helper
  - [ ] Add `is_interview_operation()` helper
  - [ ] Add `extract_file_paths_from_request()` helper

- [ ] **Orchestrator Integration**
  - [ ] Tag verification gate operations in `ExecutionRequest`
  - [ ] Pass plan metadata (allowed files) to `ExecutionRequest`
  - [ ] Integrate FileSafe violations into gate reports
  - [ ] Update gate execution to handle guard overrides

- [ ] **Interview Integration**
  - [ ] Tag interview operations in `ExecutionRequest`
  - [ ] Add FileSafe config to `InterviewGuiConfig`
  - [ ] Relax security filter during interview phases (if configured)

- [ ] **Worktree Integration**
  - [ ] Update write scope to handle worktree paths correctly
  - [ ] Normalize paths relative to `working_directory`
  - [ ] Handle worktree symlinks in path resolution

- [ ] **GUI Integration**
  - [ ] Add `FileSafeConfig` to `GuiConfig`
  - [ ] Add FileSafe tab to Config view (or add to Advanced tab)
  - [ ] Add FileSafe-related messages to `Message` enum
  - [ ] Wire FileSafe config to orchestrator config (Option B)
  - [ ] Add FileSafe event log viewer (optional)

- [ ] **Config Wiring**
  - [ ] Wire `GuiConfig::filesafe` to `PuppetMasterConfig` (orchestrator config)
  - [ ] Ensure FileSafe settings available to `BaseRunner` initialization
  - [ ] Test config persistence across sessions

- [ ] **Cleanup Integration**
  - [ ] Add security filter patterns to cleanup allowlist
  - [ ] Coordinate write-scope allowed files with cleanup allowlist
  - [ ] Ensure cleanup never deletes sensitive files

- [ ] **State Management**
  - [ ] Include FileSafe events in state snapshots
  - [ ] Persist guard configuration in config file
  - [ ] Add FileSafe state to `prd.json` metadata (optional)

- [ ] **Testing Integration**
  - [ ] Test guards with verification gate operations
  - [ ] Test guards with interview operations
  - [ ] Test guards with worktree execution
  - [ ] Test guards with cleanup operations
  - [ ] Test config wiring end-to-end

---

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

**Phase 1 — Core guards (no GUI, no Assistant)**  
1. Create `src/filesafe/` module (mod, bash_guard, destructive_patterns, file_guard, security_filter).  
2. Implement pattern loading (§2.3), bundled + project-local resolution (§2.2).  
3. Implement `BashGuard` (new, disabled, check_command, **commands_match** §2.2, approved_commands from config).  
4. Implement **check_prompt** and **extract_commands_from_prompt** (§11.3).  
5. Implement `FileGuard` (allowed set, **per-request update** §11.1, check_file_write).  
6. Implement `SecurityFilter` (**default_sensitive_patterns** §11.2, check_file_access).  
7. Add `FileSafeConfig` to `GuiConfig` and YAML (§2.4, §5.2); config load/save only (no UI yet).  
8. Integrate into **BaseRunner**: add guard fields, init in `new()` (with config from orchestrator when wired), in **execute_command()** call check_command (after building full command string), then **update file_guard allowed set** from request (§11.1), then check_file_write and check_file_access for extracted file paths.  
9. **ExecutionRequest:** ensure allowed files and operation tags can be passed (env_vars `PUPPET_MASTER_ALLOWED_FILES`, `PUPPET_MASTER_OPERATION_TYPE` or future `tags`).  
10. Implement **extract_file_paths_from_request** (§15.2), **is_verification_gate_operation**, **is_interview_operation** (§15.2).  
11. In **platform runners** (e.g. Cursor): after **append_prompt_attachments**, call **check_prompt** on compiled prompt and **security_filter** on context files; respect verification gate and interview tags.  
12. Event logging: **FileSafeEvent** struct (§6), write to `filesafe-events.jsonl` (or seglog when available).  
13. Pattern file: create `config/destructive-commands.txt` (§4); verify regexes.  
14. Unit tests: pattern match, commands_match, check_prompt extraction, FileGuard allowed/blocked, SecurityFilter, disabled/override behavior.

**Phase 2 — Config wiring and GUI**  
15. Wire **GuiConfig::filesafe** → **PuppetMasterConfig::filesafe** at orchestrator start (Option B, WorktreeGitImprovement).  
16. Pass FileSafe config (and approved_commands) into BaseRunner construction.  
17. **Advanced tab:** Add **FileSafe Guards** collapsible card (§15.5, FinalGUISpec §7.4): three toggles, override with warning, approved commands list (scrollable, remove, optional add), optional event log link. Use existing widgets and help_tooltip keys.  
18. Message enum and update handlers for all FileSafe toggles and list actions.  
19. Persist approved_commands; ensure runtime blocklist checks whitelist from config.

**Phase 3 — Assistant Chat and YOLO**  
20. When YOLO is on and FileSafe enabled: show **warning chip** "YOLO active — FileSafe guards still apply" (§15.5, FinalGUISpec §7.16).  
21. **In-chat approval UI:** On block, show inline card (orange border, command in mono, guard name, "Approve once" / "Approve & add to list"), 60s timeout, log to event log.  
22. Terminal: on block, output RED with "[BLOCKED] Blocked by FileSafe".  
23. Optional: Dashboard FileSafe status card with link to Settings > Advanced.

**Phase 4 — Context compilation (Part B)**  
24. Implement context compiler (§14), delta context, cache, handoff schemas, compaction marker, skill bundling; wire to platform runner and config. (Can be a separate implementation plan from Part A.)

**Risks and mitigations:**  
- **Gap — plan metadata:** Orchestrator must set allowed files on each ExecutionRequest for write scope; implement **get_allowed_files_for_current_subtask** and pass via env or request field (§15.9 Gap 2).  
- **Gap — worktree paths:** Normalize paths relative to `working_directory` and handle symlinks (§15.9 Gap 4).  
- **False positives:** Log all blocks; allow override and approved list; tune patterns from feedback (§12.2).

---

**End of Implementation Plan**
