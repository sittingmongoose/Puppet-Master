# Shard 010: Dynamic Subagent Selection Architecture

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L217-L257

Source SHA256: `a5ff69d2472c5d5935bc2f9da119c526ab5bbbf3d86eeff28e50426a28d98928`

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
