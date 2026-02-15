//! Commit message formatter - generates structured commit messages

use crate::types::{ItemStatus, TierType};

// DRY:DATA:CommitFormatter
/// Formats commit messages according to RWM conventions
pub struct CommitFormatter;

impl CommitFormatter {
    // DRY:FN:format_commit
    /// Format a commit message for a tier
    ///
    /// Format: `ralph: [TIER_TYPE] {id}: {title} - {status}`
    ///
    /// # Arguments
    /// * `tier_type` - Type of tier (Phase, Task, Subtask)
    /// * `id` - Tier ID (e.g., PH-001, TK-001-002)
    /// * `title` - Brief description of the work
    /// * `status` - Current status
    pub fn format_commit(tier_type: TierType, id: &str, title: &str, status: ItemStatus) -> String {
        let tier_str = match tier_type {
            TierType::Phase => "PHASE",
            TierType::Task => "TASK",
            TierType::Subtask => "SUBTASK",
            TierType::Iteration => "ITERATION",
        };

        format!(
            "ralph: [{}] {}: {} - {}",
            tier_str,
            id,
            Self::sanitize_title(title),
            status
        )
    }

    // DRY:FN:format_gate_commit
    /// Format a gate commit message
    pub fn format_gate_commit(tier_type: TierType, id: &str, passed: bool) -> String {
        let tier_str = match tier_type {
            TierType::Phase => "PHASE",
            TierType::Task => "TASK",
            TierType::Subtask => "SUBTASK",
            TierType::Iteration => "ITERATION",
        };

        let result = if passed { "PASSED" } else { "FAILED" };

        format!("ralph: [{}] {} gate {}", tier_str, id, result)
    }

    // DRY:FN:format_iteration_commit
    /// Format an iteration commit message
    pub fn format_iteration_commit(subtask_id: &str, iteration: u32, success: bool) -> String {
        let result = if success { "completed" } else { "attempted" };
        format!(
            "ralph: [ITERATION] {} attempt {} {}",
            subtask_id, iteration, result
        )
    }

    // DRY:FN:format_checkpoint_commit
    /// Format a checkpoint commit
    pub fn format_checkpoint_commit(description: &str) -> String {
        format!("ralph: [CHECKPOINT] {}", Self::sanitize_title(description))
    }

    // DRY:FN:format_rollback_commit
    /// Format a rollback commit
    pub fn format_rollback_commit(target: &str, reason: &str) -> String {
        format!(
            "ralph: [ROLLBACK] to {} - {}",
            target,
            Self::sanitize_title(reason)
        )
    }

    /// Sanitize title for commit message (remove newlines, limit length)
    fn sanitize_title(title: &str) -> String {
        title
            .lines()
            .next()
            .unwrap_or(title)
            .trim()
            .chars()
            .take(80)
            .collect()
    }

    // DRY:FN:format_commit_body
    /// Generate detailed commit body
    pub fn format_commit_body(files_changed: &[String], notes: Option<&str>) -> String {
        let mut body = String::new();

        if !files_changed.is_empty() {
            body.push_str("\nFiles changed:\n");
            for file in files_changed {
                body.push_str(&format!("  - {}\n", file));
            }
        }

        if let Some(notes) = notes {
            body.push_str("\nNotes:\n");
            body.push_str(notes);
        }

        body
    }

    // DRY:FN:format_full_commit
    /// Generate full commit message with body
    pub fn format_full_commit(
        tier_type: TierType,
        id: &str,
        title: &str,
        status: ItemStatus,
        files_changed: &[String],
        notes: Option<&str>,
    ) -> String {
        let subject = Self::format_commit(tier_type, id, title, status);
        let body = Self::format_commit_body(files_changed, notes);

        if body.is_empty() {
            subject
        } else {
            format!("{}\n{}", subject, body)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_commit() {
        let msg = CommitFormatter::format_commit(
            TierType::Task,
            "TK-001-002",
            "Implement authentication",
            ItemStatus::Passed,
        );
        assert_eq!(
            msg,
            "ralph: [TASK] TK-001-002: Implement authentication - Passed"
        );
    }

    #[test]
    fn test_format_gate_commit() {
        let msg = CommitFormatter::format_gate_commit(TierType::Phase, "PH-001", true);
        assert_eq!(msg, "ralph: [PHASE] PH-001 gate PASSED");
    }

    #[test]
    fn test_format_iteration_commit() {
        let msg = CommitFormatter::format_iteration_commit("ST-001-001-001", 3, true);
        assert_eq!(msg, "ralph: [ITERATION] ST-001-001-001 attempt 3 completed");
    }

    #[test]
    fn test_sanitize_title() {
        let long = "a".repeat(100);
        let sanitized = CommitFormatter::sanitize_title(&long);
        assert_eq!(sanitized.len(), 80);

        let multiline = "First line\nSecond line";
        let sanitized = CommitFormatter::sanitize_title(multiline);
        assert_eq!(sanitized, "First line");
    }

    #[test]
    fn test_format_full_commit() {
        let msg = CommitFormatter::format_full_commit(
            TierType::Subtask,
            "ST-001-001-001",
            "Add login form",
            ItemStatus::Running,
            &["src/auth.rs".to_string(), "tests/auth_test.rs".to_string()],
            Some("Implemented basic form structure"),
        );

        assert!(msg.contains("ralph: [SUBTASK]"));
        assert!(msg.contains("Files changed:"));
        assert!(msg.contains("src/auth.rs"));
        assert!(msg.contains("Notes:"));
    }
}
