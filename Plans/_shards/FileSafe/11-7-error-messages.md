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

