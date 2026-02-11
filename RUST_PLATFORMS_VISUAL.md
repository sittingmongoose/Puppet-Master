# Rust Platforms Module - Visual Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RWM PUPPET MASTER - RUST PLATFORMS MODULE                 │
│                         ✅ PRODUCTION READY (8,572 LOC)                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           PLATFORM RUNNERS (5/5)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   CURSOR     │  │    CLAUDE    │  │    CODEX     │  │   GEMINI     │   │
│  │  (282 LOC)   │  │  (253 LOC)   │  │  (274 LOC)   │  │  (234 LOC)   │   │
│  │              │  │              │  │              │  │              │   │
│  │ -p --force   │  │ -p --no-     │  │ exec --full- │  │ -p --approval│   │
│  │ --model X    │  │ session-per  │  │ auto --json  │  │ -mode yolo   │   │
│  │ --output-    │  │ --permission │  │ --model X    │  │ --model X    │   │
│  │ format json  │  │ -mode bypass │  │ --color never│  │ --output-    │   │
│  │              │  │              │  │              │  │ format json  │   │
│  │ ✅ 6 tests   │  │ ✅ 4 tests   │  │ ✅ 5 tests   │  │ ✅ 4 tests   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│                          ┌──────────────┐                                   │
│                          │   COPILOT    │                                   │
│                          │  (198 LOC)   │                                   │
│                          │              │                                   │
│                          │ -p --allow-  │                                   │
│                          │ all-tools    │                                   │
│                          │ --stream off │                                   │
│                          │ --allow-all- │                                   │
│                          │ paths/urls   │                                   │
│                          │              │                                   │
│                          │ ✅ 4 tests   │                                   │
│                          └──────────────┘                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        CORE INFRASTRUCTURE (3/3)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ RUNNER.RS (480 LOC) - Base Runner                                  │    │
│  │ • Process spawning (tokio::process::Command)                       │    │
│  │ • PID tracking & registry                                          │    │
│  │ • Timeout handling (SIGTERM/SIGKILL)                               │    │
│  │ • stdout/stderr streaming                                          │    │
│  │ • Completion signal detection                                      │    │
│  │ ✅ 3 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ REGISTRY.RS (458 LOC) - Central Platform Registry                  │    │
│  │ • Thread-safe registration/lookup                                  │    │
│  │ • Enable/disable runners                                           │    │
│  │ • Health monitor integration                                       │    │
│  │ • Auth status integration                                          │    │
│  │ ✅ 9 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ MOD.RS (176 LOC) - Module Root & Public API                        │    │
│  │ • PlatformRunner trait definition                                  │    │
│  │ • Factory functions                                                │    │
│  │ • Re-exports for all modules                                       │    │
│  │ ✅ 2 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        RESILIENCE & MONITORING (3/3)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ CIRCUIT_BREAKER.RS (556 LOC) ⚡                                     │    │
│  │ • 3-state pattern: Closed → Open → HalfOpen                        │    │
│  │ • Configurable thresholds (5 failures, 2 successes)                │    │
│  │ • Recovery timeout (5 minutes)                                     │    │
│  │ • Stagnation detection (1 hour)                                    │    │
│  │ • Per-platform breakers                                            │    │
│  │ ✅ 11 tests                                                        │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ HEALTH_MONITOR.RS (408 LOC) 🏥                                      │    │
│  │ • Real-time health tracking                                        │    │
│  │ • Consecutive failure counting                                     │    │
│  │ • Circuit breaker integration                                      │    │
│  │ • Last error tracking                                              │    │
│  │ • Success/failure timestamps                                       │    │
│  │ ✅ 6 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ AUTH_STATUS.RS (351 LOC) 🔐                                         │    │
│  │ • Authentication verification (all 5 platforms)                    │    │
│  │ • Environment variable checks                                      │    │
│  │ • CLI-based auth status                                            │    │
│  │ • Timeout handling (10s default)                                   │    │
│  │ ✅ 4 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     QUOTA & RATE LIMITING (2/2)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ QUOTA_MANAGER.RS (429 LOC) 📊                                       │    │
│  │ • Multi-level tracking: per run/hour/day                           │    │
│  │ • Soft limits (80% warning)                                        │    │
│  │ • Hard limits (100% block)                                         │    │
│  │ • Cursor unlimited mode                                            │    │
│  │ • Global quota manager singleton                                   │    │
│  │ ✅ 4 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ RATE_LIMITER.RS (365 LOC) ⏱️                                        │    │
│  │ • Token bucket algorithm                                           │    │
│  │ • Per-platform rate limiting                                       │    │
│  │ • Async acquire() with blocking                                    │    │
│  │ • Configurable refill rate                                         │    │
│  │ • Global rate limiter singleton                                    │    │
│  │ ✅ 6 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      TRACKING & AUDITING (2/2)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ USAGE_TRACKER.RS (704 LOC) 📈                                       │    │
│  │ • JSONL logging (.puppet-master/usage/usage.jsonl)                 │    │
│  │ • Token consumption tracking                                       │    │
│  │ • Success/failure rates                                            │    │
│  │ • Quota info parsing (Codex/Gemini errors)                         │    │
│  │ • Plan detection (Free/Plus/Team/Enterprise)                       │    │
│  │ • Time range filtering                                             │    │
│  │ ✅ 9 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ PERMISSION_AUDIT.RS (696 LOC) 🔍 [NEW]                             │    │
│  │ • JSONL audit log (.puppet-master/audit/permissions.jsonl)         │    │
│  │ • Permission event tracking                                        │    │
│  │ • Query system with filters                                        │    │
│  │ • Approval statistics                                              │    │
│  │ • Session ID tracking                                              │    │
│  │ ✅ 7 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      PARSING & DETECTION (3/3)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ OUTPUT_PARSER.RS (674 LOC) 🔧                                       │    │
│  │ • Platform-specific parsers (5 platforms)                          │    │
│  │ • Completion signal detection                                      │    │
│  │ • Token usage extraction                                           │    │
│  │ • File path detection (regex)                                      │    │
│  │ • Error categorization                                             │    │
│  │ • JSON/JSONL parsing                                               │    │
│  │ ✅ 8 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ PERMISSION_DETECTOR.RS (539 LOC) 👁️ [NEW]                          │    │
│  │ • Regex-based prompt detection                                     │    │
│  │ • Platform-specific patterns                                       │    │
│  │ • Confidence scoring (0.0-1.0)                                     │    │
│  │ • Auto-response policies                                           │    │
│  │ • Context line capture                                             │    │
│  │ ✅ 9 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ PLATFORM_DETECTOR.RS (443 LOC) 🔎                                   │    │
│  │ • Automatic CLI detection                                          │    │
│  │ • Version extraction                                               │    │
│  │ • PATH + common locations                                          │    │
│  │ • Copilot extension verification                                   │    │
│  │ • Installation recommendations                                     │    │
│  │ ✅ 5 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         CATALOG & CAPABILITIES (2/2)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ MODEL_CATALOG.RS (690 LOC) 📚                                       │    │
│  │ • Complete catalog for all 5 platforms                             │    │
│  │ • 20+ models with metadata                                         │    │
│  │ • Context window sizes                                             │    │
│  │ • Vision/tool support flags                                        │    │
│  │ • Provider tracking (Anthropic/OpenAI/Google)                      │    │
│  │ • Default model selection                                          │    │
│  │ ✅ 12 tests                                                        │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ CAPABILITY.RS (362 LOC) 🎯                                          │    │
│  │ • Platform capability detection                                    │    │
│  │ • Binary existence checks                                          │    │
│  │ • Version detection                                                │    │
│  │ • Feature probing (JSON, models, modes)                            │    │
│  │ • TTL-based cache (1 hour)                                         │    │
│  │ ✅ 3 tests                                                         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              STATISTICS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Total Files:          20 files                                             │
│  Total Lines:          8,572 LOC                                            │
│  Test Coverage:        95+ tests                                            │
│  Placeholder Code:     0 (zero todo!/unimplemented!)                        │
│  Production Ready:     ✅ YES                                                │
│                                                                              │
│  Platform Runners:     5/5 (100%)                                           │
│  Support Modules:      15/15 (100%)                                         │
│  CLI Flags Verified:   ✅ All match AGENTS.md                               │
│  Fresh Process:        ✅ All platforms                                      │
│  Autonomous Flags:     ✅ All platforms                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTEGRATION FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Orchestrator                                                              │
│       │                                                                      │
│       ├─→ Registry.get_runner(platform)                                     │
│       │       │                                                              │
│       │       ├─→ HealthMonitor.is_available(platform)                      │
│       │       ├─→ AuthStatusChecker.check_platform(platform)                │
│       │       └─→ Return runner                                             │
│       │                                                                      │
│       ├─→ RateLimiter.acquire(platform) [blocks if needed]                  │
│       │                                                                      │
│       ├─→ QuotaManager.enforce_quota(platform) [fails if exhausted]         │
│       │                                                                      │
│       ├─→ PlatformRunner.execute(request)                                   │
│       │       │                                                              │
│       │       ├─→ BaseRunner.execute_command()                              │
│       │       │       │                                                      │
│       │       │       ├─→ ProcessRegistry.register(pid)                     │
│       │       │       ├─→ spawn process                                     │
│       │       │       ├─→ stream stdout/stderr                              │
│       │       │       ├─→ timeout handling                                  │
│       │       │       └─→ ProcessRegistry.unregister(pid)                   │
│       │       │                                                              │
│       │       └─→ Return ExecutionResult                                    │
│       │                                                                      │
│       ├─→ OutputParser.parse(stdout, stderr)                                │
│       │                                                                      │
│       ├─→ HealthMonitor.record_success() / record_failure()                 │
│       │                                                                      │
│       ├─→ QuotaManager.record_usage(platform, tokens, duration)             │
│       │                                                                      │
│       ├─→ UsageTracker.track(event)                                         │
│       │                                                                      │
│       └─→ PermissionAudit.log(event) [if permissions involved]              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

```

**Legend:**
- ✅ = Implemented & Tested
- 🔐 = Security Feature
- ⚡ = Resilience Feature
- 📊 = Tracking Feature
- 🔧 = Parsing Feature
- 📚 = Catalog Feature
- 🏥 = Monitoring Feature
- 🔍 = Auditing Feature
- 👁️ = Detection Feature
- 🔎 = Discovery Feature
- 🎯 = Capability Feature
- ⏱️ = Rate Limiting Feature
- 📈 = Analytics Feature

**Status:** ✅ PRODUCTION READY - ALL MODULES COMPLETE
