# Shard 010: Dynamic Subagent Selection Architecture

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L217-L257

Source SHA256: `e32f5d0b0778f41bb08294714781a4fbad3f2fb122c2b9c11a9339373a83c03c`

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
