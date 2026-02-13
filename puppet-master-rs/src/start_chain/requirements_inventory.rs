//! Requirements inventory (Start Chain)
//!
//! Heuristically extracts requirement IDs from source requirements text and maps
//! them to PRD items. This is used by start-chain validators to compute basic
//! coverage without needing full semantic parsing.

use once_cell::sync::Lazy;
use regex::Regex;
use std::collections::{HashMap, HashSet};

use crate::types::ParsedRequirements;
use crate::types::prd::PRD;

static REQUIREMENT_ID_RE: Lazy<Regex> = Lazy::new(|| {
    // Examples: REQ-001, NFR-12, SEC-7
    Regex::new(r"(?i)\b[A-Z]{2,6}-\d{1,5}\b").expect("valid requirement id regex")
});

static REQUIREMENT_SPACED_RE: Lazy<Regex> = Lazy::new(|| {
    // Examples: REQ 12, REQ#12, Requirement 12
    Regex::new(r"(?i)\bREQ(?:UIREMENT)?\s*#?\s*(\d{1,5})\b")
        .expect("valid requirement spaced regex")
});

/// Extract requirement IDs from arbitrary text.
///
/// Dedupe is stable (first occurrence wins) and IDs are normalized to uppercase.
pub fn extract_requirement_ids(text: &str) -> Vec<String> {
    let mut seen = HashSet::<String>::new();
    let mut ids = Vec::new();

    for m in REQUIREMENT_ID_RE.find_iter(text) {
        let id = m.as_str().to_uppercase();
        if seen.insert(id.clone()) {
            ids.push(id);
        }
    }

    for caps in REQUIREMENT_SPACED_RE.captures_iter(text) {
        if let Some(num) = caps.get(1).map(|m| m.as_str()) {
            let id = format!("REQ-{}", num);
            let id = id.to_uppercase();
            if seen.insert(id.clone()) {
                ids.push(id);
            }
        }
    }

    ids
}

/// Build a mapping of requirement IDs to PRD item IDs where they are referenced.
pub fn map_requirements_to_prd(
    prd: &PRD,
    requirement_ids: &[String],
) -> HashMap<String, Vec<String>> {
    let mut by_req: HashMap<String, Vec<String>> = HashMap::new();

    let prd_items = collect_prd_items(prd);

    for req_id in requirement_ids {
        let needle = req_id.to_uppercase();
        let mut covered_by: Vec<String> = Vec::new();

        for (item_id, item_text) in &prd_items {
            if item_text.contains(&needle) {
                covered_by.push(item_id.clone());
            }
        }

        by_req.insert(req_id.clone(), covered_by);
    }

    by_req
}

fn collect_prd_items(prd: &PRD) -> Vec<(String, String)> {
    let mut items: Vec<(String, String)> = Vec::new();

    for phase in &prd.phases {
        items.push((
            phase.id.clone(),
            join_texts([
                Some(phase.title.as_str()),
                phase.goal.as_deref(),
                phase.description.as_deref(),
            ])
            .to_uppercase(),
        ));

        for task in &phase.tasks {
            items.push((
                task.id.clone(),
                join_texts([Some(task.title.as_str()), task.description.as_deref(), None])
                    .to_uppercase(),
            ));

            for subtask in &task.subtasks {
                let mut parts = Vec::new();
                parts.push(subtask.title.as_str().to_string());
                if let Some(d) = &subtask.description {
                    parts.push(d.clone());
                }
                for ac in &subtask.acceptance_criteria {
                    parts.push(ac.clone());
                }

                items.push((subtask.id.clone(), parts.join("\n").to_uppercase()));
            }
        }
    }

    items
}

fn join_texts<'a, const N: usize>(parts: [Option<&'a str>; N]) -> String {
    let mut out = String::new();
    for part in parts.into_iter().flatten() {
        if !out.is_empty() {
            out.push('\n');
        }
        out.push_str(part);
    }
    out
}

/// Lightweight inventory: requirement IDs + coverage mapping.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequirementsInventory {
    pub requirement_ids: Vec<String>,
    pub requirement_to_prd_items: HashMap<String, Vec<String>>,
}

impl RequirementsInventory {
    pub fn from_requirements_text(requirements_text: &str) -> Self {
        Self {
            requirement_ids: extract_requirement_ids(requirements_text),
            requirement_to_prd_items: HashMap::new(),
        }
    }

    pub fn from_parsed_requirements(parsed: &ParsedRequirements) -> Self {
        let mut combined = String::new();
        if let Some(desc) = &parsed.description {
            combined.push_str(desc);
            combined.push('\n');
        }
        for section in &parsed.sections {
            combined.push_str(&section.title);
            combined.push('\n');
            combined.push_str(&section.content);
            combined.push('\n');
        }

        Self::from_requirements_text(&combined)
    }

    pub fn with_prd_mapping(mut self, prd: &PRD) -> Self {
        self.requirement_to_prd_items = map_requirements_to_prd(prd, &self.requirement_ids);
        self
    }

    /// Build inventory from PRD and requirement IDs.
    pub fn build(prd: &PRD, requirement_ids: &[String]) -> Self {
        Self {
            requirement_ids: requirement_ids.to_vec(),
            requirement_to_prd_items: map_requirements_to_prd(prd, requirement_ids),
        }
    }

    pub fn uncovered_requirement_ids(&self) -> Vec<String> {
        self.requirement_ids
            .iter()
            .filter(|id| {
                self.requirement_to_prd_items
                    .get(*id)
                    .map_or(true, |items| items.is_empty())
            })
            .cloned()
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::prd::{ItemStatus, PRDMetadata, Phase, Task};

    fn create_test_prd() -> PRD {
        use crate::types::prd::Subtask;

        PRD {
            metadata: PRDMetadata {
                name: "Test".to_string(),
                description: None,
                version: "1.0".to_string(),
                total_tasks: 1,
                total_subtasks: 1,
                completed_count: 0,
                total_tests: 0,
                passed_tests: 0,
                created_at: Some(chrono::Utc::now()),
                updated_at: Some(chrono::Utc::now()),
            },
            phases: vec![Phase {
                id: "P1".to_string(),
                title: "Phase 1".to_string(),
                goal: None,
                description: Some("Covers REQ-001".to_string()),
                status: ItemStatus::Pending,
                tasks: vec![Task {
                    id: "P1-T1".to_string(),
                    title: "Task 1".to_string(),
                    description: Some("Implements REQ-002".to_string()),
                    status: ItemStatus::Pending,
                    subtasks: vec![Subtask {
                        id: "P1-T1-S1".to_string(),
                        task_id: "P1-T1".to_string(),
                        title: "Subtask".to_string(),
                        description: Some("REQ-003 in subtask".to_string()),
                        criterion: None,
                        status: ItemStatus::Pending,
                        iterations: 0,
                        evidence: Vec::new(),
                        plan: None,
                        acceptance_criteria: vec!["AC covers REQ-004".to_string()],
                        iteration_records: Vec::new(),
                    }],
                    evidence: Vec::new(),
                    gate_reports: Vec::new(),
                    dependencies: Vec::new(),
                    complexity: None,
                    task_type: None,
                }],
                iterations: 0,
                evidence: Vec::new(),
                gate_report: None,
                orchestrator_state: None,
                orchestrator_context: None,
                dependencies: Vec::new(),
            }],
        }
    }

    #[test]
    fn test_extract_requirement_ids_dedup_and_normalize() {
        let text = "- REQ-001 must work\n- req-001 again\nNFR-12 is important\nRequirement 7 should be tracked";
        let ids = extract_requirement_ids(text);
        assert_eq!(ids, vec!["REQ-001", "NFR-12", "REQ-7"]);
    }

    #[test]
    fn test_inventory_mapping_to_prd_items() {
        let prd = create_test_prd();
        let inventory = RequirementsInventory {
            requirement_ids: vec![
                "REQ-001".to_string(),
                "REQ-002".to_string(),
                "REQ-003".to_string(),
                "REQ-004".to_string(),
                "REQ-999".to_string(),
            ],
            requirement_to_prd_items: HashMap::new(),
        }
        .with_prd_mapping(&prd);

        assert_eq!(
            inventory.uncovered_requirement_ids(),
            vec!["REQ-999".to_string()]
        );
        assert_eq!(
            inventory.requirement_to_prd_items["REQ-001"],
            vec!["P1".to_string()]
        );
        assert_eq!(
            inventory.requirement_to_prd_items["REQ-002"],
            vec!["P1-T1".to_string()]
        );
        assert_eq!(
            inventory.requirement_to_prd_items["REQ-003"],
            vec!["P1-T1-S1".to_string()]
        );
        assert_eq!(
            inventory.requirement_to_prd_items["REQ-004"],
            vec!["P1-T1-S1".to_string()]
        );
    }
}
