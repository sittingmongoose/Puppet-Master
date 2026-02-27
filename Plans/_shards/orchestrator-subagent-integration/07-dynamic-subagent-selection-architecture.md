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

```rust
// src/core/subagent_selector.rs

pub struct SubagentSelector {
    project_context: ProjectContext,
    available_subagents: HashMap<String, SubagentInfo>,
}

impl SubagentSelector {
    /// Detect project language from codebase
    // DRY:FN:detect_language — Detect programming languages in workspace
    pub fn detect_language(&self, workspace: &Path) -> Result<Vec<DetectedLanguage>> {
        let mut languages = Vec::new();
        
        // Check for language indicators
        if workspace.join("Cargo.toml").exists() {
            languages.push(DetectedLanguage {
                name: "rust".to_string(),
                confidence: 0.95,
                indicators: vec!["Cargo.toml".to_string()],
            });
        }
        
        if workspace.join("package.json").exists() {
            // Check for TypeScript
            if workspace.join("tsconfig.json").exists() {
                languages.push(DetectedLanguage {
                    name: "typescript".to_string(),
                    confidence: 0.9,
                    indicators: vec!["package.json".to_string(), "tsconfig.json".to_string()],
                });
            } else {
                languages.push(DetectedLanguage {
                    name: "javascript".to_string(),
                    confidence: 0.85,
                    indicators: vec!["package.json".to_string()],
                });
            }
        }
        
        if workspace.join("requirements.txt").exists() || workspace.join("pyproject.toml").exists() {
            languages.push(DetectedLanguage {
                name: "python".to_string(),
                confidence: 0.9,
                indicators: vec!["requirements.txt".to_string()],
            });
        }
        
        // Add more language detection...
        
        Ok(languages)
    }
    
    /// Select subagent for tier level
    // DRY:FN:select_for_tier — Select subagents for a tier based on context
    pub fn select_for_tier(
        &self,
        tier_type: TierType,
        tier_context: &TierContext,
    ) -> Vec<String> {
        match tier_type {
            TierType::Phase => self.select_for_phase(tier_context),
            TierType::Task => self.select_for_task(tier_context),
            TierType::Subtask => self.select_for_subtask(tier_context),
            TierType::Iteration => self.select_for_iteration(tier_context),
        }
    }
    
    fn select_for_phase(&self, context: &TierContext) -> Vec<String> {
        let mut subagents = vec!["project-manager".to_string()];
        
        // Add architect if architecture decisions needed
        if context.needs_architecture_review {
            subagents.push("architect-reviewer".to_string());
        }
        
        // Add product manager if product planning
        if context.needs_product_planning {
            subagents.push("product-manager".to_string());
        }
        
        subagents
    }
    
    fn select_for_task(&self, context: &TierContext) -> Vec<String> {
        let mut subagents = Vec::new();
        
        // 1. Language-specific engineer
        if let Some(lang) = &context.primary_language {
            if let Some(subagent) = self.language_to_subagent(lang) {
                subagents.push(subagent);
            }
        }
        
        // 2. Domain expert
        match &context.domain {
            ProjectDomain::Backend => {
                subagents.push("backend-developer".to_string());
            }
            ProjectDomain::Frontend => {
                subagents.push("frontend-developer".to_string());
            }
            ProjectDomain::FullStack => {
                subagents.push("fullstack-developer".to_string());
            }
            ProjectDomain::Mobile => {
                subagents.push("mobile-developer".to_string());
            }
            ProjectDomain::Infrastructure => {
                subagents.push("devops-engineer".to_string());
            }
            _ => {}
        }
        
        // 3. Framework specialist
        if let Some(framework) = &context.framework {
            if let Some(subagent) = self.framework_to_subagent(framework) {
                subagents.push(subagent);
            }
        }
        
        // Fallback
        if subagents.is_empty() {
            subagents.push("fullstack-developer".to_string());
        }
        
        subagents
    }
    
    fn select_for_subtask(&self, context: &TierContext) -> Vec<String> {
        let mut subagents = Vec::new();
        
        // Inherit from task
        if let Some(task_subagents) = &context.parent_subagents {
            subagents.extend(task_subagents.clone());
        }
        
        // Add specialized subagent based on subtask focus
        match &context.subtask_focus {
            Some(SubtaskFocus::CodeReview) => {
                subagents.push("code-reviewer".to_string());
            }
            Some(SubtaskFocus::Testing) => {
                subagents.push("test-automator".to_string());
            }
            Some(SubtaskFocus::Documentation) => {
                subagents.push("technical-writer".to_string());
            }
            Some(SubtaskFocus::APIDesign) => {
                subagents.push("api-designer".to_string());
            }
            Some(SubtaskFocus::UIDesign) => {
                subagents.push("ui-designer".to_string());
            }
            Some(SubtaskFocus::Security) => {
                subagents.push("security-engineer".to_string());
            }
            Some(SubtaskFocus::Performance) => {
                subagents.push("performance-engineer".to_string());
            }
            _ => {}
        }
        
        subagents
    }
    
    fn select_for_iteration(&self, context: &TierContext) -> Vec<String> {
        let mut subagents = Vec::new();
        
        // Inherit from parent tiers
        if let Some(parent_subagents) = &context.parent_subagents {
            subagents.extend(parent_subagents.clone());
        }
        
        // Add specialized roles based on iteration state
        if context.has_errors {
            subagents.push("debugger".to_string());
        }
        
        if context.needs_code_review {
            subagents.push("code-reviewer".to_string());
        }
        
        if context.needs_testing {
            subagents.push("qa-expert".to_string());
        }
        
        // Error pattern matching
        for pattern in &context.error_patterns {
            match pattern {
                ErrorPattern::SecurityIssue => {
                    subagents.push("security-auditor".to_string());
                }
                ErrorPattern::PerformanceIssue => {
                    subagents.push("performance-engineer".to_string());
                }
                _ => {}
            }
        }
        
        subagents
    }
    
    // DRY:DATA:language_to_subagent_mapping — Single source of truth for language → subagent mapping
    // DRY REQUIREMENT: MUST use subagent_registry::get_subagent_for_language() — NEVER hardcode language → subagent mappings
    fn language_to_subagent(&self, lang: &str) -> Option<String> {
        // Use canonical subagent registry (DRY:DATA:subagent_registry)
        // DO NOT use match statements like: match lang { "rust" => Some("rust-engineer".to_string()), ... }
        subagent_registry::get_subagent_for_language(lang)
    }
    
    // DRY:DATA:framework_to_subagent_mapping — Single source of truth for framework → subagent mapping
    // DRY REQUIREMENT: MUST use subagent_registry::get_subagent_for_framework() — NEVER hardcode framework → subagent mappings
    fn framework_to_subagent(&self, framework: &str) -> Option<String> {
        // Use canonical subagent registry (DRY:DATA:subagent_registry)
        // DO NOT use match statements like: match framework { "react" => Some("react-specialist".to_string()), ... }
        subagent_registry::get_subagent_for_framework(framework)
    }
}
```

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

### Tier Context

```rust
// src/types/state.rs (additions)

pub struct TierContext {
    pub tier_type: TierType,
    pub tier_id: String,
    pub title: String,
    pub description: String,
    
    // Project context
    pub primary_language: Option<String>,
    pub domain: ProjectDomain,
    pub framework: Option<String>,
    
    // Tier-specific
    pub needs_architecture_review: bool,
    pub needs_product_planning: bool,
    pub subtask_focus: Option<SubtaskFocus>,
    
    // Iteration state
    pub has_errors: bool,
    pub needs_code_review: bool,
    pub needs_testing: bool,
    pub error_patterns: Vec<ErrorPattern>,
    
    // Inheritance
    pub parent_subagents: Option<Vec<String>>,
}

pub enum SubtaskFocus {
    CodeReview,
    Testing,
    Documentation,
    APIDesign,
    UIDesign,
    Security,
    Performance,
    Database,
}
```

