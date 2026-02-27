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
    let allowed_files = FileGuard::load_allowed_files_from_request(request)?;
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
        if let Err(e) = self.file_guard.check_file_write(&normalized_path, &request.working_directory, &allowed_files) {
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

