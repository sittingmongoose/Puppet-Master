# Shard 010: Dynamic Subagent Selection Architecture

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L204-L261

Source SHA256: `1b766e341ccbcc8592cd42f2e5be62eaffb068675017ee4bfa70384f01ab2c1f`

---

## Dynamic Subagent Selection Architecture

### Project Context Detection

```rust
// src/core/subagent_selector.rs

pub struct ProjectContext {
    pub languages: Vec<DetectedLanguage>,
    pub frameworks: Vec<String>,
    pub domain: ProjectDomain,
    pub task_type: Option<TaskType>,
    pub error_patterns: Vec<ErrorPattern>,
}

#[derive(Debug, Clone)]
pub struct DetectedLanguage {
    pub name: String,           // "rust", "python", "javascript"
    pub confidence: f32,        // 0.0-1.0
    pub indicators: Vec<String>, // ["Cargo.toml", "src/main.rs"]
}

pub enum ProjectDomain {
    Backend,
    Frontend,
    FullStack,
    Mobile,
    Infrastructure,
    Data,
    Embedded,
    Unknown,
}

pub enum ErrorPattern {
    CompilationError,
    TestFailure,
    SecurityIssue,
    PerformanceIssue,
    RuntimeError,
}
```

### Subagent Selector
Subagent selection preserves the same runtime identity packet used by the owner contract.

Required runtime identity carry-through:
- `requested_account_id`
- `effective_account_id`
- `requested_account_binding`
- `requested_account_policy`
- `operational_identity`
- `tool_use_id`

Rules:
- Child-run routing keeps requested and effective account identity explicit.
- `requested_account_binding` and `requested_account_policy` survive into delegated runtime selection and audit.
- `operational_identity` and `tool_use_id` survive into lineage, approval, and usage joins.
- Subagent selection is a `/consumer` of the shared runtime-account owner contracts: it preserves `requested_account_binding` and `operational_identity` without local substitute fields, keeps requested/effective account and `effective-account` disclosure aligned to `Plans/Contracts_V0.md`, `Plans/Multi-Account.md`, and `Plans/storage-plan.md`, and enforces owner/consumer boundaries for account-binding fields.
