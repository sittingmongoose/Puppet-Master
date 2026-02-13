//! System prompts for each interview phase.
//!
//! Generates domain-specific prompts that instruct the AI to act as an
//! interviewer, using structured question markers and phase-completion
//! signals.

use super::question_parser::STRUCTURED_MARKERS;

/// Configuration passed to the prompt generator.
pub struct PromptConfig {
    /// The feature being planned.
    pub feature: String,
    /// Whether first-principles mode is enabled.
    pub first_principles: bool,
    /// Interaction mode (expert or eli5).
    pub interaction_mode: String,
    /// Optional existing-project scan context.
    pub project_context: Option<String>,
    /// Additional context file contents.
    pub context_content: Option<String>,
}

/// Domain focus description for each of the 8 category phases.
struct DomainTemplate {
    name: &'static str,
    focus: &'static str,
    key_questions: &'static str,
}

const DOMAIN_TEMPLATES: [DomainTemplate; 8] = [
    DomainTemplate {
        name: "Scope & Goals",
        focus: "Project purpose, target users, success criteria, MVP boundaries, and non-goals.",
        key_questions: "- What problem is this solving?\n\
             - Who are the primary users?\n\
             - What does success look like?\n\
             - What is in-scope for the MVP vs. future?\n\
             - What is explicitly out of scope?",
    },
    DomainTemplate {
        name: "Architecture & Technology",
        focus: "Tech stack, framework versions, rendering approach, dependency consistency, and build toolchain.",
        key_questions: "- Which programming languages and frameworks?\n\
             - What specific versions/editions? (MUST be pinned, NO 'latest')\n\
             - What rendering approach (e.g. GPU vs software)?\n\
             - Are all dependencies consistent and compatible?\n\
             - What is the build and packaging strategy?\n\
             - Have all technology versions been explicitly pinned?\n\
             - Are there known compatibility issues between versions?\n\
             - What is the upgrade strategy for dependencies?",
    },
    DomainTemplate {
        name: "Product / UX",
        focus: "User workflows, screens, navigation, accessibility, and edge cases.",
        key_questions: "- What are the main user workflows?\n\
             - What screens or views are needed?\n\
             - How does navigation work?\n\
             - What accessibility requirements exist?\n\
             - What edge cases should be handled?\n\
             - Is this a GUI application? If so, what framework?\n\
             - What are the UI/UX design patterns and guidelines?\n\
             - Are there mockups, wireframes, or design systems?\n\
             - What is the user experience for first-time vs. returning users?\n\
             - How is user feedback collected and displayed?",
    },
    DomainTemplate {
        name: "Data & Persistence",
        focus: "Storage technology, schema design, migrations, backup, and data retention.",
        key_questions: "- What data needs to be persisted?\n\
             - What storage technology (SQL, NoSQL, files)?\n\
             - What does the schema look like?\n\
             - How are migrations handled?\n\
             - What is the backup and retention strategy?",
    },
    DomainTemplate {
        name: "Security & Secrets",
        focus: "Authentication, authorization, encryption, credential management, and threat model.",
        key_questions: "- What authentication strategy?\n\
             - What authorization / role model?\n\
             - How are secrets and credentials managed?\n\
             - What data needs encryption?\n\
             - What is the threat model?",
    },
    DomainTemplate {
        name: "Deployment & Environments",
        focus: "Deployment targets, CI/CD, configuration management, and platform support.",
        key_questions: "- Where is this deployed (cloud, desktop, embedded)?\n\
             - What CI/CD pipeline?\n\
             - How is configuration managed per-environment?\n\
             - What platforms must be supported?\n\
             - What are the rollback and release strategies?",
    },
    DomainTemplate {
        name: "Performance & Reliability",
        focus: "Latency targets, retry logic, failover, error handling, and resource budgets.",
        key_questions: "- What are the latency / throughput targets?\n\
             - What retry and failover strategies?\n\
             - How are errors surfaced to users?\n\
             - What resource budgets (CPU, memory, bandwidth)?\n\
             - What is the uptime / SLA target?",
    },
    DomainTemplate {
        name: "Testing & Verification",
        focus: "Test strategy, Playwright requirements, coverage goals, and acceptance criteria.",
        key_questions: "- What test types are needed (unit, integration, E2E)?\n\
             - What coverage target?\n\
             - Are Playwright / browser tests required?\n\
             - What are the acceptance criteria?\n\
             - How is verification automated?",
    },
];

/// Generates the system prompt for a given interview phase.
///
/// # Arguments
/// * `config` - Interview configuration (feature name, first-principles flag, context).
/// * `phase_index` - Zero-based index into the 8 domain phases.
/// * `previous_docs` - Content from previously completed phase documents (for cross-reference).
pub fn generate_system_prompt(
    config: &PromptConfig,
    phase_index: usize,
    previous_docs: &[String],
) -> String {
    let domain = &DOMAIN_TEMPLATES[phase_index.min(DOMAIN_TEMPLATES.len() - 1)];
    let phase_number = phase_index + 1;

    let mut parts: Vec<String> = Vec::new();

    // Role definition
    parts.push(format!(
        "You are an expert requirements interviewer helping plan the following feature:\n\n\
         **Feature:** {}\n\n\
         You are currently in **Phase {phase_number} of 8: {}**.\n\n\
         Your job is to ask focused, precise questions about **{}** until you have \
         gathered enough information to produce a complete domain specification with \
         zero gaps or ambiguity.",
        config.feature, domain.name, domain.focus,
    ));

    // Interaction mode
    if config.interaction_mode.to_lowercase() == "eli5" {
        parts.push(
            "\n**ELI5 Mode:** Use simple language. For each question, include a brief explanation of what it means and why it matters. Define technical terms inline."
                .to_string(),
        );
    } else {
        parts.push(
            "\n**Expert Mode:** Be concise and technical. Avoid unnecessary explanations unless the user seems confused."
                .to_string(),
        );
    }

    // First-principles mode
    if config.first_principles {
        parts.push(
            "\n**First Principles Mode:** Before diving into details, challenge \
             the fundamental assumptions:\n\
             - What problem is this really solving?\n\
             - Is this the right approach?\n\
             - What are the core constraints and trade-offs?\n\
             - Are there simpler alternatives?"
                .to_string(),
        );
    }

    // Previous phase context
    if !previous_docs.is_empty() {
        parts.push("\n**Context from previous phases:**".to_string());
        for (i, doc) in previous_docs.iter().enumerate() {
            parts.push(format!("\n--- Phase {} ---\n{}", i + 1, doc));
        }
        parts.push(
            "\nUse the above as context. Do not re-ask questions already answered.".to_string(),
        );
    }

    // Existing-project scan context
    if let Some(ctx) = &config.project_context {
        parts.push(format!("\n**Existing project context:**\n{ctx}"));
    }

    // Additional context files / reference materials
    if let Some(ctx) = &config.context_content {
        parts.push(format!("\n**Reference materials / additional context:**\n{ctx}"));
    }

    // Domain-specific guidance
    parts.push(format!(
        "\n**Key areas to cover in this phase:**\n{}",
        domain.key_questions
    ));

    // Interview instructions
    parts.push(format!(
        "\n**Instructions:**\n\
         1. Ask 3-8 focused questions to cover the domain thoroughly.\n\
         2. Use structured questions when offering multiple-choice options.\n\
         3. Probe deeper when answers are vague or incomplete.\n\
         4. Track key decisions explicitly.\n\
         5. When you have gathered enough information, signal phase completion.\n\n\
         **Structured Question Format:**\n\
         When presenting options, use this EXACT format:\n\n\
         {qs}\n\
         {{\n  \
           \"header\": \"Short Label\",\n  \
           \"question\": \"Your question here?\",\n  \
           \"options\": [\n    \
             {{\"label\": \"Option A\", \"description\": \"Explanation\"}},\n    \
             {{\"label\": \"Option B\", \"description\": \"Explanation\"}}\n  \
           ],\n  \
           \"multiSelect\": false\n\
         }}\n\
         {qe}\n\n\
         **Phase Completion Format:**\n\
         When done, output:\n\n\
         {pcs}\n\
         {{\n  \
           \"phase\": \"{phase_id}\",\n  \
           \"summary\": \"What was covered\",\n  \
           \"decisions\": [\"Decision 1\", \"Decision 2\"],\n  \
           \"openItems\": [\"Item still TBD\"]\n\
         }}\n\
         {pce}\n\n\
         **Rules:**\n\
         - Output at most ONE structured block per response.\n\
         - You may include regular text before or after the block.\n\
         - Ask at least 3 questions before completing a phase.",
        qs = STRUCTURED_MARKERS.question_start,
        qe = STRUCTURED_MARKERS.question_end,
        pcs = STRUCTURED_MARKERS.phase_complete_start,
        pce = STRUCTURED_MARKERS.phase_complete_end,
        phase_id = domain_phase_id(phase_index),
    ));

    parts.join("\n")
}

/// Returns the phase domain names for listing purposes.
pub fn domain_phase_names() -> Vec<&'static str> {
    DOMAIN_TEMPLATES.iter().map(|d| d.name).collect()
}

/// Returns a stable identifier for a domain phase index (e.g. `"scope_goals"`).
pub fn domain_phase_id(index: usize) -> &'static str {
    match index {
        0 => "scope_goals",
        1 => "architecture_technology",
        2 => "product_ux",
        3 => "data_persistence",
        4 => "security_secrets",
        5 => "deployment_environments",
        6 => "performance_reliability",
        7 => "testing_verification",
        _ => "unknown",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_system_prompt_basic() {
        let config = PromptConfig {
            feature: "Login page".to_string(),
            first_principles: false,
            interaction_mode: "expert".to_string(),
            project_context: None,
            context_content: None,
        };

        let prompt = generate_system_prompt(&config, 0, &[]);
        assert!(prompt.contains("Login page"));
        assert!(prompt.contains("Scope & Goals"));
        assert!(prompt.contains("PM_QUESTION"));
        assert!(prompt.contains("PM_PHASE_COMPLETE"));
    }

    #[test]
    fn test_generate_system_prompt_first_principles() {
        let config = PromptConfig {
            feature: "Dashboard".to_string(),
            first_principles: true,
            interaction_mode: "expert".to_string(),
            project_context: None,
            context_content: None,
        };

        let prompt = generate_system_prompt(&config, 1, &[]);
        assert!(prompt.contains("First Principles"));
        assert!(prompt.contains("Architecture & Technology"));
    }

    #[test]
    fn test_generate_system_prompt_with_context() {
        let config = PromptConfig {
            feature: "API".to_string(),
            first_principles: false,
            interaction_mode: "expert".to_string(),
            project_context: None,
            context_content: Some("We use Rust.".to_string()),
        };

        let prev = vec!["Phase 1 defined scope as CLI tool.".to_string()];
        let prompt = generate_system_prompt(&config, 2, &prev);
        assert!(prompt.contains("We use Rust."));
        assert!(prompt.contains("Expert Mode"));
        assert!(prompt.contains("Phase 1 defined scope as CLI tool."));
        assert!(prompt.contains("Product / UX"));
    }

    #[test]
    fn test_domain_phase_names() {
        let names = domain_phase_names();
        assert_eq!(names.len(), 8);
        assert_eq!(names[0], "Scope & Goals");
        assert_eq!(names[7], "Testing & Verification");
    }

    #[test]
    fn test_domain_phase_id() {
        assert_eq!(domain_phase_id(0), "scope_goals");
        assert_eq!(domain_phase_id(7), "testing_verification");
        assert_eq!(domain_phase_id(99), "unknown");
    }
}
