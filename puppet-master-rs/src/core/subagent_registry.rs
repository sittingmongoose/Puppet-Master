//! Subagent registry — single source of truth for all canonical subagent names.
//!
//! This module provides the canonical list of all subagent names, their categories,
//! and mapping functions for language/framework → subagent selection.
//!
//! # DRY Tags
//! - DRY:DATA:subagent_registry — Single source of truth for all subagent names
//! - DRY:FN:all_subagent_names — Get all canonical subagent names
//! - DRY:FN:get_subagent_for_language — Map language to subagent
//! - DRY:FN:get_subagent_for_framework — Map framework to subagent
//! - DRY:FN:is_valid_subagent_name — Validate subagent name
//! - DRY:FN:get_subagents_for_tier — Get subagents for tier type
//!
//! CONSUMERS: core/orchestrator, core/subagent_selector, interview/orchestrator,
//! all code that needs to select or validate subagent names.

use crate::types::TierType;

// ─── Canonical Subagent Names ────────────────────────────────────────────────

/// Phase-level subagents (planning, architecture, project management).
const PHASE_SUBAGENTS: &[&str] = &[
    "project-manager",
    "architect-reviewer",
    "product-manager",
];

/// Task-level subagents for language-specific work.
const TASK_LANGUAGE_SUBAGENTS: &[(&str, &str)] = &[
    ("rust", "rust-engineer"),
    ("python", "python-pro"),
    ("javascript", "javascript-pro"),
    ("typescript", "typescript-pro"),
    ("java", "java-architect"),
    ("go", "rust-engineer"), // Go uses Rust engineer (similar systems language)
    ("c", "rust-engineer"), // C uses Rust engineer (systems language)
    ("cpp", "rust-engineer"), // C++ uses Rust engineer (systems language)
    ("csharp", "csharp-developer"),
    ("swift", "swift-expert"),
    ("php", "php-pro"),
];

/// Task-level subagents for domain-specific work.
const TASK_DOMAIN_SUBAGENTS: &[(&str, &str)] = &[
    ("backend", "backend-developer"),
    ("frontend", "frontend-developer"),
    ("fullstack", "fullstack-developer"),
    ("mobile", "mobile-developer"),
    ("devops", "devops-engineer"),
    ("security", "security-engineer"),
    ("database", "database-administrator"),
    ("testing", "qa-expert"),
];

/// Task-level subagents for framework-specific work.
const TASK_FRAMEWORK_SUBAGENTS: &[(&str, &str)] = &[
    ("react", "react-specialist"),
    ("vue", "vue-expert"),
    ("nextjs", "nextjs-developer"),
    ("laravel", "laravel-specialist"),
    ("django", "python-pro"),
    ("flask", "python-pro"),
    ("express", "javascript-pro"),
    ("spring", "java-architect"),
    ("aspnet", "csharp-developer"),
    ("rails", "rust-engineer"), // Ruby on Rails — use general backend developer
];

/// Subtask-level subagents (implementation, testing, review).
const SUBTASK_SUBAGENTS: &[&str] = &[
    "code-reviewer",
    "test-automator",
    "security-auditor",
    "performance-engineer",
    "accessibility-tester",
    "compliance-auditor",
];

/// Iteration-level subagents (debugging, optimization).
const ITERATION_SUBAGENTS: &[&str] = &[
    "debugger",
    "performance-engineer",
];

// ─── Public API ─────────────────────────────────────────────────────────────

// DRY:FN:all_subagent_names — Get all canonical subagent names
/// Get all canonical subagent names.
/// 
/// This is the single source of truth for all valid subagent names.
/// Returns a flattened list of all subagent names across all tiers.
pub fn all_subagent_names() -> Vec<String> {
    let mut names = Vec::new();
    
    // Phase subagents
    names.extend(PHASE_SUBAGENTS.iter().map(|s| s.to_string()));
    
    // Task language subagents
    names.extend(TASK_LANGUAGE_SUBAGENTS.iter().map(|(_, s)| s.to_string()));
    
    // Task domain subagents
    names.extend(TASK_DOMAIN_SUBAGENTS.iter().map(|(_, s)| s.to_string()));
    
    // Task framework subagents
    names.extend(TASK_FRAMEWORK_SUBAGENTS.iter().map(|(_, s)| s.to_string()));
    
    // Subtask subagents
    names.extend(SUBTASK_SUBAGENTS.iter().map(|s| s.to_string()));
    
    // Iteration subagents
    names.extend(ITERATION_SUBAGENTS.iter().map(|s| s.to_string()));
    
    // Deduplicate (some subagents appear in multiple categories)
    names.sort();
    names.dedup();
    names
}

// DRY:FN:get_subagent_for_language — Map language to subagent
/// Get the recommended subagent for a programming language.
/// 
/// Returns `Some(subagent_name)` if a mapping exists, `None` otherwise.
/// This is the single source of truth for language → subagent mappings.
pub fn get_subagent_for_language(lang: &str) -> Option<String> {
    let lang_lower = lang.to_lowercase();
    TASK_LANGUAGE_SUBAGENTS
        .iter()
        .find(|(l, _)| l == &lang_lower)
        .map(|(_, subagent)| subagent.to_string())
}

// DRY:FN:get_subagent_for_framework — Map framework to subagent
/// Get the recommended subagent for a framework.
/// 
/// Returns `Some(subagent_name)` if a mapping exists, `None` otherwise.
/// This is the single source of truth for framework → subagent mappings.
pub fn get_subagent_for_framework(framework: &str) -> Option<String> {
    let framework_lower = framework.to_lowercase();
    TASK_FRAMEWORK_SUBAGENTS
        .iter()
        .find(|(f, _)| f == &framework_lower)
        .map(|(_, subagent)| subagent.to_string())
}

// DRY:FN:is_valid_subagent_name — Validate subagent name
/// Check if a subagent name is valid (exists in the canonical list).
/// 
/// This is the single source of truth for subagent name validation.
pub fn is_valid_subagent_name(name: &str) -> bool {
    all_subagent_names().contains(&name.to_string())
}

// DRY:FN:get_subagents_for_tier — Get subagents for tier type
/// Get the list of subagents available for a tier type.
/// 
/// Returns subagents that are appropriate for the given tier type.
pub fn get_subagents_for_tier(tier_type: TierType) -> Vec<String> {
    match tier_type {
        TierType::Phase => PHASE_SUBAGENTS.iter().map(|s| s.to_string()).collect(),
        TierType::Task => {
            // Task tier can use language, domain, or framework subagents
            let mut subagents = Vec::new();
            subagents.extend(TASK_LANGUAGE_SUBAGENTS.iter().map(|(_, s)| s.to_string()));
            subagents.extend(TASK_DOMAIN_SUBAGENTS.iter().map(|(_, s)| s.to_string()));
            subagents.extend(TASK_FRAMEWORK_SUBAGENTS.iter().map(|(_, s)| s.to_string()));
            // Deduplicate
            subagents.sort();
            subagents.dedup();
            subagents
        }
        TierType::Subtask => SUBTASK_SUBAGENTS.iter().map(|s| s.to_string()).collect(),
        TierType::Iteration => ITERATION_SUBAGENTS.iter().map(|s| s.to_string()).collect(),
    }
}

// DRY:FN:get_reviewer_subagent_for_tier — Get reviewer subagent for tier
/// Get the reviewer subagent name for a tier type.
/// 
/// Returns the canonical reviewer subagent name (typically "code-reviewer").
pub fn get_reviewer_subagent_for_tier(tier_type: TierType) -> Option<String> {
    match tier_type {
        TierType::Phase | TierType::Task | TierType::Subtask => {
            Some("code-reviewer".to_string())
        }
        TierType::Iteration => None, // Iterations don't have separate reviewers
    }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_subagent_names_not_empty() {
        let names = all_subagent_names();
        assert!(!names.is_empty(), "Should have at least some subagent names");
    }

    #[test]
    fn test_get_subagent_for_language() {
        assert_eq!(
            get_subagent_for_language("rust"),
            Some("rust-engineer".to_string())
        );
        assert_eq!(
            get_subagent_for_language("python"),
            Some("python-pro".to_string())
        );
        assert_eq!(
            get_subagent_for_language("javascript"),
            Some("javascript-pro".to_string())
        );
        assert_eq!(get_subagent_for_language("unknown"), None);
    }

    #[test]
    fn test_get_subagent_for_framework() {
        assert_eq!(
            get_subagent_for_framework("react"),
            Some("react-specialist".to_string())
        );
        assert_eq!(
            get_subagent_for_framework("vue"),
            Some("vue-expert".to_string())
        );
        assert_eq!(
            get_subagent_for_framework("nextjs"),
            Some("nextjs-developer".to_string())
        );
        assert_eq!(get_subagent_for_framework("unknown"), None);
    }

    #[test]
    fn test_is_valid_subagent_name() {
        assert!(is_valid_subagent_name("rust-engineer"));
        assert!(is_valid_subagent_name("code-reviewer"));
        assert!(is_valid_subagent_name("project-manager"));
        assert!(!is_valid_subagent_name("invalid-subagent"));
        assert!(!is_valid_subagent_name(""));
    }

    #[test]
    fn test_get_subagents_for_tier() {
        let phase_subagents = get_subagents_for_tier(TierType::Phase);
        assert!(phase_subagents.contains(&"project-manager".to_string()));
        assert!(phase_subagents.contains(&"architect-reviewer".to_string()));

        let task_subagents = get_subagents_for_tier(TierType::Task);
        assert!(task_subagents.contains(&"rust-engineer".to_string()));
        assert!(task_subagents.contains(&"backend-developer".to_string()));
        assert!(task_subagents.contains(&"react-specialist".to_string()));

        let subtask_subagents = get_subagents_for_tier(TierType::Subtask);
        assert!(subtask_subagents.contains(&"code-reviewer".to_string()));
        assert!(subtask_subagents.contains(&"test-automator".to_string()));

        let iteration_subagents = get_subagents_for_tier(TierType::Iteration);
        assert!(iteration_subagents.contains(&"debugger".to_string()));
    }

    #[test]
    fn test_get_reviewer_subagent_for_tier() {
        assert_eq!(
            get_reviewer_subagent_for_tier(TierType::Phase),
            Some("code-reviewer".to_string())
        );
        assert_eq!(
            get_reviewer_subagent_for_tier(TierType::Task),
            Some("code-reviewer".to_string())
        );
        assert_eq!(
            get_reviewer_subagent_for_tier(TierType::Subtask),
            Some("code-reviewer".to_string())
        );
        assert_eq!(get_reviewer_subagent_for_tier(TierType::Iteration), None);
    }

    #[test]
    fn test_all_subagent_names_deduplicated() {
        let names = all_subagent_names();
        let mut sorted = names.clone();
        sorted.sort();
        assert_eq!(names, sorted, "Names should be sorted");
        
        // Check for duplicates
        let mut seen = std::collections::HashSet::new();
        for name in &names {
            assert!(seen.insert(name), "Duplicate subagent name: {}", name);
        }
    }
}
