# Platform Runners Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RWM Puppet Master GUI                               │
│                         (Iced-based Frontend)                                │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ ExecutionRequest
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Platform Factory                                     │
│                      create_runner(Platform)                                 │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
    ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
    │   Cursor     │     │    Codex     │    │   Claude     │
    │   Runner     │     │   Runner     │    │   Runner     │
    └──────┬───────┘     └──────┬───────┘    └──────┬───────┘
           │                    │                    │
           │                    │                    │
           ▼                    ▼                    ▼
    ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
    │   Gemini     │     │   Copilot    │    │     Base     │
    │   Runner     │     │   Runner     │    │    Runner    │◄────┐
    └──────┬───────┘     └──────┬───────┘    └──────┬───────┘     │
           │                    │                    │              │
           └────────────────────┴────────────────────┘              │
                                │                                   │
                                │ delegates to                      │
                                ▼                                   │
                    ┌───────────────────────┐                      │
                    │    BaseRunner         │──────────────────────┘
                    │  - Process spawning   │
                    │  - Timeout handling   │
                    │  - Circuit breaker    │
                    │  - Stall detection    │
                    │  - Signal completion  │
                    └───────┬───────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌─────────────┐ ┌─────────────┐
    │  Capability  │ │   Quota     │ │    Rate     │
    │   Cache      │ │  Manager    │ │  Limiter    │
    │              │ │             │ │             │
    │ - Discovery  │ │ - Tracking  │ │ - Token     │
    │ - Probing    │ │ - Enforce   │ │   bucket    │
    │ - TTL cache  │ │ - Limits    │ │ - Acquire   │
    └──────────────┘ └─────────────┘ └─────────────┘
            │               │               │
            └───────────────┴───────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Process Registry    │
                │  - Global PID track   │
                │  - Cleanup handler    │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  tokio::process       │
                │  - Async spawning     │
                │  - stdout/stderr      │
                │  - Signal handling    │
                └───────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  CLI Binaries │
                    │               │
                    │ agent/codex/  │
                    │ claude/gemini/│
                    │ copilot       │
                    └───────────────┘
```

## Data Flow

```
User Input
    │
    ▼
┌────────────────────────┐
│ Create                 │
│ ExecutionRequest       │
│ - platform: Cursor     │
│ - model: gpt-4o        │
│ - prompt: "..."        │
│ - mode: Auto           │
│ - timeout: 600s        │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Check Quota            │
│ ✓ Within limits        │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Acquire Rate Limit     │
│ ✓ Token available      │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Check Availability     │
│ ✓ CLI found            │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Build Arguments        │
│ ["-p", "...",          │
│  "--model", "gpt-4o"]  │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Spawn Process          │
│ - Register PID         │
│ - Setup stdout/stderr  │
└────────┬───────────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────┐    ┌─────────────┐
│ Read stdout │    │ Read stderr │
│ (async)     │    │ (async)     │
└──────┬──────┘    └──────┬──────┘
       │                  │
       └────────┬─────────┘
                │
                ▼
    ┌───────────────────────┐
    │ Collect Output Lines  │
    │ - Detect line types   │
    │ - Check completion    │
    │ - Monitor stall       │
    └────────┬──────────────┘
             │
             ▼
    ┌───────────────────────┐
    │ Wait for Exit         │
    │ - Handle timeout      │
    │ - SIGTERM if needed   │
    │ - SIGKILL if needed   │
    └────────┬──────────────┘
             │
             ▼
    ┌───────────────────────┐
    │ Unregister PID        │
    │ Update circuit breaker│
    └────────┬──────────────┘
             │
             ▼
    ┌───────────────────────┐
    │ Build ExecutionResult │
    │ - status: Completed   │
    │ - output: [lines...]  │
    │ - duration: 45.2s     │
    │ - tokens: 1234        │
    └────────┬──────────────┘
             │
             ▼
    ┌───────────────────────┐
    │ Record Usage          │
    │ - Update stats        │
    │ - Check quota         │
    └────────┬──────────────┘
             │
             ▼
        Return Result
```

## Circuit Breaker State Machine

```
┌──────────┐
│  Closed  │  (Normal operation)
│          │
│ failures │
│    = 0   │
└────┬─────┘
     │
     │ failure
     ▼
┌──────────┐
│  Closed  │
│          │
│ failures │
│    = 1   │
└────┬─────┘
     │
     │ failures++
     ▼
┌──────────┐        ┌──────────┐
│  Closed  │   ...  │  Closed  │
│          │        │          │
│ failures │        │ failures │
│    = 4   │        │    = 5   │
└────┬─────┘        └────┬─────┘
     │                   │
     │                   │ threshold reached
     │                   ▼
     │              ┌──────────┐
     │              │   Open   │  (Fail-fast)
     │              │          │
     │              │ failures │
     │              │   >= 5   │
     │              └────┬─────┘
     │                   │
     └───────────────────┤
         success         │
                         │
         ┌───────────────┘
         │
         ▼
    ┌──────────┐
    │  Closed  │
    │          │
    │ failures │
    │    = 0   │
    └──────────┘
```

## Token Bucket Rate Limiting

```
Time: 0s
┌─────────────────────────┐
│ ████████████████████    │  20 tokens (max 20)
└─────────────────────────┘

consume() → success
┌─────────────────────────┐
│ ███████████████████     │  19 tokens
└─────────────────────────┘

consume() x 19 → all success
┌─────────────────────────┐
│                         │  0 tokens
└─────────────────────────┘

consume() → WAIT (blocks)

Time: +2s (refill rate: 10 tokens/sec)
┌─────────────────────────┐
│ ██████████              │  20 tokens (refilled, capped at max)
└─────────────────────────┘

consume() → success
┌─────────────────────────┐
│ █████████               │  19 tokens
└─────────────────────────┘
```

## Quota Tracking Timeline

```
Hour 0                Hour 1                Hour 2
│                     │                     │
├─ Call 1 (100 tok)   ├─ Reset hourly      ├─ Reset hourly
├─ Call 2 (150 tok)   │   counters         │   counters
├─ Call 3 (200 tok)   ├─ Call 51 (100 tok) ├─ Call 101 (100 tok)
│                     │                     │
│  Per-run: 3 calls   │  Per-run: 51 calls │  Per-run: 101 calls
│  Per-hour: 3 calls  │  Per-hour: 48 calls│  Per-hour: 51 calls
│  Per-day: 3 calls   │  Per-day: 51 calls │  Per-day: 101 calls
│                     │                     │
│  Tokens/run: 450    │  Tokens/run: 5,100 │  Tokens/run: 10,100
│  Tokens/hour: 450   │  Tokens/hour: 4,800│  Tokens/hour: 5,100
│  Tokens/day: 450    │  Tokens/day: 5,100 │  Tokens/day: 10,100
│                     │                     │
│  Status: OK         │  Status: WARNING   │  Status: EXHAUSTED
│                     │  (80% of limit)    │  (100% of limit)
└─────────────────────┴─────────────────────┴──────────────────────
```

## Capability Discovery Flow

```
Platform: Cursor
    │
    ▼
┌────────────────────┐
│ Check Cache        │
│ TTL: 1 hour        │
└────┬───────────────┘
     │
     ├─ Found & Valid ────► Return cached info
     │
     ▼ Not found/expired
┌────────────────────┐
│ which "agent"      │
└────┬───────────────┘
     │
     ├─ Not found ────────► Try "cursor-agent"
     │                          │
     ▼ Found                    │
┌────────────────────┐          │
│ agent --version    │◄─────────┘
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ Parse version      │
│ v2.0.1             │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ agent --help       │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ Detect features:   │
│ ✓ --mode           │
│ ✓ --output-format  │
│ ✓ models subcommand│
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ Build CapabilityInfo│
│ - available: true  │
│ - version: v2.0.1  │
│ - features: [...]  │
│ - timestamp: now   │
└────┬───────────────┘
     │
     ▼
┌────────────────────┐
│ Cache for 1 hour   │
└────┬───────────────┘
     │
     ▼
   Return
```

## Process Lifecycle

```
Request arrives
    │
    ▼
┌─────────────────┐
│ Spawn process   │
│ PID: 12345      │
└────┬────────────┘
     │
     ├──► Register PID in global registry
     │
     ▼
┌─────────────────┐
│ Start timeout   │
│ timer (600s)    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Start stall     │
│ timer (120s)    │
└────┬────────────┘
     │
     ├────────────────┬────────────────┐
     │                │                │
     ▼                ▼                ▼
┌─────────┐    ┌──────────┐    ┌──────────┐
│ Monitor │    │  Read    │    │  Read    │
│ timers  │    │ stdout   │    │ stderr   │
└────┬────┘    └────┬─────┘    └────┬─────┘
     │              │               │
     │              └───────┬───────┘
     │                      │
     │              ┌───────▼────────┐
     │              │ Output arrives │
     │              │ Reset stall    │
     │              └───────┬────────┘
     │                      │
     │◄─────────────────────┘
     │
     ▼
Decision Point:
     │
     ├─ Process exits normally ───────► Completed
     │
     ├─ Timeout reached ──────────────► Send SIGTERM
     │                                      │
     │                                      ├─ Wait 10s
     │                                      │
     │                                      ├─ Still alive? ──► SIGKILL
     │                                      │
     │                                      └─► TimedOut
     │
     └─ Stall detected ───────────────► Send SIGTERM ──► Stalled
```

## Thread/Task Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Main Thread                           │
│                      (Tokio Runtime)                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌─────────────┐ ┌─────────────┐
│  GUI Task    │ │ Orchestrator│ │ Background  │
│  (Iced)      │ │    Task     │ │  Tasks      │
└──────────────┘ └──────┬──────┘ └─────────────┘
                        │
                        ├─► spawn(execute_request)
                        │       │
                        │       ├─► spawn(read_stdout)
                        │       │       │
                        │       │       └─► BufReader lines
                        │       │
                        │       ├─► spawn(read_stderr)
                        │       │       │
                        │       │       └─► BufReader lines
                        │       │
                        │       └─► spawn(timeout_monitor)
                        │               │
                        │               └─► sleep() + check
                        │
                        └─► mpsc::channel for output
                                │
                                └─► Collect all lines
```

## File Organization

```
puppet-master-rs/
├── Cargo.toml                 (dependencies, features)
├── src/
│   ├── main.rs                (entry point)
│   ├── types.rs               (core types, ExecutionRequest/Result)
│   └── platforms/
│       ├── mod.rs             (trait, factory, exports)
│       ├── runner.rs          (BaseRunner, ProcessRegistry)
│       ├── capability.rs      (discovery, caching)
│       ├── quota_manager.rs   (budget tracking)
│       ├── rate_limiter.rs    (token bucket)
│       ├── cursor.rs          (Cursor runner)
│       ├── codex.rs           (Codex runner)
│       ├── claude.rs          (Claude runner)
│       ├── gemini.rs          (Gemini runner)
│       └── copilot.rs         (Copilot runner)
└── tests/
    └── integration/
        └── platforms_test.rs  (integration tests)
```
