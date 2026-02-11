//! Prompt templates for AI interactions.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// A prompt template with variables.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PromptTemplate {
    /// Template name/ID
    pub name: String,
    /// System prompt (optional)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system_prompt: Option<String>,
    /// User prompt template with {{variable}} placeholders
    pub user_prompt_template: String,
    /// Required variables
    #[serde(default)]
    pub variables: Vec<String>,
    /// Optional description
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

impl PromptTemplate {
    /// Creates a new prompt template.
    pub fn new(name: impl Into<String>, user_prompt_template: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            system_prompt: None,
            user_prompt_template: user_prompt_template.into(),
            variables: Vec::new(),
            description: None,
        }
    }

    /// Sets the system prompt and returns self for chaining.
    pub fn with_system_prompt(mut self, system_prompt: impl Into<String>) -> Self {
        self.system_prompt = Some(system_prompt.into());
        self
    }

    /// Adds a required variable and returns self for chaining.
    pub fn with_variable(mut self, variable: impl Into<String>) -> Self {
        self.variables.push(variable.into());
        self
    }

    /// Sets the description and returns self for chaining.
    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// Renders the template with provided variables.
    pub fn render(&self, variables: &HashMap<String, String>) -> Result<String, String> {
        // Check for missing required variables
        for var in &self.variables {
            if !variables.contains_key(var) {
                return Err(format!("Missing required variable: {}", var));
            }
        }

        let mut rendered = self.user_prompt_template.clone();

        // Replace all {{variable}} placeholders
        for (key, value) in variables {
            let placeholder = format!("{{{{{}}}}}", key);
            rendered = rendered.replace(&placeholder, value);
        }

        // Check for unreplaced placeholders
        if rendered.contains("{{") {
            return Err("Template contains unreplaced variables".to_string());
        }

        Ok(rendered)
    }

    /// Returns the full prompt (system + user).
    pub fn render_full(&self, variables: &HashMap<String, String>) -> Result<(Option<String>, String), String> {
        let user_prompt = self.render(variables)?;
        Ok((self.system_prompt.clone(), user_prompt))
    }
}

/// Collection of standard prompt templates.
pub struct PromptTemplates;

impl PromptTemplates {
    /// Returns the architecture review template.
    pub fn architecture_review() -> PromptTemplate {
        PromptTemplate::new(
            "architecture_review",
            r#"Please review the following architecture documentation:

{{architecture_doc}}

Analyze the architecture for:
1. Scalability concerns
2. Security considerations
3. Maintainability issues
4. Performance bottlenecks
5. Technology choices

Provide specific recommendations for improvement."#,
        )
        .with_system_prompt(
            "You are an experienced software architect reviewing system designs. \
            Focus on practical, actionable feedback.",
        )
        .with_variable("architecture_doc")
        .with_description("Review architecture documentation and provide feedback")
    }

    /// Returns the requirements interview template.
    pub fn interview() -> PromptTemplate {
        PromptTemplate::new(
            "interview",
            r#"Based on the following project description:

{{project_description}}

Previous context:
{{previous_context}}

Generate {{question_count}} clarifying questions to better understand:
- Functional requirements
- Non-functional requirements
- Constraints and assumptions
- Success criteria

Format each question on a new line starting with "Q:"."#,
        )
        .with_system_prompt(
            "You are a requirements analyst conducting a discovery interview. \
            Ask insightful questions to uncover hidden requirements and edge cases.",
        )
        .with_variable("project_description")
        .with_variable("previous_context")
        .with_variable("question_count")
        .with_description("Generate interview questions for requirements gathering")
    }

    /// Returns the requirements inventory template.
    pub fn inventory() -> PromptTemplate {
        PromptTemplate::new(
            "inventory",
            r#"Analyze the following requirements document:

{{requirements_doc}}

Extract and categorize all requirements as:

FUNCTIONAL:
- [List functional requirements]

NON-FUNCTIONAL:
- [List non-functional requirements]

CONSTRAINTS:
- [List constraints and limitations]

ASSUMPTIONS:
- [List assumptions]

For each requirement, provide:
1. A unique ID
2. A brief description
3. Priority (High/Medium/Low)
4. Category"#,
        )
        .with_system_prompt(
            "You are a requirements engineer analyzing documentation. \
            Extract clear, testable requirements from narrative descriptions.",
        )
        .with_variable("requirements_doc")
        .with_description("Create an inventory of requirements from a document")
    }

    /// Returns the PRD generation template.
    pub fn prd_generation() -> PromptTemplate {
        PromptTemplate::new(
            "prd_generation",
            r#"Generate a detailed Product Requirements Document (PRD) for:

Project: {{project_name}}
Description: {{project_description}}

Requirements:
{{requirements}}

The PRD should include:
1. Phases: High-level project phases
2. Tasks: Specific tasks within each phase
3. Subtasks: Granular implementation steps
4. Acceptance Criteria: Testable criteria for each task

For each item, specify:
- ID (e.g., P1-T1-S1)
- Name and description
- Dependencies
- Priority (Critical/High/Medium/Low)
- Estimated duration

Format the output as structured JSON following the PRD schema."#,
        )
        .with_system_prompt(
            "You are a product manager creating detailed project plans. \
            Break down requirements into actionable work items with clear acceptance criteria.",
        )
        .with_variable("project_name")
        .with_variable("project_description")
        .with_variable("requirements")
        .with_description("Generate a structured PRD from requirements")
    }

    /// Returns the test plan generation template.
    pub fn test_plan() -> PromptTemplate {
        PromptTemplate::new(
            "test_plan",
            r#"Generate a comprehensive test plan for:

{{test_target}}

Requirements to test:
{{requirements}}

Create test cases covering:
1. Unit tests
2. Integration tests
3. End-to-end tests
4. Edge cases
5. Error conditions

For each test case, specify:
- Test ID
- Description
- Preconditions
- Test steps
- Expected result
- Priority"#,
        )
        .with_system_prompt(
            "You are a QA engineer designing test plans. \
            Ensure comprehensive coverage including happy paths, edge cases, and error handling.",
        )
        .with_variable("test_target")
        .with_variable("requirements")
        .with_description("Generate a comprehensive test plan")
    }

    /// Returns the gap analysis template.
    pub fn gap_analysis() -> PromptTemplate {
        PromptTemplate::new(
            "gap_analysis",
            r#"Analyze the following PRD for completeness:

{{prd_content}}

Identify gaps in:
1. Requirements coverage
2. Acceptance criteria
3. Dependencies
4. Risk assessment
5. Resource allocation

For each gap, specify:
- Location (Phase/Task/Subtask ID)
- Type of gap
- Severity (Critical/High/Medium/Low)
- Recommended action"#,
        )
        .with_system_prompt(
            "You are a project analyst reviewing PRDs for completeness. \
            Identify missing information that could lead to project issues.",
        )
        .with_variable("prd_content")
        .with_description("Analyze PRD for gaps and missing information")
    }

    /// Returns the code review template.
    pub fn code_review() -> PromptTemplate {
        PromptTemplate::new(
            "code_review",
            r#"Review the following code changes:

File: {{file_path}}

Changes:
{{code_diff}}

Context: {{context}}

Provide feedback on:
1. Code quality and style
2. Potential bugs or issues
3. Performance concerns
4. Security vulnerabilities
5. Test coverage
6. Documentation

Format feedback as:
- ISSUE: [Description]
- SUGGESTION: [Recommendation]
- PRAISE: [Good practices observed]"#,
        )
        .with_system_prompt(
            "You are a senior software engineer conducting code review. \
            Focus on quality, maintainability, and potential issues.",
        )
        .with_variable("file_path")
        .with_variable("code_diff")
        .with_variable("context")
        .with_description("Review code changes and provide feedback")
    }

    /// Returns all standard templates as a collection.
    pub fn all() -> Vec<PromptTemplate> {
        vec![
            Self::architecture_review(),
            Self::interview(),
            Self::inventory(),
            Self::prd_generation(),
            Self::test_plan(),
            Self::gap_analysis(),
            Self::code_review(),
        ]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_template_creation() {
        let template = PromptTemplate::new("test", "Hello {{name}}!")
            .with_system_prompt("You are a test assistant")
            .with_variable("name")
            .with_description("A test template");

        assert_eq!(template.name, "test");
        assert_eq!(template.variables.len(), 1);
        assert!(template.system_prompt.is_some());
    }

    #[test]
    fn test_template_render_success() {
        let template = PromptTemplate::new("greeting", "Hello {{name}}, welcome to {{place}}!")
            .with_variable("name")
            .with_variable("place");

        let mut variables = HashMap::new();
        variables.insert("name".to_string(), "Alice".to_string());
        variables.insert("place".to_string(), "Wonderland".to_string());

        let rendered = template.render(&variables).unwrap();
        assert_eq!(rendered, "Hello Alice, welcome to Wonderland!");
    }

    #[test]
    fn test_template_render_missing_variable() {
        let template = PromptTemplate::new("greeting", "Hello {{name}}!").with_variable("name");

        let variables = HashMap::new();
        let result = template.render(&variables);

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Missing required variable"));
    }

    #[test]
    fn test_template_render_full() {
        let template = PromptTemplate::new("test", "User prompt: {{value}}")
            .with_system_prompt("System prompt")
            .with_variable("value");

        let mut variables = HashMap::new();
        variables.insert("value".to_string(), "test value".to_string());

        let (system, user) = template.render_full(&variables).unwrap();
        assert_eq!(system, Some("System prompt".to_string()));
        assert_eq!(user, "User prompt: test value");
    }

    #[test]
    fn test_architecture_review_template() {
        let template = PromptTemplates::architecture_review();
        assert_eq!(template.name, "architecture_review");
        assert!(template.system_prompt.is_some());
        assert!(template.variables.contains(&"architecture_doc".to_string()));
    }

    #[test]
    fn test_interview_template() {
        let template = PromptTemplates::interview();
        assert_eq!(template.name, "interview");
        assert_eq!(template.variables.len(), 3);
    }

    #[test]
    fn test_prd_generation_template() {
        let template = PromptTemplates::prd_generation();
        assert_eq!(template.name, "prd_generation");

        let mut variables = HashMap::new();
        variables.insert("project_name".to_string(), "Test Project".to_string());
        variables.insert(
            "project_description".to_string(),
            "A test".to_string(),
        );
        variables.insert("requirements".to_string(), "REQ-001".to_string());

        let rendered = template.render(&variables);
        assert!(rendered.is_ok());
        assert!(rendered.unwrap().contains("Test Project"));
    }

    #[test]
    fn test_all_templates() {
        let templates = PromptTemplates::all();
        assert_eq!(templates.len(), 7);
        assert!(templates.iter().all(|t| !t.name.is_empty()));
        assert!(templates.iter().all(|t| t.system_prompt.is_some()));
    }
}
