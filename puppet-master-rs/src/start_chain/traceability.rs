//! Requirements traceability matrix for tracking coverage.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::types::prd::PRD;

// DRY:DATA:TraceabilityLink
/// A link between a requirement and a PRD item.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TraceabilityLink {
    /// Requirement ID
    pub requirement_id: String,
    /// PRD item ID (phase, task, or subtask)
    pub prd_item_id: String,
    /// Type of PRD item
    pub item_type: TraceabilityItemType,
    /// Evidence references
    #[serde(default)]
    pub evidence_refs: Vec<String>,
    /// Test criteria associated with this link
    #[serde(default)]
    pub test_criteria: Vec<String>,
}

// DRY:DATA:TraceabilityItemType
/// Type of PRD item in traceability.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TraceabilityItemType {
    /// Phase-level item
    Phase,
    /// Task-level item
    Task,
    /// Subtask-level item
    Subtask,
}

// DRY:DATA:CoverageStatus
/// Coverage status for a requirement.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum CoverageStatus {
    /// No PRD items covering this requirement
    Uncovered,
    /// Partially covered (some but not all aspects)
    Partial,
    /// Fully covered by PRD items
    Complete,
    /// Covered and tested
    Verified,
}

// DRY:DATA:TraceabilityMatrix
/// Traceability matrix for requirements coverage.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TraceabilityMatrix {
    /// All traceability links
    pub links: Vec<TraceabilityLink>,
    /// Map from requirement ID to PRD item IDs
    #[serde(skip)]
    requirement_to_items: HashMap<String, Vec<String>>,
    /// Map from PRD item ID to requirement IDs
    #[serde(skip)]
    item_to_requirements: HashMap<String, Vec<String>>,
}

impl TraceabilityMatrix {
    // DRY:FN:new
    /// Creates a new empty traceability matrix.
    pub fn new() -> Self {
        Self {
            links: Vec::new(),
            requirement_to_items: HashMap::new(),
            item_to_requirements: HashMap::new(),
        }
    }

    // DRY:FN:add_link
    /// Adds a link between a requirement and a PRD item.
    pub fn add_link(&mut self, link: TraceabilityLink) {
        // Update forward mapping
        self.requirement_to_items
            .entry(link.requirement_id.clone())
            .or_default()
            .push(link.prd_item_id.clone());

        // Update reverse mapping
        self.item_to_requirements
            .entry(link.prd_item_id.clone())
            .or_default()
            .push(link.requirement_id.clone());

        self.links.push(link);
    }

    // DRY:FN:get_coverage
    /// Returns all PRD items covering a requirement.
    pub fn get_coverage(&self, requirement_id: &str) -> Vec<&TraceabilityLink> {
        self.links
            .iter()
            .filter(|link| link.requirement_id == requirement_id)
            .collect()
    }

    // DRY:FN:get_requirements_for_item
    /// Returns all requirements covered by a PRD item.
    pub fn get_requirements_for_item(&self, prd_item_id: &str) -> Vec<&TraceabilityLink> {
        self.links
            .iter()
            .filter(|link| link.prd_item_id == prd_item_id)
            .collect()
    }

    // DRY:FN:find_untested
    /// Finds all untested requirements.
    pub fn find_untested(&self) -> Vec<String> {
        let mut untested = Vec::new();

        // Group links by requirement
        let mut by_requirement: HashMap<String, Vec<&TraceabilityLink>> = HashMap::new();
        for link in &self.links {
            by_requirement
                .entry(link.requirement_id.clone())
                .or_default()
                .push(link);
        }

        // Check each requirement for test coverage
        for (req_id, links) in by_requirement {
            let has_tests = links.iter().any(|link| !link.test_criteria.is_empty());
            if !has_tests {
                untested.push(req_id);
            }
        }

        untested
    }

    // DRY:FN:find_uncovered
    /// Returns requirements with no PRD coverage.
    pub fn find_uncovered(&self, all_requirement_ids: &[String]) -> Vec<String> {
        all_requirement_ids
            .iter()
            .filter(|id| !self.requirement_to_items.contains_key(*id))
            .cloned()
            .collect()
    }

    // DRY:FN:coverage_status
    /// Calculates coverage status for a requirement.
    pub fn coverage_status(&self, requirement_id: &str) -> CoverageStatus {
        let links = self.get_coverage(requirement_id);

        if links.is_empty() {
            return CoverageStatus::Uncovered;
        }

        let has_tests = links.iter().any(|link| !link.test_criteria.is_empty());
        let has_evidence = links.iter().any(|link| !link.evidence_refs.is_empty());

        if has_evidence && has_tests {
            CoverageStatus::Verified
        } else if has_tests {
            CoverageStatus::Complete
        } else {
            CoverageStatus::Partial
        }
    }

    // DRY:FN:to_markdown
    /// Exports the matrix as a markdown table.
    pub fn to_markdown(&self) -> String {
        let mut md = String::from("# Requirements Traceability Matrix\n\n");
        md.push_str("| Requirement ID | PRD Item ID | Item Type | Test Criteria | Evidence |\n");
        md.push_str("|----------------|-------------|-----------|---------------|----------|\n");

        for link in &self.links {
            let item_type = match link.item_type {
                TraceabilityItemType::Phase => "Phase",
                TraceabilityItemType::Task => "Task",
                TraceabilityItemType::Subtask => "Subtask",
            };
            let test_count = link.test_criteria.len();
            let evidence_count = link.evidence_refs.len();

            md.push_str(&format!(
                "| {} | {} | {} | {} | {} |\n",
                link.requirement_id, link.prd_item_id, item_type, test_count, evidence_count
            ));
        }

        md
    }

    // DRY:FN:to_json
    /// Exports the matrix as JSON.
    pub fn to_json(&self) -> Result<String, String> {
        serde_json::to_string_pretty(self).map_err(|e| format!("Failed to serialize: {}", e))
    }

    // DRY:FN:from_prd
    /// Builds a traceability matrix from a PRD.
    /// Note: This implementation assumes requirement IDs are embedded in descriptions or titles.
    /// For production use, you'd want a proper source_refs field in the PRD schema.
    pub fn from_prd(prd: &PRD, requirement_ids: &[String]) -> Self {
        let mut matrix = Self::new();

        // Process phases - check if IDs appear in title or description
        for phase in &prd.phases {
            for req_id in requirement_ids {
                let matches_in_title = phase.title.contains(req_id);
                let matches_in_desc = phase
                    .description
                    .as_ref()
                    .map_or(false, |d| d.contains(req_id));

                if matches_in_title || matches_in_desc {
                    matrix.add_link(TraceabilityLink {
                        requirement_id: req_id.clone(),
                        prd_item_id: phase.id.clone(),
                        item_type: TraceabilityItemType::Phase,
                        evidence_refs: Vec::new(), // No evidence_refs in current schema
                        test_criteria: Vec::new(), // Phases don't have acceptance_criteria
                    });
                }
            }

            // Process tasks
            for task in &phase.tasks {
                for req_id in requirement_ids {
                    let matches_in_title = task.title.contains(req_id);
                    let matches_in_desc = task
                        .description
                        .as_ref()
                        .map_or(false, |d| d.contains(req_id));

                    if matches_in_title || matches_in_desc {
                        matrix.add_link(TraceabilityLink {
                            requirement_id: req_id.clone(),
                            prd_item_id: task.id.clone(),
                            item_type: TraceabilityItemType::Task,
                            evidence_refs: Vec::new(),
                            test_criteria: Vec::new(), // Tasks don't have acceptance_criteria
                        });
                    }
                }

                // Process subtasks
                for subtask in &task.subtasks {
                    for req_id in requirement_ids {
                        let matches_in_title = subtask.title.contains(req_id);
                        let matches_in_desc = subtask
                            .description
                            .as_ref()
                            .map_or(false, |d| d.contains(req_id));

                        if matches_in_title || matches_in_desc {
                            matrix.add_link(TraceabilityLink {
                                requirement_id: req_id.clone(),
                                prd_item_id: subtask.id.clone(),
                                item_type: TraceabilityItemType::Subtask,
                                evidence_refs: Vec::new(),
                                test_criteria: subtask.acceptance_criteria.clone(),
                            });
                        }
                    }
                }
            }
        }

        matrix
    }

    // DRY:FN:stats
    /// Returns coverage statistics.
    pub fn stats(&self, all_requirement_ids: &[String]) -> TraceabilityStats {
        let covered_count = all_requirement_ids
            .iter()
            .filter(|id| self.requirement_to_items.contains_key(*id))
            .count();

        let tested_count = all_requirement_ids
            .iter()
            .filter(|id| {
                let links = self.get_coverage(id);
                links.iter().any(|link| !link.test_criteria.is_empty())
            })
            .count();

        let verified_count = all_requirement_ids
            .iter()
            .filter(|id| {
                let links = self.get_coverage(id);
                links
                    .iter()
                    .any(|link| !link.test_criteria.is_empty() && !link.evidence_refs.is_empty())
            })
            .count();

        TraceabilityStats {
            total_requirements: all_requirement_ids.len(),
            covered_requirements: covered_count,
            tested_requirements: tested_count,
            verified_requirements: verified_count,
            total_links: self.links.len(),
        }
    }
}

impl Default for TraceabilityMatrix {
    fn default() -> Self {
        Self::new()
    }
}

// DRY:DATA:TraceabilityStats
/// Statistics about traceability coverage.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TraceabilityStats {
    /// Total number of requirements
    pub total_requirements: usize,
    /// Requirements with at least one PRD item
    pub covered_requirements: usize,
    /// Requirements with test criteria
    pub tested_requirements: usize,
    /// Requirements with evidence
    pub verified_requirements: usize,
    /// Total number of traceability links
    pub total_links: usize,
}

impl TraceabilityStats {
    // DRY:FN:coverage_percent
    /// Returns coverage percentage.
    pub fn coverage_percent(&self) -> f32 {
        if self.total_requirements == 0 {
            return 0.0;
        }
        (self.covered_requirements as f32 / self.total_requirements as f32) * 100.0
    }

    // DRY:FN:test_coverage_percent
    /// Returns test coverage percentage.
    pub fn test_coverage_percent(&self) -> f32 {
        if self.total_requirements == 0 {
            return 0.0;
        }
        (self.tested_requirements as f32 / self.total_requirements as f32) * 100.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_link() {
        let mut matrix = TraceabilityMatrix::new();

        let link = TraceabilityLink {
            requirement_id: "REQ-001".to_string(),
            prd_item_id: "P1-T1".to_string(),
            item_type: TraceabilityItemType::Task,
            evidence_refs: Vec::new(),
            test_criteria: vec!["Criterion 1".to_string()],
        };

        matrix.add_link(link);
        assert_eq!(matrix.links.len(), 1);
        assert_eq!(matrix.get_coverage("REQ-001").len(), 1);
    }

    #[test]
    fn test_find_untested() {
        let mut matrix = TraceabilityMatrix::new();

        // Link with tests
        matrix.add_link(TraceabilityLink {
            requirement_id: "REQ-001".to_string(),
            prd_item_id: "P1-T1".to_string(),
            item_type: TraceabilityItemType::Task,
            evidence_refs: Vec::new(),
            test_criteria: vec!["Test 1".to_string()],
        });

        // Link without tests
        matrix.add_link(TraceabilityLink {
            requirement_id: "REQ-002".to_string(),
            prd_item_id: "P1-T2".to_string(),
            item_type: TraceabilityItemType::Task,
            evidence_refs: Vec::new(),
            test_criteria: Vec::new(),
        });

        let untested = matrix.find_untested();
        assert_eq!(untested.len(), 1);
        assert!(untested.contains(&"REQ-002".to_string()));
    }

    #[test]
    fn test_coverage_status() {
        let mut matrix = TraceabilityMatrix::new();

        // Uncovered
        assert_eq!(matrix.coverage_status("REQ-999"), CoverageStatus::Uncovered);

        // Partial (no tests)
        matrix.add_link(TraceabilityLink {
            requirement_id: "REQ-001".to_string(),
            prd_item_id: "P1-T1".to_string(),
            item_type: TraceabilityItemType::Task,
            evidence_refs: Vec::new(),
            test_criteria: Vec::new(),
        });
        assert_eq!(matrix.coverage_status("REQ-001"), CoverageStatus::Partial);

        // Complete (has tests)
        matrix.add_link(TraceabilityLink {
            requirement_id: "REQ-002".to_string(),
            prd_item_id: "P1-T2".to_string(),
            item_type: TraceabilityItemType::Task,
            evidence_refs: Vec::new(),
            test_criteria: vec!["Test 1".to_string()],
        });
        assert_eq!(matrix.coverage_status("REQ-002"), CoverageStatus::Complete);

        // Verified (has tests and evidence)
        matrix.add_link(TraceabilityLink {
            requirement_id: "REQ-003".to_string(),
            prd_item_id: "P1-T3".to_string(),
            item_type: TraceabilityItemType::Task,
            evidence_refs: vec!["EV-001".to_string()],
            test_criteria: vec!["Test 1".to_string()],
        });
        assert_eq!(matrix.coverage_status("REQ-003"), CoverageStatus::Verified);
    }

    #[test]
    fn test_markdown_export() {
        let mut matrix = TraceabilityMatrix::new();

        matrix.add_link(TraceabilityLink {
            requirement_id: "REQ-001".to_string(),
            prd_item_id: "P1-T1".to_string(),
            item_type: TraceabilityItemType::Task,
            evidence_refs: vec!["EV-001".to_string()],
            test_criteria: vec!["Test 1".to_string()],
        });

        let markdown = matrix.to_markdown();
        assert!(markdown.contains("REQ-001"));
        assert!(markdown.contains("P1-T1"));
        assert!(markdown.contains("Task"));
    }

    #[test]
    fn test_stats() {
        let mut matrix = TraceabilityMatrix::new();

        matrix.add_link(TraceabilityLink {
            requirement_id: "REQ-001".to_string(),
            prd_item_id: "P1-T1".to_string(),
            item_type: TraceabilityItemType::Task,
            evidence_refs: Vec::new(),
            test_criteria: vec!["Test 1".to_string()],
        });

        let all_reqs = vec!["REQ-001".to_string(), "REQ-002".to_string()];
        let stats = matrix.stats(&all_reqs);

        assert_eq!(stats.total_requirements, 2);
        assert_eq!(stats.covered_requirements, 1);
        assert_eq!(stats.tested_requirements, 1);
        assert_eq!(stats.coverage_percent(), 50.0);
    }
}
