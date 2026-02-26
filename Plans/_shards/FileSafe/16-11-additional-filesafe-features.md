## 11. Additional FileSafe Features

### 11.1 FileSafe: Write scope (CRITICAL)

**Problem:** Agents may write to files not declared in the active plan, causing scope creep and conflicts.

**Solution:** Implement write-scope enforcement that blocks writes to files not explicitly listed in the current task/subtask plan. (Internal module name remains `FileGuard`; product and GUI use **Write scope** only.)

```rust
// DRY:DATA:FileGuard — FileSafe write scope: blocks writes outside active plan
pub struct FileGuard {
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
    pub fn check_file_write(&self, file_path: &Path, working_directory: &Path, allowed_files: &HashSet<PathBuf>) -> Result<(), GuardError> {
        if !self.enabled {
            return Ok(());
        }
        
        // Normalize paths for comparison
        let file_path_normalized = file_path.canonicalize()
            .unwrap_or_else(|_| file_path.to_path_buf());
        
        // Check exact match
        if allowed_files.contains(&file_path_normalized) {
            return Ok(());
        }
        
        // Check relative path match (file_path relative to working_directory)
        if let Ok(relative) = file_path_normalized.strip_prefix(working_directory) {
            let relative_path = relative.to_path_buf();
            if allowed_files.contains(&relative_path) {
                return Ok(());
            }
        }
        
        // Check directory-level permissions (if enabled)
        // If any parent directory is in allowed_files, allow
        let mut current = file_path_normalized.parent();
        while let Some(dir) = current {
            if allowed_files.contains(dir) {
                return Ok(());
            }
            current = dir.parent();
        }
        
        // AutoDecision: MVP does not support wildcard patterns for write scope; allow exact paths and explicit directories only.
        
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
        
        // AutoDecision: do not implicitly allow `working_directory` or project root; write scope is plan-driven and fails closed.
         
        Ok(allowed)
    }
}
```

**Per-request update:** AutoDecision: use Option B (no interior mutability). The runner computes `allowed_files` per request via `FileGuard::load_allowed_files_from_request(request)` and passes `&allowed_files` into `check_file_write(...)` for each check; `FileGuard` does not store request-scoped allowlists.

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

- `\.env` (and common variants: `.env.local`, `.env.*`) -- pattern: `\.env(\..*)?$` or `\.env`
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

