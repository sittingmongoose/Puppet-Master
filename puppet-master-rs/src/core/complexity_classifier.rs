//! Task complexity classification
//!
//! Classifies tasks into complexity levels and types with:
//! - Heuristic-based classification (no LLM calls)
//! - Complexity levels: Trivial, Simple, Moderate, Complex, Critical
//! - Task types: Feature, Bugfix, Refactor, Test, Docs
//! - Model level routing based on complexity matrix

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// DRY:DATA:Complexity
/// Task complexity level
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Complexity {
    /// Very simple task (1-2 criteria, minimal testing)
    Trivial,
    /// Simple task (3-5 criteria, basic testing)
    Simple,
    /// Moderate complexity (6-10 criteria, moderate testing)
    Moderate,
    /// Complex task (11+ criteria, extensive testing)
    Complex,
    /// Critical/architectural task (migrations, security, breaking changes)
    Critical,
}

impl std::fmt::Display for Complexity {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Trivial => write!(f, "trivial"),
            Self::Simple => write!(f, "simple"),
            Self::Moderate => write!(f, "moderate"),
            Self::Complex => write!(f, "complex"),
            Self::Critical => write!(f, "critical"),
        }
    }
}

// DRY:DATA:TaskType
/// Task type classification
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TaskType {
    /// New feature development
    Feature,
    /// Bug fix
    Bugfix,
    /// Code refactoring
    Refactor,
    /// Test implementation
    Test,
    /// Documentation
    Docs,
}

impl std::fmt::Display for TaskType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Feature => write!(f, "feature"),
            Self::Bugfix => write!(f, "bugfix"),
            Self::Refactor => write!(f, "refactor"),
            Self::Test => write!(f, "test"),
            Self::Docs => write!(f, "docs"),
        }
    }
}

// DRY:DATA:ModelLevel
/// Model level for platform routing
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ModelLevel {
    /// Level 1 - Simple tasks (e.g., Haiku, 3.5-Sonnet, smaller models)
    Level1,
    /// Level 2 - Standard tasks (e.g., Sonnet, GPT-4)
    Level2,
    /// Level 3 - Complex/critical tasks (e.g., Opus, O1)
    Level3,
}

impl std::fmt::Display for ModelLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Level1 => write!(f, "level1"),
            Self::Level2 => write!(f, "level2"),
            Self::Level3 => write!(f, "level3"),
        }
    }
}

// DRY:DATA:ClassificationResult
/// Classification result
#[derive(Debug, Clone)]
pub struct ClassificationResult {
    /// Task complexity
    pub complexity: Complexity,
    /// Task type
    pub task_type: TaskType,
    /// Recommended model level
    pub model_level: ModelLevel,
}

// DRY:DATA:TaskInfo
/// Task information for classification
#[derive(Debug, Clone)]
pub struct TaskInfo {
    /// Task title
    pub title: String,
    /// Task description
    pub description: String,
    /// Acceptance criteria
    pub acceptance_criteria: Vec<String>,
    /// Number of test commands
    pub test_command_count: usize,
    /// Additional context for classification
    pub additional_context: String,
}

/// Complexity routing matrix
type ComplexityMatrix = HashMap<(Complexity, TaskType), ModelLevel>;

// DRY:DATA:ComplexityClassifier
/// Complexity classifier
pub struct ComplexityClassifier {
    /// Routing matrix for model level selection
    matrix: ComplexityMatrix,
}

impl ComplexityClassifier {
    /// Create new classifier with default routing matrix
    pub fn new() -> Self {
        Self {
            matrix: Self::default_matrix(),
        }
    }

    /// Create with custom routing matrix
    pub fn with_matrix(matrix: ComplexityMatrix) -> Self {
        Self { matrix }
    }

    /// Classify a task
    pub fn classify(&self, task: &TaskInfo) -> ClassificationResult {
        let complexity = self.classify_complexity(task);
        let task_type = self.classify_task_type(task);
        let model_level = self.get_model_level(complexity, task_type);

        ClassificationResult {
            complexity,
            task_type,
            model_level,
        }
    }

    /// Classify task complexity based on heuristics
    fn classify_complexity(&self, task: &TaskInfo) -> Complexity {
        let criteria_count = task.acceptance_criteria.len();
        let test_count = task.test_command_count;
        let text = self.get_signal_text(task);

        // Check for critical keywords
        let critical_keywords = [
            "migration",
            "migrate",
            "security",
            "auth",
            "encryption",
            "architecture",
            "orchestrator",
            "state machine",
            "breaking change",
        ];

        if critical_keywords
            .iter()
            .any(|kw| text.to_lowercase().contains(kw))
        {
            return Complexity::Critical;
        }

        // Classify based on criteria and test counts
        match (criteria_count, test_count) {
            (0..=2, 0..=1) => Complexity::Trivial,
            (3..=5, 0..=2) => Complexity::Simple,
            (6..=10, 0..=4) => Complexity::Moderate,
            (11..=20, _) => Complexity::Complex,
            _ => Complexity::Critical,
        }
    }

    /// Classify task type based on keywords
    fn classify_task_type(&self, task: &TaskInfo) -> TaskType {
        let text = self.get_signal_text(task);
        let lower = text.to_lowercase();

        // Documentation keywords (highest priority)
        if lower.contains("readme")
            || lower.contains("docs")
            || lower.contains("documentation")
            || lower.contains("changelog")
        {
            return TaskType::Docs;
        }

        // Test keywords (check before bugfix to avoid "fix test" being treated as bugfix)
        if lower.contains("test")
            || lower.contains("vitest")
            || lower.contains("jest")
            || lower.contains("coverage")
            || lower.contains("spec")
            || lower.contains("assert")
        {
            return TaskType::Test;
        }

        // Bugfix keywords
        if lower.contains("fix")
            || lower.contains("bug")
            || lower.contains("regression")
            || lower.contains("crash")
            || lower.contains("error")
            || lower.contains("broken")
            || lower.contains("fail")
        {
            return TaskType::Bugfix;
        }

        // Refactor keywords
        if lower.contains("refactor")
            || lower.contains("cleanup")
            || lower.contains("restructure")
            || lower.contains("rewrite")
            || lower.contains("rename")
            || lower.contains("simplify")
        {
            return TaskType::Refactor;
        }

        // Default to feature
        TaskType::Feature
    }

    /// Get model level from complexity and task type
    fn get_model_level(&self, complexity: Complexity, task_type: TaskType) -> ModelLevel {
        *self
            .matrix
            .get(&(complexity, task_type))
            .unwrap_or(&ModelLevel::Level2) // Default to Level2
    }

    /// Combine all text for signal analysis
    fn get_signal_text(&self, task: &TaskInfo) -> String {
        let criteria_text = task.acceptance_criteria.join(" ");
        format!(
            "{} {} {} {}",
            task.title, task.description, criteria_text, task.additional_context
        )
    }

    /// Default routing matrix (from BUILD_QUEUE_IMPROVEMENTS.md P2-T05)
    fn default_matrix() -> ComplexityMatrix {
        let mut matrix = HashMap::new();

        // Trivial - all Level1
        matrix.insert((Complexity::Trivial, TaskType::Feature), ModelLevel::Level1);
        matrix.insert((Complexity::Trivial, TaskType::Bugfix), ModelLevel::Level1);
        matrix.insert(
            (Complexity::Trivial, TaskType::Refactor),
            ModelLevel::Level1,
        );
        matrix.insert((Complexity::Trivial, TaskType::Test), ModelLevel::Level1);
        matrix.insert((Complexity::Trivial, TaskType::Docs), ModelLevel::Level1);

        // Simple
        matrix.insert((Complexity::Simple, TaskType::Feature), ModelLevel::Level1);
        matrix.insert((Complexity::Simple, TaskType::Bugfix), ModelLevel::Level2);
        matrix.insert((Complexity::Simple, TaskType::Refactor), ModelLevel::Level1);
        matrix.insert((Complexity::Simple, TaskType::Test), ModelLevel::Level1);
        matrix.insert((Complexity::Simple, TaskType::Docs), ModelLevel::Level1);

        // Moderate - mostly Level2
        matrix.insert(
            (Complexity::Moderate, TaskType::Feature),
            ModelLevel::Level2,
        );
        matrix.insert((Complexity::Moderate, TaskType::Bugfix), ModelLevel::Level2);
        matrix.insert(
            (Complexity::Moderate, TaskType::Refactor),
            ModelLevel::Level2,
        );
        matrix.insert((Complexity::Moderate, TaskType::Test), ModelLevel::Level2);
        matrix.insert((Complexity::Moderate, TaskType::Docs), ModelLevel::Level1);

        // Complex - Level2 for tests/docs, Level3 for others
        matrix.insert((Complexity::Complex, TaskType::Feature), ModelLevel::Level3);
        matrix.insert((Complexity::Complex, TaskType::Bugfix), ModelLevel::Level3);
        matrix.insert(
            (Complexity::Complex, TaskType::Refactor),
            ModelLevel::Level3,
        );
        matrix.insert((Complexity::Complex, TaskType::Test), ModelLevel::Level2);
        matrix.insert((Complexity::Complex, TaskType::Docs), ModelLevel::Level2);

        // Critical - all Level3 except docs
        matrix.insert(
            (Complexity::Critical, TaskType::Feature),
            ModelLevel::Level3,
        );
        matrix.insert((Complexity::Critical, TaskType::Bugfix), ModelLevel::Level3);
        matrix.insert(
            (Complexity::Critical, TaskType::Refactor),
            ModelLevel::Level3,
        );
        matrix.insert((Complexity::Critical, TaskType::Test), ModelLevel::Level2);
        matrix.insert((Complexity::Critical, TaskType::Docs), ModelLevel::Level2);

        matrix
    }
}

impl Default for ComplexityClassifier {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn create_task(title: &str, criteria_count: usize, test_count: usize) -> TaskInfo {
        TaskInfo {
            title: title.to_string(),
            description: String::new(),
            acceptance_criteria: (0..criteria_count)
                .map(|i| format!("Criterion {}", i))
                .collect(),
            test_command_count: test_count,
            additional_context: String::new(),
        }
    }

    #[test]
    fn test_classify_trivial_task() {
        let classifier = ComplexityClassifier::new();
        let task = create_task("Simple fix", 2, 1);

        let result = classifier.classify(&task);
        assert_eq!(result.complexity, Complexity::Trivial);
    }

    #[test]
    fn test_classify_simple_task() {
        let classifier = ComplexityClassifier::new();
        let task = create_task("Add validation", 4, 2);

        let result = classifier.classify(&task);
        assert_eq!(result.complexity, Complexity::Simple);
    }

    #[test]
    fn test_classify_moderate_task() {
        let classifier = ComplexityClassifier::new();
        let task = create_task("Implement feature", 8, 3);

        let result = classifier.classify(&task);
        assert_eq!(result.complexity, Complexity::Moderate);
    }

    #[test]
    fn test_classify_complex_task() {
        let classifier = ComplexityClassifier::new();
        let task = create_task("Major refactor", 15, 5);

        let result = classifier.classify(&task);
        assert_eq!(result.complexity, Complexity::Complex);
    }

    #[test]
    fn test_classify_critical_task() {
        let classifier = ComplexityClassifier::new();
        let task = TaskInfo {
            title: "Database migration for auth system".to_string(),
            description: "Migrate authentication to new security model".to_string(),
            acceptance_criteria: vec!["Migrate schema".to_string()],
            test_command_count: 1,
            additional_context: String::new(),
        };

        let result = classifier.classify(&task);
        assert_eq!(result.complexity, Complexity::Critical);
    }

    #[test]
    fn test_classify_docs_type() {
        let classifier = ComplexityClassifier::new();
        let task = create_task("Update README documentation", 2, 0);

        let result = classifier.classify(&task);
        assert_eq!(result.task_type, TaskType::Docs);
    }

    #[test]
    fn test_classify_test_type() {
        let classifier = ComplexityClassifier::new();
        let task = create_task("Add unit tests for parser", 3, 5);

        let result = classifier.classify(&task);
        assert_eq!(result.task_type, TaskType::Test);
    }

    #[test]
    fn test_classify_bugfix_type() {
        let classifier = ComplexityClassifier::new();
        let task = create_task("Fix crash in login handler", 2, 1);

        let result = classifier.classify(&task);
        assert_eq!(result.task_type, TaskType::Bugfix);
    }

    #[test]
    fn test_classify_refactor_type() {
        let classifier = ComplexityClassifier::new();
        let task = create_task("Refactor state machine code", 5, 2);

        let result = classifier.classify(&task);
        assert_eq!(result.task_type, TaskType::Refactor);
    }

    #[test]
    fn test_classify_feature_type() {
        let classifier = ComplexityClassifier::new();
        let task = create_task("Implement new export feature", 6, 3);

        let result = classifier.classify(&task);
        assert_eq!(result.task_type, TaskType::Feature);
    }

    #[test]
    fn test_model_level_routing() {
        let classifier = ComplexityClassifier::new();

        // Trivial docs -> Level1
        let task = create_task("Update README", 1, 0);
        let result = classifier.classify(&task);
        assert_eq!(result.model_level, ModelLevel::Level1);

        // Simple bugfix -> Level2
        let task = TaskInfo {
            title: "Fix validation bug".to_string(),
            description: String::new(),
            acceptance_criteria: vec!["Fix".to_string(); 4],
            test_command_count: 2,
            additional_context: String::new(),
        };
        let result = classifier.classify(&task);
        assert_eq!(result.model_level, ModelLevel::Level2);

        // Critical feature -> Level3
        let task = TaskInfo {
            title: "Implement security encryption".to_string(),
            description: String::new(),
            acceptance_criteria: vec!["Secure".to_string()],
            test_command_count: 1,
            additional_context: String::new(),
        };
        let result = classifier.classify(&task);
        assert_eq!(result.model_level, ModelLevel::Level3);
    }
}
