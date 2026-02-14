//! Manages interview phases and tracks progress through domain categories.

use serde::{Deserialize, Serialize};

/// Definition of a single interview phase.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InterviewPhaseDefinition {
    /// Stable identifier (e.g. `"scope_goals"`).
    pub id: String,
    /// Domain category (e.g. `"Scope & Goals"`).
    pub domain: String,
    /// Human-readable name.
    pub name: String,
    /// Description of what this phase covers.
    pub description: String,
    /// Minimum number of questions before phase can complete.
    pub min_questions: usize,
    /// Maximum questions before the AI should wrap up.
    pub max_questions: usize,
}

/// Manages the ordered list of interview phases and the current position.
pub struct PhaseManager {
    phases: Vec<InterviewPhaseDefinition>,
    current_index: usize,
}

impl PhaseManager {
    /// Creates a new `PhaseManager` pre-populated with the 8 standard domain phases.
    pub fn new() -> Self {
        Self {
            phases: default_phases(),
            current_index: 0,
        }
    }

    /// Returns a reference to all phase definitions.
    pub fn phases(&self) -> &[InterviewPhaseDefinition] {
        &self.phases
    }

    /// Returns the current phase index (0-based).
    pub fn current_index(&self) -> usize {
        self.current_index
    }

    /// Returns the current phase definition, or `None` if all phases are done.
    pub fn current_phase(&self) -> Option<&InterviewPhaseDefinition> {
        self.phases.get(self.current_index)
    }

    /// Advances to the next phase. Returns `true` if there is a next phase,
    /// `false` if all phases are complete.
    pub fn advance(&mut self) -> bool {
        if self.current_index + 1 < self.phases.len() {
            self.current_index += 1;
            true
        } else {
            false
        }
    }

    /// Sets the current phase index directly (e.g. when resuming from saved state).
    pub fn set_index(&mut self, index: usize) {
        self.current_index = index.min(self.phases.len().saturating_sub(1));
    }

    /// Returns `true` if all phases have been completed.
    pub fn is_complete(&self) -> bool {
        self.current_index >= self.phases.len()
    }

    /// Marks the current phase as complete and advances the index past the last phase
    /// if this was the final one.
    pub fn mark_current_complete(&mut self) {
        if self.current_index < self.phases.len() {
            self.current_index += 1;
        }
    }

    /// Returns the total number of phases.
    pub fn total_phases(&self) -> usize {
        self.phases.len()
    }

    /// Adds a dynamic feature-specific phase to the end of the list.
    pub fn add_dynamic_phase(&mut self, id: &str, name: &str, description: &str) {
        self.phases.push(InterviewPhaseDefinition {
            id: id.to_string(),
            domain: format!("Feature: {name}"),
            name: name.to_string(),
            description: description.to_string(),
            min_questions: 3,
            max_questions: 8,
        });
    }

    /// Returns the dynamic phases (Phase 9+) as a Vec.
    pub fn dynamic_phases(&self) -> Vec<InterviewPhaseDefinition> {
        if self.phases.len() > 8 {
            self.phases[8..].to_vec()
        } else {
            Vec::new()
        }
    }

    /// Restores dynamic phases from saved state.
    pub fn restore_dynamic_phases(&mut self, dynamic_phases: Vec<InterviewPhaseDefinition>) {
        // Remove any existing dynamic phases first
        self.phases.truncate(8);
        // Add the restored dynamic phases
        self.phases.extend(dynamic_phases);
    }
}

impl Default for PhaseManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Returns the 8 standard category-domain phase definitions.
fn default_phases() -> Vec<InterviewPhaseDefinition> {
    vec![
        InterviewPhaseDefinition {
            id: "scope_goals".to_string(),
            domain: "Scope & Goals".to_string(),
            name: "Scope & Goals".to_string(),
            description: "Project purpose, users, success criteria, MVP boundaries, non-goals."
                .to_string(),
            min_questions: 3,
            max_questions: 8,
        },
        InterviewPhaseDefinition {
            id: "architecture_technology".to_string(),
            domain: "Architecture & Technology".to_string(),
            name: "Architecture & Technology".to_string(),
            description:
                "Tech stack, versions, frameworks, rendering approach, dependency consistency."
                    .to_string(),
            min_questions: 3,
            max_questions: 8,
        },
        InterviewPhaseDefinition {
            id: "product_ux".to_string(),
            domain: "Product / UX".to_string(),
            name: "Product / UX".to_string(),
            description: "User workflows, screens, accessibility, edge cases.".to_string(),
            min_questions: 3,
            max_questions: 8,
        },
        InterviewPhaseDefinition {
            id: "data_persistence".to_string(),
            domain: "Data & Persistence".to_string(),
            name: "Data & Persistence".to_string(),
            description: "Storage technology, schema, migrations, backup, retention.".to_string(),
            min_questions: 3,
            max_questions: 8,
        },
        InterviewPhaseDefinition {
            id: "security_secrets".to_string(),
            domain: "Security & Secrets".to_string(),
            name: "Security & Secrets".to_string(),
            description: "Authentication, encryption, credential management, threat model."
                .to_string(),
            min_questions: 3,
            max_questions: 8,
        },
        InterviewPhaseDefinition {
            id: "deployment_environments".to_string(),
            domain: "Deployment & Environments".to_string(),
            name: "Deployment & Environments".to_string(),
            description: "Targets, CI/CD, config management, platform support.".to_string(),
            min_questions: 3,
            max_questions: 8,
        },
        InterviewPhaseDefinition {
            id: "performance_reliability".to_string(),
            domain: "Performance & Reliability".to_string(),
            name: "Performance & Reliability".to_string(),
            description: "Latency targets, retry logic, failover, error handling.".to_string(),
            min_questions: 3,
            max_questions: 8,
        },
        InterviewPhaseDefinition {
            id: "testing_verification".to_string(),
            domain: "Testing & Verification".to_string(),
            name: "Testing & Verification".to_string(),
            description:
                "Test strategy, Playwright requirements, coverage goals, acceptance criteria."
                    .to_string(),
            min_questions: 3,
            max_questions: 8,
        },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_phases() {
        let pm = PhaseManager::new();
        assert_eq!(pm.total_phases(), 8);
        assert_eq!(pm.current_index(), 0);
        assert!(!pm.is_complete());
    }

    #[test]
    fn test_advance_through_phases() {
        let mut pm = PhaseManager::new();
        for i in 0..7 {
            assert_eq!(pm.current_index(), i);
            assert!(pm.advance());
        }
        // At index 7 (last phase), advance returns false
        assert!(!pm.advance());
    }

    #[test]
    fn test_mark_complete() {
        let mut pm = PhaseManager::new();
        pm.set_index(7);
        assert_eq!(pm.current_phase().unwrap().id, "testing_verification");
        pm.mark_current_complete();
        assert!(pm.is_complete());
    }

    #[test]
    fn test_add_dynamic_phase() {
        let mut pm = PhaseManager::new();
        assert_eq!(pm.total_phases(), 8);
        pm.add_dynamic_phase("feature_auth", "Authentication", "Auth deep dive");
        assert_eq!(pm.total_phases(), 9);
        assert_eq!(pm.phases()[8].id, "feature_auth");
    }

    #[test]
    fn test_dynamic_phases_extraction() {
        let mut pm = PhaseManager::new();
        assert_eq!(pm.dynamic_phases().len(), 0);
        
        pm.add_dynamic_phase("feature_auth", "Authentication", "Auth deep dive");
        pm.add_dynamic_phase("feature_api", "API", "API design");
        
        let dynamic = pm.dynamic_phases();
        assert_eq!(dynamic.len(), 2);
        assert_eq!(dynamic[0].id, "feature_auth");
        assert_eq!(dynamic[1].id, "feature_api");
    }

    #[test]
    fn test_restore_dynamic_phases() {
        let mut pm = PhaseManager::new();
        
        // Add some dynamic phases
        pm.add_dynamic_phase("feature_auth", "Authentication", "Auth deep dive");
        pm.add_dynamic_phase("feature_api", "API", "API design");
        
        // Extract them
        let dynamic = pm.dynamic_phases();
        assert_eq!(pm.total_phases(), 10);
        
        // Create a new phase manager and restore
        let mut pm2 = PhaseManager::new();
        assert_eq!(pm2.total_phases(), 8);
        pm2.restore_dynamic_phases(dynamic);
        assert_eq!(pm2.total_phases(), 10);
        assert_eq!(pm2.phases()[8].id, "feature_auth");
        assert_eq!(pm2.phases()[9].id, "feature_api");
    }

    #[test]
    fn test_set_index_clamped() {
        let mut pm = PhaseManager::new();
        pm.set_index(100);
        assert_eq!(pm.current_index(), 7);
    }

    #[test]
    fn test_current_phase() {
        let pm = PhaseManager::new();
        let phase = pm.current_phase().unwrap();
        assert_eq!(phase.id, "scope_goals");
        assert_eq!(phase.min_questions, 3);
    }
}
