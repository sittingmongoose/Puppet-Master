# Process Cleanup System - Complete API Reference

## Module: `puppet_master::utils::process`

Complete API documentation for the process management and cleanup system.

---

## Global State

### `SHUTDOWN_FLAG: AtomicBool`
Global atomic flag indicating shutdown state.

### `GLOBAL_REGISTRY: Lazy<ProcessRegistry>`
Global singleton process registry instance.

---

## Structures

### `ProcessRegistry`

Thread-safe registry for tracking spawned child processes.

```rust
pub struct ProcessRegistry {
    pids: Arc<Mutex<HashSet<u32>>>,
}
```

#### Methods

##### `global() -> &'static ProcessRegistry`
Get the global singleton instance.

**Example:**
```rust
let registry = ProcessRegistry::global();
```

##### `register(&self, pid: u32)`
Register a process ID for tracking.

**Parameters:**
- `pid`: Process ID to track

**Example:**
```rust
registry.register(child.id());
```

##### `unregister(&self, pid: u32)`
Remove a process ID from tracking.

**Parameters:**
- `pid`: Process ID to stop tracking

**Example:**
```rust
registry.unregister(pid);
```

##### `active_pids(&self) -> Vec<u32>`
Get all currently tracked process IDs.

**Returns:** Vector of active PIDs

**Example:**
```rust
let pids = registry.active_pids();
println!("Tracking {} processes", pids.len());
```

##### `kill_all(&self) -> Result<()>`
Immediately kill all tracked processes with SIGKILL.

**Returns:** `Result<()>`

**Example:**
```rust
registry.kill_all()?;
```

##### `kill_all_graceful(&self, timeout: Duration) -> Result<()>`
Kill all tracked processes gracefully with timeout.

**Process:**
1. Send SIGTERM to all
2. Wait for `timeout` with polling
3. Send SIGKILL to remaining
4. Verify all terminated
5. Clear registry

**Parameters:**
- `timeout`: Maximum time to wait for graceful exit

**Returns:** `Result<()>` - Error if any processes remain alive

**Example:**
```rust
registry.kill_all_graceful(Duration::from_secs(5))?;
```

##### Legacy Methods (Backward Compatibility)

- `register_pid(&self, pid: u32)` → use `register()`
- `unregister_pid(&self, pid: u32)` → use `unregister()`
- `get_pids(&self) -> Vec<u32>` → use `active_pids()`

---

### `ProcessDropGuard`

RAII guard that automatically kills a process when dropped.

```rust
pub struct ProcessDropGuard {
    pid: u32,
    registry: &'static ProcessRegistry,
    grace_period: Duration,
}
```

#### Methods

##### `new(pid: u32) -> Self`
Create a new drop guard with default grace period (500ms).

**Parameters:**
- `pid`: Process ID to guard

**Returns:** New `ProcessDropGuard`

**Example:**
```rust
let guard = ProcessDropGuard::new(child.id());
```

##### `with_grace_period(pid: u32, grace_period: Duration) -> Self`
Create a new drop guard with custom grace period.

**Parameters:**
- `pid`: Process ID to guard
- `grace_period`: Time to wait for graceful exit

**Returns:** New `ProcessDropGuard`

**Example:**
```rust
let guard = ProcessDropGuard::with_grace_period(
    child.id(),
    Duration::from_secs(10)
);
```

##### `pid(&self) -> u32`
Get the guarded process ID.

**Returns:** Process ID

**Example:**
```rust
println!("Guarding PID: {}", guard.pid());
```

##### `disarm(self)`
Disarm the guard, preventing process kill on drop.

**Example:**
```rust
guard.disarm();  // Process will keep running
```

#### Drop Behavior

When dropped:
1. Check if process is alive
2. Send SIGTERM
3. Wait for grace period
4. Send SIGKILL if still alive
5. Unregister from global registry

---

### `Signal`

Process signal enumeration.

```rust
pub enum Signal {
    Term,  // SIGTERM - graceful shutdown
    Kill,  // SIGKILL - immediate termination
    #[cfg(unix)]
    Int,   // SIGINT - interrupt
    #[cfg(unix)]
    Hup,   // SIGHUP - hangup
}
```

---

## Functions

### Global State Management

#### `is_shutting_down() -> bool`
Check if global shutdown has been requested.

**Returns:** `true` if shutting down

**Example:**
```rust
if is_shutting_down() {
    return;  // Skip new work
}
```

#### `set_shutdown_flag()`
Set the global shutdown flag.

**Example:**
```rust
set_shutdown_flag();
```

---

### Graceful Shutdown

#### `graceful_shutdown() -> impl Future<Output = ()>`
Async graceful shutdown of all tracked processes.

**Process:**
1. Set global shutdown flag
2. Send SIGTERM to all tracked processes
3. Wait up to 5 seconds for exits
4. Send SIGKILL to remaining
5. Verify all terminated
6. Log results

**Example:**
```rust
graceful_shutdown().await;
```

#### `graceful_shutdown_sync()`
Synchronous version of graceful shutdown.

**Example:**
```rust
graceful_shutdown_sync();
```

---

### Signal Handlers

#### `setup_signal_handlers() -> Result<()>`
Install signal handlers for graceful shutdown.

**Handles:**
- Unix: SIGINT, SIGTERM
- Windows: Ctrl+C

**Returns:** `Result<()>`

**Example:**
```rust
fn main() -> Result<()> {
    setup_signal_handlers()?;
    // ... application code
    Ok(())
}
```

---

### Process Control

#### `kill_process(pid: u32, signal: Signal) -> Result<()>`
Send a signal to a process.

**Parameters:**
- `pid`: Target process ID
- `signal`: Signal to send

**Returns:** `Result<()>`

**Platform:**
- Unix: Uses `libc::kill()`
- Windows: Uses `TerminateProcess()`

**Example:**
```rust
kill_process(pid, Signal::Term)?;
```

#### `kill_process_tree(pid: u32, graceful_timeout: Duration) -> Result<()>`
Kill a process and all its children.

**Parameters:**
- `pid`: Root process ID
- `graceful_timeout`: Time to wait for graceful exit

**Returns:** `Result<()>`

**Platform:**
- Unix: Kills entire process group
- Windows: Kills single process (no tree support)

**Example:**
```rust
kill_process_tree(pid, Duration::from_secs(3))?;
```

#### `kill_process_group(pid: u32, signal: Signal) -> Result<()>` [Unix only]
Kill an entire process group.

**Parameters:**
- `pid`: Process group leader ID
- `signal`: Signal to send

**Returns:** `Result<()>`

**Example:**
```rust
#[cfg(unix)]
kill_process_group(pid, Signal::Term)?;
```

---

### Process Status

#### `is_process_alive(pid: u32) -> bool`
Check if a process is currently running.

**Parameters:**
- `pid`: Process ID to check

**Returns:** `true` if alive

**Platform:**
- Unix: Uses `kill(pid, 0)` probe
- Windows: Uses `OpenProcess()`

**Example:**
```rust
if is_process_alive(pid) {
    println!("Process is still running");
}
```

#### `is_process_running(pid: u32) -> bool`
Legacy alias for `is_process_alive()`.

#### `wait_for_exit(pid: u32, timeout: Duration) -> bool`
Wait for a process to exit with timeout.

**Parameters:**
- `pid`: Process ID to wait for
- `timeout`: Maximum wait time

**Returns:** `true` if exited, `false` if timeout

**Polling:** 50ms intervals

**Example:**
```rust
if wait_for_exit(pid, Duration::from_secs(5)) {
    println!("Process exited gracefully");
} else {
    println!("Timeout waiting for exit");
}
```

---

### Process Spawning

#### `spawn_tracked(cmd: &str, args: &[&str]) -> Result<(Child, ProcessDropGuard)>`
Spawn a process with automatic tracking and cleanup.

**Parameters:**
- `cmd`: Command to execute
- `args`: Command arguments

**Returns:** `(Child, ProcessDropGuard)` tuple

**Features:**
- Automatically registered in global registry
- Set as process group leader on Unix
- Automatic cleanup via drop guard

**Example:**
```rust
let (mut child, guard) = spawn_tracked("myapp", &["--config", "app.yaml"])?;
let output = child.wait_with_output()?;
// Process killed automatically when guard drops
```

---

### Process Groups [Unix only]

#### `set_process_group(cmd: &mut Command)` [Unix only]
Configure a command to create a new process group.

**Parameters:**
- `cmd`: Mutable reference to `Command`

**Effect:** Sets `pre_exec` hook to call `setpgid(0, 0)`

**Example:**
```rust
#[cfg(unix)]
{
    let mut cmd = Command::new("myapp");
    set_process_group(&mut cmd);
    let child = cmd.spawn()?;
}
```

---

## Type Aliases

None.

---

## Error Handling

All fallible operations return `anyhow::Result<T>` with contextual error messages.

**Common Errors:**
- Process not found (ESRCH)
- Permission denied (EPERM)
- Invalid signal (EINVAL)
- Failed to spawn process

**Example:**
```rust
match kill_process(pid, Signal::Term) {
    Ok(_) => log::info!("Process terminated"),
    Err(e) => log::error!("Failed to kill process: {}", e),
}
```

---

## Platform Support

### Unix (Linux, macOS, BSD)
- ✅ Full signal support (SIGTERM, SIGKILL, SIGINT, SIGHUP)
- ✅ Process groups
- ✅ Process tree killing
- ✅ `kill(pid, 0)` for status checks

### Windows
- ✅ Process termination (TerminateProcess)
- ✅ Process status checks (OpenProcess)
- ⚠️ No process groups (single process only)
- ⚠️ No signal differentiation (Term vs Kill)

---

## Thread Safety

All components are thread-safe:
- `ProcessRegistry`: Uses `Arc<Mutex<HashSet<u32>>>`
- `SHUTDOWN_FLAG`: Uses `AtomicBool`
- `ProcessDropGuard`: Safe to send across threads

---

## Performance

| Operation | Complexity | Notes |
|-----------|------------|-------|
| `register(pid)` | O(1) | HashSet insert |
| `unregister(pid)` | O(1) | HashSet remove |
| `active_pids()` | O(n) | Copies all PIDs |
| `is_process_alive()` | O(1) | Single syscall |
| `wait_for_exit()` | O(t/p) | t=timeout, p=poll interval |
| `kill_all_graceful()` | O(n*t) | n=processes, t=timeout |

---

## Examples

### Complete Application Setup

```rust
use puppet_master::utils::process::*;
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    // Install signal handlers
    setup_signal_handlers()?;
    
    // Spawn tracked processes
    let (web_server, _guard1) = spawn_tracked("nginx", &["-c", "nginx.conf"])?;
    let (worker, _guard2) = spawn_tracked("worker", &["--threads", "4"])?;
    
    // Application runs...
    run_application().await?;
    
    // Graceful shutdown on exit
    graceful_shutdown().await;
    
    Ok(())
}
```

### Custom Process Manager

```rust
struct ProcessManager {
    processes: HashMap<String, (Child, ProcessDropGuard)>,
}

impl ProcessManager {
    fn spawn(&mut self, name: String, cmd: &str, args: &[&str]) -> Result<()> {
        let (child, guard) = spawn_tracked(cmd, args)?;
        self.processes.insert(name, (child, guard));
        Ok(())
    }
    
    fn kill(&mut self, name: &str) -> Result<()> {
        if let Some((mut child, guard)) = self.processes.remove(name) {
            drop(guard);  // Triggers cleanup
            child.wait()?;
        }
        Ok(())
    }
}
```

### Conditional Process Retention

```rust
fn spawn_maybe_daemon(cmd: &str, daemon: bool) -> Result<Child> {
    let (child, guard) = spawn_tracked(cmd, &[])?;
    
    if daemon {
        guard.disarm();  // Keep running
    }
    // else: guard drops and kills process
    
    Ok(child)
}
```

---

## Testing

All functions have comprehensive tests. Run with:

```bash
cargo test process              # All process tests
cargo test test_spawn_tracked   # Specific test
cargo test -- --nocapture       # With output
```

---

## Dependencies

Required in `Cargo.toml`:

```toml
[dependencies]
anyhow = "1"
log = "0.4"
once_cell = "1"
ctrlc = "3.4"

[target.'cfg(unix)'.dependencies]
nix = { version = "0.29", features = ["signal"] }
```

---

## Safety

### Unsafe Code

Limited unsafe code usage:
- `libc::kill()` for Unix signals (FFI)
- `libc::setpgid()` for process groups (FFI)
- Windows process APIs (FFI)

All unsafe blocks are:
- ✅ Properly documented
- ✅ Platform-gated with `#[cfg()]`
- ✅ Minimal scope
- ✅ Error-checked

### Memory Safety

- ✅ No memory leaks
- ✅ No dangling pointers
- ✅ No data races
- ✅ Drop guarantee for cleanup

---

## Version

**Current Version**: 0.1.1
**Rust Edition**: 2021
**MSRV**: 1.70+

---

## See Also

- `PROCESS_CLEANUP_SYSTEM.md` - Full documentation
- `PROCESS_CLEANUP_QUICK_REF.md` - Quick reference
- `std::process` - Rust standard library
- `libc` - Unix system calls

---

**Last Updated**: 2026-02-03
**Module**: `puppet_master::utils::process`
