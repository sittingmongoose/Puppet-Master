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

