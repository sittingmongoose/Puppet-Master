# Platform Runners Quick Reference

## Module Structure

```
src/platforms/
├── mod.rs              # Trait definition, factory, re-exports
├── runner.rs           # Base runner with process management
├── capability.rs       # CLI detection and capability caching
├── quota_manager.rs    # Budget/quota tracking
├── rate_limiter.rs     # Token bucket rate limiting
├── cursor.rs           # Cursor agent CLI runner
├── codex.rs            # Codex CLI runner
├── claude.rs           # Claude Code CLI runner
├── gemini.rs           # Gemini CLI runner
└── copilot.rs          # GitHub Copilot CLI runner
```

## PlatformRunner Trait

```rust
#[async_trait]
pub trait PlatformRunner: Send + Sync {
    fn platform(&self) -> Platform;
    async fn execute(&self, request: &ExecutionRequest) -> Result<ExecutionResult>;
    async fn is_available(&self) -> bool;
    async fn discover_models(&self) -> Result<Vec<String>>;
    fn build_args(&self, request: &ExecutionRequest) -> Vec<String>;
}
```

## CLI Command Reference

| Platform | Command | Args | JSON Output | Plan Mode | Max Turns |
|----------|---------|------|-------------|-----------|-----------|
| Cursor | `agent` or `cursor-agent` | `-p`, `--model`, `--mode`, `--output-format` | ✅ Yes | `--mode=plan` | ❌ No |
| Codex | `codex exec` | `"prompt"`, `--model`, `--full-auto`, `--json`, `--max-turns` | ✅ Yes | No `--full-auto` | ✅ Yes |
| Claude | `claude` | `-p`, `--model`, `--permission-mode`, `--output-format`, `--max-turns` | ✅ Yes | `--permission-mode plan` | ✅ Yes |
| Gemini | `gemini` | `-p`, `--model`, `--approval-mode`, `--output-format` | ✅ Yes | `--approval-mode plan` | ❌ No |
| Copilot | `copilot` | `-p`, `--allow-all-tools`, `--stream off` | ❌ No | ❌ No | ❌ No |

## Default Quotas

| Platform | Calls/Run | Calls/Hour | Calls/Day | Tokens/Run | Tokens/Hour | Tokens/Day |
|----------|-----------|------------|-----------|------------|-------------|------------|
| Cursor | Unlimited | 100 | 500 | Unlimited | 1M | 5M |
| Codex | 50 | 100 | 500 | 500K | 1M | 5M |
| Claude | 50 | 100 | 500 | 500K | 1M | 5M |
| Gemini | 50 | 60 | 1000 | 500K | 1M | 10M |
| Copilot | 50 | 100 | 500 | 500K | 1M | 5M |

## Rate Limits (Calls/Minute)

| Platform | Default | Refill Interval |
|----------|---------|-----------------|
| Cursor | 60 | 1000ms |
| Codex | 60 | 1000ms |
| Claude | 50 | 1200ms |
| Gemini | 60 | 1000ms |
| Copilot | 60 | 1000ms |

## Execution Modes

| Mode | Cursor | Codex | Claude | Gemini | Copilot |
|------|--------|-------|--------|--------|---------|
| Auto | Default | `--full-auto` | `--permission-mode auto` | `--approval-mode yolo` | `--allow-all-paths` |
| Plan | `--mode=plan` | No `--full-auto` | `--permission-mode plan` | `--approval-mode plan` | ❌ N/A |
| Ask | `--mode=ask` | ❌ N/A | `--permission-mode ask` | `--approval-mode confirm` | ❌ N/A |

## Reasoning Effort (o3/o3-mini)

Only supported by **Codex**:
- `--reasoning-effort low`
- `--reasoning-effort medium` (default for o3 models)
- `--reasoning-effort high`
- `--reasoning-effort xhigh`

## Model Discovery

| Platform | Method | Fallback |
|----------|--------|----------|
| Cursor | `agent models` CLI | Known models list |
| Codex | `~/.config/codex/config.json` | Known models list |
| Claude | `--help` parsing | Known models list |
| Gemini | `gemini models` CLI | Known models list |
| Copilot | N/A | `"github-copilot"` |

## Known Models

### Cursor
- gpt-4o, gpt-4o-mini
- claude-3-5-sonnet-20241022, claude-3-5-sonnet-20240620, claude-3-5-haiku-20241022
- o1, o1-mini, o3-mini
- gemini-2.0-flash-exp, gemini-exp-1206

### Codex
- gpt-4o, gpt-4o-mini
- o1, o1-mini, o3-mini
- claude-3-5-sonnet-20241022, claude-3-5-sonnet-20240620, claude-3-opus-20240229

### Claude
- claude-3-5-sonnet-20241022, claude-3-5-sonnet-20240620, claude-3-5-haiku-20241022
- claude-3-opus-20240229, claude-3-sonnet-20240229, claude-3-haiku-20240307

### Gemini
- gemini-2.0-flash-exp, gemini-exp-1206, gemini-exp-1121
- gemini-1.5-pro-latest, gemini-1.5-pro
- gemini-1.5-flash-latest, gemini-1.5-flash, gemini-1.5-flash-8b

### Copilot
- github-copilot (fixed)

## Special Features

### Cursor
- **Large prompt handling:** Prompts > 32KB sent via stdin
- **Capability caching:** 1-hour TTL
- **Fallback commands:** `agent` → `cursor-agent`

### Codex
- **Reasoning effort:** Automatic for o3 models
- **Git repo check:** Can skip with `--skip-git-repo-check`
- **Working directory:** `--cd` support

### Claude
- **System prompts:** `--append-system-prompt`
- **Tool restrictions:** `--allowedTools`
- **No persistence:** `--no-session-persistence` (for orchestrator)

### Gemini
- **Sandbox mode:** `--sandbox`
- **Directory inclusion:** `--include-directories`

### Copilot
- **No JSON:** Text output only, manual parsing required
- **Tool permissions:** `--allow-all-tools`
- **No streaming:** `--stream off` for easier parsing

## Timeout & Stall Detection

| Feature | Default | Configurable |
|---------|---------|--------------|
| Soft timeout | From request | Yes (per-request) |
| Default timeout | 3600s (1 hour) | Yes (BaseRunner) |
| Stall timeout | 120s (2 minutes) | Yes (BaseRunner) |
| Soft kill | SIGTERM | Platform-specific |
| Hard kill | SIGKILL after 10s | Fixed |
| Grace period | 10s | Fixed |

## Completion Signals

Detected in output:
- `<ralph>COMPLETE</ralph>` - Successful completion
- `<ralph>GUTTER</ralph>` - Alternative completion marker

## Circuit Breaker

- **Threshold:** 5 consecutive failures (configurable)
- **Action:** Fail-fast on subsequent requests
- **Reset:** Automatic on success
- **Manual reset:** `circuit_breaker.reset()`

## Output Line Types

Automatically detected:
- `Stdout` - Regular output
- `Stderr` - Error stream
- `Info` - Contains "info:" or "[info]"
- `Warning` - Contains "warning:" or "[warn]"
- `Error` - Contains "error:" or "[error]"
- `Debug` - Contains "debug:" or "[debug]"

## Global Singletons

```rust
// Get global instances
use puppet_master::platforms::*;

let quota_manager = quota_manager::global_quota_manager();
let rate_limiter = rate_limiter::global_rate_limiter();
let capability_cache = capability::global_cache();
let process_registry = &PROCESS_REGISTRY;
```

## Example: Execute with All Features

```rust
use puppet_master::platforms::*;
use puppet_master::types::*;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Create runner
    let runner = create_runner(Platform::Codex);
    
    // Check quota
    let quota_manager = quota_manager::global_quota_manager();
    quota_manager.enforce_quota(Platform::Codex)?;
    
    // Acquire rate limit
    let rate_limiter = rate_limiter::global_rate_limiter();
    rate_limiter.acquire(Platform::Codex).await?;
    
    // Build request
    let request = ExecutionRequest::new(
        Platform::Codex,
        "o3-mini".to_string(),
        "Implement a binary search tree".to_string(),
    )
    .with_mode(ExecutionMode::Auto)
    .with_working_dir(std::env::current_dir()?)
    .with_max_turns(10)
    .with_timeout(600)
    .with_reasoning_effort(ReasoningEffort::High);
    
    // Execute
    let start = std::time::Instant::now();
    let result = runner.execute(&request).await?;
    
    // Record usage
    quota_manager.record_usage(
        Platform::Codex,
        result.tokens_used.unwrap_or(0),
        start.elapsed().as_secs_f64(),
    );
    
    // Check result
    if result.is_success() {
        println!("✅ Success in {:.2}s", result.duration_secs);
        println!("Output: {}", result.output_text());
    } else {
        eprintln!("❌ Failed: {}", result.status);
        if let Some(error) = &result.error {
            eprintln!("Error: {}", error);
        }
    }
    
    Ok(())
}
```

## Testing

Run all platform tests:
```bash
cd puppet-master-rs
cargo test --package puppet-master --lib platforms
```

Run specific platform tests:
```bash
cargo test --package puppet-master --lib platforms::cursor
cargo test --package puppet-master --lib platforms::quota_manager
```

## Configuration Files

### Quota Config (example)
```rust
use puppet_master::platforms::quota_manager::*;

let config = QuotaConfig {
    platform: Platform::Cursor,
    max_calls_per_run: None, // Unlimited
    max_calls_per_hour: Some(200),
    max_calls_per_day: Some(1000),
    max_tokens_per_run: None,
    max_tokens_per_hour: Some(2_000_000),
    max_tokens_per_day: Some(10_000_000),
    soft_limit_threshold: 0.9, // 90%
};

let manager = quota_manager::global_quota_manager();
manager.set_config(config);
```

### Rate Limiter Config (example)
```rust
use puppet_master::platforms::rate_limiter::*;

let config = RateLimiterConfig {
    platform: Platform::Claude,
    max_calls_per_minute: 30, // Reduce to 30/min
    refill_interval_ms: 2000, // 2 seconds
};

let limiter = rate_limiter::global_rate_limiter();
limiter.set_config(config);
```

## Error Handling

All methods return `anyhow::Result<T>` with rich context:

```rust
use anyhow::Context;

let result = runner.execute(&request)
    .await
    .context("Failed to execute on Cursor")?;
```

Circuit breaker errors:
```rust
if circuit_breaker.is_open() {
    return Err(anyhow!("Circuit breaker is open for {}", platform));
}
```

Quota errors:
```rust
quota_manager.enforce_quota(platform)?; // Err if exhausted
```

## Performance Tips

1. **Use caching:** Capability cache reduces CLI calls
2. **Batch requests:** Group related tasks to minimize overhead
3. **Monitor quotas:** Check `QuotaStatus::Warning` to prevent exhaustion
4. **Adjust timeouts:** Set appropriate timeouts per task complexity
5. **Circuit breaker:** Prevents wasted resources on failing platforms
6. **Rate limiting:** Prevents API throttling

## Debugging

Enable logging:
```bash
RUST_LOG=debug cargo run
```

Check process registry:
```rust
let pids = PROCESS_REGISTRY.get_all();
println!("Active processes: {:?}", pids);
```

Inspect output lines:
```rust
for line in &result.output {
    println!("[{:?}] {}", line.line_type, line.content);
}
```
