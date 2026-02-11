//! Requirements interviewer - interactive requirements gathering.
//!
//! Generates prompts for the AI to ask clarifying questions
//! to help refine and complete requirements.

use crate::platforms::{PlatformRunner, UsageEvent, UsageTracker};
use crate::types::{ExecutionRequest, ParsedRequirements, RequirementsSection};
use anyhow::Result;
use log::{debug, info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use std::sync::Arc;
use std::time::{Duration, Instant};

/// Interactive requirements interviewer.
pub struct RequirementsInterviewer;

/// An interview question to gather more information.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InterviewQuestion {
    /// The question text.
    pub question: String,
    /// Question category.
    pub category: QuestionCategory,
    /// How important this question is.
    pub importance: Importance,
    /// Context explaining why this question is asked.
    pub context: String,
    /// Suggested answers (if multiple choice).
    #[serde(default)]
    pub suggested_answers: Vec<String>,
    /// Whether this question is required.
    #[serde(default)]
    pub required: bool,
}

/// Category of interview question.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum QuestionCategory {
    /// Questions about project scope and boundaries.
    Scope,
    /// Technical implementation questions.
    Technical,
    /// Design and architecture questions.
    Design,
    /// Testing and quality assurance questions.
    Testing,
    /// Deployment and operations questions.
    Deployment,
    /// Security requirements.
    Security,
    /// Performance requirements.
    Performance,
    /// User experience questions.
    UserExperience,
    /// Data and storage questions.
    Data,
    /// Integration with other systems.
    Integration,
}

impl std::fmt::Display for QuestionCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Scope => write!(f, "Scope"),
            Self::Technical => write!(f, "Technical"),
            Self::Design => write!(f, "Design"),
            Self::Testing => write!(f, "Testing"),
            Self::Deployment => write!(f, "Deployment"),
            Self::Security => write!(f, "Security"),
            Self::Performance => write!(f, "Performance"),
            Self::UserExperience => write!(f, "User Experience"),
            Self::Data => write!(f, "Data"),
            Self::Integration => write!(f, "Integration"),
        }
    }
}

/// Importance level of a question.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Importance {
    /// Nice to have, but not essential.
    NiceToHave,
    /// Important to know.
    Important,
    /// Critical to project success.
    Critical,
}

impl std::fmt::Display for Importance {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NiceToHave => write!(f, "Nice to Have"),
            Self::Important => write!(f, "Important"),
            Self::Critical => write!(f, "Critical"),
        }
    }
}

/// Result of an interview session.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InterviewResult {
    pub total_questions: usize,
    pub questions_by_category: HashMap<QuestionCategory, Vec<InterviewQuestion>>,
    pub questions: Vec<InterviewQuestion>,
    pub critical_count: usize,
}


#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AiInterviewPayload {
    questions: Vec<InterviewQuestion>,
}

fn extract_platform_response_text(raw_output: &str) -> String {
    // Many CLIs emit JSON wrappers like {"response": "..."}.
    if let Ok(json) = serde_json::from_str::<serde_json::Value>(raw_output) {
        if let Some(text) = extract_text_from_json(&json) {
            return text;
        }
    }

    // Best-effort: locate an embedded JSON object and retry.
    if let (Some(start), Some(end)) = (raw_output.find('{'), raw_output.rfind('}')) {
        if start < end {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&raw_output[start..=end]) {
                if let Some(text) = extract_text_from_json(&json) {
                    return text;
                }
            }
        }
    }

    raw_output.to_string()
}

fn extract_text_from_json(json: &serde_json::Value) -> Option<String> {
    if let Some(s) = json.as_str() {
        return Some(s.to_string());
    }
    let obj = json.as_object()?;

    for key in ["response", "output", "message", "content", "text"] {
        if let Some(s) = obj.get(key).and_then(|v| v.as_str()) {
            return Some(s.to_string());
        }
    }

    if let Some(result) = obj.get("result") {
        if let Some(s) = result.get("finalResponse").and_then(|v| v.as_str()) {
            return Some(s.to_string());
        }
        if let Some(s) = result.get("response").and_then(|v| v.as_str()) {
            return Some(s.to_string());
        }
        if let Some(s) = result.get("output").and_then(|v| v.as_str()) {
            return Some(s.to_string());
        }
        if let Some(s) = result.get("message").and_then(|v| v.as_str()) {
            return Some(s.to_string());
        }
        // Claude often emits message.content as array of blocks.
        if let Some(arr) = result
            .pointer("/message/content")
            .and_then(|v| v.as_array())
        {
            let mut parts = Vec::new();
            for item in arr {
                if let Some(t) = item.get("text").and_then(|v| v.as_str()) {
                    parts.push(t);
                }
            }
            if !parts.is_empty() {
                return Some(parts.join(""));
            }
        }
    }

    None
}

fn parse_json_fragment<T: for<'de> Deserialize<'de>>(text: &str) -> Result<T> {
    if let Ok(v) = serde_json::from_str::<T>(text) {
        return Ok(v);
    }

    if let (Some(start), Some(end)) = (text.find('{'), text.rfind('}')) {
        if start < end {
            return Ok(serde_json::from_str::<T>(&text[start..=end])?);
        }
    }

    Err(anyhow::anyhow!("No parseable JSON found"))
}

fn parse_line_questions(text: &str) -> Vec<InterviewQuestion> {
    let mut out = Vec::new();

    for (idx, line) in text.lines().enumerate() {
        let t = line.trim();
        let q = t
            .strip_prefix("Q:")
            .or_else(|| t.strip_prefix("- Q:"))
            .map(|s| s.trim());

        let Some(question) = q else {
            continue;
        };

        let category = infer_category(question);
        let importance = infer_importance(idx);

        out.push(InterviewQuestion {
            question: question.to_string(),
            category,
            importance,
            context: "AI-generated clarifying question".to_string(),
            suggested_answers: vec![],
            required: matches!(importance, Importance::Critical),
        });
    }

    out
}

fn infer_category(question: &str) -> QuestionCategory {
    let q = question.to_lowercase();
    if q.contains("deploy") || q.contains("hosting") || q.contains("ci") {
        QuestionCategory::Deployment
    } else if q.contains("test") || q.contains("coverage") {
        QuestionCategory::Testing
    } else if q.contains("security") || q.contains("auth") || q.contains("encrypt") {
        QuestionCategory::Security
    } else if q.contains("performance") || q.contains("latency") || q.contains("throughput") {
        QuestionCategory::Performance
    } else if q.contains("database") || q.contains("data") || q.contains("store") {
        QuestionCategory::Data
    } else if q.contains("integrat") || q.contains("api") || q.contains("webhook") {
        QuestionCategory::Integration
    } else if q.contains("ui") || q.contains("ux") || q.contains("user") {
        QuestionCategory::UserExperience
    } else if q.contains("design") || q.contains("architecture") {
        QuestionCategory::Design
    } else if q.contains("language") || q.contains("framework") || q.contains("stack") {
        QuestionCategory::Technical
    } else {
        QuestionCategory::Scope
    }
}

fn infer_importance(idx: usize) -> Importance {
    if idx < 3 {
        Importance::Critical
    } else if idx < 7 {
        Importance::Important
    } else {
        Importance::NiceToHave
    }
}

impl RequirementsInterviewer {
    /// Generate interview questions from parsed requirements.
    pub fn generate_questions(requirements: &ParsedRequirements) -> Result<InterviewResult> {
        info!("Generating interview questions for: {}", requirements.project_name);

        let mut all_questions = Vec::new();

        // Always ask foundational questions
        all_questions.extend(Self::generate_foundational_questions(&requirements.project_name));

        // Analyze each section for gaps
        for section in &requirements.sections {
            let questions = Self::analyze_section_for_questions(section)?;
            all_questions.extend(questions);
        }

        // Add category-specific questions
        all_questions.extend(Self::generate_technical_questions());
        all_questions.extend(Self::generate_testing_questions());
        all_questions.extend(Self::generate_deployment_questions());

        // Group questions by category
        let mut questions_by_category: HashMap<QuestionCategory, Vec<InterviewQuestion>> =
            HashMap::new();
        
        for question in &all_questions {
            questions_by_category
                .entry(question.category)
                .or_default()
                .push(question.clone());
        }

        let critical_count = all_questions
            .iter()
            .filter(|q| q.importance == Importance::Critical)
            .count();

        Ok(InterviewResult {
            total_questions: all_questions.len(),
            questions_by_category: questions_by_category.clone(),
            questions: all_questions,
            critical_count,
        })
    }

    /// Generate interview questions using an AI platform runner.
    ///
    /// Falls back to rule-based generation if execution or parsing fails.
    pub async fn interview_with_ai(
        requirements: &ParsedRequirements,
        runner: Arc<dyn PlatformRunner>,
        model: &str,
        working_directory: &Path,
        question_count: usize,
        usage_tracker: Option<&UsageTracker>,
    ) -> Result<InterviewResult> {
        let template = super::PromptTemplates::interview();

        let project_description = requirements
            .description
            .clone()
            .or_else(|| requirements.sections.first().map(|s| s.content.clone()))
            .unwrap_or_else(|| "Project requirements".to_string());

        let previous_context = requirements
            .sections
            .iter()
            .map(|s| format!("- {}", s.title))
            .collect::<Vec<_>>()
            .join("\n");

        let mut vars = HashMap::new();
        vars.insert("project_description".to_string(), project_description);
        vars.insert("previous_context".to_string(), previous_context);
        vars.insert("question_count".to_string(), question_count.to_string());

        let (system_prompt, user_prompt) = template
            .render_full(&vars)
            .map_err(|e| anyhow::anyhow!(e))?;

        let mut prompt = String::new();
        if let Some(system) = system_prompt {
            prompt.push_str(&system);
            prompt.push_str("\n\n");
        }
        prompt.push_str(&user_prompt);
        prompt.push_str(
            "\n\nReturn ONLY strict JSON in this shape:\n{\"questions\":[{\"question\":\"...\",\"category\":\"scope\",\"importance\":\"critical\",\"context\":\"...\",\"suggestedAnswers\":[],\"required\":false}]}\n\nAllowed category values: scope, technical, design, testing, deployment, security, performance, userExperience, data, integration.\nAllowed importance values: niceToHave, important, critical.",
        );

        let request = ExecutionRequest::new(
            runner.platform(),
            model.to_string(),
            prompt,
            working_directory.to_path_buf(),
        )
        .with_timeout(Duration::from_millis(180_000))
        .with_plan_mode(true);

        let start = Instant::now();
        let exec = match runner.execute(&request).await {
            Ok(r) => r,
            Err(err) => {
                warn!("AI interview execution failed: {err}");
                return Self::generate_questions(requirements);
            }
        };
        let duration_ms = exec
            .duration_ms
            .unwrap_or_else(|| start.elapsed().as_millis() as u64);

        // Track usage (best-effort)
        let mut event = UsageEvent::new(runner.platform())
            .with_model(model.to_string())
            .with_duration(duration_ms)
            .with_success(exec.success);
        if let Some(tokens) = exec.tokens_used {
            event = event.with_tokens(0, tokens);
        }
        if !exec.success {
            event = event.with_error(exec.error_message.clone().unwrap_or_else(|| "AI interview failed".to_string()));
        }
        if let Some(tracker) = usage_tracker {
            let _ = tracker.track(event).await;
        } else if let Ok(tracker) = UsageTracker::default_location() {
            let _ = tracker.track(event).await;
        }

        if !exec.success {
            warn!("AI interview returned unsuccessful result; using heuristic fallback");
            return Self::generate_questions(requirements);
        }

        let Some(raw_output) = exec.output.as_deref() else {
            warn!("AI interview produced no output; using heuristic fallback");
            return Self::generate_questions(requirements);
        };

        let response_text = extract_platform_response_text(raw_output);

        // Prefer structured JSON payload.
        if let Ok(payload) = parse_json_fragment::<AiInterviewPayload>(&response_text) {
            return Ok(Self::build_interview_result(payload.questions));
        }

        // Fallback: parse line-based "Q:" output.
        let questions = parse_line_questions(&response_text);
        if questions.is_empty() {
            warn!("AI interview output could not be parsed; using heuristic fallback");
            return Self::generate_questions(requirements);
        }

        Ok(Self::build_interview_result(questions))
    }

    fn build_interview_result(questions: Vec<InterviewQuestion>) -> InterviewResult {
        let mut questions_by_category: HashMap<QuestionCategory, Vec<InterviewQuestion>> =
            HashMap::new();

        for q in &questions {
            questions_by_category.entry(q.category).or_default().push(q.clone());
        }

        let critical_count = questions
            .iter()
            .filter(|q| q.importance == Importance::Critical)
            .count();

        InterviewResult {
            total_questions: questions.len(),
            questions_by_category,
            questions,
            critical_count,
        }
    }

    /// Generate foundational questions about the project.
    fn generate_foundational_questions(project_name: &str) -> Vec<InterviewQuestion> {
        vec![
            InterviewQuestion {
                question: format!(
                    "What is the primary goal of the {} project?",
                    project_name
                ),
                category: QuestionCategory::Scope,
                importance: Importance::Critical,
                context: "Understanding the primary goal helps focus all implementation decisions".to_string(),
                suggested_answers: vec![],
                required: true,
            },
            InterviewQuestion {
                question: "Who are the target users or audience for this project?".to_string(),
                category: QuestionCategory::Scope,
                importance: Importance::Critical,
                context: "Knowing the users helps prioritize features and design decisions".to_string(),
                suggested_answers: vec![
                    "Developers".to_string(),
                    "End users".to_string(),
                    "Internal team".to_string(),
                    "External customers".to_string(),
                ],
                required: true,
            },
            InterviewQuestion {
                question: "What is the expected timeline for this project?".to_string(),
                category: QuestionCategory::Scope,
                importance: Importance::Important,
                context: "Timeline affects complexity and feature prioritization".to_string(),
                suggested_answers: vec![
                    "Days".to_string(),
                    "Weeks".to_string(),
                    "Months".to_string(),
                    "Ongoing".to_string(),
                ],
                required: false,
            },
            InterviewQuestion {
                question: "What are the critical success criteria for this project?".to_string(),
                category: QuestionCategory::Scope,
                importance: Importance::Critical,
                context: "Success criteria define when the project is complete".to_string(),
                suggested_answers: vec![],
                required: true,
            },
        ]
    }

    /// Analyze a requirements section for missing information.
    fn analyze_section_for_questions(
        section: &RequirementsSection,
    ) -> Result<Vec<InterviewQuestion>> {
        debug!("Analyzing section: {}", section.title);
        
        let mut questions = Vec::new();
        let content_lower = section.content.to_lowercase();

        // Check for vague terms
        if content_lower.contains("should") || content_lower.contains("could") {
            questions.push(InterviewQuestion {
                question: format!(
                    "In '{}', which requirements are mandatory vs optional?",
                    section.title
                ),
                category: QuestionCategory::Scope,
                importance: Importance::Important,
                context: "Distinguishing mandatory from optional helps prioritize work".to_string(),
                suggested_answers: vec![],
                required: false,
            });
        }

        // Check for performance mentions without specifics
        if content_lower.contains("fast") || content_lower.contains("performance") {
            questions.push(InterviewQuestion {
                question: format!(
                    "What are the specific performance requirements for '{}'?",
                    section.title
                ),
                category: QuestionCategory::Performance,
                importance: Importance::Important,
                context: "Specific performance targets enable proper testing and validation".to_string(),
                suggested_answers: vec![],
                required: false,
            });
        }

        // Check for security mentions
        if content_lower.contains("secure") || content_lower.contains("security") {
            questions.push(InterviewQuestion {
                question: format!(
                    "What are the security requirements for '{}'?",
                    section.title
                ),
                category: QuestionCategory::Security,
                importance: Importance::Critical,
                context: "Security requirements must be explicit and testable".to_string(),
                suggested_answers: vec![
                    "Authentication required".to_string(),
                    "Authorization/permissions".to_string(),
                    "Data encryption".to_string(),
                    "Audit logging".to_string(),
                ],
                required: false,
            });
        }

        // Check for data storage mentions
        if content_lower.contains("data") || content_lower.contains("store") {
            questions.push(InterviewQuestion {
                question: format!(
                    "What data needs to be persisted for '{}'? What is the expected data volume?",
                    section.title
                ),
                category: QuestionCategory::Data,
                importance: Importance::Important,
                context: "Data requirements affect architecture and storage decisions".to_string(),
                suggested_answers: vec![],
                required: false,
            });
        }

        // Check for integration mentions
        if content_lower.contains("integrate") || content_lower.contains("api") {
            questions.push(InterviewQuestion {
                question: format!(
                    "What external systems or APIs does '{}' need to integrate with?",
                    section.title
                ),
                category: QuestionCategory::Integration,
                importance: Importance::Important,
                context: "Integration points are critical for architecture design".to_string(),
                suggested_answers: vec![],
                required: false,
            });
        }

        Ok(questions)
    }

    /// Generate technical implementation questions.
    fn generate_technical_questions() -> Vec<InterviewQuestion> {
        vec![
            InterviewQuestion {
                question: "What programming languages and frameworks should be used?".to_string(),
                category: QuestionCategory::Technical,
                importance: Importance::Critical,
                context: "Technology stack affects all implementation decisions".to_string(),
                suggested_answers: vec![],
                required: true,
            },
            InterviewQuestion {
                question: "Are there any existing systems or codebases to integrate with?".to_string(),
                category: QuestionCategory::Technical,
                importance: Importance::Important,
                context: "Existing systems constrain design and require compatibility".to_string(),
                suggested_answers: vec![],
                required: false,
            },
            InterviewQuestion {
                question: "What are the target platforms? (Web, Mobile, Desktop, etc.)".to_string(),
                category: QuestionCategory::Technical,
                importance: Importance::Critical,
                context: "Target platforms determine build tooling and architecture".to_string(),
                suggested_answers: vec![
                    "Web Browser".to_string(),
                    "iOS".to_string(),
                    "Android".to_string(),
                    "Windows".to_string(),
                    "macOS".to_string(),
                    "Linux".to_string(),
                ],
                required: true,
            },
        ]
    }

    /// Generate testing and quality questions.
    fn generate_testing_questions() -> Vec<InterviewQuestion> {
        vec![
            InterviewQuestion {
                question: "What level of test coverage is required?".to_string(),
                category: QuestionCategory::Testing,
                importance: Importance::Important,
                context: "Test coverage targets affect test development effort".to_string(),
                suggested_answers: vec![
                    "Basic smoke tests".to_string(),
                    "80% coverage".to_string(),
                    "90%+ coverage".to_string(),
                    "Critical paths only".to_string(),
                ],
                required: false,
            },
            InterviewQuestion {
                question: "What types of testing are needed? (Unit, Integration, E2E, etc.)".to_string(),
                category: QuestionCategory::Testing,
                importance: Importance::Important,
                context: "Different test types require different infrastructure".to_string(),
                suggested_answers: vec![
                    "Unit tests".to_string(),
                    "Integration tests".to_string(),
                    "End-to-end tests".to_string(),
                    "Performance tests".to_string(),
                ],
                required: false,
            },
            InterviewQuestion {
                question: "Are there specific quality gates or approval processes?".to_string(),
                category: QuestionCategory::Testing,
                importance: Importance::Important,
                context: "Quality gates determine when work is considered complete".to_string(),
                suggested_answers: vec![],
                required: false,
            },
        ]
    }

    /// Generate deployment and operations questions.
    fn generate_deployment_questions() -> Vec<InterviewQuestion> {
        vec![
            InterviewQuestion {
                question: "What is the target deployment environment?".to_string(),
                category: QuestionCategory::Deployment,
                importance: Importance::Critical,
                context: "Deployment environment affects build and configuration".to_string(),
                suggested_answers: vec![
                    "Cloud (AWS/Azure/GCP)".to_string(),
                    "On-premise servers".to_string(),
                    "Containers (Docker/K8s)".to_string(),
                    "Serverless".to_string(),
                    "Desktop application".to_string(),
                ],
                required: true,
            },
            InterviewQuestion {
                question: "What is the expected deployment frequency?".to_string(),
                category: QuestionCategory::Deployment,
                importance: Importance::Important,
                context: "Deployment frequency affects CI/CD requirements".to_string(),
                suggested_answers: vec![
                    "Continuous deployment".to_string(),
                    "Daily".to_string(),
                    "Weekly".to_string(),
                    "Monthly".to_string(),
                ],
                required: false,
            },
            InterviewQuestion {
                question: "What monitoring and logging capabilities are needed?".to_string(),
                category: QuestionCategory::Deployment,
                importance: Importance::Important,
                context: "Monitoring helps detect and diagnose production issues".to_string(),
                suggested_answers: vec![
                    "Basic logs".to_string(),
                    "Metrics and alerts".to_string(),
                    "Distributed tracing".to_string(),
                    "Error tracking".to_string(),
                ],
                required: false,
            },
        ]
    }

    /// Format questions as a prompt for the AI.
    pub fn format_as_prompt(result: &InterviewResult) -> String {
        let mut prompt = String::from("# Requirements Clarification Questions\n\n");
        prompt.push_str(&format!("Total Questions: {}\n", result.total_questions));
        prompt.push_str(&format!("Critical Questions: {}\n\n", result.critical_count));

        // Group by category
        for (category, questions) in &result.questions_by_category {
            prompt.push_str(&format!("## {} Questions\n\n", category));

            for (idx, question) in questions.iter().enumerate() {
                let importance_marker = match question.importance {
                    Importance::Critical => "🔴 CRITICAL",
                    Importance::Important => "🟡 IMPORTANT",
                    Importance::NiceToHave => "🟢 NICE TO HAVE",
                };

                prompt.push_str(&format!("{}. {} {}\n", idx + 1, importance_marker, question.question));
                prompt.push_str(&format!("   Context: {}\n", question.context));

                if !question.suggested_answers.is_empty() {
                    prompt.push_str("   Suggested answers:\n");
                    for answer in &question.suggested_answers {
                        prompt.push_str(&format!("   - {}\n", answer));
                    }
                }

                prompt.push('\n');
            }
        }

        prompt
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_foundational_questions() {
        let questions = RequirementsInterviewer::generate_foundational_questions("TestProject");
        assert!(!questions.is_empty());
        assert!(questions.iter().any(|q| q.importance == Importance::Critical));
    }

    #[test]
    fn test_analyze_section_with_performance() {
        let section = RequirementsSection::new(
            "Performance",
            "System must be fast and responsive"
        );

        let questions = RequirementsInterviewer::analyze_section_for_questions(&section).unwrap();
        assert!(questions.iter().any(|q| q.category == QuestionCategory::Performance));
    }

    #[test]
    fn test_analyze_section_with_security() {
        let section = RequirementsSection::new(
            "Security",
            "System must be secure and protect user data"
        );

        let questions = RequirementsInterviewer::analyze_section_for_questions(&section).unwrap();
        assert!(questions.iter().any(|q| q.category == QuestionCategory::Security));
    }

    #[test]
    fn test_generate_questions() {
        let requirements = ParsedRequirements::new("TestProject")
            .with_section(RequirementsSection::new(
                "Feature 1",
                "System should handle user authentication"
            ));

        let result = RequirementsInterviewer::generate_questions(&requirements).unwrap();
        assert!(result.total_questions > 0);
        assert!(result.critical_count > 0);
    }

    #[test]
    fn test_format_as_prompt() {
        let mut result = InterviewResult {
            questions: vec![],
            questions_by_category: HashMap::new(),
            total_questions: 1,
            critical_count: 1,
        };

        let question = InterviewQuestion {
            question: "Test question?".to_string(),
            category: QuestionCategory::Scope,
            importance: Importance::Critical,
            context: "Test context".to_string(),
            suggested_answers: vec!["Answer 1".to_string()],
            required: true,
        };

        result.questions.push(question.clone());
        result.questions_by_category.insert(QuestionCategory::Scope, vec![question]);

        let prompt = RequirementsInterviewer::format_as_prompt(&result);
        assert!(prompt.contains("Test question?"));
        assert!(prompt.contains("CRITICAL"));
    }

    #[test]
    fn test_question_category_display() {
        assert_eq!(QuestionCategory::Scope.to_string(), "Scope");
        assert_eq!(QuestionCategory::Security.to_string(), "Security");
    }

    #[test]
    fn test_importance_ordering() {
        assert!(Importance::Critical > Importance::Important);
        assert!(Importance::Important > Importance::NiceToHave);
    }
}
