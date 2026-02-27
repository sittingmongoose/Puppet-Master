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

