# Process Cleanup System - Quick Reference

## Import

```rust
use puppet_master::utils::process::*;
```

## Common Patterns

### 1. Spawn with Automatic Cleanup (Recommended)

```rust
// Automatic tracking and cleanup
let (mut child, guard) = spawn_tracked("myapp", &["--config", "app.yaml"])?;

// guard automatically kills process when dropped
let output = child.wait_with_output()?;
```

### 2. Manual Process Management

```rust
let registry = ProcessRegistry::global();
let child = Command::new("myapp").spawn()?;
registry.register(child.id());

// Later: kill all tracked processes
registry.kill_all_graceful(Duration::from_secs(5))?;
```

### 3. Signal Handlers (Main Application)

```rust
fn main() -> Result<()> {
    setup_signal_handlers()?;  // Ctrl+C triggers graceful_shutdown
    // ... your app code
    Ok(())
}
```

### 4. Custom Grace Period

```rust
let child = Command::new("sensitive").spawn()?;
let guard = ProcessDropGuard::with_grace_period(
    child.id(),
    Duration::from_secs(10)  // 10 second grace period
);
```

### 5. Keep Process Running (Disarm Guard)

```rust
let (child, guard) = spawn_tracked("daemon", &[])?;
guard.disarm();  // Don't kill when guard drops
```

## Key Functions

| Function | Purpose |
|----------|---------|
| `ProcessRegistry::global()` | Get singleton registry |
| `setup_signal_handlers()` | Install Ctrl+C handler |
| `spawn_tracked(cmd, args)` | Spawn with auto cleanup |
| `is_process_alive(pid)` | Check if process exists |
| `wait_for_exit(pid, timeout)` | Wait for process to exit |
| `kill_process(pid, signal)` | Send signal to process |
| `kill_process_tree(pid, timeout)` | Kill process and children |
| `graceful_shutdown()` | Shutdown all tracked processes |

## ProcessRegistry Methods

```rust
let registry = ProcessRegistry::global();

registry.register(pid);           // Track process
registry.unregister(pid);         // Stop tracking
registry.active_pids();           // Get all tracked PIDs
registry.kill_all();              // SIGKILL immediately
registry.kill_all_graceful(dur);  // SIGTERM then SIGKILL
```

## ProcessDropGuard

```rust
// Automatic cleanup on drop
let guard = ProcessDropGuard::new(pid);
// Or with custom timeout
let guard = ProcessDropGuard::with_grace_period(pid, Duration::from_secs(5));

// Get PID
let pid = guard.pid();

// Prevent killing
guard.disarm();
```

## Signals

```rust
Signal::Term  // SIGTERM - graceful
Signal::Kill  // SIGKILL - immediate
Signal::Int   // SIGINT (Unix only)
Signal::Hup   // SIGHUP (Unix only)
```

## Global Shutdown Flag

```rust
if is_shutting_down() {
    // Skip new work
    return;
}

set_shutdown_flag();  // Signal shutdown
```

## Platform-Specific

### Unix Only

```rust
#[cfg(unix)]
{
    kill_process_group(pid, Signal::Term)?;  // Kill process tree
    set_process_group(&mut cmd);             // Create new process group
}
```

## Integration Examples

### In Platform Runners

```rust
impl Platform {
    async fn start(&mut self) -> Result<()> {
        let (child, guard) = spawn_tracked(&self.command, &self.args)?;
        self.child = Some(child);
        self.guard = Some(guard);
        Ok(())
    }
}
```

### In Agent Manager

```rust
impl AgentManager {
    fn spawn_agent(&mut self, agent: &Agent) -> Result<()> {
        let (child, guard) = spawn_tracked(&agent.cmd, &agent.args)?;
        self.agents.insert(agent.id, AgentHandle { child, guard });
        Ok(())
    }
}
```

### Application Shutdown

```rust
#[tokio::main]
async fn main() -> Result<()> {
    setup_signal_handlers()?;
    
    tokio::select! {
        _ = tokio::signal::ctrl_c() => {
            graceful_shutdown().await;
        }
        result = run_app() => result?,
    }
    
    Ok(())
}
```

## Best Practices

✅ **DO**:
- Use `spawn_tracked()` for automatic cleanup
- Call `setup_signal_handlers()` early in main
- Use `graceful_shutdown()` on application exit
- Store `ProcessDropGuard` with process lifetime
- Check `is_shutting_down()` before new work

❌ **DON'T**:
- Forget to drop guards (causes leaks)
- Call `std::mem::forget()` on guards
- Skip signal handler setup
- Mix manual and automatic tracking
- Assume processes exit instantly

## Troubleshooting

**Processes not dying:**
```rust
// Check if registered
let pids = ProcessRegistry::global().active_pids();
log::info!("Tracked PIDs: {:?}", pids);

// Manual kill with longer timeout
registry.kill_all_graceful(Duration::from_secs(30))?;
```

**Guard dropped too early:**
```rust
// Store guard with same lifetime as process
struct MyApp {
    child: Child,
    guard: ProcessDropGuard,  // Lives as long as MyApp
}
```

**Need to keep process running:**
```rust
let (child, guard) = spawn_tracked("daemon", &[])?;
guard.disarm();  // Explicit opt-out of auto cleanup
```

## Testing

```bash
# Run process management tests
cargo test process

# With output
cargo test process -- --nocapture

# Specific test
cargo test test_process_drop_guard
```

## Performance

- Registration: O(1)
- Lookup: O(1)
- Process check: Single system call
- Cleanup: O(n) where n = process count

## Dependencies

```toml
ctrlc = "3.4"
once_cell = "1"

[target.'cfg(unix)'.dependencies]
nix = { version = "0.29", features = ["signal"] }
```

---

**Full Documentation**: See `PROCESS_CLEANUP_SYSTEM.md`
**File**: `puppet-master-rs/src/utils/process.rs`
