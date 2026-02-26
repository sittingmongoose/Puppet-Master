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

